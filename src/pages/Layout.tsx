import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="grid grid-cols-[15%_1fr] h-screen">
      <Sidebar />

      <main style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        <Outlet />
      </main>
    </div>
  );
}
