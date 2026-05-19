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

  const [formData, setFormData] =
    useState({
      name: "",
      mobile: "",
      address: "",
      note: "",
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
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {

    try {

      setLoading(true);

      const querySnapshot =
        await getDocs(
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

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================
  // SAVE CUSTOMER
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      // DUPLICATE CHECK

      const q = query(
        collection(db, "customers"),
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
          "Customer already exists"
        );

        return;
      }

      await addDoc(
        collection(db, "customers"),
        {
          ...formData,
          deleted: false,
          createdAt: new Date(),
        }
      );

      alert("Customer Added");

      setFormData({
        name: "",
        mobile: "",
        address: "",
        note: "",
      });

      fetchCustomers();

    } catch (error) {

      console.error(error);

      alert("Error adding customer");
    }
  };

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredCustomers =
    customers.filter((customer) => {

      const searchTerm =
        search.toLowerCase();

      return (

        customer.name
          ?.toLowerCase()
          .includes(searchTerm)

        ||

        customer.mobile
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
          Customers
        </h1>

        <p className="
          text-sm text-gray-500 mt-1
        ">
          Manage tailor customers
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
            Search by name or phone
          "
        />

      </Section>

      {/* ADD CUSTOMER */}

      <Section title="Add Customer">

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
            placeholder="Customer Name"
          />

          <InputField
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            placeholder="Phone Number"
          />

          <InputField
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
          />

          <InputField
            name="note"
            value={formData.note}
            onChange={handleChange}
            placeholder="Customer Note"
          />

          <button
            className="
              bg-blue-600 text-white
              rounded-xl p-3
              text-sm font-medium
              hover:bg-blue-700
              transition
            "
          >
            Add Customer
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

          filteredCustomers.map(
            (customer) => (

            <div
              key={customer.id}

              onClick={() =>
                navigate(
                  `/customers/${customer.id}`
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

              <div className="
                flex items-start
                justify-between
              ">

                <div>

                  <h2 className="
                    text-base font-semibold
                  ">
                    {customer.name}
                  </h2>

                  <p className="
                    text-sm text-gray-500 mt-1
                  ">
                    {customer.mobile}
                  </p>

                </div>

              </div>

              {customer.address && (

                <p className="
                  text-sm text-gray-400
                  mt-3
                ">
                  {customer.address}
                </p>

              )}

            </div>

          ))

        )}

      </div>

    </div>
  );
}