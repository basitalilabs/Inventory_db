const pool = require('../config/db');

// create a new product

const createProduct = async (req, res) => {
    const { name, description, price, stock, category_id } = req.body;

    if (!name || !price || !stock || !category_id) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (isNaN(price) || isNaN(stock)) {
        return res.status(400).json({ message: 'Price and stock must be numbers' });
    }

    if (price <= 0 || stock < 0) {
        return res.status(400).json({ message: 'Price and stock must be non-negative' });
    }

    try {
        const categoryCheck = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id]);
        if (categoryCheck.rowCount === 0) {
            return res.status(400).json({ message: 'Invalid category_id — category does not exist' });
        }

        const newProduct = await pool.query(
            'INSERT INTO products (name, description, price, stock, category_id, created_by) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, description, price, stock, category_id, req.user.id]
        );
        res.status(201).json(newProduct.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

module.exports = { createProduct };