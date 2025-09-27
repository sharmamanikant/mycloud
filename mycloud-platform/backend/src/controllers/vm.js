const axios = require("axios");

exports.createVM = async (req, res) => {
  try {
    const { name, cores, memory, disk } = req.body;

    // Proxmox API call (adjust node, storage, etc.)
    const response = await axios.post(
      `${process.env.https://10.30.0.100:8006/#v1:0:18:4:5::::::=apitokens}/nodes/pve/qemu`,
      {
        vmid: Math.floor(Math.random() * 100000), // Generate VM ID
        name,
        cores,
        memory,
        disk,
      },
      {
        headers: {
          Authorization: `PVEAPIToken=${process.env.root}!${process.env.root@pam!cloud}=${process.env.e9418a2d-e7ea-43fa-95d2-2cbfdb9a32b8}`,
        },
      }
    );

    res.json({ msg: "VM creation started", data: response.data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error creating VM" });
  }
};

