// index.js
const express = require('express');
const axios = require('axios');
const ApiKey = require('./models/ApiKey');
const cors = require('cors'); // Import CORS
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Configure CORS globally
app.use(cors({
    origin: 'http://localhost:3000', // REMPLACER QUAND PASSAGE DU SITE EN FRONT
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'x-admin-api-key', 'x-api-key']
}));

// Importer les routes
const clientRoutes = require('./routes/clients');
const protectedRoutes = require('./routes/protected');

// Utiliser les routes
app.use('/api/clients', clientRoutes);
app.use('/api', protectedRoutes);

// Route de base pour vérifier le fonctionnement
app.get('/', (req, res) => {
    res.send('Catalysia is UP !.');
});

// Route pour gérer les requêtes du chatbot
const authenticate = require('./middleware/authenticate');

app.post('/api/chat', authenticate, async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message manquant dans la requête.' });
    }

    try {
        // Incrémenter le compteur total_calls en utilisant l'API key
        await ApiKey.increment(req.client.key);

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4o-mini', 
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 1500,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const botReply = response.data.choices[0].message.content.trim();
        res.json({ reply: botReply });
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API OpenAI:', error.message);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.listen(port, () => {
    console.log(`Backend démarré sur le port ${port}`);
});
