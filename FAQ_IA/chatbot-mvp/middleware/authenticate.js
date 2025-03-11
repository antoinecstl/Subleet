const Client = require('../models/Client');

const authenticate = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'Clé API manquante.' });

    try {
        const client = await Client.findByApiKey(apiKey);
        if (!client || client.revoked) {
            return res.status(401).json({ error: 'Clé API invalide ou révoquée.' });
        }

        req.client = client; // Attache le client à la requête pour un accès ultérieur
        next();
    } catch (error) {
        console.error('Erreur lors de l\'authentification :', error);
        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
};

module.exports = authenticate;
