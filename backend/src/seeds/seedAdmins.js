/**
 * SEED ADMIN USERS
 * ----------------
 * Creates one Super Admin and one Restaurant Owner,
 * then assigns restaurants to the owner.
 *
 * Usage:  node src/seeds/seedAdmins.js
 */

require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectMongoDB = require("../config/mongo");
const { connectMySQL } = require("../config/mysql");
const User = require("../models/user.model");
const Restaurant = require("../models/restaurant.model");

const ADMIN_USER = {
  name: "Super Admin",
  email: "admin@zomato.com",
  password: "Admin@123",
  role: "admin",
  phone: "9000000001",
};

const OWNER_USER = {
  name: "Restaurant Owner",
  email: "owner@zomato.com",
  password: "Owner@123",
  role: "restaurant_owner",
  phone: "9000000002",
};

const seed = async () => {
  try {
    // Connect databases
    await connectMongoDB();
    await connectMySQL();

    console.log("\n🔧 Seeding admin users...\n");

    // ── Create / update Super Admin ──
    const hashedAdminPw = await bcrypt.hash(ADMIN_USER.password, 12);
    const admin = await User.findOneAndUpdate(
      { email: ADMIN_USER.email },
      { ...ADMIN_USER, password: hashedAdminPw },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`✅ Super Admin created`);
    console.log(`   Email:    ${ADMIN_USER.email}`);
    console.log(`   Password: ${ADMIN_USER.password}`);
    console.log(`   ID:       ${admin._id}\n`);

    // ── Create / update Restaurant Owner ──
    const hashedOwnerPw = await bcrypt.hash(OWNER_USER.password, 12);
    const owner = await User.findOneAndUpdate(
      { email: OWNER_USER.email },
      { ...OWNER_USER, password: hashedOwnerPw },
      { upsert: true, returnDocument: "after" }
    );
    console.log(`✅ Restaurant Owner created`);
    console.log(`   Email:    ${OWNER_USER.email}`);
    console.log(`   Password: ${OWNER_USER.password}`);
    console.log(`   ID:       ${owner._id}\n`);

    // ── Assign first 3 restaurants to the owner ──
    const restaurants = await Restaurant.findAll({
      limit: 3,
      order: [["id", "ASC"]],
    });

    if (restaurants.length > 0) {
      const ids = restaurants.map((r) => r.id);
      await Restaurant.update(
        { ownerId: owner._id.toString() },
        { where: { id: ids } }
      );
      console.log(`✅ Assigned ${ids.length} restaurants to owner:`);
      restaurants.forEach((r) => console.log(`   • ${r.name} (ID: ${r.id})`));
    } else {
      console.log("⚠️  No restaurants found. Run seedRestaurants.js first.");
    }

    console.log("\n🎉 Done! You can now log in:\n");
    console.log("   Super Admin:       admin@zomato.com / Admin@123");
    console.log("   Restaurant Owner:  owner@zomato.com / Owner@123");
    console.log("\n   Owner panel:  http://localhost:5173/admin\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
