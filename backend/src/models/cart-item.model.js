const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

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
      type: DataTypes.ENUM("Black", "White"),
      allowNull: false,
      defaultValue: "Black",
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
