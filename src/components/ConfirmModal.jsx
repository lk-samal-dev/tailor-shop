export default function ConfirmModal({

  open,
  title,
  message,

  onConfirm,
  onCancel,

  confirmText = "Confirm",
  cancelText = "Cancel",

  danger = false,

}) {

  if (!open) return null;

  return (

    <div className="
      fixed inset-0

      bg-slate-900/40
      backdrop-blur-sm

      z-[999]

      flex items-center
      justify-center

      p-4
    ">

      <div className="
        w-full
        max-w-sm

        bg-white
        dark:bg-slate-900

        rounded-3xl

        p-6

        shadow-[0_20px_60px_rgba(0,0,0,0.2)]
      ">

        {/* TITLE */}

        <h2 className="
          text-lg
          font-semibold

          text-slate-800
          dark:text-white
        ">

          {title}

        </h2>

        {/* MESSAGE */}

        <p className="
          mt-2

          text-sm

          text-slate-500
          dark:text-slate-300
        ">

          {message}

        </p>

        {/* ACTIONS */}

        <div className="
          flex gap-2

          mt-6
        ">

          <button

            onClick={onCancel}

            className="
              flex-1

              bg-slate-100
              dark:bg-slate-800

              text-slate-700
              dark:text-white

              rounded-2xl

              py-3

              text-sm
              font-medium
            "
          >

            {cancelText}

          </button>

          <button

            onClick={onConfirm}

            className={`
              flex-1

              rounded-2xl

              py-3

              text-sm
              font-medium

              text-white

              ${
                danger
                  ? `
                    bg-rose-500
                    hover:bg-rose-600
                  `
                  : `
                    bg-blue-600
                    hover:bg-blue-700
                  `
              }
            `}
          >

            {confirmText}

          </button>

        </div>

      </div>

    </div>
  );
}