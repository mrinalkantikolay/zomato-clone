/**
 * Seed Script — Restaurants + Menu Items
 * =======================================
 * Run: node src/seeds/seedRestaurants.js
 *
 * Inserts 10 restaurants + 7 dishes each (70 menu items) into MySQL.
 * Safe to run multiple times — clears and re-seeds.
 */

require("dotenv").config();

const { sequelize } = require("../config/mysql");
const Restaurant = require("../models/restaurant.model");
const Menu = require("../models/menu.model");

/* ───────────────────────────────────────────────
   RESTAURANTS
   ─────────────────────────────────────────────── */
const restaurants = [
  {
    name: "The Spice Kitchen",
    address: "12, MG Road, Kolkata 700001",
    description: "Authentic North Indian cuisine with signature biryanis and tandoori specialties",
    cuisine: "Indian",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
  },
  {
    name: "Pizza Paradise",
    address: "45, Park Street, Kolkata 700016",
    description: "Wood-fired Italian pizzas and handmade pasta in a cozy ambiance",
    cuisine: "Italian",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
  },
  {
    name: "Dragon Wok",
    address: "78, Salt Lake, Sector V, Kolkata 700091",
    description: "Premium Chinese and pan-Asian stir fry, dim sum, and noodles",
    cuisine: "Chinese",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop",
  },
  {
    name: "Burger Barn",
    address: "23, New Town, Kolkata 700156",
    description: "Gourmet smash burgers, loaded fries, and thick milkshakes",
    cuisine: "Fast Food",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
  },
  {
    name: "Sushi Master",
    address: "56, Camac Street, Kolkata 700017",
    description: "Authentic Japanese sushi, sashimi, and ramen bar",
    cuisine: "Japanese",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
  },
  {
    name: "Taco Fiesta",
    address: "89, Gariahat Road, Kolkata 700029",
    description: "Mexican street food — tacos, burritos, quesadillas, and nachos",
    cuisine: "Mexican",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop",
  },
  {
    name: "Café Mocha",
    address: "34, Elgin Road, Kolkata 700020",
    description: "Specialty coffee, fresh pastries, and all-day brunch menu",
    cuisine: "Italian",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
  },
  {
    name: "Royal Mughlai",
    address: "67, Esplanade, Kolkata 700069",
    description: "Royal Mughlai kebabs, korma, and slow-cooked dum biryani",
    cuisine: "Indian",
    isOpen: false,
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
  },
  {
    name: "Green Bowl",
    address: "101, Ballygunge, Kolkata 700019",
    description: "Healthy salad bowls, smoothies, and plant-based meals",
    cuisine: "Fast Food",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
  },
  {
    name: "Shawarma Street",
    address: "15, Howrah Station Area, Howrah 711101",
    description: "Middle Eastern shawarma wraps, falafel, and hummus platters",
    cuisine: "Indian",
    isOpen: true,
    imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600&h=400&fit=crop",
  },
];

/* ───────────────────────────────────────────────
   MENU ITEMS — 7 per restaurant
   ─────────────────────────────────────────────── */
