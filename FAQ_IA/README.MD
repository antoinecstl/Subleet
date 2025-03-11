Chatbot MVP Deployment Guide

Bienvenue dans le guide de déploiement de votre Chatbot MVP ! Ce document récapitule toutes les étapes nécessaires pour créer, dockeriser, déployer et sécuriser votre chatbot intelligent utilisant l'API OpenAI sur une VM Google Cloud Platform (GCP).
Table des Matières

    Prérequis
    Configuration de l'Environnement Local
    Développement de l'Application Backend
    Dockerisation de l'Application
    Déploiement sur une VM GCP
    Configuration de Nginx et HTTPS
    Test de l'Application avec Postman
    Surveillance et Gestion des Logs
    Intégration avec Plugins WordPress et Shopify (Optionnel)
    Automatisation du Déploiement (Optionnel)
    Bonnes Pratiques et Améliorations Futures
    Conclusion

Prérequis

Avant de commencer, assurez-vous d'avoir les éléments suivants :

    Compte Google Cloud Platform (GCP) avec une VM configurée.
    Accès SSH à votre VM GCP.
    Node.js et npm installés sur votre machine locale.
    Docker installé sur votre machine locale et votre VM GCP.
    Git (optionnel) pour la gestion de version.
    Postman pour tester les API.

Configuration de l'Environnement Local

    Cloner le Répertoire du Projet :

git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo

Créer et Configurer le Fichier .env :

Créez un fichier .env à la racine du projet avec les variables d'environnement suivantes :

PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
API_KEY=your_simple_api_key_here

    OPENAI_API_KEY : Votre clé API OpenAI.
    API_KEY : Une clé API unique pour sécuriser votre endpoint.

Installer les Dépendances :

    npm install

Développement de l'Application Backend

    Structure du Projet :

chatbot-mvp/
├── index.js
├── package.json
├── Dockerfile
├── .dockerignore
├── .env
└── README.md

Contenu de index.js :

// index.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const { Logging } = require('@google-cloud/logging');

const app = express();
const port = process.env.PORT || 3000;

// Initialiser Google Cloud Logging
const logging = new Logging();
const log = logging.log('chatbot-mvp');

// Middleware pour parser le JSON
app.use(express.json());

// Middleware de vérification de clé API
app.use((req, res, next) => {
    if (req.path === '/' || req.path === '/api-docs') {
        return next(); // Autoriser la route de base et Swagger sans clé API
    }

    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({ error: 'Clé API invalide ou manquante.' });
    }

    next();
});

// Configuration de Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chatbot API',
            version: '1.0.0',
            description: 'API pour interagir avec le chatbot utilisant OpenAI',
        },
        servers: [
            {
                url: `https://34.163.138.44`,
            },
        ],
    },
    apis: ['./index.js'],
};

const specs = swaggerJsdoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Envoyer un message au chatbot
 *     tags: [Chatbot]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 example: "Bonjour, comment ça va?"
 *     responses:
 *       200:
 *         description: Réponse du chatbot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reply:
 *                   type: string
 *                   example: "Bonjour ! Je vais bien, merci. Comment puis-je vous aider aujourd'hui?"
 *       400:
 *         description: Requête invalide
 *       401:
 *         description: Clé API invalide ou manquante
 *       500:
 *         description: Erreur interne du serveur
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     ApiKeyAuth:
 *       type: apiKey
 *       in: header
 *       name: x-api-key
 */

// Route de base pour vérifier le fonctionnement
app.get('/', (req, res) => {
    res.send('Chatbot MVP est en cours d\'exécution.');
});

// Route pour gérer les requêtes du chatbot
app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message manquant dans la requête.' });
    }

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages: [{ role: 'user', content: userMessage }],
            max_tokens: 150,
            temperature: 0.7,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });

        const botReply = response.data.choices[0].message.content.trim();

        // Créer une entrée de log
        const logEntry = log.entry({ resource: { type: 'global' } }, { userMessage, botReply });
        await log.write(logEntry);

        res.json({ reply: botReply });
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API OpenAI:', error.message);

        // Créer une entrée de log pour l'erreur
        const logEntry = log.entry({ resource: { type: 'global' } }, { error: error.message });
        await log.write(logEntry);

        res.status(500).json({ error: 'Erreur interne du serveur.' });
    }
});

app.listen(port, () => {
    console.log(`Backend démarré sur le port ${port}`);
});

Tester Localement :

node index.js

    Route de Base :

curl http://localhost:3000/

Réponse attendue :

Chatbot MVP est en cours d'exécution.

Route /chat :

Utilisez Postman ou une commande curl compatible PowerShell :

Invoke-RestMethod -Uri http://localhost:3000/chat -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"message": "Bonjour, comment ça va?"}'

