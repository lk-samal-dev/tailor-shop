import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerProfile from "./pages/CustomerProfile";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import SmartMeasurement from "./pages/SmartMeasurement";

export default function App() {

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  return (
    <BrowserRouter>

      <div className="
        min-h-screen bg-gray-100
      ">

        {/* NAVBAR */}

        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        <div className="flex">

          {/* SIDEBAR */}

          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          {/* MAIN CONTENT */}

            <main className="
              flex-1

              p-3 md:p-5

              w-full

              overflow-x-hidden
            ">

            <Routes>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/customers"
                element={<Customers />}
              />

              <Route
                path="/customers/:id"
                element={<CustomerProfile />}
              />

              <Route
                path="/employees"
                element={<Employees />}
              />

              <Route
                path="/employees/:id"
                element={<EmployeeProfile />}
              />

              

              <Route
                path="/measurements"
                element={<SmartMeasurement />}
              />

              

            </Routes>

          </main>

        </div>

      </div>

    </BrowserRouter>
  );
}