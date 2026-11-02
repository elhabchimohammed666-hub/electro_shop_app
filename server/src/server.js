import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Variable d'environnement requise : ${name}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET doit contenir au moins 32 caractères.');
}

const port = Number(process.env.PORT) || 5000;
await connectDatabase();
app.listen(port, () => console.log(`API disponible sur http://localhost:${port}/api/v1`));
