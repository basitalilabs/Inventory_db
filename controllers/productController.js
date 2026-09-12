const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createProduct = catchAsync(async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;

  const categoryCheck = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [category_id],
  );
  if (categoryCheck.rowCount === 0) {
    throw new AppError("Invalid category_id — category does not exist", 400);
  }

  const newProduct = await pool.query(
    "INSERT INTO products (name, description, price, stock, category_id, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [name, description, price, stock, category_id, req.user.id],
  );
  return res
    .status(201)
    .json({
      success: true,
      message: "Product created successfully",
      data: newProduct.rows[0],
    });
});

const getAllProducts = catchAsync(async (req, res) => {
  const products = await pool.query(
    `SELECT products.*, categories.name AS category_name
            FROM products
            LEFT JOIN categories ON products.category_id = categories.id`,
  );
  return res
    .status(200)
    .json({ success: true, message: "Products fetched successfully", data: products.rows });
});

const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const product = await pool.query(
    `SELECT products.*, categories.name AS category_name
            FROM products
            LEFT JOIN categories ON products.category_id = categories.id
            WHERE products.id = $1`,
    [id],
  );
  if (product.rowCount === 0) {
    throw new AppError("Product not found", 404);
  }
  return res
    .status(200)
    .json({ success: true, message: "Product fetched successfully", data: product.rows[0] });
});

const updateProductById = catchAsync(async (req, res) => {
  const { name, description, price, stock, category_id } = req.body;
  const { id } = req.params;

  const existingProduct = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id],
  );
  if (existingProduct.rowCount === 0) {
    throw new AppError("Product not found", 404);
  }
  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [category_id],
  );
  if (existingCategory.rowCount === 0) {
    throw new AppError("Invalid category_id — category does not exist", 400);
  }

  const updatedProduct = await pool.query(
    "UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5 WHERE id = $6 RETURNING *",
    [name, description, price, stock, category_id, id],
  );
  return res
    .status(200)
    .json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct.rows[0],
    });
});

const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params;

  const existingProduct = await pool.query(
    "SELECT * FROM products WHERE id = $1",
    [id],
  );
  if (existingProduct.rowCount === 0) {
    throw new AppError("Product not found", 404);
  }

  await pool.query("DELETE FROM products WHERE id = $1", [id]);
  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProduct,
};
