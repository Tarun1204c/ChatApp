import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
    },
    type: {
      type: String,
      enum: ["general", "research", "agent"],
      default: "general",
    },
    status: {
      type: String,
      enum: ["active", "archived", "deleted"],
      default: "active",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      model: {
        type: String,
        default: "gpt-4o-mini",
      },
      temperature: {
        type: Number,
        default: 0.3,
      },
      tags: [{
        type: String,
        trim: true,
      }],
      summary: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

chatSchema.index({ user: 1, updatedAt: -1 });

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
