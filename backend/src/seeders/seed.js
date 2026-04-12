require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Product, Cart } = require("../models");

const seed = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const customerPassword = await bcrypt.hash("Customer@123", 10);

    const [admin, customer] = await Promise.all([
      User.create({
        username: "noxadmin",
        email: "admin@nox.com",
        password: adminPassword,
        role: "admin",
      }),
      User.create({
        username: "noxcustomer",
        email: "customer@nox.com",
        password: customerPassword,
        role: "customer",
      }),
    ]);

    await Promise.all([Cart.create({ userId: admin.id }), Cart.create({ userId: customer.id })]);

    await Product.bulkCreate([
      {
        name: "Shadow Graphic Tee",
        description: "Oversized cotton t-shirt with reflective print.",
        price: 39.99,
        stock: 80,
        category: "t-shirts",
        imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
      },
      {
        name: "Midnight Utility Hoodie",
        description: "Heavyweight hoodie with hidden zip pocket.",
        price: 89.99,
        stock: 45,
        category: "hoodies",
        imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7",
      },
      {
        name: "Cipher Cargo Pants",
        description: "Relaxed-fit cargo with adjustable hem cords.",
        price: 74.5,
        stock: 35,
        category: "pants",
        imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80",
      },
      {
        name: "Nox Core Cap",
        description: "Structured six-panel cap with embroidered Nox logo.",
        price: 29,
        stock: 120,
        category: "accessories",
        imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b",
      },
    ]);

    console.log("Seed completed successfully");
    console.log("Admin login: admin@nox.com / Admin@123");
    console.log("Customer login: customer@nox.com / Customer@123");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
