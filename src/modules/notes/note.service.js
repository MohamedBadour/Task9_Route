import mongoose from "mongoose";
import { Note } from "../../DB/models/note.model.js";

const validId = (id) => mongoose.isValidObjectId(id);

// helper: load note + ownership check; returns note or sends the response
const getOwned = async (req, res) => {
  if (!validId(req.params.noteId)) {
    res.status(404).json({ message: "Note not found" });
    return null;
  }
  const note = await Note.findById(req.params.noteId);
  if (!note) {
    res.status(404).json({ message: "Note not found" });
    return null;
  }
  if (note.userId.toString() !== req.userId) {
    res.status(403).json({ message: "You are not the owner" });
    return null;
  }
  return note;
};

// 1. create
export const createNote = async (req, res) => {
  try {
    const { title, content } = req.body;
    await Note.create({ title, content, userId: req.userId });
    return res.status(201).json({ message: "Note created" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// 2. update one (owner) and return updated
export const updateNote = async (req, res) => {
  try {
    const note = await getOwned(req, res);
    if (!note) return;
    const { title, content } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    await note.save();
    return res.status(200).json({ message: "updated", note });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// 3. replace (owner)
export const replaceNote = async (req, res) => {
  try {
    const note = await getOwned(req, res);
    if (!note) return;
    const { title, content, userId } = req.body;
    const replaced = await Note.findOneAndReplace(
      { _id: note._id },
      { title, content, userId: userId || note.userId },
      { new: true, runValidators: true }
    );
    return res.status(200).json(replaced);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// 4. update title of all notes of logged-in user
export const updateAllTitles = async (req, res) => {
  const result = await Note.updateMany({ userId: req.userId }, { title: req.body.title });
  if (!result.matchedCount) return res.status(404).json({ message: "No note found" });
  return res.status(200).json({ message: "All notes updated" });
};

// 5. delete one (owner) and return deleted
export const deleteNote = async (req, res) => {
  const note = await getOwned(req, res);
  if (!note) return;
  await note.deleteOne();
  return res.status(200).json({ message: "deleted", note });
};

// 6. paginate + sort createdAt desc
export const paginateSort = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 10, 1);
  const notes = await Note.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  return res.status(200).json(notes);
};

// 7. get by id (owner)
export const getNote = async (req, res) => {
  const note = await getOwned(req, res);
  if (!note) return;
  return res.status(200).json(note);
};

// 8. get note by content
export const getByContent = async (req, res) => {
  const note = await Note.findOne({ userId: req.userId, content: req.query.content });
  if (!note) return res.status(404).json({ message: "No note found" });
  return res.status(200).json(note);
};

// 9. notes with user info (select title, userId, createdAt + user email)
export const notesWithUser = async (req, res) => {
  const notes = await Note.find({ userId: req.userId })
    .select("title userId createdAt")
    .populate("userId", "email -_id");
  return res.status(200).json(notes);
};

// 10. aggregate with user (name, email) + search by title
export const aggregateNotes = async (req, res) => {
  const match = { userId: new mongoose.Types.ObjectId(req.userId) };
  if (req.query.title) match.title = req.query.title;

  const notes = await Note.aggregate([
    { $match: match },
    { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { title: 1, userId: 1, createdAt: 1, "user.name": 1, "user.email": 1, _id: 0 } },
  ]);
  return res.status(200).json(notes);
};

// 11. delete all notes of logged-in user
export const deleteAllNotes = async (req, res) => {
  await Note.deleteMany({ userId: req.userId });
  return res.status(200).json({ message: "Deleted" });
};
