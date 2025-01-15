import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    first_name: { type: String, default: null },
    last_name: { type: String, default: null },
    email: { type: String, unique: true },
    password: { type: String },
    languages: { type: Array },
    categories: { type: Array },
    savedStories: { type: Array },
    token: { type: String },
    verified: { type: Boolean, default: false },
    verifyToken: { type: String },
    verifyTokenExpires: Date,
    resetPasswordToken: { type: String },
    resetPasswordExpires: Date,
    status: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

const User = mongoose.model("user", userSchema);

export default User;
