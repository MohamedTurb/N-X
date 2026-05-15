const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { PRODUCT_COLORS, DEFAULT_PRODUCT_COLOR } = require("../utils/colors");

const CartItem = sequelize.define(
  "CartItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cartId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
    color: {
      type: DataTypes.ENUM(...PRODUCT_COLORS),
      allowNull: false,
      defaultValue: DEFAULT_PRODUCT_COLOR,
    },
  },
  {
    tableName: "cart_items",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["cartId", "productId"],
      },
    ],
  }
);

module.exports = CartItem;
