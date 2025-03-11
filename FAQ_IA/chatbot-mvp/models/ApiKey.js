const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class ApiKey {
    static async generate(clientId) {
        const key = uuidv4();
        const query = `
            INSERT INTO api_keys (client_id, key)
            VALUES ($1, $2)
            RETURNING key, created_at
        `;
        const values = [clientId, key];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async revoke(key) {
        const query = `
            UPDATE api_keys
            SET revoked = TRUE
            WHERE key = $1
        `;
        const values = [key];
        await db.query(query, values);
    }

    static async find(key) {
        const query = `
            SELECT * FROM api_keys
            WHERE key = $1 AND revoked = FALSE
        `;
        const values = [key];
        const result = await db.query(query, values);
        return result.rows[0];
    }

    static async increment(key) {
        const query = `
            UPDATE api_keys
            SET total_calls = total_calls + 1
            WHERE key = $1
        `;
        const values = [key];
        await db.query(query, values);
    }
}

module.exports = ApiKey;
