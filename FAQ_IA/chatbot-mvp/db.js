const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.on('connect', () => {
    console.log('Connexion à PostgreSQL réussie.');
});

pool.on('error', (err) => {
    console.error('Erreur de connexion PostgreSQL :', err);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
