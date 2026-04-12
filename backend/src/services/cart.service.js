const { Cart, CartItem, Product } = require("../models");

const getOrCreateCart = async (userId) => {
  const [cart] = await Cart.findOrCreate({ where: { userId }, defaults: { userId } });
  return cart;
};

const getFullCartByUserId = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return Cart.findByPk(cart.id, {
    include: [
      {
        model: CartItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });
};

module.exports = {
  getOrCreateCart,
  getFullCartByUserId,
};
