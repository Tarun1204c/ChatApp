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
      index: true,
    },
    sender: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["text", "markdown", "json"],
      default: "text",
    },
    sources: [sourceSchema],
    citations: [{
      type: String,
      trim: true,
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "sent", "failed", "streaming"],
      default: "sent",
    },
    model: {
      type: String,
      default: "",
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    metadata: {
      reasoning: {
        type: String,
        default: "",
      },
      followUp: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ chat: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);

export default Message;
