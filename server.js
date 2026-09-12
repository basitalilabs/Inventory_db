const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);

app.get('/', (_req, res) => {
    res.send('Mini IMS API is running');
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});