/**
 * Seed Script — Restaurant Owner Accounts
 * ========================================
 * Run: node src/seeds/seedOwners.js
 *
 * Creates a restaurant_owner user for each restaurant and
 * links them via ownerId. Prints credentials so you can log in.
 */

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/mysql");
const Restaurant = require("../models/restaurant.model");
const User = require("../models/user.model");

// ── Owner data per restaurant ──
const ownerData = [
  { restaurant: "The Spice Kitchen",   name: "Rajesh Kumar",      email: "rajesh@spicekitchen.com",     password: "Spice@123" },
  { restaurant: "Pizza Paradise",      name: "Marco Rossi",       email: "marco@pizzaparadise.com",     password: "Pizza@123" },
  { restaurant: "Dragon Wok",          name: "Chen Wei",          email: "chen@dragonwok.com",          password: "Dragon@123" },
  { restaurant: "Burger Barn",         name: "Jake Miller",       email: "jake@burgerbarn.com",         password: "Burger@123" },
  { restaurant: "Sushi Master",        name: "Yuki Tanaka",       email: "yuki@sushimaster.com",        password: "Sushi@123" },
  { restaurant: "Taco Fiesta",         name: "Carlos Garcia",     email: "carlos@tacofiesta.com",       password: "Taco@123" },
  { restaurant: "Café Mocha",          name: "Sarah Johnson",     email: "sarah@cafemocha.com",         password: "Cafe@123" },
  { restaurant: "Royal Mughlai",       name: "Imran Sheikh",      email: "imran@royalmughlai.com",      password: "Royal@123" },
  { restaurant: "Green Bowl",          name: "Priya Patel",       email: "priya@greenbowl.com",         password: "Green@123" },
  { restaurant: "Shawarma Street",     name: "Omar Hassan",       email: "omar@shawarmastreet.com",     password: "Shawarma@123" },
];

const seed = async () => {
  try {
    // Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    await sequelize.authenticate();
    console.log("MySQL connected");

    // Get all restaurants
    const restaurants = await Restaurant.findAll();
    console.log(`Found ${restaurants.length} restaurants\n`);

    const credentials = [];

    for (const owner of ownerData) {
      // Find the restaurant
      const restaurant = restaurants.find((r) => r.name === owner.restaurant);
      if (!restaurant) {
        console.log(`Restaurant "${owner.restaurant}" not found — skipping`);
        continue;
      }

      // Check if user already exists
      let user = await User.findOne({ email: owner.email });
      if (user) {
        // Update role if needed
        if (user.role !== "restaurant_owner") {
          user.role = "restaurant_owner";
          await user.save();
        }
        console.log(`${owner.email} already exists — reusing`);
      } else {
        // Create new user
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(owner.password, salt);
        user = await User.create({
          name: owner.name,
          email: owner.email,
          password: hashedPassword,
          role: "restaurant_owner",
        });
        console.log(`Created owner: ${owner.name} (${owner.email})`);
      }

      // Link restaurant to owner
      await Restaurant.update(
        { ownerId: user._id.toString() },
        { where: { id: restaurant.id } }
      );

      credentials.push({
        restaurant: owner.restaurant,
        ownerName: owner.name,
        email: owner.email,
        password: owner.password,
      });
    }

    // Print credentials table
    console.log("\n" + "═".repeat(90));
    console.log("  RESTAURANT OWNER CREDENTIALS");
    console.log("═".repeat(90));
    console.log(
      "Restaurant".padEnd(22) +
      "Owner".padEnd(20) +
      "Email".padEnd(30) +
      "Password"
    );
    console.log("─".repeat(90));
    for (const c of credentials) {
      console.log(
        c.restaurant.padEnd(22) +
        c.ownerName.padEnd(20) +
        c.email.padEnd(30) +
        c.password
      );
    }
    console.log("═".repeat(90));
    console.log(`\n${credentials.length} owner accounts created and linked!\n`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
