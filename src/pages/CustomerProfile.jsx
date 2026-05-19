import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase/config";

import html2canvas from "html2canvas";

import Section from "../components/SectionCard";
import TabButton from "../components/TabButton";

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

  const [activeTab, setActiveTab] =
    useState("all");

  const [loading, setLoading] =
    useState(false);

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

  // =========================
  // FETCH CUSTOMER
  // =========================

  const fetchCustomer = async () => {

    try {

      const customerRef =
        doc(db, "customers", id);

      const customerSnap =
        await getDoc(customerRef);

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

      const querySnapshot =
        await getDocs(q);

      const list = [];

      querySnapshot.forEach((doc) => {

        list.push({
          id: doc.id,
          ...doc.data(),
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

  // =========================
  // UPDATE CUSTOMER
  // =========================

  const updateCustomer =
    async () => {

    try {

      await updateDoc(
        doc(db, "customers", id),
        {
          name: editData.name,
          mobile: editData.mobile,
        }
      );

      setCustomer({
        ...customer,
        name: editData.name,
        mobile: editData.mobile,
      });

      setEditing(false);

      alert("Customer Updated");

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const deleteCustomer =
    async () => {

    const confirmDelete =
      window.confirm(
        "Delete customer permanently?"
      );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(db, "customers", id)
      );

      navigate("/customers");

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE MEASUREMENT
  // =========================

  const deleteMeasurement =
    async (measurementId) => {

    const confirmDelete =
      window.confirm(
        "Delete measurement?"
      );

    if (!confirmDelete) return;

    try {

      await deleteDoc(
        doc(
          db,
          "measurements",
          measurementId
        )
      );

      fetchMeasurements();

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
${customer.name}

${customer.mobile}

${item.type}

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
        "650px";

      container.style.padding =
        "30px";

      container.style.background =
        "#ffffff";

      container.style.fontFamily =
        "Arial";

      container.style.position =
        "fixed";

      container.style.left =
        "-9999px";

      container.innerHTML = `

        <div
          style="
            border:1px solid #e5e7eb;
            border-radius:24px;
            padding:24px;
          "
        >

          <h1
            style="
              text-align:center;
              color:#2563eb;
              margin-bottom:20px;
            "
          >
            NICE CREATION
          </h1>

          <div
            style="
              margin-bottom:20px;
              line-height:1.8;
            "
          >

            <p>
              <strong>Name:</strong>
              ${customer.name}
            </p>

            <p>
              <strong>Phone:</strong>
              ${customer.mobile}
            </p>

            <p>
              <strong>Type:</strong>
              ${item.type}
            </p>

          </div>

          ${Object.entries(item.data || {})
            .map(
              ([key, value]) => `
                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    padding:10px 0;
                    border-bottom:1px solid #f1f5f9;
                  "
                >
                  <span>${key}</span>
                  <strong>${value}</strong>
                </div>
              `
            )
            .join("")}

        </div>
      `;

      document.body.appendChild(
        container
      );

      const canvas =
        await html2canvas(container);

      const image =
        canvas.toDataURL(
          "image/jpeg",
          1
        );

      const link =
        document.createElement("a");

      link.href = image;

      link.download =
        `${customer.name}.jpg`;

      link.click();

      document.body.removeChild(
        container
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // EDIT MEASUREMENT
  // =========================

  const openMeasurementEdit =
    (item) => {

    setEditingMeasurement(item);

    setMeasurementEditData(
      item.data || {}
    );
  };

  const updateMeasurement =
    async () => {

    try {

      await updateDoc(
        doc(
          db,
          "measurements",
          editingMeasurement.id
        ),
        {
          data:
            measurementEditData,
        }
      );

      setEditingMeasurement(null);

      fetchMeasurements();

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
          flex flex-col md:flex-row
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
            flex flex-wrap gap-2
          ">

            <button

              onClick={() =>
                navigate("/measurements", {
                  state: {
                    customerId: customer.id,
                    customerName: customer.name,
                    customerPhone: customer.mobile,
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
                border border-white/20

                rounded-2xl

                px-4 py-3

                text-sm
              "
            >
              Edit
            </button>

            <button
              onClick={deleteCustomer}

              className="
                bg-red-500/20
                border border-red-300/20

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
          grid grid-cols-2
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
        flex flex-wrap gap-2

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
            grid grid-cols-1
            md:grid-cols-2
            gap-3
          ">

            {filteredMeasurements.map(
              (item) => (

              <div
                key={item.id}

                className="
                  bg-white

                  border border-slate-200

                  rounded-[22px]

                  p-4

                  shadow-[0_6px_18px_rgba(15,23,42,0.04)]

                  transition-all
                "
              >

                {/* TOP */}

                <div className="
                  flex items-center
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

        border border-slate-100

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

                {/* ACTIONS */}

                <div className="
                  flex items-center
                  gap-2
                  mt-4
                ">

                  <button
                    onClick={() =>
                      openMeasurementEdit(item)
                    }

                    className="
                      h-9 w-9

                      flex items-center
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

                      flex items-center
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
                    onClick={() =>
                      downloadMeasurement(item)
                    }

                    className="
                      h-9 w-9

                      flex items-center
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
                    onClick={() =>
                      deleteMeasurement(
                        item.id
                      )
                    }

                    className="
                      h-9 w-9

                      flex items-center
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

          flex items-center
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
                    name: e.target.value,
                  })
                }

                placeholder="Name"

                className="
                  w-full

                  bg-slate-50

                  border border-slate-200

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
                    mobile: e.target.value,
                  })
                }

                placeholder="Mobile"

                className="
                  w-full

                  bg-slate-50

                  border border-slate-200

                  rounded-2xl

                  px-4 py-3
                "
              />

            </div>

            <div className="
              flex gap-2
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

          flex items-center
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
              flex items-center
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

                  flex items-center
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

                      border border-slate-200

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
              flex gap-2
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

    </div>
  );
}

export default CustomerProfile;