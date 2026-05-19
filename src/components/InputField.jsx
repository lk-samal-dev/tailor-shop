export default function InputField({

  type = "text",

  name,

  value,

  onChange,

  placeholder,

}) {

  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}

      className="
        w-full
        border border-gray-200

        rounded-xl

        px-3 py-3

        text-sm

        outline-none

        focus:ring-2
        focus:ring-blue-500

        transition
      "
    />
  );
}