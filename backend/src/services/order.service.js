const { sequelize, CartItem, Product, Order, OrderItem, Cart } = require("../models");
const ApiError = require("../utils/api-error");

const createOrderFromCart = async (userId, orderMeta = {}) => {
  const transaction = await sequelize.transaction();

  try {
    const cart = await Cart.findOne({ where: { userId }, transaction });

    if (!cart) {
      throw new ApiError(400, "Cart is empty");
    }

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [{ model: Product, as: "product", required: true }],
      transaction,
      lock: {
        level: transaction.LOCK.UPDATE,
        of: CartItem,
      },
    });

    if (!cartItems.length) {
      throw new ApiError(400, "Cart is empty");
    }

    let total = 0;

    for (const item of cartItems) {
      if (item.quantity > item.product.stock) {
        throw new ApiError(
          400,
          `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`
        );
      }
      total += Number(item.product.price) * item.quantity;
    }

    const order = await Order.create(
      {
        userId,
        totalPrice: total.toFixed(2),
        customerName: orderMeta.customerName?.trim() || null,
        customerEmail: orderMeta.customerEmail?.trim() || null,
        customerPhone: orderMeta.customerPhone?.trim() || null,
        shippingAddress: orderMeta.shippingAddress?.trim() || null,
        governorate: orderMeta.governorate?.trim() || null,
        buildingNumber: orderMeta.buildingNumber?.trim() || null,
        floorNumber: orderMeta.floorNumber?.trim() || null,
        landmark: orderMeta.landmark?.trim() || null,
        status: "pending",
      },
      { transaction }
    );

    for (const item of cartItems) {
      await OrderItem.create(
        {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          color: item.color,
          price: item.product.price,
        },
        { transaction }
      );

      await Product.update(
        { stock: item.product.stock - item.quantity },
        { where: { id: item.productId }, transaction }
      );
    }

    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    return Order.findByPk(order.id, {
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  createOrderFromCart,
};