Réponse attendue :

        {
          "reply": "Bonjour ! Je vais bien, merci. Comment puis-je vous aider aujourd'hui?"
        }

Dockerisation de l'Application

    Créer un Dockerfile :

    À la racine de votre projet, créez un fichier nommé Dockerfile avec le contenu suivant :

# Utiliser l'image officielle Node.js comme image de base
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install --only=production

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port sur lequel l'application va tourner
EXPOSE 3000

# Définir la commande pour démarrer l'application
CMD ["node", "index.js"]

Créer un .dockerignore :

Pour optimiser la construction de l'image Docker, créez un fichier .dockerignore :

touch .dockerignore

Ajoutez les lignes suivantes :

node_modules
npm-debug.log
.env

Construire et Tester l'Image Docker Localement :

docker build -t chatbot-mvp .
docker run -d -p 3000:3000 --env-file .env --name chatbot-mvp chatbot-mvp

    Tester les Endpoints :

curl http://localhost:3000/

        curl -X POST http://localhost:3000/chat -H "Content-Type: application/json" -d '{"message": "Bonjour, comment ça va?"}'

Déploiement sur une VM GCP

    Transférer les Fichiers sur la VM GCP :

        Option 1 : Utiliser Git (si le projet est sur GitHub) :

git clone https://github.com/votre-utilisateur/votre-repo.git
cd votre-repo

Option 2 : Utiliser scp :

Depuis votre machine locale :

    scp -r /path/to/chatbot-mvp user@34.163.138.44:/home/user/chatbot-mvp

Configurer les Variables d'Environnement sur la VM :

cd chatbot-mvp
nano .env

Ajoutez :

PORT=3000
OPENAI_API_KEY=your_openai_api_key_here
API_KEY=your_simple_api_key_here

Construire et Exécuter le Conteneur Docker sur la VM :

docker build -t chatbot-mvp .
docker run -d -p 3000:3000 --env-file .env --name chatbot-mvp chatbot-mvp

Vérifier que le Conteneur Fonctionne :

    docker ps

Configuration de Nginx et HTTPS

    Installer Nginx sur la VM :

sudo apt-get update
sudo apt-get install nginx

Configurer Nginx comme Proxy Inverse :

Créez un fichier de configuration pour votre site :

sudo nano /etc/nginx/sites-available/chatbot

Ajoutez la configuration suivante :

