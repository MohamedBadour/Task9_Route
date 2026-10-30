import express from "express";
import { connectDB } from "./DB/connection.js";
import userRouter from "./modules/users/user.controller.js";
import noteRouter from "./modules/notes/note.controller.js";

export const bootstrap = async () => {
  const app = express();
  app.use(express.json());
  await connectDB();

  app.use("/users", userRouter);
  app.use("/notes", noteRouter);

  app.use((req, res) => res.status(404).json({ message: "Route not found" }));
  app.listen(process.env.PORT || 3000, () => console.log("Server running"));
};
