import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';

async function start() {
  await connectDB();
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log(`Server running on port ${port}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});