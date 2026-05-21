export default function Navbar({
  setSidebarOpen,
}) {

  return (
    <nav className="
      sticky top-0 z-40
      bg-white border-b
      border-gray-200
      px-4 py-3
    ">

      <div className="
        flex items-center
        justify-between
      ">

        {/* LEFT */}

        <div className="
          flex items-center gap-3
        ">

          <button
            onClick={() =>
              setSidebarOpen(true)
            }
            className="
              md:hidden
              text-xl
            "
          >
            ☰
          </button>

          <div className="lg:hidden">

            <h1 className="
              text-lg md:text-xl
              font-semibold
            ">
              Nice Creation
            </h1>

            <p className="
              text-xs text-gray-400
            ">
              Mr Pradip Mohapatra
            </p>

          </div>

        </div>

      </div>

    </nav>
  );
}