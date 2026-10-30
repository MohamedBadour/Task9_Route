import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      validate: {
        // title must not be entirely uppercase
        validator: (v) => v !== v.toUpperCase(),
        message: "Title must not be entirely uppercase",
      },
    },
    content: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);
