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
  doj: new Date().toISOString().split("T")[0],
};

// =========================
// VALIDATION HELPERS
// =========================

const validateEmployeeForm = (formData) => {
  const name = formData.name.trim();
  const mobile = formData.mobile.trim();

  if (!name) {
    return "Employee name is required.";
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

  if (!formData.doj) {
    return "Date of joining is required.";
  }

  return null; // No error
};

// =========================
// COMPONENT
// =========================

export default function Employees() {

  const navigate = useNavigate();

  // =========================
  // STATES
  // =========================

  const [employees, setEmployees] =
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
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = useCallback(async () => {

    try {

      setLoading(true);

      const querySnapshot = await getDocs(
        collection(db, "employees")
      );

      const list = [];

      for (const employeeDoc of querySnapshot.docs) {

        const employee = employeeDoc.data();

        // NOTE: N+1 query — structured cleanly
        // for future aggregation/pagination upgrade.
        const currentMonth = new Date()
          .toISOString()
          .slice(0, 7);

        const incomeQuery = query(
          collection(db, "employee_income"),
          where("employeeId", "==", employeeDoc.id)
        );

        const incomeSnapshot = await getDocs(incomeQuery);

        let monthlyIncome = 0;

        incomeSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.incomeDate?.startsWith(currentMonth)) {
            monthlyIncome += Number(data.dailyIncome) || 0;
          }
        });

        list.push({
          id: employeeDoc.id,
          ...employee,
          monthlyIncome,
        });
      }

      setEmployees(list);

    } catch (error) {

      console.error("fetchEmployees error:", error);
      showToast("Failed to load employees. Please try again.", "error");

    } finally {

      setLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // =========================
  // ADD EMPLOYEE
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (saving) return;

    // Validate
    const validationError = validateEmployeeForm(formData);

    if (validationError) {
      showToast(validationError, "error");
      return;
    }

    const trimmedName = formData.name.trim();
    const trimmedMobile = formData.mobile.trim();

    try {

      setSaving(true);

      // Duplicate check
      const q = query(
        collection(db, "employees"),
        where("mobile", "==", trimmedMobile)
      );

      const existing = await getDocs(q);

      if (!existing.empty) {
        showToast(
          "An employee with this mobile number already exists.",
          "error"
        );
        return;
      }

      await addDoc(collection(db, "employees"), {
        name: trimmedName,
        mobile: trimmedMobile,
        doj: formData.doj,
        active: true,
        createdAt: new Date(),
      });

      showToast("Employee registered successfully.", "success");

      setFormData(INITIAL_FORM);

      setCurrentPage(1);

      await fetchEmployees();

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

  const filteredEmployees = employees.filter((employee) => {
    const searchTerm = search.toLowerCase().trim();
    if (!searchTerm) return true;
    return (
      employee.name?.toLowerCase().includes(searchTerm) ||
      employee.mobile?.includes(searchTerm)
    );
  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredEmployees.length / PAGE_SIZE
  );

  const paginatedEmployees = filteredEmployees.slice(
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
          Employees
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage tailor workers
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

      {/* REGISTER EMPLOYEE */}

      <Section title="Register Employee">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <InputField
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Employee Name"
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
            type="date"
            name="doj"
            value={formData.doj}
            onChange={handleChange}
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
            {saving ? "Adding..." : "Add Employee"}
          </button>
        </form>
      </Section>

      {/* LIST */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">

        {loading ? (

          <div className="text-sm text-gray-500">
            Loading...
          </div>

        ) : paginatedEmployees.length === 0 ? (

          <div className="text-sm text-gray-400 col-span-3">
            No employees found.
          </div>

        ) : (

          paginatedEmployees.map((employee) => (

            <div
              key={employee.id}
              onClick={() =>
                navigate(`/employees/${employee.id}`)
              }
              className="
                bg-white border border-gray-100
                rounded-xl p-4 shadow-sm
                cursor-pointer hover:shadow-md transition
              "
            >
              {/* TOP */}

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-base font-semibold">
                    {employee.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {employee.mobile}
                  </p>
                </div>

                <span className="
                  text-xs bg-green-100 text-green-700
                  px-2 py-1 rounded-lg
                ">
                  {employee.active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* DETAILS */}

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-400">DOJ</p>
                  <h3 className="text-sm font-medium mt-1">
                    {employee.doj}
                  </h3>
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    Monthly Earnings
                  </p>
                  <h3 className="text-sm font-semibold mt-1">
                    ₹{employee.monthlyIncome}
                  </h3>
                </div>
              </div>
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