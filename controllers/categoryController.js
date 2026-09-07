const pool = require('../config/db');

const createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name field is required"
        })
    }

    try {

        const existingCategory = await pool.query('SELECT * FROM categories WHERE name = $1', [name]);

        if (existingCategory.rowCount > 0) {
            return res.status(400).json({
                message: 'Category with this name already exists'
            })
        }

        const newCategory = await pool.query('INSERT INTO categories (name) VALUES ($1) RETURNING *', [name]);

        return res.status(201).json(newCategory.rows[0]);
    } catch (error) {

        console.error('Error creating category:', error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const getAllCategories = async (req, res) => {
    try{
        const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        return res.status(200).json(categories.rows);
    }catch(error){
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try{
        const category = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        if(category.rowCount === 0){
            return res.status(404).json({
                message: 'Category not found'
            });
        }
        return res.status(200).json(category.rows[0]);
    }catch(error){
        console.error('Error fetching category by ID:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const updateCategory = async (req, res) => {
    const {id} = req.params;
    const {name} = req.body;

    if (!name) {
        return res.status(400).json({
            message: "Name field is required"
        })
    }

    try{
        const existingCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);

        if (existingCategory.rowCount === 0) {
            return res.status(404).json({
                message: 'Category not found'
            })
        }

        const duplicateCheck = await pool.query('SELECT * FROM categories WHERE name = $1 AND id != $2', [name, id]);

        if(duplicateCheck.rowCount > 0){
            return res.status(400).json({
                message: 'Another category with this name already exists'
            })
        }
        
        const updateCategory = await pool.query('UPDATE categories SET name=$1 WHERE id = $2 RETURNING *', [name, id]);
        return res.status(200).json(updateCategory.rows[0]);

    }catch(error){
        console.error('Error updating category by ID:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const deleteCategory = async (req, res) => {
    const {id} = req.params;
    try{
        const existingCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
        
        if(existingCategory.rowCount === 0){
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        await pool.query('DELETE FROM categories WHERE id = $1', [id]);
        return res.status(200).json({ message: 'Category successfully deleted' });

    }catch(error){
        console.error('Error deleting category by ID:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

module.exports = {createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory};