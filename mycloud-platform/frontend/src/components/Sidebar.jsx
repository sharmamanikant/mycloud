// components/Sidebar.jsx
import React from "react";
import { FaServer, FaStorage, FaNetworkWired, FaMoneyBill } from "react-icons/fa";

const Sidebar = () => {
  const menu = [
    { name: "Dashboard", icon: <FaServer /> },
    { name: "Virtual Machines", icon: <FaServer /> },
    { name: "Storage", icon: <FaStorage /> },
    { name: "Networking", icon: <FaNetworkWired /> },
    { name: "Billing", icon: <FaMoneyBill /> },
    { name: "Settings", icon: <FaServer /> },
  ];

  return (
    <div className="w-64 bg-white shadow-md">
      <div className="p-6 font-bold text-xl border-b">My Cloud Platform</div>
      <ul className="mt-6">
        {menu.map((item, idx) => (
          <li
            key={idx}
            className="flex items-center p-4 hover:bg-gray-100 cursor-pointer"
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
