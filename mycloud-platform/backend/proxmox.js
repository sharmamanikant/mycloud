import axios from "axios";
import https from "https";

// Set PROXMOX_TLS_VERIFY=true in production when using a valid certificate
const tlsVerify = process.env.PROXMOX_TLS_VERIFY === "true";

const proxmoxClient = axios.create({
  baseURL: process.env.PROXMOX_API_URL,
  headers: {
    Authorization: `PVEAPIToken=${process.env.PROXMOX_USER}!${process.env.PROXMOX_TOKEN_ID}=${process.env.PROXMOX_SECRET}`,
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: tlsVerify }),
});

export default proxmoxClient;
