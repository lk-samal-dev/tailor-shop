import { useEffect, useState } from "react";

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

  const [formData, setFormData] =
    useState({
      name: "",
      mobile: "",
      doj:
        new Date()
          .toISOString()
          .split("T")[0],
    });

  // =========================
  // HANDLE CHANGE
  // =========================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // FETCH EMPLOYEES
  // =========================

  const fetchEmployees = async () => {

    try {

      setLoading(true);

      const querySnapshot =
        await getDocs(
          collection(db, "employees")
        );

      const list = [];

      for (const employeeDoc of
        querySnapshot.docs) {

        const employee =
          employeeDoc.data();

        // CURRENT MONTH

        const currentMonth =
          new Date()
            .toISOString()
            .slice(0, 7);

        // INCOME QUERY

        const incomeQuery = query(
          collection(
            db,
            "employee_income"
          ),
          where(
            "employeeId",
            "==",
            employeeDoc.id
          )
        );

        const incomeSnapshot =
          await getDocs(incomeQuery);

        let monthlyIncome = 0;

        incomeSnapshot.forEach((doc) => {

          const data = doc.data();

          if (
            data.incomeDate?.startsWith(
              currentMonth
            )
          ) {

            monthlyIncome += Number(
              data.dailyIncome
            );
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

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // =========================
  // ADD EMPLOYEE
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // DUPLICATE CHECK

      const q = query(
        collection(db, "employees"),
        where(
          "mobile",
          "==",
          formData.mobile
        )
      );

      const existing =
        await getDocs(q);

      if (!existing.empty) {

        alert(
          "Employee already exists"
        );

        return;
      }

      await addDoc(
        collection(db, "employees"),
        {
          ...formData,
          active: true,
          createdAt: new Date(),
        }
      );

      alert("Employee Added");

      setFormData({
        name: "",
        mobile: "",
        doj:
          new Date()
            .toISOString()
            .split("T")[0],
      });

      fetchEmployees();

    } catch (error) {

      console.error(error);

      alert("Error adding employee");
    }
  };

  // =========================
  // FILTER
  // =========================

  const filteredEmployees =
    employees.filter((employee) => {

      const searchTerm =
        search.toLowerCase();

      return (

        employee.name
          ?.toLowerCase()
          .includes(searchTerm)

        ||

        employee.mobile
          ?.includes(searchTerm)
      );
    });

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div>

        <h1 className="
          text-xl md:text-2xl
          font-bold
        ">
          Employees
        </h1>

        <p className="
          text-sm text-gray-500 mt-1
        ">
          Manage tailor workers
        </p>

      </div>

      {/* SEARCH */}

      <Section>

        <SearchBar
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="
            Search employee
          "
        />

      </Section>

      {/* ADD */}

      <Section title="Register Employee">

        <form
          onSubmit={handleSubmit}
          className="
            grid grid-cols-1
            md:grid-cols-2
            lg:grid-cols-4
            gap-3
          "
        >

          <InputField
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Employee Name"
          />

          <InputField
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Phone Number"
          />

          <InputField
            type="date"
            name="doj"
            value={formData.doj}
            onChange={handleChange}
          />

          <button
            className="
              bg-blue-600 text-white
              rounded-xl p-3
              text-sm font-medium
            "
          >
            Add Employee
          </button>

        </form>

      </Section>

      {/* LIST */}

      <div className="
        grid grid-cols-1
        md:grid-cols-2
        lg:grid-cols-3
        gap-3
      ">

        {loading ? (

          <div className="
            text-sm text-gray-500
          ">
            Loading...
          </div>

        ) : (

          filteredEmployees.map(
            (employee) => (

            <div
              key={employee.id}

              onClick={() =>
                navigate(
                  `/employees/${employee.id}`
                )
              }

              className="
                bg-white border
                border-gray-100
                rounded-xl p-4
                shadow-sm
                cursor-pointer
                hover:shadow-md
                transition
              "
            >

              {/* TOP */}

              <div className="
                flex items-start
                justify-between
              ">

                <div>

                  <h2 className="
                    text-base font-semibold
                  ">
                    {employee.name}
                  </h2>

                  <p className="
                    text-sm text-gray-500 mt-1
                  ">
                    {employee.mobile}
                  </p>

                </div>

                <span className="
                  text-xs bg-green-100
                  text-green-700
                  px-2 py-1 rounded-lg
                ">
                  Active
                </span>

              </div>

              {/* DETAILS */}

              <div className="
                mt-4 grid grid-cols-2
                gap-3
              ">

                <div>

                  <p className="
                    text-xs text-gray-400
                  ">
                    DOJ
                  </p>

                  <h3 className="
                    text-sm font-medium mt-1
                  ">
                    {employee.doj}
                  </h3>

                </div>

                <div>

                  <p className="
                    text-xs text-gray-400
                  ">
                    Monthly Earnings
                  </p>

                  <h3 className="
                    text-sm font-semibold
                    mt-1
                  ">
                    ₹
                    {employee.monthlyIncome}
                  </h3>

                </div>

              </div>

            </div>

          ))

        )}

      </div>

    </div>
  );
}