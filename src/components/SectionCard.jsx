export default function Section({
  title,
  children,
}) {

  return (
    <section
      className="
        bg-white
        rounded-2xl

        border border-gray-100

        shadow-sm

        p-4
      "
    >

      {title && (

        <div className="mb-4">

          <h2 className="
            text-base md:text-lg
            font-semibold
          ">
            {title}
          </h2>

        </div>

      )}

      {children}

    </section>
  );
}