import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { User } from "../../DB/models/user.model.js";
import { Note } from "../../DB/models/note.model.js";

const PHONE_SECRET = () => process.env.PHONE_SECRET || "change_me_too";

// 1. signup: hash password, encrypt phone
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, age } = req.body;
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already exists." });

    await User.create({
      name,
      email,
      age,
      password: await bcrypt.hash(password, 10),
      phone: CryptoJS.AES.encrypt(phone, PHONE_SECRET()).toString(),
    });
    return res.status(201).json({ message: "User added successfully." });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// 2. login -> JWT (1 hour)
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || "change_me", {
    expiresIn: "1h",
  });
  return res.status(200).json({ message: "Login successful", token });
};

// 3. update logged-in user (except password)
export const updateUser = async (req, res) => {
  try {
    const { password, ...data } = req.body;
    if (data.email) {
      const taken = await User.findOne({ email: data.email, _id: { $ne: req.userId } });
      if (taken) return res.status(409).json({ message: "Email already exists." });
    }
    if (data.phone) data.phone = CryptoJS.AES.encrypt(data.phone, PHONE_SECRET()).toString();

    const user = await User.findByIdAndUpdate(req.userId, data, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "User updated" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// 4. delete logged-in user
export const deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  await Note.deleteMany({ userId: req.userId });
  return res.status(200).json({ message: "User deleted" });
};

// 5. get logged-in user
export const getUser = async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.status(200).json(user);
};
