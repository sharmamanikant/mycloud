const axios = require("axios");

exports.createVM = async (req, res) => {
  try {
    const { name, cores, memory, disk } = req.body;

    // Proxmox API call (adjust node, storage, etc.)
    const response = await axios.post(
      `${process.env.PROXMOX_API_URL}/nodes/pve/qemu`,
      {
        vmid: Math.floor(Math.random() * 100000), // Generate VM ID
        name,
        cores,
        memory,
        disk,
      },
      {
        headers: {
          Authorization: `PVEAPIToken=${process.env.PROXMOX_USER}!${process.env.PROXMOX_TOKEN_ID}=${process.env.PROXMOX_SECRET}`,
        },
      }
    );

    res.json({ msg: "VM creation started", data: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating VM" });
  }
};
