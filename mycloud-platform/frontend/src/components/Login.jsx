import { useState } from "react";
import axios from "axios";

export default function Login({ setAuth }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setAuth(true);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-4">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <input type="email" placeholder="Email" value={email}
        onChange={(e) => setEmail(e.target.value)} className="border p-2 block mb-2" />
      <input type="password" placeholder="Password" value={password}
        onChange={(e) => setPassword(e.target.value)} className="border p-2 block mb-2" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>
  );
}
