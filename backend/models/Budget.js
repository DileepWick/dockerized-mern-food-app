import { Schema, model } from "mongoose";

const budgetSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    amountLimit: { type: Number, required: true },
    timePeriod: { type: String, enum: ["monthly", "yearly"], required: true },
    notificationsEnabled: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default model("Budget", budgetSchema);
