const pool = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;

  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE name = $1",
    [name],
  );

  if (existingCategory.rowCount > 0) {
    throw new AppError("Category with this name already exists", 400);
  }

  const newCategory = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [name],
  );

  return res.status(201).json({ success: true, data: newCategory.rows[0] });
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await pool.query(
    "SELECT * FROM categories ORDER BY id ASC",
  );
  return res.status(200).json({ success: true, data: categories.rows });
});

const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const category = await pool.query("SELECT * FROM categories WHERE id = $1", [
    id,
  ]);
  if (category.rowCount === 0) {
    throw new AppError("Category not found", 404);
  }
  return res.status(200).json({ success: true, data: category.rows[0] });
});

const updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [id],
  );

  if (existingCategory.rowCount === 0) {
    throw new AppError("Category not found", 404);
  }

  const duplicateCheck = await pool.query(
    "SELECT * FROM categories WHERE name = $1 AND id != $2",
    [name, id],
  );

  if (duplicateCheck.rowCount > 0) {
    throw new AppError("Another category with this name already exists", 400);
  }

  const updatedCategory = await pool.query(
    "UPDATE categories SET name=$1 WHERE id = $2 RETURNING *",
    [name, id],
  );
  return res.status(200).json({ success: true, data: updatedCategory.rows[0] });
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const existingCategory = await pool.query(
    "SELECT * FROM categories WHERE id = $1",
    [id],
  );

  if (existingCategory.rowCount === 0) {
    throw new AppError("Category not found", 404);
  }

  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
  return res.status(200).json({ success: true, message: "Category successfully deleted" });
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
