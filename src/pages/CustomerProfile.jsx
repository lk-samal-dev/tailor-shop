import { useEffect, useState } from "react";

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import html2canvas from "html2canvas";

import { db } from "../firebase/config";

import Section from "../components/SectionCard";
import TabButton from "../components/TabButton";
import Toast from "../components/Toast";
import ConfirmModal from "../components/ConfirmModal";

function CustomerProfile() {

  const { id } = useParams();

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [customer, setCustomer] =
    useState(null);

  const [measurements, setMeasurements] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("all");

  const [editing, setEditing] =
    useState(false);

  const [editingMeasurement,
    setEditingMeasurement] =
    useState(null);

  const [measurementEditData,
    setMeasurementEditData] =
    useState({});

  const [editData, setEditData] =
    useState({
      name: "",
      mobile: "",
    });

  const [confirmOpen,
    setConfirmOpen] =
    useState(false);

  const [deleteId,
    setDeleteId] =
    useState(null);

    const [toastOpen,
  setToastOpen] =
  useState(false);

  const [toastMessage,
    setToastMessage] =
    useState("");

  const [toastType,
    setToastType] =
    useState("success");

  const [confirmType,
    setConfirmType] =
    useState("");

  // =========================
  // FETCH CUSTOMER
  // =========================

  const fetchCustomer = async () => {

    try {

      const customerSnap =
        await getDoc(
          doc(db, "customers", id)
        );

      if (customerSnap.exists()) {

        const data = {
          id: customerSnap.id,
          ...customerSnap.data(),
        };

        setCustomer(data);

        setEditData({
          name: data.name || "",
          mobile: data.mobile || "",
        });
      }

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // FETCH MEASUREMENTS
  // =========================

  const fetchMeasurements =
    async () => {

    try {

      setLoading(true);

      const q = query(
        collection(db, "measurements"),
        where("customerId", "==", id)
      );

      const snapshot =
        await getDocs(q);

      const list = [];

      snapshot.forEach((docItem) => {

        list.push({
          id: docItem.id,
          ...docItem.data(),
        });
      });

      setMeasurements(list.reverse());

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchCustomer();

    fetchMeasurements();

  }, []);

  const showToast = (
  message,
  type = "success"
) => {

  setToastMessage(message);

  setToastType(type);

  setToastOpen(true);
};

  // =========================
  // UPDATE CUSTOMER
  // =========================

  const updateCustomer =
  async () => {

  try {

    if (
      !editData.name.trim()
    ) {

      showToast(
        "Enter Customer Name",
        "error"
      );

      return;
    }

    if (
      !/^[0-9]{10}$/.test(
        editData.mobile
      )
    ) {

      showToast(
        "Enter valid 10 digit mobile number",
        "error"
      );

      return;
    }

    await updateDoc(
      doc(db, "customers", id),
      {
        name:
          editData.name.trim(),

        mobile:
          editData.mobile,
      }
    );

    // UPDATE ALL MEASUREMENTS

    const q = query(
      collection(
        db,
        "measurements"
      ),
      where(
        "customerId",
        "==",
        id
      )
    );

    const snapshot =
      await getDocs(q);

    const promises =
      snapshot.docs.map(
        (docItem) =>

          updateDoc(
            doc(
              db,
              "measurements",
              docItem.id
            ),
            {
              customerName:
                editData.name.trim(),

              customerPhone:
                editData.mobile,
            }
          )
      );

    await Promise.all(promises);

    setCustomer({
      ...customer,
      name:
        editData.name.trim(),

      mobile:
        editData.mobile,
    });

    setEditing(false);

    fetchMeasurements();

    showToast(
      "Customer Updated"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Failed To Update",
      "error"
    );
  }
};

  // =========================
  // DELETE CUSTOMER
  // =========================

  const deleteCustomer =
  async () => {

  try {

    // DELETE MEASUREMENTS

    const q = query(
      collection(
        db,
        "measurements"
      ),
      where(
        "customerId",
        "==",
        id
      )
    );

    const snapshot =
      await getDocs(q);

    const promises =
      snapshot.docs.map(
        (docItem) =>

          deleteDoc(
            doc(
              db,
              "measurements",
              docItem.id
            )
          )
      );

    await Promise.all(promises);

    // DELETE CUSTOMER

    await deleteDoc(
      doc(db, "customers", id)
    );

    showToast(
      "Customer Deleted"
    );
    setConfirmOpen(false);

    setTimeout(() => {

      navigate("/customers");

    }, 700);

  } catch (error) {

    console.error(error);

    showToast(
      "Delete Failed",
      "error"
    );
  }
};

  // =========================
  // DELETE MEASUREMENT
  // =========================

  const deleteMeasurement =
    async (measurementId) => {

    try {

      await deleteDoc(
        doc(
          db,
          "measurements",
          measurementId
        )
      );

      fetchMeasurements();
      showToast("Measurement Deletedd");

      setConfirmOpen(false);

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // SHARE
  // =========================

  const shareMeasurement =
    async (item) => {

    try {

      const text = `
Customer: ${customer?.name}

Phone: ${customer?.mobile}

Type: ${item.type}

${Object.entries(item.data || {})
  .map(
    ([key, value]) =>
      `${key}: ${value}`
  )
  .join("\n")}
`;

      if (
        navigator.share &&
        /Android|iPhone|iPad/i.test(
          navigator.userAgent
        )
      ) {

        await navigator.share({
          title: "Measurement",
          text,
        });

        return;
      }

      const whatsappUrl =
        `https://wa.me/?text=${encodeURIComponent(text)}`;

      window.open(
        whatsappUrl,
        "_blank"
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DOWNLOAD JPG
  // =========================

  const downloadMeasurement =
  async (item) => {

  try {

    const container =
      document.createElement("div");

    container.style.width =
      "700px";

    container.style.padding =
      "35px";

    container.style.background =
      "#f8fafc";

    container.style.fontFamily =
      "Arial, sans-serif";

    container.style.position =
      "fixed";

    container.style.left =
      "-9999px";

    container.innerHTML = `

      <div
        style="
          background:white;
          border-radius:28px;
          overflow:hidden;
          border:1px solid #e2e8f0;
          box-shadow:0 10px 35px rgba(15,23,42,0.08);
        "
      >

        <!-- HEADER -->

        <div
          style="
            background:linear-gradient(
              135deg,
              #2563eb,
              #1d4ed8
            );

            padding:30px;

            color:white;
          "
        >

          <h1
            style="
              margin:0;
              font-size:32px;
              font-weight:700;
              letter-spacing:.5px;
            "
          >
            NICE CREATION
          </h1>

          <p
            style="
              margin-top:8px;
              opacity:.9;
              font-size:14px;
            "
          >
            Professional Tailoring Measurements
          </p>

        </div>

        <!-- CUSTOMER -->

        <div
          style="
            padding:28px;
          "
        >

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:18px;
              margin-bottom:25px;
            "
          >

            <div
              style="
                background:#f8fafc;
                border-radius:18px;
                padding:16px;
                border:1px solid #e2e8f0;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#64748b;
                  margin-bottom:8px;
                "
              >
                CUSTOMER NAME
              </p>

              <h3
                style="
                  margin:0;
                  color:#0f172a;
                  font-size:20px;
                "
              >
                ${customer?.name || "-"}
              </h3>

            </div>

            <div
              style="
                background:#f8fafc;
                border-radius:18px;
                padding:16px;
                border:1px solid #e2e8f0;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:12px;
                  color:#64748b;
                  margin-bottom:8px;
                "
              >
                PHONE NUMBER
              </p>

              <h3
                style="
                  margin:0;
                  color:#0f172a;
                  font-size:20px;
                "
              >
                ${customer?.mobile || "-"}
              </h3>

            </div>

          </div>

          <!-- INFO -->

          <div
            style="
              display:flex;
              gap:12px;
              margin-bottom:24px;
              flex-wrap:wrap;
            "
          >

            <div
              style="
                background:#dbeafe;
                color:#1d4ed8;
                padding:10px 16px;
                border-radius:999px;
                font-size:13px;
                font-weight:600;
              "
            >
              ${item.type}
            </div>

            <div
              style="
                background:#f1f5f9;
                color:#334155;
                padding:10px 16px;
                border-radius:999px;
                font-size:13px;
                font-weight:600;
              "
            >
              ${item.measurementDate}
            </div>

          </div>

          <!-- NOTE -->

          ${
            item.note

            ? `
              <div
                style="
                  background:#fef3c7;
                  border:1px solid #fde68a;
                  border-radius:18px;
                  padding:18px;
                  margin-bottom:24px;
                "
              >

                <p
                  style="
                    margin:0;
                    color:#92400e;
                    font-size:13px;
                    font-weight:700;
                    margin-bottom:10px;
                  "
                >
                  ADDITIONAL NOTE
                </p>

                <p
                  style="
                    margin:0;
                    color:#78350f;
                    line-height:1.7;
                    font-size:14px;
                  "
                >
                  ${item.note}
                </p>

              </div>
            `

            : ""
          }

          <!-- MEASUREMENTS -->

          <div
            style="
              border:1px solid #e2e8f0;
              border-radius:22px;
              overflow:hidden;
            "
          >

            <div
              style="
                background:#eff6ff;
                padding:16px 20px;
                border-bottom:1px solid #dbeafe;
              "
            >

              <h2
                style="
                  margin:0;
                  color:#1e3a8a;
                  font-size:18px;
                "
              >
                Measurement Details
              </h2>

            </div>

            <div
              style="
                padding:10px 20px;
              "
            >

              ${Object.entries(item.data || {})
                .map(
                  ([key, value]) => `

                    <div
                      style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;

                        padding:14px 0;

                        border-bottom:1px solid #f1f5f9;
                      "
                    >

                      <span
                        style="
                          color:#64748b;
                          text-transform:capitalize;
                          font-size:14px;
                        "
                      >
                        ${key}
                      </span>

                      <strong
                        style="
                          color:#0f172a;
                          font-size:15px;
                        "
                      >
                        ${value} inch
                      </strong>

                    </div>
                  `
                )
                .join("")}

            </div>

          </div>

          <!-- FOOTER -->

          <div
            style="
              margin-top:30px;

              padding-top:22px;

              border-top:1px dashed #cbd5e1;

              text-align:center;
            "
          >

            <h3
              style="
                margin:0;
                color:#1e293b;
                font-size:18px;
              "
            >
              NICE CREATION
            </h3>

            <p
              style="
                margin:10px 0 0;
                color:#64748b;
                font-size:13px;
                line-height:1.8;
              "
            >
              Raurkela, Odisha

              <br/>

              Contact:
              +91 9876543210

              <br/>

              Thank you for choosing us
            </p>

          </div>

        </div>

      </div>
    `;

    document.body.appendChild(
      container
    );

    const canvas =
      await html2canvas(container, {
        scale: 2,
        useCORS: true,
      });

    const image =
      canvas.toDataURL(
        "image/jpeg",
        1
      );

    const link =
      document.createElement("a");

    link.href = image;

    link.download =
      `${customer?.name || "measurement"}.jpg`;

    link.click();

    document.body.removeChild(
      container
    );

    showToast(
      "JPG Downloaded"
    );

  } catch (error) {

    console.error(error);

    showToast(
      "Download Failed",
      "error"
    );
  }
};

  // =========================
  // EDIT MEASUREMENT
  // =========================

  const openMeasurementEdit =
    (item) => {

    setEditingMeasurement(item);

    setMeasurementEditData({

    ...(item.data || {}),

    note:
    item.note || "",
    });   
  };

  const updateMeasurement =
    async () => {

      const invalid =
  Object.entries(
    measurementEditData
  ).find(
    ([key, value]) => {

      if (key === "note")
        return false;

      return !/^[0-9./ ]+$/
        .test(value);
    }
  );

if (invalid) {

  showToast(
    `${invalid[0]} invalid`,
    "error"
  );

  return;
}

    try {

      await updateDoc(
        doc(
          db,
          "measurements",
          editingMeasurement.id
        ),
        {
  data: Object.fromEntries(

    Object.entries(
      measurementEditData
    ).filter(
      ([key]) =>
        key !== "note"
    )
  ),

  note:
    measurementEditData.note,
}
      );

      setEditingMeasurement(null);

      fetchMeasurements();
      showToast ("Measurement Updated");

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredMeasurements =
    activeTab === "all"

      ? measurements

      : measurements.filter(
          (item) =>
            item.type === activeTab
        );

  // =========================
  // UI
  // =========================

  return (

    <div className="
      min-h-screen
      bg-[#f4f7fc]
      p-4
      md:p-6
      space-y-5
      pb-10
    ">

      {/* HEADER */}

      <div className="
        bg-gradient-to-r
        from-[#1e293b]
        to-[#334155]

        rounded-3xl

        p-5

        text-white

        shadow-[0_8px_30px_rgba(0,0,0,0.08)]
      ">

        <div className="
          flex flex-col
          md:flex-row

          md:items-center
          md:justify-between

          gap-4
        ">

          <div>

            <h1 className="
              text-2xl
              font-bold
            ">
              {customer?.name}
            </h1>

            <p className="
              text-slate-300
              mt-1
            ">
              {customer?.mobile}
            </p>

          </div>

          <div className="
            flex flex-wrap
            gap-2
          ">

            <button

              onClick={() =>
                navigate("/measurements", {
                  state: {
                    customerId: customer?.id,
                    customerName: customer?.name,
                    customerPhone: customer?.mobile,
                  },
                })
              }

              className="
                bg-gradient-to-r
                from-cyan-500
                to-blue-600

                text-white

                rounded-2xl

                px-4 py-3

                text-sm
                font-medium
              "
            >
              Take Measurement
            </button>

            <button

              onClick={() =>
                setEditing(true)
              }

              className="
                bg-white/10

                border
                border-white/20

                rounded-2xl

                px-4 py-3

                text-sm
              "
            >
              Edit
            </button>

            <button

             onClick={() => {setConfirmType( "customer" );

              setConfirmOpen(true); }}

              className="
                bg-red-500/20

                border
                border-red-300/20

                rounded-2xl

                px-4 py-3

                text-sm
              "
            >
              Delete
            </button>

          </div>

        </div>

      </div>

      {/* OVERVIEW */}

      <Section title="Customer Overview">

        <div className="
          grid
          grid-cols-2
          gap-4
        ">

          <div>

            <p className="
              text-xs
              text-slate-400
            ">
              Total Measurements
            </p>

            <h2 className="
              text-xl
              font-bold
              mt-1
            ">
              {measurements.length}
            </h2>

          </div>

          <div>

            <p className="
              text-xs
              text-slate-400
            ">
              Status
            </p>

            <h2 className="
              text-sm
              font-semibold
              mt-1
              text-green-600
            ">
              Active Customer
            </h2>

          </div>

        </div>

      </Section>

      {/* FILTERS */}

      <div className="
        flex flex-wrap
        gap-2

        bg-[#e9eef8]

        p-2

        rounded-2xl
      ">

        <TabButton
          label="All"
          active={activeTab === "all"}
          onClick={() =>
            setActiveTab("all")
          }
        />

        <TabButton
          label="Kamij"
          active={
            activeTab === "kamij"
          }
          onClick={() =>
            setActiveTab("kamij")
          }
        />

        <TabButton
          label="Pant"
          active={
            activeTab === "pant"
          }
          onClick={() =>
            setActiveTab("pant")
          }
        />

        <TabButton
          label="Blouse"
          active={
            activeTab === "blouse"
          }
          onClick={() =>
            setActiveTab("blouse")
          }
        />

      </div>

      {/* HISTORY */}

      <Section title="Measurement History">

        {loading ? (

          <div className="
            text-sm
            text-slate-500
          ">
            Loading...
          </div>

        ) : (

          <div className="
            grid
            grid-cols-1
            md:grid-cols-2

            gap-3
          ">

            {filteredMeasurements.length === 0 && (

                <div className="
                  col-span-full

                  bg-white

                  border
                  border-slate-200

                  rounded-3xl

                  p-10

                  text-center
                ">

                  <i className="
                    fa-solid
                    fa-ruler-combined

                    text-3xl

                    text-slate-300
                  "></i>

                  <p className="
                    mt-3
                    text-slate-500
                  ">
                    No measurements found
                  </p>

                </div>

              )}

            {filteredMeasurements.map(
              (item) => (

              <div
                key={item.id}

                className="
                  bg-white

                  border
                  border-slate-200

                  rounded-[22px]

                  p-4

                  shadow-[0_6px_18px_rgba(15,23,42,0.04)]
                "
              >

                {/* TOP */}

                <div className="
                  flex
                  items-center
                  justify-between
                ">

                  <span className="
                    text-[11px]
                    font-semibold

                    bg-blue-100
                    text-blue-700

                    px-3 py-1

                    rounded-full
                  ">

                    {item.type}

                  </span>

                  <p className="
                    text-[11px]
                    text-slate-400
                  ">
                    {item.measurementDate}
                  </p>

                </div>

                {/* DATA */}

                <div className="
                  mt-2
                  space-y-1
                ">

                  {Object.entries(
                    item.data || {}
                  ).map(
                    ([key, value]) => (

                    <div
                      key={key}

                      className="
                        flex
                        items-center
                        justify-between

                        bg-slate-50

                        border
                        border-slate-100

                        rounded-lg

                        px-3 py-1

                        text-[12px]
                        leading-none
                      "
                    >

                      <span className="
                        capitalize
                        text-slate-500
                      ">
                        {key}
                      </span>

                      <span className="
                        font-semibold
                        text-slate-800
                      ">
                        {value}
                      </span>

                    </div>

                  ))}

                </div>

                {item.note && (

                  <div className="
                    mt-3

                    bg-amber-50

                    border border-amber-100

                    rounded-xl

                    px-3 py-2
                  ">

                    <p className="
                      text-[11px]
                      font-semibold

                      text-amber-700

                      mb-1
                    ">
                      Note
                    </p>

                    <p className="
                      text-[12px]
                      text-slate-700

                      leading-relaxed
                    ">
                      {item.note}
                    </p>

                  </div>

                )}

                {/* ACTIONS */}

                <div className="
                  flex
                  items-center

                  gap-2

                  mt-4
                ">

                  <button

                    onClick={() =>
                      openMeasurementEdit(item)
                    }

                    className="
                      h-9 w-9

                      flex
                      items-center
                      justify-center

                      rounded-xl

                      bg-slate-100
                      text-slate-700
                    "
                  >

                    <i className="
                      fa-solid
                      fa-pen-to-square
                      text-sm
                    "></i>

                  </button>

                  <button

                    onClick={() =>
                      shareMeasurement(item)
                    }

                    className="
                      h-9 w-9

                      flex
                      items-center
                      justify-center

                      rounded-xl

                      bg-emerald-100
                      text-emerald-700
                    "
                  >

                    <i className="
                      fa-solid
                      fa-share
                      text-sm
                    "></i>

                  </button>

                  <button

                    onClick={() => downloadMeasurement(item) }

                    className="
                      h-9 w-9

                      flex
                      items-center
                      justify-center

                      rounded-xl

                      bg-blue-100
                      text-blue-700
                    "
                  >

                    <i className="
                      fa-solid
                      fa-download
                      text-sm
                    "></i>

                  </button>

                  <button

                    onClick={() => {

                      setDeleteId(item.id);

                      setConfirmType("measurement");

                      setConfirmOpen(true);
                    }}

                    className="
                      h-9 w-9

                      flex
                      items-center
                      justify-center

                      rounded-xl

                      bg-rose-100
                      text-rose-700
                    "
                  >

                    <i className="
                      fa-solid
                      fa-trash
                      text-sm
                    "></i>

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </Section>

      {/* CUSTOMER EDIT MODAL */}

      {editing && (

        <div className="
          fixed inset-0

          bg-slate-900/40
          backdrop-blur-sm

          z-50

          flex
          items-center
          justify-center

          p-4
        ">

          <div className="
            bg-white

            rounded-3xl

            p-5

            w-full
            max-w-md
          ">

            <h2 className="
              text-lg
              font-semibold
              mb-4
            ">
              Edit Customer
            </h2>

            <div className="
              space-y-3
            ">

              <input
                type="text"

                value={editData.name}

                onChange={(e) =>
                  setEditData({
                    ...editData,

                    name:
                      e.target.value.replace(
                        /[^a-zA-Z ]/g,
                        ""
                      ),
                  })
                }

                placeholder="Customer Name"

                className="
                  w-full

                  bg-slate-50

                  border
                  border-slate-200

                  rounded-2xl

                  px-4 py-3
                "
              />

              <input
                type="text"

                value={editData.mobile}

                onChange={(e) =>
                  setEditData({
                    ...editData,
                   mobile:
                      e.target.value.replace(
                        /[^0-9]/g,
                        ""
                      ),
                  })
                }

                placeholder="Mobile Number"

                className="
                  w-full

                  bg-slate-50

                  border
                  border-slate-200

                  rounded-2xl

                  px-4 py-3
                "
              />

            </div>

            <div className="
              flex
              gap-2

              mt-5
            ">

              <button

                onClick={updateCustomer}

                className="
                  flex-1

                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600

                  text-white

                  rounded-2xl

                  py-3
                "
              >
                Save
              </button>

              <button

                onClick={() =>
                  setEditing(false)
                }

                className="
                  flex-1

                  bg-slate-100

                  rounded-2xl

                  py-3
                "
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* MEASUREMENT EDIT MODAL */}

      {editingMeasurement && (

        <div className="
          fixed inset-0

          bg-slate-900/40
          backdrop-blur-sm

          z-50

          flex
          items-center
          justify-center

          p-4
        ">

          <div className="
            bg-white

            rounded-3xl

            p-5

            w-full
            max-w-md
          ">

            <div className="
              flex
              items-center
              justify-between

              mb-5
            ">

              <div>

                <h2 className="
                  text-lg
                  font-semibold
                ">
                  Edit Measurement
                </h2>

                <p className="
                  text-sm
                  text-slate-500
                  mt-1
                ">
                  Update measurement details
                </p>

              </div>

              <button

                onClick={() =>
                  setEditingMeasurement(null)
                }

                className="
                  h-9 w-9

                  flex
                  items-center
                  justify-center

                  rounded-xl

                  bg-slate-100
                "
              >

                <i className="
                  fa-solid
                  fa-xmark
                "></i>

              </button>

            </div>

            <div className="
              space-y-3

              max-h-[55vh]

              overflow-y-auto
            ">

              {Object.entries(
                measurementEditData
              ).map(
                ([key, value]) => (

                <div
                  key={key}
                >

                  <label className="
                    text-sm
                    font-medium
                    text-slate-600

                    capitalize

                    mb-1
                    block
                  ">

                    {key}

                  </label>

                  <input
                    type="text"

                    value={value}

                    onChange={(e) =>
                      setMeasurementEditData({
                        ...measurementEditData,
                        [key]:
                          e.target.value,
                      })
                    }

                    className="
                      w-full

                      bg-slate-50

                      border
                      border-slate-200

                      rounded-2xl

                      px-4 py-3

                      text-sm

                      outline-none

                      focus:border-blue-500
                      focus:bg-white
                    "
                  />

                </div>

              ))}

            </div>

            <div className="
              flex
              gap-2

              mt-5
            ">

              <button

                onClick={updateMeasurement}

                className="
                  flex-1

                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600

                  text-white

                  rounded-2xl

                  py-3
                "
              >
                Save
              </button>

              <button

                onClick={() =>
                  setEditingMeasurement(null)
                }

                className="
                  flex-1

                  bg-slate-100

                  rounded-2xl

                  py-3
                "
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

      {/* CONFIRM MODAL */}

      <ConfirmModal

            open={confirmOpen}

            title={
              confirmType === "customer"

                ? "Delete Customer"

                : "Delete Measurement"
            }

            message={confirmType === "customer" ? ` Deleting customer will also remove all measurements permanently.`

                : `This measurement will be permanently deleted. ` }

            danger={true}

            confirmText="Delete"

            onCancel={() =>
              setConfirmOpen(false)
            }

            onConfirm={() => {

              if (
                confirmType === "customer"
              ) {

                deleteCustomer();

              } else {

                deleteMeasurement(deleteId);
              }
            }}
          />

              <Toast
              open={toastOpen}
              message={toastMessage}
              type={toastType}
              onClose={() =>
                setToastOpen(false)
              }
            />
    </div>
  );
}

export default CustomerProfile;