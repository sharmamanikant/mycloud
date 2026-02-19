import React from "react";
import { NavLink } from "react-router-dom";
import { FaServer, FaShieldAlt, FaNetworkWired, FaTachometerAlt, FaSignOutAlt } from "react-icons/fa";

const menu = [
  { name: "Dashboard", path: "/", icon: <FaTachometerAlt /> },
  { name: "Virtual Machines", path: "/vms", icon: <FaServer /> },
  { name: "Security Groups", path: "/security-groups", icon: <FaShieldAlt /> },
  { name: "Networking", path: "/networking", icon: <FaNetworkWired /> },
];

const Sidebar = ({ onLogout }) => {
  return (
    <div className="w-64 bg-white shadow-md flex flex-col">
      <div className="p-6 font-bold text-xl border-b text-blue-700">☁ MyCloud</div>
      <ul className="mt-4 flex-1">
        {menu.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center p-4 hover:bg-blue-50 cursor-pointer ${isActive ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-700"}`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          </li>
        ))}
      </ul>
      <button
        onClick={onLogout}
        className="flex items-center p-4 text-red-500 hover:bg-red-50 border-t"
      >
        <FaSignOutAlt className="mr-3" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;

