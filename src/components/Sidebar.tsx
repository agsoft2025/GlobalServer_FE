import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/AGS_logo.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Inmate Dashboard", path: "/inmate-dashboard" },
    { name: "School Dashboard", path: "/school-dashboard" },
  ];

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      className="h-full w-64 shadow-2xl flex flex-col py-5 px-5"
      style={{
        background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
        color: "white",
      }}
    >
      {/* Logo */}
      <div className="mb-10 flex justify-center bg-white/80 py-4 rounded-xl">
        <img src={logo} alt="AG Soft Logo" className="h-16 w-auto" />
      </div>

      {/* Menu */}
      <nav className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded-md font-medium hover:bg-white/20 transition ${
                isActive ? "bg-white/30" : ""
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
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
  );
}
