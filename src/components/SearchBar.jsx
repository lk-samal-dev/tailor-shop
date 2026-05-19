export default function SearchBar({
  value,
  onChange,
  placeholder,
}) {

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}

      className="
        w-full
        border border-gray-200
        rounded-xl
        px-4 py-3
        text-sm
        outline-none
        focus:ring-2
        focus:ring-blue-500
      "
    />
  );
}