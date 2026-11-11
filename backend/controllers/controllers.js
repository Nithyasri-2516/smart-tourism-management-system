import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { User, Place, Trip, Category, Recommendation, Favourite, Review } from "../models/index.js";
import { recommendPlaces } from "../services/recommendationEngine.js";
import { buildItinerary } from "../services/itineraryEngine.js";

const tokenFor = user => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const safeUser = user => ({ id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, active: user.active, preferences: user.preferences });

export async function register(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ message: "Name, valid email and password (minimum 8 characters) are required" });
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) return res.status(409).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "user" });
  res.status(201).json({ token: tokenFor(user), user: safeUser(user) });
}
export async function login(req, res) {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email: String(email || "").toLowerCase() }).select("+password");
  if (!user || !(await bcrypt.compare(password || "", user.password)) || !user.active || (role && user.role !== role))
    return res.status(401).json({ message: "Invalid credentials or account unavailable" });
  res.json({ token: tokenFor(user), user: safeUser(user) });
}
export async function me(req, res) { res.json({ user: safeUser(req.user) }); }
export async function updateProfile(req, res) {
  const allowed = ["name", "phone", "preferences"];
  allowed.forEach(k => { if (req.body[k] !== undefined) req.user[k] = req.body[k]; });
  await req.user.save(); res.json({ user: safeUser(req.user) });
}
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await bcrypt.compare(currentPassword || "", user.password))) return res.status(400).json({ message: "Current password is incorrect" });
  if (!newPassword || newPassword.length < 8) return res.status(400).json({ message: "New password must contain at least 8 characters" });
  user.password = await bcrypt.hash(newPassword, 12); await user.save(); res.json({ message: "Password updated" });
}
export async function listPlaces(req, res) {
  const q = {};
  if (req.query.category) q.category = req.query.category;
  if (req.query.state) q.state = new RegExp(req.query.state, "i");
  if (req.query.featured === "true") q.featured = true;
  if (req.query.search) q.$or = ["name", "location", "description"].map(k => ({ [k]: new RegExp(req.query.search, "i") }));
  const places = await Place.find(q).sort({ createdAt: -1 }).limit(500);
  res.json({ places });
}
export async function getPlace(req, res) {
  const place = await Place.findById(req.params.id);
  if (!place) return res.status(404).json({ message: "Destination not found" });
  await Place.updateOne({ _id: place._id }, { $inc: { popularity: 1 } });
  res.json({ place });
}
export async function createPlace(req, res) { res.status(201).json({ place: await Place.create(req.body) }); }
export async function updatePlace(req, res) {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!place) return res.status(404).json({ message: "Destination not found" });
  res.json({ place });
}
export async function deletePlace(req, res) {
  await Place.findByIdAndDelete(req.params.id); res.json({ message: "Destination deleted" });
}
export async function getRecommendations(req, res) {
  const places = await Place.find();
  const ranked = recommendPlaces(places, req.user.preferences);
  const docs = ranked.slice(0, 20);
  await Recommendation.deleteMany({ user: req.user._id });
  if (docs.length) await Recommendation.insertMany(docs.map(x => ({ user: req.user._id, place: x.place._id, score: x.score, reason: x.reason })));
  res.json({ recommendations: docs });
}
export async function savePreferences(req, res) {
  req.user.preferences = { ...req.user.preferences?.toObject?.(), ...req.body };
  await req.user.save(); res.json({ preferences: req.user.preferences });
}
export async function createTrip(req, res) {
  const { name, startDate, endDate, placeIds = [], travellers = 1, budget = 0, startLocation = "" } = req.body;
  if (!name || !startDate || !endDate || new Date(endDate) < new Date(startDate)) return res.status(400).json({ message: "Enter a trip name and valid travel dates" });
  const places = await Place.find({ _id: { $in: placeIds } });
  const days = buildItinerary(placeIds, places, startDate, endDate);
  const estimatedCost = places.reduce((sum, p) => sum + Number(p.entryFee || 0) * Number(travellers), 0);
  const trip = await Trip.create({ user: req.user._id, name, startDate, endDate, startLocation, travellers, budget, days: days.map(d => ({ day: d.day, date: d.date, places: d.places.map(p => p._id) })), estimatedCost });
  res.status(201).json({ trip: await trip.populate("days.places") });
}
export async function listTrips(req, res) {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };
  const trips = await Trip.find(filter).populate("user", "name email").populate("days.places").sort({ createdAt: -1 });
  res.json({ trips });
}
export async function updateTrip(req, res) {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const trip = await Trip.findOneAndUpdate(filter, req.body, { new: true, runValidators: true }).populate("days.places");
  if (!trip) return res.status(404).json({ message: "Trip not found" });
  res.json({ trip });
}
export async function deleteTrip(req, res) {
  const filter = req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };
  const result = await Trip.findOneAndDelete(filter);
  if (!result) return res.status(404).json({ message: "Trip not found" });
  res.json({ message: "Trip deleted" });
}
export async function listFavourites(req, res) {
  const favourites = await Favourite.find({ user: req.user._id }).populate("place");
  res.json({ favourites });
}
export async function toggleFavourite(req, res) {
  const { placeId } = req.body;
  if (!mongoose.isValidObjectId(placeId)) return res.status(400).json({ message: "Invalid place" });
  const existing = await Favourite.findOne({ user: req.user._id, place: placeId });
  if (existing) { await existing.deleteOne(); return res.json({ favourite: false }); }
  await Favourite.create({ user: req.user._id, place: placeId }); res.json({ favourite: true });
}
export async function addReview(req, res) {
  const { rating, comment = "" } = req.body;
  const review = await Review.findOneAndUpdate({ user: req.user._id, place: req.params.id }, { rating, comment }, { new: true, upsert: true, runValidators: true });
  const stats = await Review.aggregate([{ $match: { place: new mongoose.Types.ObjectId(req.params.id) } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]);
  if (stats.length) await Place.findByIdAndUpdate(req.params.id, { rating: stats[0].avg });
  res.status(201).json({ review });
}
export async function adminStats(req, res) {
  const [users, places, trips, categories, recentUsers, recentTrips, popular, byCategory] = await Promise.all([
    User.countDocuments({ role: "user" }), Place.countDocuments(), Trip.countDocuments(), Category.countDocuments(),
    User.find({ role: "user" }).sort({ createdAt: -1 }).limit(5).select("name email createdAt"),
    Trip.find().sort({ createdAt: -1 }).limit(5).populate("user", "name"),
    Place.find().sort({ popularity: -1 }).limit(5),
    Place.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }])
  ]);
  res.json({ stats: { users, places, trips, categories }, recentUsers, recentTrips, popular, byCategory });
}
export async function adminUsers(req, res) {
  const users = await User.find({ role: "user" }).select("-password").sort({ createdAt: -1 });
  res.json({ users });
}
export async function updateUserStatus(req, res) {
  const user = await User.findOneAndUpdate({ _id: req.params.id, role: "user" }, { active: !!req.body.active }, { new: true }).select("-password");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json({ user });
}
export async function deleteUser(req, res) {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: "user" });
  if (!user) return res.status(404).json({ message: "User not found" });
  await Promise.all([Trip.deleteMany({ user: user._id }), Favourite.deleteMany({ user: user._id }), Recommendation.deleteMany({ user: user._id }), Review.deleteMany({ user: user._id })]);
  res.json({ message: "User and related records deleted" });
}
export async function categories(req, res) { res.json({ categories: await Category.find().sort({ name: 1 }) }); }
export async function createCategory(req, res) { res.status(201).json({ category: await Category.create(req.body) }); }
export async function deleteCategory(req, res) { await Category.findByIdAndDelete(req.params.id); res.json({ message: "Category deleted" }); }