const menuTemplates = {
  "The Spice Kitchen": [
    { name: "Butter Chicken", price: 349, category: "Main Course", isVeg: false, description: "Creamy tomato-based curry with tender chicken pieces", imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop" },
    { name: "Paneer Tikka", price: 249, category: "Starters", isVeg: true, description: "Marinated cottage cheese cubes grilled in tandoor", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=300&fit=crop" },
    { name: "Hyderabadi Biryani", price: 299, category: "Main Course", isVeg: false, description: "Fragrant basmati rice layered with spiced mutton", imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop" },
    { name: "Dal Makhani", price: 199, category: "Main Course", isVeg: true, description: "Slow-cooked black lentils in rich buttery gravy", imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop" },
    { name: "Tandoori Roti (4 pcs)", price: 99, category: "Breads", isVeg: true, description: "Whole wheat bread baked in clay oven", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop" },
    { name: "Gulab Jamun (2 pcs)", price: 129, category: "Desserts", isVeg: true, description: "Deep-fried milk dumplings soaked in rose syrup", imageUrl: "https://images.unsplash.com/photo-1666190053473-f7e9aa4e5c28?w=300&h=300&fit=crop" },
    { name: "Masala Chai", price: 79, category: "Beverages", isVeg: true, description: "Traditional Indian spiced tea with fresh ginger", imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=300&h=300&fit=crop" },
  ],
  "Pizza Paradise": [
    { name: "Margherita Pizza", price: 299, category: "Pizzas", isVeg: true, description: "Classic pizza with fresh mozzarella and basil", imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop" },
    { name: "Pepperoni Feast", price: 449, category: "Pizzas", isVeg: false, description: "Loaded with double pepperoni and extra cheese", imageUrl: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&h=300&fit=crop" },
    { name: "Garlic Breadsticks", price: 179, category: "Starters", isVeg: true, description: "Freshly baked garlic bread with herb butter", imageUrl: "https://images.unsplash.com/photo-1619531040576-f9416740661b?w=300&h=300&fit=crop" },
    { name: "Pasta Alfredo", price: 329, category: "Pasta", isVeg: true, description: "Creamy white sauce penne with mushrooms", imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=300&h=300&fit=crop" },
    { name: "BBQ Chicken Wings", price: 349, category: "Starters", isVeg: false, description: "Smoky BBQ glazed chicken wings (8 pcs)", imageUrl: "https://images.unsplash.com/photo-1527477396000-e27163b14323?w=300&h=300&fit=crop" },
    { name: "Tiramisu", price: 249, category: "Desserts", isVeg: true, description: "Classic Italian coffee-flavored layered dessert", imageUrl: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=300&fit=crop" },
    { name: "Cold Coffee", price: 149, category: "Beverages", isVeg: true, description: "Iced coffee blended with vanilla ice cream", imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop" },
  ],
  "Dragon Wok": [
    { name: "Veg Manchurian", price: 219, category: "Starters", isVeg: true, description: "Crispy vegetable balls in tangy Indo-Chinese sauce", imageUrl: "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&h=300&fit=crop" },
    { name: "Chicken Fried Rice", price: 249, category: "Main Course", isVeg: false, description: "Wok-tossed rice with chicken and vegetables", imageUrl: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=300&fit=crop" },
    { name: "Hakka Noodles", price: 219, category: "Main Course", isVeg: true, description: "Stir-fried noodles with fresh vegetables and soy sauce", imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&h=300&fit=crop" },
    { name: "Dim Sum Platter", price: 349, category: "Starters", isVeg: false, description: "Steamed dumplings with prawn and chicken filling (8 pcs)", imageUrl: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300&h=300&fit=crop" },
    { name: "Chilli Paneer", price: 229, category: "Starters", isVeg: true, description: "Cottage cheese tossed with peppers in spicy sauce", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=300&fit=crop" },
    { name: "Honey Noodles", price: 179, category: "Desserts", isVeg: true, description: "Crispy noodles drizzled with honey and ice cream", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=300&h=300&fit=crop" },
    { name: "Lemon Iced Tea", price: 99, category: "Beverages", isVeg: true, description: "Refreshing iced tea with fresh lemon and mint", imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&h=300&fit=crop" },
  ],
  "Burger Barn": [
    { name: "Classic Smash Burger", price: 249, category: "Burgers", isVeg: false, description: "Double-smashed beef patty with cheddar and special sauce", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=300&fit=crop" },
    { name: "Crispy Chicken Burger", price: 229, category: "Burgers", isVeg: false, description: "Crispy fried chicken with coleslaw and mayo", imageUrl: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=300&h=300&fit=crop" },
    { name: "Veggie Supreme Burger", price: 199, category: "Burgers", isVeg: true, description: "Grilled veggie patty with lettuce, tomato, and cheese", imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop" },
    { name: "Loaded Fries", price: 179, category: "Sides", isVeg: true, description: "Crispy fries topped with cheese sauce and jalapeños", imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&h=300&fit=crop" },
    { name: "Onion Rings", price: 149, category: "Sides", isVeg: true, description: "Beer-battered crispy onion rings with dip", imageUrl: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&h=300&fit=crop" },
    { name: "Chocolate Shake", price: 169, category: "Beverages", isVeg: true, description: "Thick chocolate milkshake with whipped cream", imageUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&h=300&fit=crop" },
    { name: "Brownie Sundae", price: 199, category: "Desserts", isVeg: true, description: "Warm chocolate brownie with vanilla ice cream", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=300&fit=crop" },
  ],
  "Sushi Master": [
    { name: "Salmon Nigiri (4 pcs)", price: 449, category: "Sushi", isVeg: false, description: "Fresh salmon slices over seasoned rice", imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=300&h=300&fit=crop" },
    { name: "California Roll (8 pcs)", price: 399, category: "Sushi", isVeg: false, description: "Crab, avocado, and cucumber inside-out roll", imageUrl: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=300&h=300&fit=crop" },
    { name: "Veggie Tempura Roll", price: 349, category: "Sushi", isVeg: true, description: "Crispy tempura vegetables wrapped in seaweed", imageUrl: "https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&h=300&fit=crop" },
    { name: "Tonkotsu Ramen", price: 449, category: "Main Course", isVeg: false, description: "Rich pork bone broth ramen with chashu and egg", imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=300&fit=crop" },
    { name: "Edamame", price: 149, category: "Starters", isVeg: true, description: "Steamed and salted young soybeans", imageUrl: "https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?w=300&h=300&fit=crop" },
    { name: "Mochi Ice Cream (3 pcs)", price: 249, category: "Desserts", isVeg: true, description: "Japanese rice cake filled with ice cream", imageUrl: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&h=300&fit=crop" },
    { name: "Green Tea", price: 99, category: "Beverages", isVeg: true, description: "Traditional Japanese matcha green tea", imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop" },
  ],
  "Taco Fiesta": [
    { name: "Chicken Tacos (3 pcs)", price: 279, category: "Tacos", isVeg: false, description: "Soft corn tortillas with spiced chicken and salsa", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&h=300&fit=crop" },
    { name: "Bean & Cheese Burrito", price: 249, category: "Burritos", isVeg: true, description: "Flour tortilla stuffed with beans, rice, and cheese", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&h=300&fit=crop" },
    { name: "Loaded Nachos", price: 229, category: "Starters", isVeg: true, description: "Crispy nachos with cheese, jalapeños, and guacamole", imageUrl: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=300&h=300&fit=crop" },
    { name: "Churros (6 pcs)", price: 179, category: "Desserts", isVeg: true, description: "Fried dough sticks with chocolate dipping sauce", imageUrl: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=300&h=300&fit=crop" },
    { name: "Quesadilla", price: 219, category: "Main Course", isVeg: true, description: "Grilled tortilla with melted cheese and peppers", imageUrl: "https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=300&h=300&fit=crop" },
    { name: "Mexican Rice Bowl", price: 259, category: "Main Course", isVeg: false, description: "Spiced rice bowl with chicken, beans, and sour cream", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=300&fit=crop" },
    { name: "Horchata", price: 119, category: "Beverages", isVeg: true, description: "Traditional cinnamon rice milk drink", imageUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&h=300&fit=crop" },
  ],
  "Café Mocha": [
    { name: "Avocado Toast", price: 249, category: "Brunch", isVeg: true, description: "Sourdough toast with mashed avocado and poached egg", imageUrl: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=300&h=300&fit=crop" },
    { name: "Eggs Benedict", price: 299, category: "Brunch", isVeg: false, description: "Poached eggs on English muffin with hollandaise", imageUrl: "https://images.unsplash.com/photo-1608039829572-9b0189f5c34d?w=300&h=300&fit=crop" },
    { name: "Blueberry Pancakes", price: 229, category: "Brunch", isVeg: true, description: "Fluffy pancakes with fresh blueberries and maple syrup", imageUrl: "https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=300&h=300&fit=crop" },
    { name: "Cappuccino", price: 179, category: "Beverages", isVeg: true, description: "Double shot espresso with steamed milk foam", imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&h=300&fit=crop" },
    { name: "Croissant", price: 149, category: "Pastries", isVeg: true, description: "Buttery French croissant, freshly baked", imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=300&h=300&fit=crop" },
    { name: "Chocolate Brownie", price: 169, category: "Desserts", isVeg: true, description: "Rich dark chocolate brownie with walnut chunks", imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=300&fit=crop" },
    { name: "Fresh Orange Juice", price: 129, category: "Beverages", isVeg: true, description: "Freshly squeezed orange juice, no sugar added", imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&h=300&fit=crop" },
  ],
  "Royal Mughlai": [
    { name: "Galouti Kebab", price: 349, category: "Starters", isVeg: false, description: "Melt-in-mouth minced lamb kebabs, Lucknowi style", imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop" },
    { name: "Mutton Korma", price: 449, category: "Main Course", isVeg: false, description: "Slow-cooked mutton in rich cashew-yogurt gravy", imageUrl: "https://images.unsplash.com/photo-1545247181-516773cae754?w=300&h=300&fit=crop" },
    { name: "Chicken Reshmi Kebab", price: 299, category: "Starters", isVeg: false, description: "Creamy marinated chicken skewers grilled to perfection", imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop" },
    { name: "Lucknowi Biryani", price: 399, category: "Main Course", isVeg: false, description: "Aromatic dum-style biryani with saffron and spices", imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&h=300&fit=crop" },
    { name: "Roomali Roti (3 pcs)", price: 89, category: "Breads", isVeg: true, description: "Paper-thin handkerchief bread cooked on inverted tawa", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&h=300&fit=crop" },
    { name: "Shahi Tukda", price: 199, category: "Desserts", isVeg: true, description: "Royal bread pudding with saffron rabri and nuts", imageUrl: "https://images.unsplash.com/photo-1666190053473-f7e9aa4e5c28?w=300&h=300&fit=crop" },
    { name: "Rose Sherbet", price: 99, category: "Beverages", isVeg: true, description: "Chilled rose-flavored milk drink with basil seeds", imageUrl: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&h=300&fit=crop" },
  ],
  "Green Bowl": [
    { name: "Buddha Bowl", price: 299, category: "Bowls", isVeg: true, description: "Quinoa, roasted chickpeas, avocado, and tahini dressing", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=300&fit=crop" },
    { name: "Acai Smoothie Bowl", price: 349, category: "Bowls", isVeg: true, description: "Frozen acai blended with banana, topped with granola", imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&h=300&fit=crop" },
    { name: "Caesar Salad", price: 249, category: "Salads", isVeg: false, description: "Romaine lettuce, croutons, parmesan, and Caesar dressing", imageUrl: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=300&h=300&fit=crop" },
    { name: "Green Detox Smoothie", price: 199, category: "Beverages", isVeg: true, description: "Spinach, kale, banana, and almond milk blend", imageUrl: "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=300&h=300&fit=crop" },
    { name: "Falafel Wrap", price: 229, category: "Main Course", isVeg: true, description: "Crispy falafel with hummus and pickled veggies in pita", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=300&fit=crop" },
    { name: "Protein Energy Bar", price: 149, category: "Snacks", isVeg: true, description: "Homemade bar with oats, nuts, dates, and dark chocolate", imageUrl: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=300&h=300&fit=crop" },
    { name: "Coconut Water", price: 99, category: "Beverages", isVeg: true, description: "Fresh tender coconut water served chilled", imageUrl: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=300&h=300&fit=crop" },
  ],
  "Shawarma Street": [
    { name: "Chicken Shawarma Roll", price: 179, category: "Wraps", isVeg: false, description: "Juicy chicken strips with garlic sauce in rumali wrap", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=300&h=300&fit=crop" },
    { name: "Paneer Shawarma Roll", price: 169, category: "Wraps", isVeg: true, description: "Spiced cottage cheese with vegetables in wrap", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=300&h=300&fit=crop" },
    { name: "Falafel Plate", price: 229, category: "Main Course", isVeg: true, description: "Crispy falafel with hummus, pita, and salad", imageUrl: "https://images.unsplash.com/photo-1593001874117-c99c800e3eb7?w=300&h=300&fit=crop" },
    { name: "Hummus & Pita", price: 149, category: "Starters", isVeg: true, description: "Creamy chickpea hummus with warm pita bread", imageUrl: "https://images.unsplash.com/photo-1577805947697-89340ce0422a?w=300&h=300&fit=crop" },
    { name: "Chicken Seekh Kebab", price: 249, category: "Starters", isVeg: false, description: "Minced chicken skewers with Middle Eastern spices", imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=300&fit=crop" },
    { name: "Baklava (3 pcs)", price: 179, category: "Desserts", isVeg: true, description: "Layered phyllo pastry with nuts and honey syrup", imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=300&h=300&fit=crop" },
    { name: "Mint Lemonade", price: 99, category: "Beverages", isVeg: true, description: "Fresh lemon with mint leaves and soda", imageUrl: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&h=300&fit=crop" },
  ],
};

/* ───────────────────────────────────────────────
   SEED RUNNER
   ─────────────────────────────────────────────── */
const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL connected");

    // Sync tables
    await Restaurant.sync({ alter: true });
    await Menu.sync({ alter: true });

    // Clear existing data (menu first due to FK)
    await Menu.destroy({ where: {} });
    await Restaurant.destroy({ where: {} });
    console.log("Cleared old data");

    // Insert restaurants
    const created = await Restaurant.bulkCreate(restaurants);
    console.log(`Seeded ${created.length} restaurants`);

    // Insert menu items for each restaurant
    let totalMenuItems = 0;
    for (const rest of created) {
      const template = menuTemplates[rest.name];
      if (template) {
        const items = template.map((item) => ({
          ...item,
          restaurantId: rest.id,
          isAvailable: true,
        }));
        await Menu.bulkCreate(items);
        totalMenuItems += items.length;
        console.log(`   ${rest.name} → ${items.length} dishes`);
      }
    }

    console.log(`\nSeeded ${totalMenuItems} menu items total!`);
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }
};

seed();
