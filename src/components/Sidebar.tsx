import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiChevronDown, FiChevronRight, FiHome, FiUsers, FiMessageSquare, FiGrid } from "react-icons/fi";
import logo from "../assets/AGS_logo.png";
import { useAuth } from "../context/AuthContext";

// type MenuItem = {
//   name: string;
//   path?: string;
//   icon?: React.ReactNode;
//   children?: {
//     name: string;
//     path: string;
//     icon?: React.ReactNode;
//   }[];
// };

export default function Sidebar() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(true);

  // const menuItems: MenuItem[] = [
  //   {
  //     name: "Inmate Dashboard",
  //     path: "/inmate-dashboard",
  //     icon: <FiUsers size={19} />,
  //   },
  //   {
  //     name: "School Dashboard",
  //     icon: <FiHome size={19} />,
  //     children: [
  //       {
  //         name: "Dashboard",
  //         path: "/school-dashboard",
  //         icon: <FiGrid size={17} />,
  //       },
  //       {
  //         name: "Admins",
  //         path: "/school-dashboard/admin",
  //         icon: <FiUsers size={17} />,
  //       },
  //       {
  //         name: "SMS Templates",
  //         path: "/school-dashboard/sms-templates",
  //         icon: <FiMessageSquare size={17} />,
  //       },
  //     ],
  //   }
  // ];

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
          color: "white",
        }}
      >
        <img
          src={logo}
          alt="AG Soft Logo"
          className="h-9 w-auto bg-white/80 rounded-md p-1"
        />

        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 rounded-md hover:bg-white/20 transition"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40
          w-64 shadow-2xl flex flex-col
          py-5 px-4 overflow-y-auto
          transform transition-transform duration-200 ease-in-out

          md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background: "linear-gradient(135deg, #3E6AB3, #EF5675)",
          color: "white",
        }}
      >
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="md:hidden self-end mb-2 p-1 rounded-md hover:bg-white/20 transition"
        >
          <FiX size={22} />
        </button>

        {/* Logo */}
        <div className="mb-8 flex justify-center bg-white/80 py-4 rounded-xl">
          <img
            src={logo}
            alt="AG Soft Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-3">

          {/* Inmate Dashboard - SECONDARY MAIN MENU */}
          <NavLink
            to="/inmate-dashboard"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `
              flex items-center gap-3
              px-4 py-3 rounded-lg
              font-semibold
              transition
              ${isActive
                ? "bg-white text-[#3E6AB3] shadow-md"
                : "hover:bg-white/20"
              }
              `
            }
          >
            <FiUsers size={19} />
            Inmate Dashboard
          </NavLink>

          {/* School Dashboard - MAIN MENU */}
          <div>
            <button
              onClick={() => setSchoolOpen(!schoolOpen)}
              className="
                w-full flex items-center justify-between
                px-4 py-3 rounded-lg
                font-semibold
                bg-white/20
                hover:bg-white/30
                transition
              "
            >
              <div className="flex items-center gap-3">
                <FiHome size={19} />
                <span>School Dashboard</span>
              </div>

              {schoolOpen ? (
                <FiChevronDown size={18} />
              ) : (
                <FiChevronRight size={18} />
              )}
            </button>

            {/* School submenu */}
            {schoolOpen && (
              <div className="ml-4 mt-2 pl-3 border-l border-white/30 flex flex-col gap-1">

                <NavLink
                  to="/school-dashboard"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-4 py-2.5 rounded-md
                    text-sm font-medium
                    transition
                    ${isActive
                      ? "bg-white text-[#3E6AB3] shadow-md"
                      : "text-white/90 hover:bg-white/20"
                    }
                    `
                  }
                >
                  <FiGrid size={17} />
                  Dashboard
                </NavLink>

                <NavLink
                  to="/school-dashboard/admin"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-4 py-2.5 rounded-md
                    text-sm font-medium
                    transition
                    ${isActive
                      ? "bg-white text-[#3E6AB3] shadow-md"
                      : "text-white/90 hover:bg-white/20"
                    }
                    `
                  }
                >
                  <FiUsers size={17} />
                  Admins
                </NavLink>

                <NavLink
                  to="/school-dashboard/sms-templates"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3
                    px-4 py-2.5 rounded-md
                    text-sm font-medium
                    transition
                    ${isActive
                      ? "bg-white text-[#3E6AB3] shadow-md"
                      : "text-white/90 hover:bg-white/20"
                    }
                    `
                  }
                >
                  <FiMessageSquare size={17} />
                  SMS Templates
                </NavLink>

              </div>
            )}
          </div>

        </nav>

        {/* Logout */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="
              w-full px-4 py-2.5
              rounded-lg
              font-medium
              bg-red-500
              hover:bg-red-600
              transition
              text-white
            "
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}