import mongoose from "mongoose";

const { Schema, model } = mongoose;
const preferenceSchema = new Schema({
  categories: [{ type: String }],
  interests: [{ type: String }],
  budget: { type: Number, default: 10000 },
  preferredLocation: { type: String, default: "" },
  duration: { type: Number, default: 3 }
}, { _id: false });

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  active: { type: Boolean, default: true },
  phone: String,
  preferences: { type: preferenceSchema, default: () => ({}) }
}, { timestamps: true });

const placeSchema = new Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  state: { type: String, default: "" },
  category: { type: String, required: true, index: true },
  description: { type: String, required: true },
  image: { type: String, default: "" },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  durationHours: { type: Number, default: 2 },
  entryFee: { type: Number, default: 0 },
  openingHours: { type: String, default: "9:00 AM - 5:00 PM" },
  rating: { type: Number, min: 0, max: 5, default: 4 },
  facilities: [String],
  bestTime: { type: String, default: "October to March" },
  featured: { type: Boolean, default: false },
  popularity: { type: Number, default: 0 }
}, { timestamps: true });
placeSchema.index({ name: "text", location: "text", description: "text" });

const tripSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true },
  startLocation: { type: String, default: "" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  travellers: { type: Number, default: 1, min: 1 },
  budget: { type: Number, default: 0 },
  status: { type: String, enum: ["upcoming", "completed", "cancelled"], default: "upcoming" },
  days: [{ day: Number, date: Date, places: [{ type: Schema.Types.ObjectId, ref: "Place" }] }],
  estimatedCost: { type: Number, default: 0 }
}, { timestamps: true });

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: String
}, { timestamps: true });

const recommendationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", index: true },
  place: { type: Schema.Types.ObjectId, ref: "Place" },
  score: Number,
  reason: String
}, { timestamps: true });

const favouriteSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  place: { type: Schema.Types.ObjectId, ref: "Place", required: true }
}, { timestamps: true });
favouriteSchema.index({ user: 1, place: 1 }, { unique: true });

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  place: { type: Schema.Types.ObjectId, ref: "Place", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: "" }
}, { timestamps: true });

export const User = model("User", userSchema);
export const Admin = model("Admin", userSchema);
export const Place = model("Place", placeSchema);
export const Trip = model("Trip", tripSchema);
export const Category = model("Category", categorySchema);
export const Recommendation = model("Recommendation", recommendationSchema);
export const Favourite = model("Favourite", favouriteSchema);
export const Review = model("Review", reviewSchema);
