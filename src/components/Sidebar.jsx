import { Link, useLocation }
from "react-router-dom";

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {

  const location = useLocation();

  const menus = [

    {
      label: "Dashboard",
      path: "/",
    },

    {
      label: "Measurements",
      path: "/measurements",
    },

    {
      label: "Customers",
      path: "/customers",
    },

    {
      label: "Employees",
      path: "/employees",
    },
  ];

  return (
    <>

      {/* OVERLAY */}

      {sidebarOpen && (

        <div
          onClick={() =>
            setSidebarOpen(false)
          }
          className="
            fixed inset-0
            bg-black/30 z-30
            md:hidden
          "
        />

      )}

      {/* SIDEBAR */}

      <aside
        className={`

          fixed md:static
          top-0 left-0
          z-40

          h-screen
          w-64

          bg-white
          border-r border-gray-200

          transform transition-transform

          ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }

        `}
      >

        {/* LOGO */}

        <div className="
          h-[65px]
          border-b border-gray-200
          flex items-center
          px-5
        ">

          <div>

            <h2 className="
              text-lg font-semibold
            ">
              Tailor ERP
            </h2>

            <p className="
              text-xs text-gray-400
            ">
              Business Suite
            </p>

          </div>

        </div>

        {/* MENUS */}

        <div className="
          p-3 space-y-1
        ">

          {menus.map((menu) => (

            <Link
              key={menu.path}

              to={menu.path}

              onClick={() =>
                setSidebarOpen(false)
              }

              className={`
                flex items-center
                px-4 py-3
                rounded-xl
                text-sm font-medium
                transition

                ${location.pathname ===
                  menu.path

                  ? "bg-blue-600 text-white"

                  : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >

              {menu.label}

            </Link>

          ))}

        </div>

      </aside>

    </>
  );
}