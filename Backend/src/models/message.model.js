import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      default: "",
    },
    domain: {
      type: String,
      default: "",
    },
    snippet: {
      type: String,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },

    sources: {
      type: [sourceSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const messageModel = mongoose.model("Message", messageSchema);

export default messageModel;
