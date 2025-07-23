import express from 'express';
import { listVMs } from './proxmox.js';

const router = express.Router();

router.get('/vms', async (req, res) => {
  try {
    const vms = await listVMs();
    res.json(vms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
