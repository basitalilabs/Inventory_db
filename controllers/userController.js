const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser =  async (req, res) => {
    // destructure the request body to get the username, email, and password
    const { name, email, password } = req.body;

    //validate that all required fields are present
    if (!name || !email || !password) {
        return res.status(400).json({
            message: 'Username, email, and password are required'
        })
    }

    // validate that the password is at least 8 characters long
    if(password.length < 8){
        return res.status(400).json({
            message: 'Password must be at least 8 characters long'
        })
    }

    //validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(emailRegex.test(email) === false){
        return res.status(400).json({
            message: 'Invalid email format'
        })
    }

    // if email already exists in the database, return an error
    
    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rowCount > 0) {
            return res.status(400).json({
                message: 'Email already exists'
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await pool.query(
          "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
          [name, email, hashedPassword],
        );

        if(newUser.rowCount > 0){
            return res.status(201).json({
                message: 'User created successfully',
                user: newUser.rows[0]
            });
        }else{
            return res.status(500).json({
                message: 'Failed to create user'
            })
        }
    }catch (error){
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if(!email || !password){
        return res.status(400).json({
            message: 'Email and password are required'
        })
    }

    try{
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rowCount === 0) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
          { id: user.rows[0].id, email: user.rows[0].email },
          process.env.JWT_SECRET,
          { expiresIn: "1h" },
        );

        const { password: _, ...safeUser } = user.rows[0];

        return res.status(200).json({
            message: 'Login successful',
            token: token,
            user: safeUser
        });

    }catch (error){
        return res.status(500).json({
            message: 'Internal server error'
        })
    }
}

module.exports = { registerUser, loginUser };