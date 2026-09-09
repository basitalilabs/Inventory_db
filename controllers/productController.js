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

const getAllProducts = async (req, res) => {
    try{
        const products = await pool.query(
            `SELECT products.*, categories.name AS category_name
            FROM products
            LEFT JOIN categories ON products.category_id = categories.id`
        )
        return res.status(200).json(products.rows)
    }catch(error){
        console.error('Error fetching categories:', error);
        return res.status(500).json({
            message: 'Internal server error'
        });
    }
}

const getProductById = async(req, res) =>{
    const {id} = req.params;
    try{
        const product = await pool.query(
            `SELECT products.*, categories.name AS category_name
            FROM products
            LEFT JOIN categories ON products.category_id = categories.id
            WHERE products.id = $1`, [id]
        )
        if(product.rowCount === 0){
            return res.status(404).json({
                message: 'Product not found'
            });
        }
        return res.status(200).json(product.rows[0])
    }catch(error){
        console.log("Fetching Product By Id error");
        return res.status(500).json({
            message : 'Internal Server Problem'
        })
    }
}

const updateProductById = async(req, res) => {
    const {name, description, price, stock, category_id} = req.body;
    const {id} = req.params;
    if (!name || !price || !stock || !category_id) {
        return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (isNaN(price) || isNaN(stock)) {
        return res.status(400).json({ message: 'Price and stock must be numbers' });
    }

    if (price <= 0 || stock < 0) {
        return res.status(400).json({ message: 'Price and stock must be non-negative' });
    }

    try{
        const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if(existingProduct.rowCount === 0){
            return res.status(404).json({
                message : "The product is not exist"
            })
        }
        const existingCategory = await pool.query('SELECT * FROM categories WHERE id = $1', [category_id]);
        if(existingCategory.rowCount === 0){
            return res.status(404).json({
                message : "Invalid category_id — category does not exist"
            })
        }

        const updatedProduct = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, category_id = $5 WHERE id = $6 RETURNING *',
            [name, description, price, stock, category_id, id]
        );
        return res.status(200).json(updatedProduct.rows[0]);
    }catch(error){
        console.log("Error Updating Product by Id", error);
        return res.status(500).json({
            message : "Internal Server Error"
        })
    }
}

const deleteProduct = async(req, res) => {
    const {id} = req.params;

    try{
        const existingProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
        if(existingProduct.rowCount === 0){
            return res.status(404).json({
                message : "The product is not exist"
            })
        }

        await pool.query('DELETE FROM products WHERE id = $1', [id]);
        return res.status(200).json({
            message : "Product deleted successfully"
        });

    }catch(error){
        console.log("Error : Delete the Product ", error);
        return res.status(500).json({
            message : "Internal Server Error"
        });
    }
}

module.exports = { createProduct, getAllProducts, getProductById, updateProductById, deleteProduct };