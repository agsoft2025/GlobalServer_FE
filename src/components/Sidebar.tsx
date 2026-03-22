import { NavLink } from "react-router-dom";
import logo from "../assets/AGS_logo.png";

export default function Sidebar() {
  const menuItems = [
    { name: "Inmate Dashboard", path: "/inmate-dashboard" },
    { name: "School Dashboard", path: "/school-dashboard" },
  ];

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
    </div>
  );
}
