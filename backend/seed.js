
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import "dotenv/config";
import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import { User, Place, Category, Trip, Favourite, Review, Recommendation } from "./models/index.js";

const categories = ["Historical Places","Beaches","Hill Stations","Temples","Waterfalls","Wildlife Sanctuaries","Adventure Tourism","Museums","Parks and Gardens"];
const places = [
["Baga Beach","North Goa","Goa","Beaches","Popular beach known for water sports, restaurants and lively sunsets.",15.5553,73.7517,0,4.4,"November to February"],
["Calangute Beach","Calangute, Goa","Goa","Beaches","A broad sandy beach with shacks, shopping and family-friendly activities.",15.5440,73.7550,0,4.3,"November to February"],
["Fort Aguada","Sinquerim, Goa","Goa","Historical Places","A seventeenth-century Portuguese fort overlooking the Arabian Sea.",15.4923,73.7737,25,4.5,"October to March"],
["Dudhsagar Falls","Sanguem, Goa","Goa","Waterfalls","A spectacular multi-tier waterfall surrounded by the Western Ghats forest.",15.3144,74.3143,50,4.7,"July to January"],
["Basilica of Bom Jesus","Old Goa, Goa","Goa","Historical Places","UNESCO-listed basilica known for Baroque architecture and heritage.",15.5009,73.9115,0,4.6,"October to March"],
["Anjuna Beach","Anjuna, Goa","Goa","Beaches","Scenic rocky shoreline famous for its flea market and sunset views.",15.5733,73.7400,0,4.2,"November to February"],
["Meenakshi Amman Temple","Madurai, Tamil Nadu","Tamil Nadu","Temples","Historic temple complex celebrated for its colourful gopurams and sculpture.",9.9195,78.1193,0,4.8,"October to March"],
["Kodaikanal","Dindigul, Tamil Nadu","Tamil Nadu","Hill Stations","Hill town with a star-shaped lake, forest trails and cool climate.",10.2381,77.4892,0,4.6,"April to June"],
["Ooty","Nilgiris, Tamil Nadu","Tamil Nadu","Hill Stations","Mountain destination with gardens, tea estates and the Nilgiri heritage railway.",11.4102,76.6950,0,4.5,"April to June"],
["Mahabalipuram","Chengalpattu, Tamil Nadu","Tamil Nadu","Historical Places","UNESCO heritage town featuring rock-cut temples and shore monuments.",12.6208,80.1945,40,4.7,"November to February"],
["Rameswaram","Ramanathapuram, Tamil Nadu","Tamil Nadu","Temples","Island pilgrimage town known for Ramanathaswamy Temple and coastal scenery.",9.2881,79.3129,0,4.6,"October to April"],
["Kanyakumari","Kanyakumari, Tamil Nadu","Tamil Nadu","Parks and Gardens","Coastal destination known for sunrise, sunset and the Vivekananda Rock Memorial.",8.0883,77.5385,50,4.5,"October to March"]
];
await connectDB();
await Promise.all([User.deleteMany({}), Place.deleteMany({}), Category.deleteMany({}), Trip.deleteMany({}), Favourite.deleteMany({}), Review.deleteMany({}), Recommendation.deleteMany({})]);
await Category.insertMany(categories.map(name => ({ name })));
await Place.insertMany(places.map(([name,location,state,category,description,latitude,longitude,entryFee,rating,bestTime],i) => ({
 name,location,state,category,description,latitude,longitude,entryFee,rating,bestTime,durationHours:2+i%3,featured:i<4,
 image:`https://images.unsplash.com/photo-${["1507525428034-b723cf961d3e","1500375592092-40eb2168fd21","1519681393784-d120267933ba","1433086966358-54859d0ed716"][i%4]}?auto=format&fit=crop&w=1000&q=80`,
 facilities:["Parking","Restrooms","Local guides"],openingHours:"9:00 AM - 5:00 PM",popularity:Math.floor(Math.random()*100)
})));
const adminEmail = process.env.ADMIN_EMAIL || "admin@smarttourism.local";
await User.create({ name:process.env.ADMIN_NAME||"Tourism Administrator",email:adminEmail,password:await bcrypt.hash(process.env.ADMIN_PASSWORD||"Admin@12345",12),role:"admin" });
await User.create({ name:"Demo Traveller",email:"user@smarttourism.local",password:await bcrypt.hash("User@12345",12),role:"user",preferences:{categories:["Beaches","Historical Places"],interests:["nature","culture"],budget:1500,preferredLocation:"Goa",duration:3} });
console.log("Seed complete. Admin:",adminEmail,"| Demo user: user@smarttourism.local");
process.exit(0);
