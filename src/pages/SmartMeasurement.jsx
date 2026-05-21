import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

import Toast from "../components/Toast";

// ============================================================
// CENTRAL CONFIG IMPORT
// ============================================================
// Adding / removing fields in measurementFields.js
// automatically updates form, validation, and saved data here.
// ============================================================

import { measurementFields } from "../utils/measurementFields";

// ========================================
// HELPERS — build initial form state from config
// ========================================

/**
 * Returns a flat object with every field key → "" across ALL tabs,
 * plus the fixed meta fields (phone, name, measurementDate, note).
 * Used for initial state and post-save reset.
 */
function buildEmptyFormData() {
  const measurementKeys = {};

  Object.values(measurementFields).forEach((fields) => {
    fields.forEach(({ key }) => {
      measurementKeys[key] = "";
    });
  });

  return {
    phone: "",
    name: "",
    measurementDate: new Date().toISOString().split("T")[0],
    note: "",
    ...measurementKeys,
  };
}

// ========================================
// FIELD COMPONENT
// ========================================

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  inputRef,
  onNext,
}) {

  const handleInput = (e) => {

    let val = e.target.value;

    val = val.replace(/[^0-9./ ]/g, "");

    onChange({
      target: {
        name,
        value: val,
      },
    });
  };

  return (
    <div>

      <label className="
        text-xs
        text-gray-500
        mb-1
        block
      ">
        {label}
      </label>

      <input
        ref={inputRef}

        type="text"

        inputMode="decimal"

        autoComplete="off"

        name={name}

        value={value}

        onChange={handleInput}

        onKeyDown={(e) => {
          if (e.key === "Enter" && onNext) {
            e.preventDefault();
            onNext();
          }
        }}

        placeholder={placeholder || "e.g. 20.5"}

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

// ========================================
// TAB STYLE MAP
// ========================================

const tabStyles = {
  kamij: {
    bg: "bg-[#f5f9ff]",
    border: "border-blue-100",
    titleColor: "text-blue-700",
    title: "Kamij Measurements",
  },
  pant: {
    bg: "bg-[#fffaf5]",
    border: "border-orange-100",
    titleColor: "text-orange-700",
    title: "Pant Measurements",
  },
  blouse: {
    bg: "bg-[#fff7fb]",
    border: "border-pink-100",
    titleColor: "text-pink-700",
    title: "Blouse Measurements",
  },
};

// ========================================
// MAIN COMPONENT
// ========================================

export default function SmartMeasurement() {

  // ========================================
  // STATES
  // ========================================

  const [activeTab, setActiveTab] =
    useState(
      localStorage.getItem("lastMeasurementTab") || "kamij"
    );

  const [customerFound, setCustomerFound] =
    useState(false);

  const [measurementCount, setMeasurementCount] =
    useState(0);

  const [customerId, setCustomerId] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [toastOpen, setToastOpen] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState("success");

  const location = useLocation();

  const customerData = location.state;

  // ========================================
  // REFS
  // ========================================

  const fieldRefs = useRef([]);

  // ========================================
  // FORM DATA — built dynamically from config
  // ========================================

  const [formData, setFormData] =
    useState(buildEmptyFormData);

  // ========================================
  // TOAST
  // ========================================

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // ========================================
  // PREFILL CUSTOMER
  // ========================================

  useEffect(() => {

    if (customerData) {

      setFormData((prev) => ({
        ...prev,
        phone: customerData.customerPhone || "",
        name: customerData.customerName || "",
      }));

      setCustomerId(customerData.customerId);
      setCustomerFound(true);
      fetchMeasurementCount(customerData.customerId);
    }

  }, []);

  // ========================================
  // SAVE LAST TAB
  // ========================================

  useEffect(() => {
    localStorage.setItem("lastMeasurementTab", activeTab);
  }, [activeTab]);

  // ========================================
  // UNSAVED WARNING
  // ========================================

  useEffect(() => {

    const handleBeforeUnload = (e) => {

      const hasChanges = Object.values(formData).some(
        (value) => value !== ""
      );

      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };

  }, [formData]);

  // ========================================
  // CHANGE
  // ========================================

  const handleChange = (e) => {

    const { name } = e.target;

    let value = e.target.value;

    if (name === "name") {
      value = value.replace(/[^a-zA-Z ]/g, "");
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // CUSTOMER SEARCH
  // ========================================

  const checkCustomer = async (mobile) => {

    if (mobile.length < 10) return;

    try {

      const q = query(
        collection(db, "customers"),
        where("mobile", "==", mobile)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {

        const customer = querySnapshot.docs[0];
        const data = customer.data();

        setCustomerFound(true);
        setCustomerId(customer.id);

        setFormData((prev) => ({
          ...prev,
          name: data.name,
        }));

        const mq = query(
          collection(db, "measurements"),
          where("customerId", "==", customer.id)
        );

        const ms = await getDocs(mq);

        setMeasurementCount(ms.size);

      } else {
        setCustomerFound(false);
        setCustomerId(null);
        setMeasurementCount(0);
      }

    } catch (error) {
      console.error(error);
      showToast("Network Error", "error");
    }
  };

  // ========================================
  // FETCH COUNT
  // ========================================

  const fetchMeasurementCount = async (id) => {

    try {

      const mq = query(
        collection(db, "measurements"),
        where("customerId", "==", id)
      );

      const ms = await getDocs(mq);

      setMeasurementCount(ms.size);

    } catch (error) {
      console.error(error);
    }
  };

  // ========================================
  // PHONE CHANGE
  // ========================================

  const handlePhoneChange = async (e) => {

    const value = e.target.value.replace(/[^0-9]/g, "");

    setFormData((prev) => ({
      ...prev,
      phone: value,
    }));

    if (value.length >= 10) {
      checkCustomer(value);
    }
  };

  // ========================================
  // RANGE VALIDATION
  // ========================================

  const validateMeasurement = (value) => {

    const number = parseFloat(value);

    if (isNaN(number)) return false;

    return number >= 1 && number <= 100;
  };

  // ========================================
  // SAVE
  // ========================================

  const handleSubmit = async () => {

    if (!formData.phone.trim()) {
      showToast("Enter Phone Number", "error");
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      showToast("Enter valid 10 digit phone number", "error");
      return;
    }

    if (!formData.name.trim()) {
      showToast("Enter Customer Name", "error");
      return;
    }

    // ----------------------------------------
    // DYNAMIC REQUIRED VALIDATION from config
    // ----------------------------------------

    const requiredFields = measurementFields[activeTab]
      .filter((f) => f.required)
      .map((f) => f.key);

    const missingField = requiredFields.find(
      (key) => !formData[key]?.trim()
    );

    if (missingField) {
      // Find human-readable label for the missing key
      const fieldConfig = measurementFields[activeTab].find(
        (f) => f.key === missingField
      );
      showToast(`Enter ${fieldConfig?.label || missingField}`, "error");
      return;
    }

    // ----------------------------------------
    // RANGE CHECK — all non-meta filled fields
    // ----------------------------------------

    const metaKeys = ["name", "phone", "measurementDate", "note"];

    const invalidField = Object.entries(formData).find(
      ([key, value]) => {
        if (metaKeys.includes(key)) return false;
        if (!value) return false;
        return !validateMeasurement(value);
      }
    );

    if (invalidField) {
      showToast(`${invalidField[0]} value looks invalid`, "error");
      return;
    }

    if (saving) return;

    try {

      setSaving(true);
      setLoading(true);

      let finalCustomerId = customerId;

      // ----------------------------------------
      // SAME DAY DUPLICATE WARNING
      // ----------------------------------------

      if (customerFound) {

        const sameDayQuery = query(
          collection(db, "measurements"),
          where("customerId", "==", customerId),
          where("measurementDate", "==", formData.measurementDate),
          where("type", "==", activeTab)
        );

        const sameDayResult = await getDocs(sameDayQuery);

        if (!sameDayResult.empty) {
          showToast("Measurement already exists for today", "error");
          setSaving(false);
          setLoading(false);
          return;
        }
      }

      // ----------------------------------------
      // CREATE CUSTOMER if new
      // ----------------------------------------

      if (!customerFound) {

        const customerRef = await addDoc(
          collection(db, "customers"),
          {
            name: formData.name.trim(),
            mobile: formData.phone.trim(),
            createdAt: new Date(),
          }
        );

        finalCustomerId = customerRef.id;
      }

      // ----------------------------------------
      // BUILD measurementData DYNAMICALLY from config
      // ----------------------------------------

      const measurementData = {};

      measurementFields[activeTab].forEach(({ key }) => {
        measurementData[key] = formData[key] || "";
      });

      // ----------------------------------------
      // SAVE
      // ----------------------------------------

      await addDoc(
        collection(db, "measurements"),
        {
          customerId: finalCustomerId,
          customerName: formData.name.trim(),
          customerPhone: formData.phone.trim(),
          type: activeTab,
          measurementDate: formData.measurementDate,
          note: formData.note.trim(),
          data: measurementData,
          createdAt: new Date(),
        }
      );

      showToast("Measurement Saved Successfully");

      // ----------------------------------------
      // RESET FORM
      // ----------------------------------------

      setFormData(buildEmptyFormData());

      setCustomerFound(false);
      setCustomerId(null);
      setMeasurementCount(0);
      setMeasurementCount((prev) => prev + 1);

      setTimeout(() => {
        fieldRefs.current[0]?.focus();
      }, 100);

    } catch (error) {

      console.error(error);
      showToast("Error saving measurement", "error");

    } finally {

      setLoading(false);
      setSaving(false);
    }
  };

  // ========================================
  // KEYBOARD NAVIGATION
  // ========================================

  const focusNext = (index) => {
    fieldRefs.current[index + 1]?.focus();
  };

  // ========================================
  // ACTIVE TAB STYLE
  // ========================================

  const style = tabStyles[activeTab] || tabStyles.kamij;

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

        <h1 className="text-xl md:text-2xl font-bold">
          Measurements
        </h1>

        <p className="text-sm text-gray-500 mt-1">
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

        <div className="grid grid-cols-2 gap-3">

          <div>

            <label className="text-xs text-gray-500 mb-1 block">
              Customer Phone
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Customer Phone"
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

            <label className="text-xs text-gray-500 mb-1 block">
              Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Customer Name"
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

        {/* STATUS BADGES */}

        {formData.phone && (

          <div className="flex flex-wrap gap-2 mt-4">

            <div className={`
              px-3 py-1.5
              rounded-full
              text-xs font-medium
              ${customerFound
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"}
            `}>
              {customerFound ? "Existing Customer" : "New Customer"}
            </div>

            {customerFound && (

              <div className="
                px-3 py-1.5
                rounded-full
                text-xs font-medium
                bg-[#e8edf7]
                text-gray-700
              ">
                {measurementCount} Measurements
              </div>

            )}

          </div>

        )}

      </div>

      {/* TYPE TABS */}

      <div className="
        bg-[#e8edf7]
        p-1
        rounded-2xl
        flex
        gap-1
      ">

        {[
          { key: "kamij", label: "Kamij" },
          { key: "pant",  label: "Pant"  },
          { key: "blouse",label: "Blouse"},
        ].map((tab) => (

          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex-1
              py-2.5
              rounded-xl
              text-sm font-semibold
              transition-all
              ${activeTab === tab.key
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-white/70"}
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

        <label className="text-xs text-gray-500 mb-1 block">
          Measurement Date
        </label>

        <input
          type="date"
          max={new Date().toISOString().split("T")[0]}
          name="measurementDate"
          value={formData.measurementDate}
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

      {/* NOTE */}

      <div className="
        bg-white
        rounded-2xl
        border border-gray-100
        shadow-sm
        p-4
      ">

        <label className="text-xs text-gray-500 mb-1 block">
          Additional Note
        </label>

        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          placeholder="Cloth note, design note, delivery note..."
          className="
            w-full
            border border-gray-200
            rounded-xl
            px-3 py-3
            text-sm
            min-h-[90px]
            resize-none
          "
        />

      </div>

      {/* ============================================================
          DYNAMIC MEASUREMENT FIELDS
          Renders based on measurementFields[activeTab] config.
          Adding/removing fields in measurementFields.js is all it takes.
          ============================================================ */}

      <div className={`
        ${style.bg}
        rounded-2xl
        border ${style.border}
        shadow-sm
        p-4
      `}>

        <h2 className={`text-sm font-semibold mb-4 ${style.titleColor}`}>
          {style.title}
        </h2>

        <div className="grid grid-cols-2 gap-3">

          {measurementFields[activeTab].map((field, index) => (

            <Field
              key={field.key}

              label={
                field.label +
                (field.required ? " *" : "")
              }

              name={field.key}

              value={formData[field.key] ?? ""}

              onChange={handleChange}

              placeholder={field.placeholder}

              inputRef={(el) =>
                (fieldRefs.current[index] = el)
              }

              onNext={() => focusNext(index)}
            />

          ))}

        </div>

      </div>

      {/* SAVE BUTTON */}

      <div className="
        fixed bottom-0 left-0 right-0
        bg-white
        border-t border-gray-200
        p-3
        z-50
      ">

        <button
          onClick={handleSubmit}
          disabled={loading || saving}
          className="
            w-full
            bg-blue-600
            hover:bg-blue-700
            disabled:opacity-60
            text-white
            rounded-2xl
            py-3
            text-sm font-semibold
            transition
          "
        >
          {loading || saving ? "Saving..." : "Save Measurement"}
        </button>

      </div>

      {/* TOAST */}

      <Toast
        open={toastOpen}
        message={toastMessage}
        type={toastType}
        onClose={() => setToastOpen(false)}
      />

    </div>
  );
}