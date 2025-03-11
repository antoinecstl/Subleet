const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Joi = require('joi');
const dotenv = require('dotenv');
const ApiKey = require('../models/ApiKey');

dotenv.config();

// Schéma de validation pour l'inscription des clients
const clientSchema = Joi.object({
    name: Joi.string().min(3).max(255).required(),
    email: Joi.string().email().required(),
});

// Middleware to verify admin API key
const verifyAdmin = (req, res, next) => {
    const adminKey = req.headers['x-admin-api-key'];
    if (adminKey === process.env.ADMIN_API_KEY) {
        next();
    } else {
        return res.status(403).json({ error: 'Accès refusé.' });
    }
};

// Route pour inscrire un nouveau user
router.post('/register', verifyAdmin, async (req, res) => {
    // Valider la requête
    const { error, value } = clientSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email } = value;

    try {
        // Vérifier si le client existe déjà
        const existingClient = await Client.findByEmail(email);
        if (existingClient) {
            return res.status(400).json({ error: 'Un client avec cet email existe déjà.' });
        }

        // Créer le client et générer une API key
        const client = await Client.create(name, email);
        res.status(201).json({ message: 'Client inscrit avec succès.', apiKey: client.apiKey });
    } catch (err) {
        console.error('Erreur lors de l\'inscription du client :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Route pour révoquer une API key et en générer une nouvelle
const authenticate = require('../middleware/authenticate');

router.post('/revoke', authenticate, async (req, res) => {
    const apiKey = req.client.key;

    try {
        await Client.revokeApiKey(apiKey);
        // Générer une nouvelle clé API
        const newApiKey = await ApiKey.generate(req.client.id);
        res.json({ message: 'Clé API révoquée et une nouvelle clé a été générée.', apiKey: newApiKey.key });
    } catch (err) {
        console.error('Erreur lors de la révocation de la clé API :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Route pour récupérer la liste des utilisateurs et leurs clés API
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await Client.getAllUsersInfo();
        res.json(users);
    } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

// Route pour supprimer un client et ses clés
router.delete('/:id', verifyAdmin, async (req, res) => {
    const clientId = req.params.id;

    try {
        await Client.delete(clientId);
        res.json({ message: 'Client et toutes ses clés ont été supprimés avec succès.' });
    } catch (err) {
        console.error('Erreur lors de la suppression du client :', err);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

module.exports = router;
