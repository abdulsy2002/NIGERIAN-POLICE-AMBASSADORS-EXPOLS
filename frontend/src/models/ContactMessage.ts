import mongoose, { Schema, Document } from "mongoose";

// Define what a Contact Message looks like
export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

const ContactMessageSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: false },
    message: { type: String, required: true },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt
);

// If the model already exists, use it. Otherwise, create it.
export default mongoose.models.ContactMessage || 
  mongoose.model<IContactMessage>("ContactMessage", ContactMessageSchema);