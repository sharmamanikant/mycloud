import proxmoxClient from "../../proxmox.js";

const NODE = () => process.env.PROXMOX_NODE || "pve";

export const listVMs = async (req, res) => {
  try {
    const response = await proxmoxClient.get(`/nodes/${NODE()}/qemu`);
    res.json(response.data.data);
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ msg: "Error fetching VMs" });
  }
};

export const createVM = async (req, res) => {
  try {
    const { name, cores, memory, disk, ostype } = req.body;
    const vmid = Math.floor(100 + Math.random() * 899900);
    await proxmoxClient.post(`/nodes/${NODE()}/qemu`, {
      vmid,
      name,
      cores: Number(cores) || 2,
      memory: Number(memory) || 2048,
      scsi0: `local-lvm:${Number(disk) || 20}`,
      ostype: ostype || "l26",
      net0: "virtio,bridge=vmbr0",
      ide2: "local:iso/ubuntu-22.04-live-server-amd64.iso,media=cdrom",
      boot: "order=ide2;scsi0",
    });
    res.json({ msg: "VM creation started", vmid });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ msg: "Error creating VM" });
  }
};

export const startVM = async (req, res) => {
  try {
    const { vmid } = req.params;
    await proxmoxClient.post(`/nodes/${NODE()}/qemu/${vmid}/status/start`);
    res.json({ msg: `VM ${vmid} start requested` });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ msg: "Error starting VM" });
  }
};

export const stopVM = async (req, res) => {
  try {
    const { vmid } = req.params;
    await proxmoxClient.post(`/nodes/${NODE()}/qemu/${vmid}/status/stop`);
    res.json({ msg: `VM ${vmid} stop requested` });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ msg: "Error stopping VM" });
  }
};

export const deleteVM = async (req, res) => {
  try {
    const { vmid } = req.params;
    await proxmoxClient.delete(`/nodes/${NODE()}/qemu/${vmid}`);
    res.json({ msg: `VM ${vmid} deleted` });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    res.status(500).json({ msg: "Error deleting VM" });
  }
};

