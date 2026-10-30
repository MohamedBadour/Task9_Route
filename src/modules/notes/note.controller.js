import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import * as NS from "./note.service.js";

const router = Router();
router.use(auth);

router.post("/", NS.createNote);
router.delete("/", NS.deleteAllNotes);
router.patch("/all", NS.updateAllTitles);
router.get("/paginate-sort", NS.paginateSort);
router.get("/note-by-content", NS.getByContent);
router.get("/note-with-user", NS.notesWithUser);
router.get("/aggregate", NS.aggregateNotes);
router.put("/replace/:noteId", NS.replaceNote);
router.patch("/:noteId", NS.updateNote);
router.delete("/:noteId", NS.deleteNote);
router.get("/:noteId", NS.getNote);

export default router;
