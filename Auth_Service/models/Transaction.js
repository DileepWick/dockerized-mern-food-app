import { Schema, model } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    tags: { type: [String], default: [] },
    isRecurring: { type: Boolean, default: false },
    recurringFrequency: { type: String, enum: ["daily", "weekly", "monthly", "yearly"], default: null },
    description: { type: String, default: "" },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export default model("Transaction", transactionSchema);
