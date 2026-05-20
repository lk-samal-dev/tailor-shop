import { useEffect, useState, useCallback } from "react";

import { useNavigate } from "react-router-dom";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

import Section from "../components/SectionCard";
import SearchBar from "../components/SearchBar";
import InputField from "../components/InputField";
import Toast from "../components/Toast";

// =========================
// CONSTANTS
// =========================

const PAGE_SIZE = 9;

const INITIAL_FORM = {
  name: "",
  mobile: "",
  address: "",
  note: "",
};

// =========================
// VALIDATION HELPERS
// =========================

const validateCustomerForm = (formData) => {
  const name = formData.name.trim();
  const mobile = formData.mobile.trim();

  if (!name) {
    return "Customer name is required.";
  }

  if (!/^[a-zA-Z\s]+$/.test(name)) {
    return "Name can only contain letters and spaces.";
  }

  if (!mobile) {
    return "Mobile number is required.";
  }

  if (!/^\d{10}$/.test(mobile)) {
    return "Enter a valid 10-digit mobile number.";
  }

  return null; // No error
};

// =========================
// COMPONENT
// =========================

export default function Customers() {

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [customers, setCustomers] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState(INITIAL_FORM);

  const [toastOpen, setToastOpen] =
    useState(false);

  const [toastMessage, setToastMessage] =
    useState("");

  const [toastType, setToastType] =
    useState("success");

  // Pagination
  const [currentPage, setCurrentPage] =
    useState(1);

  // =========================
  // TOAST HELPER
  // =========================

  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setToastOpen(true);
  };

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Block non-numeric input for mobile
    if (name === "mobile" && value && !/^\d*$/.test(value)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = useCallback(async () => {

    try {

      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "customers")
      );

      const list = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.deleted) {
          list.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setCustomers(list);

    } catch (error) {

      console.error("fetchCustomers error:", error);
      showToast("Failed to load customers. Please try again.", "error");

    } finally {

      setLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // =========================
  // SAVE CUSTOMER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (saving) return;

    // Validate
    const validationError = validateCustomerForm(formData);

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedMobile = formData.mobile.trim();
    const trimmedAddress = formData.address.trim();
    const trimmedNote = formData.note.trim();

    try {

      setSaving(true);

      // Duplicate check
      const q = query(
        collection(db, "customers"),
        where("mobile", "==", trimmedMobile)
      );

      const existing = await getDocs(q);

      if (!existing.empty) {
        showToast(
          "A customer with this mobile number already exists.",
          "error"
        );
        return;
      }

      await addDoc(collection(db, "customers"), {
        name: trimmedName,
        mobile: trimmedMobile,
        address: trimmedAddress,
        note: trimmedNote,
        deleted: false,
        createdAt: new Date(),
      });

      showToast("Customer added successfully.", "success");

      setFormData(INITIAL_FORM);

      setCurrentPage(1);

      await fetchCustomers();

    } catch (error) {

      console.error("handleSubmit error:", error);
      showToast("Something went wrong. Please try again.", "error");

    } finally {

      setSaving(false);
    }
  };

  // =========================
  // SEARCH FILTER
  // Clean structure — ready for future debounce/pagination upgrade.
  // =========================

  const filteredCustomers = customers.filter((customer) => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return true;
    return (
      customer.name?.toLowerCase().includes(searchTerm) ||
      customer.mobile?.includes(searchTerm)
    );
  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredCustomers.length / PAGE_SIZE
  );

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div>
        <h1 className="text-xl md:text-2xl font-bold">
          Customers
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage tailor customers
        </p>
      </div>

      {/* SEARCH */}

      <Section>
        <SearchBar
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by name or phone"
        />
      </Section>

      {/* ADD CUSTOMER */}

      <Section title="Add Customer">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <InputField
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Customer Name"
            maxLength={60}
          />

          <InputField
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="10-digit Phone Number"
            maxLength={10}
            inputMode="numeric"
          />

          <InputField
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            maxLength={120}
          />

          <InputField
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Customer Note"
            maxLength={200}
          />

          <button
            type="submit"
            disabled={saving}
            className="
              bg-blue-600 text-white
              rounded-xl p-3
              text-sm font-medium
              hover:bg-blue-700
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {saving ? "Adding..." : "Add Customer"}
          </button>
        </form>
      </Section>

      {/* LIST */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {loading ? (

          <div className="text-sm text-gray-500">
            Loading...
          </div>

        ) : paginatedCustomers.length === 0 ? (

          <div className="text-sm text-gray-400 col-span-3">
            No customers found.
          </div>

        ) : (

          paginatedCustomers.map((customer) => (

            <div
              key={customer.id}
              onClick={() =>
                navigate(`/customers/${customer.id}`)
              }
              className="
                bg-white border border-gray-100
                rounded-xl p-4 shadow-sm
                cursor-pointer hover:shadow-md transition
              "
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    {customer.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {customer.mobile}
                  </p>
                </div>
              </div>

              {customer.address && (
                <p className="text-sm text-gray-400 mt-3">
                  {customer.address}
                </p>
              )}

              {customer.note && (
                <p className="text-xs text-gray-300 mt-1 italic">
                  {customer.note}
                </p>
              )}
            </div>

          ))

        )}

      </div>

      {/* PAGINATION */}

      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">

          <button
            onClick={() =>
              setCurrentPage((p) => Math.max(1, p - 1))
            }
            disabled={currentPage === 1}
            className="
              px-3 py-1.5 text-sm rounded-lg
              border border-gray-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-50 transition
            "
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
            (page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`
                  px-3 py-1.5 text-sm rounded-lg border transition
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 hover:bg-gray-50"
                  }
                `}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(totalPages, p + 1))
            }
            disabled={currentPage === totalPages}
            className="
              px-3 py-1.5 text-sm rounded-lg
              border border-gray-200
              disabled:opacity-40 disabled:cursor-not-allowed
              hover:bg-gray-50 transition
            "
          >
            Next
          </button>

        </div>
      )}

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