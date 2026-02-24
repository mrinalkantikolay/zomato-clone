const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/mysql");

const Restaurant = require("../models/restaurant.model");


const Menu = sequelize.define(
  "Menu",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
    },

    imageUrl: {
      type: DataTypes.STRING,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "Main Course",
    },
    isVeg: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },

  {
    tableName: "menu",
    timestamps: true,
    indexes: [
      // Database Indexes for Performance
      {
        name: 'menu_restaurant_idx',
        fields: ['restaurantId'] // Index on restaurantId for faster menu queries
      },
      {
        name: 'menu_isAvailable_idx',
        fields: ['isAvailable'] // Index on isAvailable for filtering
      }
    ]
  }
);

Restaurant.hasMany(Menu, { foreignKey: "restaurantId" });
Menu.belongsTo(Restaurant, { foreignKey: "restaurantId" });

module.exports = Menu;