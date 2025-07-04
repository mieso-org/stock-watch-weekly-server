const serverless = require('serverless-http');
const express = require('express');
const { SecretsManagerClient, GetSecretValueCommand } = require('@aws-sdk/client-secrets-manager');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

let pool;
async function initPool() {
  if (pool) return pool;
  const client = new SecretsManagerClient();
  const secret = await client.send(new GetSecretValueCommand({ SecretId: process.env.SECRET_ARN }));
  const config = JSON.parse(secret.SecretString);
  pool = new Pool({ 
    host: config.host,
    port: config.port,
    user: config.username,
    password: config.password,
    database: config.dbname,
    ssl: { rejectUnauthorized: false }
  });
  return pool;
}

app.get('/portfolio', async (req, res) => {
  const db = await initPool();
  const { rows } = await db.query('SELECT * FROM portfolio_positions');
  res.json({ success: true, data: rows });
});

// Dodaj inne trasy z kontrolerów…

module.exports.handler = serverless(app);
