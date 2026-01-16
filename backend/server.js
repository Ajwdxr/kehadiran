import 'dotenv/config';
import app from './src/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  🚀 Kehadiran API Server
  ========================
  Status: Running
  Port: ${PORT}
  Mode: ${process.env.NODE_ENV || 'development'}
  Database: ${process.env.DB_TYPE || 'mysql'}
  ========================
  `);
});
