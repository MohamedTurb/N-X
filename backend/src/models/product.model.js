const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Product = sequelize.define(
  "Product",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    imageVariants: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    // `variants` removed to avoid selecting a non-existent DB column during queries.
  },
  {
    tableName: "products",
    timestamps: true,
  }
);

module.exports = Product;
