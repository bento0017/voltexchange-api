const express = require('express');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const metersRoutes = require('./routes/meters');
const adminRoutes = require('./routes/admin');
const marketRoutes = require('./routes/market');
const usersRoutes = require('./routes/users');

const app = express();
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/meters', metersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({ message: 'VoltExchange API' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor a correr na porta ${PORT}`);
});
