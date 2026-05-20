import { useEffect } from "react";

export default function Toast({

  open,
  message,
  type = "success",
  onClose,

}) {

  useEffect(() => {

    if (!open) return;

    const timer =
      setTimeout(() => {

        onClose();

      }, 2500);

    return () =>
      clearTimeout(timer);

  }, [open]);

  if (!open) return null;

  return (

    <div className="
      fixed top-5 right-5

      z-[999]

      animate-[fadeIn_.2s_ease]
    ">

      <div className={`
        min-w-[260px]

        rounded-2xl

        px-5 py-4

        text-white

        shadow-xl

        ${
          type === "success"

            ? "bg-emerald-500"

            : "bg-rose-500"
        }
      `}>

        <div className="
          flex items-center
          gap-3
        ">

          <i className={`
            fa-solid

            ${
              type === "success"

                ? "fa-circle-check"

                : "fa-circle-xmark"
            }
          `}></i>

          <p className="
            text-sm
            font-medium
          ">

            {message}

          </p>

        </div>

      </div>

    </div>
  );
}