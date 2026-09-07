import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto overflow-x-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