server {
    listen 80;
    server_name 34.163.138.44;

    # Rediriger tout le trafic HTTP vers HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name 34.163.138.44;

    ssl_certificate /etc/ssl/certs/chatbot-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/chatbot-selfsigned.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

Générer un Certificat SSL Auto-Signé :

sudo openssl genrsa -out /etc/ssl/private/chatbot-selfsigned.key 2048
sudo openssl req -new -x509 -key /etc/ssl/private/chatbot-selfsigned.key -out /etc/ssl/certs/chatbot-selfsigned.crt -days 365 -subj "/CN=34.163.138.44"

Activer la Configuration du Site :

sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/

Tester la Configuration de Nginx :

sudo nginx -t

Redémarrer Nginx :

    sudo systemctl restart nginx

    Configurer les Règles de Pare-feu GCP pour HTTP et HTTPS :

        Ouvrir le Port 80 (HTTP) :
            Via la Console GCP :
                Allez dans VPC Network > Firewall.
                Cliquez sur Create Firewall Rule.
                Configurez :
                    Name : allow-http
                    Network : default
                    Targets : All instances in the network
                    Source IP ranges : 0.0.0.0/0
                    Protocols and ports : tcp:80
                Cliquez sur Create.

        Ouvrir le Port 443 (HTTPS) :
            Via la Console GCP :
                Allez dans VPC Network > Firewall.
                Cliquez sur Create Firewall Rule.
                Configurez :
                    Name : allow-https
                    Network : default
                    Targets : All instances in the network
                    Source IP ranges : 0.0.0.0/0
                    Protocols and ports : tcp:443
                Cliquez sur Create.

Test de l'Application avec Postman
1. Tester la Route de Base

    Méthode : GET

    URL : https://34.163.138.44/

    Résultat Attendu :

    Chatbot MVP est en cours d'exécution.

2. Tester la Route /chat

    Méthode : POST

    URL : https://34.163.138.44/chat

    Headers :
    Key	Value
    Content-Type	application/json
    x-api-key	your_simple_api_key_here

    Body :

{
  "message": "Bonjour, comment ça va?"
}

Réponse Attendue :

    {
      "reply": "Bonjour ! Je vais bien, merci. Comment puis-je vous aider aujourd'hui?"
    }

3. Tester sans la Clé API ou avec une Clé Invalide

    Méthode : POST

    URL : https://34.163.138.44/chat

    Headers :
    Key	Value
    Content-Type	application/json
    x-api-key	Non défini ou invalide

    Body :

{
  "message": "Bonjour, comment ça va?"
}

Réponse Attendue :

    {
      "error": "Clé API invalide ou manquante."
    }

Note : Pour gérer les certificats auto-signés dans Postman, désactivez la vérification SSL :

    Ouvrez Postman.
    Allez dans Settings (icône d'engrenage en haut à droite).
    Sous l'onglet General, désactivez SSL certificate verification.

Surveillance et Gestion des Logs
1. Surveiller les Logs de l'Application

    Afficher les Logs du Conteneur :

docker logs chatbot-mvp

Suivre les Logs en Temps Réel :

    docker logs -f chatbot-mvp

2. Intégrer avec Google Cloud Logging (Optionnel)

    Installer le Client Google Cloud Logging :

npm install @google-cloud/logging

Modifier index.js pour Intégrer Google Cloud Logging :

(Voir la section Développement de l'Application Backend pour le code complet.)

Configurer les Permissions IAM :

    Allez dans IAM & Admin > IAM dans la Console GCP.
    Trouvez le compte de service de votre VM.
    Assurez-vous qu'il a le rôle Logs Writer (roles/logging.logWriter).

Rebuilder et Redémarrer le Conteneur Docker :

    docker stop chatbot-mvp
    docker rm chatbot-mvp
    docker build -t chatbot-mvp .
    docker run -d -p 80:80 -p 443:443 --env-file .env --name chatbot-mvp chatbot-mvp

    Vérifier les Logs dans Google Cloud Logging :
        Accédez à la console de Google Cloud Logging.
        Sélectionnez le log nommé chatbot-mvp.

3. Automatiser le Redémarrage du Conteneur en Cas de Crash

Utilisez l'option --restart unless-stopped lors de l'exécution du conteneur Docker :

docker run -d -p 80:80 -p 443:443 --env-file .env --restart unless-stopped --name chatbot-mvp chatbot-mvp

Intégration avec Plugins WordPress et Shopify (Optionnel)
1. Développer un Plugin WordPress

    Créer un Répertoire pour le Plugin :

mkdir -p wordpress/wp-content/plugins/chatbot-faq
cd wordpress/wp-content/plugins/chatbot-faq

Créer le Fichier Principal du Plugin :

chatbot-faq.php

    <?php
    /*
    Plugin Name: Chatbot FAQ
    Description: Intègre un chatbot FAQ intelligent sur votre site WordPress.
    Version: 1.0
    Author: Votre Nom
    */

    // Ajouter un shortcode pour afficher le chatbot
    function chatbot_faq_shortcode() {
        ob_start();
        ?>
        <div id="chatbot">
            <h2>FAQ Intelligent</h2>
            <div id="chatbox" style="border:1px solid #ccc; padding:10px; height:300px; overflow-y:scroll;"></div>
            <input type="text" id="user-input" placeholder="Posez une question..." style="width:80%;">
            <button id="send-button">Envoyer</button>
        </div>

        <script>
            document.getElementById('send-button').addEventListener('click', function() {
                const message = document.getElementById('user-input').value;
                if (!message) return;

                fetch('https://34.163.138.44/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': 'your_simple_api_key_here'
                    },
                    body: JSON.stringify({ message })
                })
                .then(response => response.json())
                .then(data => {
                    const chatbox = document.getElementById('chatbox');
                    const userMessage = document.createElement('p');
                    userMessage.style.fontWeight = 'bold';
                    userMessage.textContent = 'Vous: ' + message;
                    chatbox.appendChild(userMessage);

                    const reply = document.createElement('p');
                    reply.textContent = 'Bot: ' + data.reply;
                    chatbox.appendChild(reply);
                    document.getElementById('user-input').value = '';

                    // Scroll automatique vers le bas
                    chatbox.scrollTop = chatbox.scrollHeight;
                })
                .catch(error => console.error('Erreur:', error));
            });
        </script>
        <?php
        return ob_get_clean();
    }
    add_shortcode('chatbot_faq', 'chatbot_faq_shortcode');

    Activer le Plugin dans WordPress :
        Allez dans le tableau de bord WordPress : Extensions > Ajouter > Téléverser une extension.
        Téléversez le dossier chatbot-faq et activez le plugin.

    Utiliser le Shortcode :
        Insérez [chatbot_faq] dans une page ou un article pour afficher le chatbot.

2. Développer une Application Shopify (Optionnel)

Développer une application Shopify nécessite des connaissances spécifiques et suivre la documentation officielle de Shopify.
Automatisation du Déploiement (Optionnel)

Automatisez la construction et le déploiement de votre application en utilisant GitHub Actions.

    Créer un Workflow GitHub Actions :

    Créez le fichier .github/workflows/deploy.yml dans votre dépôt GitHub :

    name: Deploy to GCP VM

    on:
      push:
        branches:
          - main

    jobs:
      build-and-deploy:
        runs-on: ubuntu-latest

        steps:
        - name: Checkout code
          uses: actions/checkout@v3

        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v2

        - name: Build Docker image
          run: docker build -t chatbot-mvp .

        - name: Save Docker image as artifact
          uses: actions/upload-artifact@v3
          with:
            name: chatbot-mvp
            path: chatbot-mvp.tar

        - name: Download artifact
          uses: actions/download-artifact@v3
          with:
            name: chatbot-mvp
            path: .

        - name: Load Docker image
          run: docker load -i chatbot-mvp.tar

        - name: SSH to GCP VM and Deploy
          uses: appleboy/ssh-action@v0.1.4
          with:
            host: ${{ secrets.GCP_VM_IP }}
            username: ${{ secrets.GCP_VM_USER }}
            key: ${{ secrets.GCP_SSH_KEY }}
            script: |
              docker stop chatbot-mvp || true
              docker rm chatbot-mvp || true
              docker run -d -p 80:80 -p 443:443 --env-file /home/user/chatbot-mvp/.env --restart unless-stopped --name chatbot-mvp chatbot-mvp

    Ajouter les Secrets dans GitHub :
        Allez dans votre dépôt GitHub : Settings > Secrets and variables > Actions.
        Ajoutez les secrets suivants :
            GCP_VM_IP : Adresse IP de votre VM.
            GCP_VM_USER : Nom d'utilisateur pour SSH.
            GCP_SSH_KEY : Clé SSH privée pour authentifier la connexion.

    Configurer le Workflow :
        Ce workflow construit l'image Docker, la sauvegarde comme artefact, puis se connecte à votre VM GCP via SSH pour redémarrer le conteneur avec la nouvelle image.

Bonnes Pratiques et Améliorations Futures

    Gestion Sécurisée des Secrets :
        Utilisez Google Secret Manager pour stocker vos clés API et autres informations sensibles.

    Limitation des Accès SSH :
        Utilisez des clés SSH fortes.
        Désactivez l'authentification par mot de passe.
        Restreignez les adresses IP autorisées à se connecter via SSH.

    Mise en Place de Rate Limiting Avancé :
        Utilisez des outils comme Redis pour implémenter des mécanismes de rate limiting plus sophistiqués.

    Scalabilité :
        Envisagez de déployer votre application dans un environnement scalable comme Google Kubernetes Engine (GKE) si le trafic augmente.

    Optimisation des Performances :
        Implémentez la mise en cache des réponses fréquentes.
        Optimisez les appels à l'API OpenAI en ajustant les paramètres comme max_tokens et temperature.

    Surveillance Continue :
        Intégrez des outils de monitoring comme Google Cloud Monitoring pour surveiller les performances et la disponibilité de votre application.
        Configurez des alertes pour être notifié en cas de problèmes.

    Amélioration de la Documentation :
        Maintenez votre documentation Swagger à jour.
        Rédigez des guides supplémentaires pour l'installation, la configuration et l'utilisation de votre API.

    Recueillir des Retours Utilisateurs :
        Testez votre MVP avec des utilisateurs réels et recueillez leurs retours pour identifier les points d'amélioration et ajouter des fonctionnalités pertinentes.

Conclusion

Vous avez maintenant un MVP fonctionnel et sécurisé de votre chatbot ! Voici un récapitulatif des fonctionnalités et configurations mises en place :

    Application Node.js avec Express : Gère les requêtes et interagit avec l'API OpenAI.
    Docker : Conteneurise l'application pour un déploiement facile et reproductible.
    Nginx : Sert de proxy inverse, permettant un accès via HTTP et HTTPS.
    Authentification par Clé API : Protège votre endpoint /chat.
    Swagger : Documente votre API pour faciliter son utilisation et son intégration future.
    Postman : Utilisé pour tester et interagir avec votre API.
    Google Cloud Logging : Intégration pour la gestion avancée des logs.
    GitHub Actions : Automatisation du déploiement via CI/CD.

Prochaines Étapes :

    Automatiser le Déploiement : Utilisez des outils comme GitHub Actions pour automatiser la construction et le déploiement de vos images Docker.
    Améliorer la Sécurité et la Scalabilité :
        Mettre en place HTTPS avec un nom de domaine via un service de DNS dynamique si nécessaire.
        Intégrer des outils de gestion des secrets comme Google Secret Manager.
        Préparer votre application pour une montée en charge si nécessaire.
    Développer des Plugins pour WordPress et Shopify : Faciliter l'intégration de votre chatbot sur les sites de vos clients.
    Surveiller et Optimiser les Performances : Assurer une expérience utilisateur fluide et réactive.
    Ajouter des Fonctionnalités Avancées : Par exemple, la gestion des sessions utilisateurs, l'apprentissage contextuel, etc.