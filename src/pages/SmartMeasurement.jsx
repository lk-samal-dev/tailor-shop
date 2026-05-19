import { useState } from "react";
import { useLocation }from "react-router-dom";
import { useEffect }from "react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";


// ========================================
// FIELD COMPONENT
// ========================================

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
}) {

  return (

    <div>

      <label className="
        text-xs text-gray-500
        mb-1 block
      ">
        {label}
      </label>

      <input
        type="number"

        step="0.1"

        inputMode="decimal"

        autoComplete="off"

        name={name}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        onWheel={(e) =>
          e.target.blur()
        }

        className="
          w-full
          border border-gray-200
          bg-white

          rounded-xl

          px-3 py-2.5

          text-sm

          outline-none

          focus:ring-2
          focus:ring-blue-500

          transition
        "
      />

    </div>
  );
}

export default function SmartMeasurement() {

  // ========================================
  // STATES
  // ========================================

  const [activeTab, setActiveTab] =
    useState("kamij");

  const [customerFound,
    setCustomerFound] =
    useState(false);

  const [measurementCount,
    setMeasurementCount] =
    useState(0);

  const [customerId,
    setCustomerId] =
    useState(null);

  const [loading,
    setLoading] =
    useState(false);

  const location = useLocation();

const customerData = location.state;

  const [formData, setFormData] =
    useState({

      phone: "",
      name: "",

      measurementDate:
        new Date()
          .toISOString()
          .split("T")[0],

      // KAMIJ

      shoulder: "",
      chest: "",
      upperChest: "",
      waist: "",
      hip: "",
      length: "",
      sleeve: "",
      bicep: "",

      // PANT

      pantWaist: "",
      pantLength: "",
      thigh: "",
      knee: "",
      mori: "",

      // BLOUSE

      blouseLength: "",
      blouseChest: "",
      blouseWaist: "",
      frontNeck: "",
      backNeck: "",
      blouseSleeve: "",
    });

        useEffect(() => {

      if (customerData) {

        setFormData((prev) => ({

          ...prev,

          phone:
            customerData.customerPhone || "",

          name:
            customerData.customerName || "",
        }));

        setCustomerId(
          customerData.customerId
        );

        setCustomerFound(true);

        fetchMeasurementCount(
          customerData.customerId
        );
      }

    }, []);

  // ========================================
  // CHANGE
  // ========================================

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // CUSTOMER SEARCH
  // ========================================

  const checkCustomer =
    async (mobile) => {

    if (mobile.length < 10) return;

    try {

      const q = query(
        collection(db, "customers"),
        where("mobile", "==", mobile)
      );

      const querySnapshot =
        await getDocs(q);

      if (!querySnapshot.empty) {

        const customer =
          querySnapshot.docs[0];

        const data =
          customer.data();

        setCustomerFound(true);

        setCustomerId(customer.id);

        setFormData((prev) => ({
          ...prev,
          name: data.name,
        }));

        // COUNT

        const mq = query(
          collection(db, "measurements"),
          where(
            "customerId",
            "==",
            customer.id
          )
        );

        const ms =
          await getDocs(mq);

        setMeasurementCount(ms.size);

      } else {

        setCustomerFound(false);

        setCustomerId(null);

        setMeasurementCount(0);
      }

    } catch (error) {

      console.error(error);
    }
  };

  const fetchMeasurementCount =
  async (id) => {

  try {

    const mq = query(
      collection(db, "measurements"),
      where("customerId", "==", id)
    );

    const ms =
      await getDocs(mq);

    setMeasurementCount(ms.size);

  } catch (error) {

    console.error(error);
  }
};

  // ========================================
  // PHONE CHANGE
  // ========================================

  const handlePhoneChange =
    async (e) => {

    const value =
      e.target.value;

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    if (value.length >= 10) {

      checkCustomer(value);
    }
  };

  // ========================================
  // SAVE
  // ========================================

  const handleSubmit =
    async () => {

    try {

      setLoading(true);

      let finalCustomerId =
        customerId;

      // CREATE CUSTOMER

      if (!customerFound) {

        const customerRef =
          await addDoc(
            collection(db, "customers"),
            {
              name: formData.name,
              mobile:
                formData.phone,
              createdAt:
                new Date(),
            }
          );

        finalCustomerId =
          customerRef.id;
      }

      let measurementData = {};

      // KAMIJ

      if (activeTab === "kamij") {

        measurementData = {

          shoulder:
            formData.shoulder,

          chest:
            formData.chest,

          upperChest:
            formData.upperChest,

          waist:
            formData.waist,

          hip:
            formData.hip,

          length:
            formData.length,

          sleeve:
            formData.sleeve,

          bicep:
            formData.bicep,
        };
      }

      // PANT

      if (activeTab === "pant") {

        measurementData = {

          pantWaist:
            formData.pantWaist,

          pantLength:
            formData.pantLength,

          thigh:
            formData.thigh,

          knee:
            formData.knee,

          mori:
            formData.mori,
        };
      }

      // BLOUSE

      if (activeTab === "blouse") {

        measurementData = {

          blouseLength:
            formData.blouseLength,

          blouseChest:
            formData.blouseChest,

          blouseWaist:
            formData.blouseWaist,

          frontNeck:
            formData.frontNeck,

          backNeck:
            formData.backNeck,

          blouseSleeve:
            formData.blouseSleeve,
        };
      }

      // SAVE

      await addDoc(
        collection(db, "measurements"),
        {
          customerId:
            finalCustomerId,

          customerName:
            formData.name,

          customerPhone:
            formData.phone,

          type: activeTab,

          measurementDate:
            formData.measurementDate,

          data: measurementData,

          createdAt:
            new Date(),
        }
      );

      alert(
        "Measurement Saved Successfully"
      );

    } catch (error) {

      console.error(error);

      alert("Error saving");

    } finally {

      setLoading(false);
    }
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="
        pb-28
        space-y-4

        min-h-screen

        bg-[#f5f7fb]

        text-gray-800
      ">

      {/* HEADER */}

      <div>

        <h1 className="
          text-xl md:text-2xl
          font-bold
        ">
          Measurements
        </h1>

        <p className="
          text-sm text-gray-500 mt-1
        ">
          Fast tailor workflow
        </p>

      </div>

      {/* CUSTOMER */}

      <div className="
        bg-white
        rounded-2xl
        border border-gray-100
        shadow-sm
        p-4
      ">

        <div className="
          grid grid-cols-2
          gap-3
        ">

          <div>

            <label className="
              text-xs text-gray-500
              mb-1 block
            ">
              Phone
            </label>

            <input
              type="text"

              value={formData.phone}

              onChange={
                handlePhoneChange
              }

              placeholder="
                Customer phone
              "

              className="
                w-full
                border border-gray-200
                rounded-xl
                px-3 py-2.5
                text-sm
              "
            />

          </div>

          <div>

            <label className="
              text-xs text-gray-500
              mb-1 block
            ">
              Name
            </label>

            <input
              type="text"

              name="name"

              value={formData.name}

              onChange={handleChange}

              placeholder="
                Customer name
              "

              className="
                w-full
                border border-gray-200
                rounded-xl
                px-3 py-2.5
                text-sm
              "
            />

          </div>

        </div>

        {/* STATUS */}

        {formData.phone && (

          <div className="
            flex flex-wrap
            gap-2 mt-4
          ">

            <div className={`
              px-3 py-1.5
              rounded-full
              text-xs font-medium

              ${
                customerFound

                ? "bg-green-100 text-green-700"

                : "bg-blue-100 text-blue-700"
              }
            `}>

              {customerFound
                ? "Existing Customer"
                : "New Customer"}

            </div>

            {customerFound && (

              <div className="
                px-3 py-1.5
                rounded-full
                text-xs font-medium

                bg-[#e8edf7]
                text-gray-700
              ">

                {measurementCount}
                {" "}
                Measurements

              </div>

            )}

          </div>

        )}

      </div>

      {/* TYPE */}

      <div className="
  bg-[#e8edf7]
  p-1
  rounded-2xl
  flex
  gap-1
">

  {[
    {
      key: "kamij",
      label: "Kamij"
    },

    {
      key: "pant",
      label: "Pant"
    },

    {
      key: "blouse",
      label: "Blouse"
    },

  ].map((tab) => (

    <button
      key={tab.key}

      onClick={() =>
        setActiveTab(tab.key)
      }

      className={`
        flex-1

        py-2.5

        rounded-xl

        text-sm
        font-semibold

        transition-all

        ${
          activeTab === tab.key

          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"

          : "text-gray-600 hover:bg-white/70"
        }
      `}
    >

      {tab.label}

    </button>

  ))}

</div>

      {/* DATE */}

      <div className="
        bg-white
        rounded-2xl
        border border-gray-100
        shadow-sm
        p-4
      ">

        <label className="
          text-xs text-gray-500
          mb-1 block
        ">
          Measurement Date
        </label>

        <input
          type="date"

          name="measurementDate"

          value={
            formData.measurementDate
          }

          onChange={handleChange}

          className="
            w-full
            border border-gray-200
            rounded-xl
            px-3 py-2.5
            text-sm
          "
        />

      </div>

      {/* KAMIJ */}

      {activeTab === "kamij" && (

        <>
          <div className="
            bg-white
            rounded-2xl
            border border-gray-100
            shadow-sm
            p-4
          ">

            <h2 className="
              text-sm font-semibold
              mb-4
            ">
              Body
            </h2>

            <div className="
              grid grid-cols-2
              gap-3
            ">

              <Field label="Shoulder" name="shoulder" value={formData.shoulder} onChange={handleChange} />
              <Field label="Chest" name="chest" value={formData.chest} onChange={handleChange} />
              <Field label="Upper Chest" name="upperChest" value={formData.upperChest} onChange={handleChange} />
              <Field label="Waist" name="waist" value={formData.waist} onChange={handleChange} />

            </div>

          </div>

          <div className="
            bg-white
            rounded-2xl
            border border-gray-100
            shadow-sm
            p-4
          ">

            <h2 className="
              text-sm font-semibold
              mb-4
            ">
              Length
            </h2>

            <div className="
              grid grid-cols-2
              gap-3
            ">

              <Field label="Hip" name="hip" value={formData.hip} onChange={handleChange} />
              <Field label="Length" name="length" value={formData.length} onChange={handleChange} />

            </div>

          </div>

          <div className="
            bg-white
            rounded-2xl
            border border-gray-100
            shadow-sm
            p-4
          ">

            <h2 className="
              text-sm font-semibold
              mb-4
            ">
              Sleeve
            </h2>

            <div className="
              grid grid-cols-2
              gap-3
            ">

              <Field label="Sleeve" name="sleeve" value={formData.sleeve} onChange={handleChange} />
              <Field label="Bicep" name="bicep" value={formData.bicep} onChange={handleChange} />

            </div>

          </div>
        </>
      )}

            {/* PANT */}

      {activeTab === "pant" && (

        <div className="
          bg-[#fffaf5]
          rounded-2xl
          border border-orange-100
          shadow-sm
          p-4
        ">

          <h2 className="
            text-sm font-semibold
            mb-4 text-orange-700
          ">
            Pant Measurements
          </h2>

          <div className="
            grid grid-cols-2
            gap-3
          ">

            <Field
              label="Waist"
              name="pantWaist"
              value={formData.pantWaist}
              onChange={handleChange}
            />

            <Field
              label="Length"
              name="pantLength"
              value={formData.pantLength}
              onChange={handleChange}
            />

            <Field
              label="Thigh"
              name="thigh"
              value={formData.thigh}
              onChange={handleChange}
            />

            <Field
              label="Knee"
              name="knee"
              value={formData.knee}
              onChange={handleChange}
            />

            <Field
              label="Mori"
              name="mori"
              value={formData.mori}
              onChange={handleChange}
            />

          </div>

        </div>

      )}

      {/* BLOUSE */}

      {activeTab === "blouse" && (

        <div className="
          bg-[#fff7fb]
          rounded-2xl
          border border-pink-100
          shadow-sm
          p-4
        ">

          <h2 className="
            text-sm font-semibold
            mb-4 text-pink-700
          ">
            Blouse Measurements
          </h2>

          <div className="
            grid grid-cols-2
            gap-3
          ">

            <Field
              label="Length"
              name="blouseLength"
              value={formData.blouseLength}
              onChange={handleChange}
            />

            <Field
              label="Chest"
              name="blouseChest"
              value={formData.blouseChest}
              onChange={handleChange}
            />

            <Field
              label="Waist"
              name="blouseWaist"
              value={formData.blouseWaist}
              onChange={handleChange}
            />

            <Field
              label="Front Neck"
              name="frontNeck"
              value={formData.frontNeck}
              onChange={handleChange}
            />

            <Field
              label="Back Neck"
              name="backNeck"
              value={formData.backNeck}
              onChange={handleChange}
            />

            <Field
              label="Sleeve"
              name="blouseSleeve"
              value={formData.blouseSleeve}
              onChange={handleChange}
            />

          </div>

        </div>

      )}



      {/* SAVE */}

      <div className="
        fixed bottom-0 left-0
        right-0

        bg-white
        border-t border-gray-200

        p-3

        z-50
      ">

        <button
          onClick={handleSubmit}

          disabled={loading}

          className="
            w-full

            bg-blue-600
            hover:bg-blue-700

            text-white

            rounded-2xl

            py-3

            text-sm
            font-semibold

            transition
          "
        >

          {loading
            ? "Saving..."
            : "Save Measurement"}

        </button>

      </div>

    </div>
  );
}