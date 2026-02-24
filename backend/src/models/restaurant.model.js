const { DataTypes } = require("sequelize");

const { sequelize } = require("../config/mysql");

const Restaurant = sequelize.define(
  "Restaurant",
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

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    isOpen: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },

    description: {
      type: DataTypes.TEXT,
    },

    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    cuisine: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },

    ownerId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "MongoDB User._id of the restaurant owner",
    },
  },
  {
    tableName: "restaurants",
    timestamps: true,
    indexes: [
      // Database Indexes for Performance
      {
        name: 'restaurant_name_idx',
        fields: ['name'] // Index on name for search queries
      },
      {
        name: 'restaurant_isOpen_idx',
        fields: ['isOpen'] // Index on isOpen for filtering
      },
      {
        name: 'restaurant_ownerId_idx',
        fields: ['ownerId'] // Index on ownerId for owner-scoped queries
      }
    ]
  }
);

module.exports = Restaurant;