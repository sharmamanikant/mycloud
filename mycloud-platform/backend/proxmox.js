import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const { PROXMOX_HOST, PROXMOX_USER, PROXMOX_PASS, NODE, TEMPLATE } = process.env;

let ticket = null;
let csrfToken = null;

async function login() {
  const response = await axios.post(`${PROXMOX_HOST}/api2/json/access/ticket`, null, {
    params: {
      username: PROXMOX_USER,
      password: PROXMOX_PASS
    },
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
  });

  ticket = response.data.data.ticket;
  csrfToken = response.data.data.CSRFPreventionToken;

  return { ticket, csrfToken };
}

export async function listVMs() {
  if (!ticket) await login();

  const response = await axios.get(`${PROXMOX_HOST}/api2/json/nodes/${NODE}/qemu`, {
    headers: { Cookie: `PVEAuthCookie=${ticket}` },
    httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false })
  });

  return response.data.data;
}
