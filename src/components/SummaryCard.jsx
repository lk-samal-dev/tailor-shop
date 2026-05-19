export default function StatsCard({
  title,
  value,
}) {

  return (
    <div
      className="
        bg-white
        rounded-2xl

        border border-gray-100

        shadow-sm

        p-4
      "
    >

      <p className="
        text-xs text-gray-400
      ">
        {title}
      </p>

      <h2 className="
        text-lg md:text-2xl
        font-bold mt-2
      ">
        {value}
      </h2>

    </div>
  );
}