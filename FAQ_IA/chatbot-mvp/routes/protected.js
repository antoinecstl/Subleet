// routes/protected.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');

// Exemple d'endpoint protégé
router.get('/protected', authenticate, (req, res) => {
    res.json({ message: `Bonjour, ${req.client.name}! Vous avez accès à cet endpoint.` });
});

module.exports = router;
