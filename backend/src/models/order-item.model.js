const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const { PRODUCT_COLORS, DEFAULT_PRODUCT_COLOR } = require("../utils/colors");

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderId: {
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
      validate: { min: 1 },
    },
    color: {
      type: DataTypes.ENUM(...PRODUCT_COLORS),
      allowNull: false,
      defaultValue: DEFAULT_PRODUCT_COLOR,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0 },
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

module.exports = OrderItem;
