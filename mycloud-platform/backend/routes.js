import express from 'express';
const router = express.Router();

// ✅ Root endpoint
router.get('/', (req, res) => {
  res.send('🚀 MyCloud Backend is Running!');
});

// Your other routes (e.g. /vms, /create, etc.)
router.get('/test', (req, res) => {
  res.json({ message: 'Test route works!' });
});

export default router;