import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiHome,
  FiUsers,
  FiMessageSquare,
  FiGrid,
  FiSend,
  FiSettings,
} from "react-icons/fi";

import logo from "../assets/AGS_logo.png";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(true);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* =========================
          MOBILE TOP BAR
      ========================== */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 shrink-0"
        style={{
          background:
            "linear-gradient(135deg, #3E6AB3, #EF5675)",
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

      {/* =========================
          MOBILE BACKDROP
      ========================== */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* =========================
          SIDEBAR
      ========================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40
          w-64
          shadow-2xl
          flex flex-col
          py-5 px-4
          overflow-y-auto

          transform
          transition-transform
          duration-200
          ease-in-out

          md:static
          md:z-auto
          md:w-64
          md:shrink-0
          md:translate-x-0

          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(135deg, #3E6AB3, #EF5675)",
          color: "white",
        }}
      >
        {/* =========================
            MOBILE CLOSE BUTTON
        ========================== */}
        <button
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
          className="
            md:hidden
            self-end
            mb-2
            p-1
            rounded-md
            hover:bg-white/20
            transition
          "
        >
          <FiX size={22} />
        </button>

        {/* =========================
            LOGO
        ========================== */}
        <div
          className="
            mb-8
            flex
            justify-center
            bg-white/80
            py-4
            rounded-xl
          "
        >
          <img
            src={logo}
            alt="AG Soft Logo"
            className="h-16 w-auto"
          />
        </div>

        {/* =========================
            NAVIGATION
        ========================== */}
        <nav className="flex flex-col gap-3">
          {/* =========================
              INMATE DASHBOARD
          ========================== */}
          <NavLink
            to="/inmate-dashboard"
            end
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `
                flex items-center gap-3
                px-4 py-3
                rounded-lg
                font-semibold
                transition

                ${
                  isActive
                    ? "bg-white text-[#3E6AB3] shadow-md"
                    : "text-white hover:bg-white/20"
                }
              `
            }
          >
            <FiUsers size={19} />

            <span>Inmate Dashboard</span>
          </NavLink>

          {/* =========================
              SCHOOL DASHBOARD
          ========================== */}
          <div>
            {/* School Dashboard Header */}
            <button
              onClick={() =>
                setSchoolOpen((prev) => !prev)
              }
              className="
                w-full
                flex
                items-center
                justify-between
                px-4
                py-3
                rounded-lg
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

            {/* =========================
                SCHOOL SUBMENU
            ========================== */}
            {schoolOpen && (
              <div
                className="
                  ml-4
                  mt-2
                  pl-3
                  border-l
                  border-white/30
                  flex
                  flex-col
                  gap-1
                "
              >
                {/* Dashboard */}
                <NavLink
                  to="/school-dashboard"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-md
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-white text-[#3E6AB3] shadow-md"
                          : "text-white/90 hover:bg-white/20"
                      }
                    `
                  }
                >
                  <FiGrid size={17} />

                  <span>Dashboard</span>
                </NavLink>

                {/* Admins */}
                <NavLink
                  to="/school-dashboard/admin"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-md
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-white text-[#3E6AB3] shadow-md"
                          : "text-white/90 hover:bg-white/20"
                      }
                    `
                  }
                >
                  <FiUsers size={17} />

                  <span>Admins</span>
                </NavLink>

                {/* SMS Templates */}
                <NavLink
                  to="/school-dashboard/sms-templates"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-md
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-white text-[#3E6AB3] shadow-md"
                          : "text-white/90 hover:bg-white/20"
                      }
                    `
                  }
                >
                  <FiMessageSquare size={17} />

                  <span>SMS Templates</span>
                </NavLink>

                {/* Sender IDs */}
                <NavLink
                  to="/school-dashboard/sender-ids"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-md
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-white text-[#3E6AB3] shadow-md"
                          : "text-white/90 hover:bg-white/20"
                      }
                    `
                  }
                >
                  <FiSend size={17} />

                  <span>Sender IDs</span>
                </NavLink>

                {/* SMS Configuration */}
                <NavLink
                  to="/school-dashboard/sms-config"
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `
                      flex
                      items-center
                      gap-3
                      px-4
                      py-2.5
                      rounded-md
                      text-sm
                      font-medium
                      transition

                      ${
                        isActive
                          ? "bg-white text-[#3E6AB3] shadow-md"
                          : "text-white/90 hover:bg-white/20"
                      }
                    `
                  }
                >
                  <FiSettings size={17} />

                  <span>SMS Configuration</span>
                </NavLink>
              </div>
            )}
          </div>
        </nav>

        {/* =========================
            LOGOUT
        ========================== */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="
              w-full
              px-4
              py-2.5
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
      </aside>
    </>
  );
}