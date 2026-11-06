import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { api } from './src/server/api.ts';
import { seedDatabase } from './src/db/seed.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API routes
app.use('/api', api);

// Serve static frontend in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Seed catalog on startup if needed and listen
seedDatabase().catch((err) => console.error('Seed check failed:', err));

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`AURA FIT Production Server listening on http://0.0.0.0:${PORT}`);
});

export default app;
