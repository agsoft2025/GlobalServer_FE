import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import logo from "../assets/AGS_logo.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  type MenuItem = {
    name: string;
    path?: string;
    children?: { name: string; path: string }[];
  };

  const menuItems: MenuItem[] = [
    { name: "Inmate Dashboard", path: "/inmate-dashboard" },
    {
      name: "School Dashboard",
      children: [
        { name: "Dashboard", path: "/school-dashboard" },
        { name: "Admins", path: "/school-dashboard/admin" },
        { name: "SMS Templates", path: "/school-dashboard/sms-templates" },
      ],
    },
  ];

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile top bar with hamburger toggle */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
          color: "white",
        }}
      >
        <img src={logo} alt="AG Soft Logo" className="h-9 w-auto bg-white/80 rounded-md p-1" />
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md hover:bg-white/20 transition"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar / off-canvas drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 shadow-2xl flex flex-col py-5 px-5 overflow-y-auto
          transform transition-transform duration-200 ease-in-out
          md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
          color: "white",
        }}
      >
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden self-end mb-2 p-1 rounded-md hover:bg-white/20 transition"
        >
          <FiX size={22} />
        </button>

        {/* Logo */}
        <div className="mb-10 flex justify-center bg-white/80 py-4 rounded-xl">
          <img src={logo} alt="AG Soft Logo" className="h-16 w-auto" />
        </div>

        {/* Menu */}
        <nav className="flex flex-col gap-4">
          {menuItems.map((item) =>
            item.children ? (
              <div key={item.name} className="flex flex-col gap-1">
                <span className="px-4 pt-2 text-xs font-semibold uppercase tracking-wide text-white/70">
                  {item.name}
                </span>
                {item.children.map((child) => (
                  <NavLink
                    key={child.path}
                    to={child.path}
                    end
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-md font-medium hover:bg-white/20 transition ${
                        isActive ? "bg-white/30" : ""
                      }`
                    }
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            ) : (
              <NavLink
                key={item.path}
                to={item.path ?? "#"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-md font-medium hover:bg-white/20 transition ${
                    isActive ? "bg-white/30" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            ),
          )}
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 rounded-md font-medium bg-red-500 hover:bg-red-600 transition text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
