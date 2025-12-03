import { model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
  userName: string;
  email?: string;
  password: string;
}

const userSchema = new Schema<IUser>(
  {
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret, options) {
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);


userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});



export const User = model<IUser>("User", userSchema);
