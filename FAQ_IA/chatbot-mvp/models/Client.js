const db = require('../db');

class Client {
    static async create(name, email) {
        const apiKey = require('uuid').v4(); // Générer une API key unique
        const query = `
            INSERT INTO clients (name, email)
            VALUES ($1, $2)
            RETURNING id, name, email, created_at
        `;
        const values = [name, email];
        const result = await db.query(query, values);
        const client = result.rows[0];

        // Insérer l'API key
        const apiKeyQuery = `
            INSERT INTO api_keys (client_id, key)
            VALUES ($1, $2)
            RETURNING key, created_at
        `;
        const apiKeyValues = [client.id, apiKey];
        const apiKeyResult = await db.query(apiKeyQuery, apiKeyValues);
        client.apiKey = apiKeyResult.rows[0].key;

        return client;
    }

    static async findByEmail(email) {
        const query = `
            SELECT * FROM clients
            WHERE email = $1
        `;
        const values = [email];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async findByApiKey(apiKey) {
        const query = `
            SELECT clients.*, api_keys.key, api_keys.revoked
            FROM clients
            JOIN api_keys ON clients.id = api_keys.client_id
            WHERE api_keys.key = $1
        `;
        const values = [apiKey];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async revokeApiKey(apiKey) {
        const query = `
            UPDATE api_keys
            SET revoked = TRUE
            WHERE key = $1
        `;
        const values = [apiKey];
        await db.query(query, values);
    }

    static async getAllUsersInfo() {
        const query = `
            SELECT clients.id, clients.name, clients.email, api_keys.key, api_keys.created_at, api_keys.revoked, api_keys.total_calls
            FROM clients
            LEFT JOIN api_keys ON clients.id = api_keys.client_id
        `;
        const result = await db.query(query);
        return result.rows;
    }

    static async delete(id) {
        const query = `
            DELETE FROM clients
            WHERE id = $1
        `;
        const values = [id];
        await db.query(query, values);
    }
}

module.exports = Client;
