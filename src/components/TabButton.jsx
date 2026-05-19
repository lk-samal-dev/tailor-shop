export default function TabButton({
  label,
  active,
  onClick,
}) {

  return (
    <button
      onClick={onClick}

      className={`
        px-4 py-2
        rounded-xl
        text-sm
        font-medium
        transition

        ${
          active
            ? "bg-blue-600 text-white"
            : "bg-white border border-gray-200 text-gray-600"
        }
      `}
    >

      {label}

    </button>
  );
}