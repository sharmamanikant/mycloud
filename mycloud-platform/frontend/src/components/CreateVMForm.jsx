import { useState } from "react";
import axios from "axios";

export default function CreateVMForm() {
  const [name, setName] = useState("");
  const [cores, setCores] = useState(2);
  const [memory, setMemory] = useState(2048);
  const [disk, setDisk] = useState(20);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/vm/create",
        { name, cores, memory, disk },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(res.data.msg);
    } catch (err) {
      alert("VM creation failed");
    }
  };

  return (
    <form onSubmit={handleCreate} className="p-4">
      <h2 className="text-xl font-bold mb-4">Create VM</h2>
      <input type="text" placeholder="VM Name" value={name}
        onChange={(e) => setName(e.target.value)} className="border p-2 block mb-2" />
      <input type="number" placeholder="Cores" value={cores}
        onChange={(e) => setCores(e.target.value)} className="border p-2 block mb-2" />
      <input type="number" placeholder="Memory (MB)" value={memory}
        onChange={(e) => setMemory(e.target.value)} className="border p-2 block mb-2" />
      <input type="number" placeholder="Disk (GB)" value={disk}
        onChange={(e) => setDisk(e.target.value)} className="border p-2 block mb-2" />
      <button type="submit" className="bg-green-500 text-white px-4 py-2">Create VM</button>
    </form>
  );
}
