import { useEffect, useState } from "react";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";

import { useParams } from "react-router-dom";

import { db } from "../firebase/config";

import Section from "../components/SectionCard";
import TabButton from "../components/TabButton";

export default function EmployeeProfile() {

  const { id } = useParams();

  // =========================
  // STATES
  // =========================

  const [employee, setEmployee] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState("earnings");

  const [incomeList, setIncomeList] =
    useState([]);

  const [paymentList, setPaymentList] =
    useState([]);

  const [selectedMonth, setSelectedMonth] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 7)
    );

  const [incomeData, setIncomeData] =
    useState({
      incomeDate:
        new Date()
          .toISOString()
          .split("T")[0],

      dailyIncome: "",

      workNote: "",
    });

  const [paymentData, setPaymentData] =
    useState({
      paymentDate:
        new Date()
          .toISOString()
          .split("T")[0],

      amountPaid: "",

      paymentMethod: "Cash",

      paymentNote: "",
    });

  // =========================
  // FETCH EMPLOYEE
  // =========================

  const fetchEmployee = async () => {

    try {

      const employeeRef =
        doc(db, "employees", id);

      const employeeSnap =
        await getDoc(employeeRef);

      if (employeeSnap.exists()) {

        setEmployee({
          id: employeeSnap.id,
          ...employeeSnap.data(),
        });
      }

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // FETCH INCOME
  // =========================

  const fetchIncome = async () => {

    try {

      const q = query(
        collection(
          db,
          "employee_income"
        ),
        where("employeeId", "==", id)
      );

      const querySnapshot =
        await getDocs(q);

      const list = [];

      querySnapshot.forEach((doc) => {

        const data = doc.data();

        if (
          data.incomeDate?.startsWith(
            selectedMonth
          )
        ) {

          list.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setIncomeList(list.reverse());

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // FETCH PAYMENTS
  // =========================

  const fetchPayments = async () => {

    try {

      const q = query(
        collection(
          db,
          "employee_payments"
        ),
        where("employeeId", "==", id)
      );

      const querySnapshot =
        await getDocs(q);

      const list = [];

      querySnapshot.forEach((doc) => {

        const data = doc.data();

        if (
          data.paymentDate?.startsWith(
            selectedMonth
          )
        ) {

          list.push({
            id: doc.id,
            ...data,
          });
        }
      });

      setPaymentList(list.reverse());

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    fetchEmployee();

  }, []);

  useEffect(() => {

    fetchIncome();

    fetchPayments();

  }, [selectedMonth]);

  // =========================
  // TOTALS
  // =========================

  const totalIncome =
    incomeList.reduce(
      (sum, item) =>
        sum + Number(item.dailyIncome),
      0
    );

  const totalPaid =
    paymentList.reduce(
      (sum, item) =>
        sum + Number(item.amountPaid),
      0
    );

  const remaining =
    totalIncome - totalPaid;

  // =========================
  // SAVE INCOME
  // =========================

  const saveIncome = async (e) => {

    e.preventDefault();

    try {

      await addDoc(
        collection(
          db,
          "employee_income"
        ),
        {
          employeeId: id,
          ...incomeData,
          createdAt: new Date(),
        }
      );

      setIncomeData({
        incomeDate:
          new Date()
            .toISOString()
            .split("T")[0],

        dailyIncome: "",

        workNote: "",
      });

      fetchIncome();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // SAVE PAYMENT
  // =========================

  const savePayment = async (e) => {

    e.preventDefault();

    try {

      await addDoc(
        collection(
          db,
          "employee_payments"
        ),
        {
          employeeId: id,
          ...paymentData,
          createdAt: new Date(),
        }
      );

      setPaymentData({
        paymentDate:
          new Date()
            .toISOString()
            .split("T")[0],

        amountPaid: "",

        paymentMethod: "Cash",

        paymentNote: "",
      });

      fetchPayments();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteIncome =
    async (incomeId) => {

    await deleteDoc(
      doc(
        db,
        "employee_income",
        incomeId
      )
    );

    fetchIncome();
  };

  const deletePayment =
    async (paymentId) => {

    await deleteDoc(
      doc(
        db,
        "employee_payments",
        paymentId
      )
    );

    fetchPayments();
  };

  return (
    <div className="space-y-4">

      {/* HEADER */}

      <div>

        <h1 className="
          text-xl md:text-2xl
          font-bold
        ">

          {employee?.name}

        </h1>

        <p className="
          text-sm text-gray-500 mt-1
        ">

          {employee?.mobile}

        </p>

      </div>

      {/* SUMMARY */}

      <div className="
        grid grid-cols-2
        md:grid-cols-4
        gap-3
      ">

        <div className="
          bg-white rounded-xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-gray-400
          ">
            Earnings
          </p>

          <h2 className="
            text-lg font-bold mt-1
          ">
            ₹{totalIncome}
          </h2>

        </div>

        <div className="
          bg-white rounded-xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-gray-400
          ">
            Paid
          </p>

          <h2 className="
            text-lg font-bold mt-1
          ">
            ₹{totalPaid}
          </h2>

        </div>

        <div className="
          bg-white rounded-xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-gray-400
          ">
            Remaining
          </p>

          <h2 className="
            text-lg font-bold mt-1
          ">
            ₹{remaining}
          </h2>

        </div>

        <div className="
          bg-white rounded-xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-gray-400
          ">
            Month
          </p>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value
              )
            }
            className="
              mt-2 text-sm
              border rounded-lg p-2
              w-full
            "
          />

        </div>

      </div>

      {/* TABS */}

      <div className="
        flex flex-wrap gap-2
      ">

        <TabButton
          label="Earnings"
          active={
            activeTab === "earnings"
          }
          onClick={() =>
            setActiveTab("earnings")
          }
        />

        <TabButton
          label="Payments"
          active={
            activeTab === "payments"
          }
          onClick={() =>
            setActiveTab("payments")
          }
        />

      </div>

      {/* EARNINGS */}

      {activeTab === "earnings" && (

        <>

          <Section title="Add Daily Income">

            <form
              onSubmit={saveIncome}
              className="
                grid grid-cols-1
                md:grid-cols-4
                gap-3
              "
            >

              <input
                type="date"
                value={
                  incomeData.incomeDate
                }
                onChange={(e) =>
                  setIncomeData({
                    ...incomeData,
                    incomeDate:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              />

              <input
                type="number"
                placeholder="Income"
                value={
                  incomeData.dailyIncome
                }
                onChange={(e) =>
                  setIncomeData({
                    ...incomeData,
                    dailyIncome:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              />

              <input
                type="text"
                placeholder="Work Note"
                value={
                  incomeData.workNote
                }
                onChange={(e) =>
                  setIncomeData({
                    ...incomeData,
                    workNote:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              />

              <button
                className="
                  bg-blue-600 text-white
                  rounded-xl p-3
                "
              >
                Save
              </button>

            </form>

          </Section>

          <Section title="Income History">

            <div className="
              space-y-3
            ">

              {incomeList.map((item) => (

                <div
                  key={item.id}
                  className="
                    border rounded-xl
                    p-4
                  "
                >

                  <div className="
                    flex justify-between
                    items-center
                  ">

                    <div>

                      <h2 className="
                        font-semibold
                      ">
                        ₹
                        {item.dailyIncome}
                      </h2>

                      <p className="
                        text-sm text-gray-500
                        mt-1
                      ">
                        {item.workNote}
                      </p>

                    </div>

                    <div className="
                      text-right
                    ">

                      <p className="
                        text-xs text-gray-400
                      ">
                        {item.incomeDate}
                      </p>

                      <button
                        onClick={() =>
                          deleteIncome(
                            item.id
                          )
                        }
                        className="
                          text-red-500
                          text-sm mt-2
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </Section>

        </>

      )}

      {/* PAYMENTS */}

      {activeTab === "payments" && (

        <>

          <Section title="Add Payment">

            <form
              onSubmit={savePayment}
              className="
                grid grid-cols-1
                md:grid-cols-4
                gap-3
              "
            >

              <input
                type="date"
                value={
                  paymentData.paymentDate
                }
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentDate:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              />

              <input
                type="number"
                placeholder="Amount"
                value={
                  paymentData.amountPaid
                }
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    amountPaid:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              />

              <select
                value={
                  paymentData.paymentMethod
                }
                onChange={(e) =>
                  setPaymentData({
                    ...paymentData,
                    paymentMethod:
                      e.target.value,
                  })
                }
                className="
                  border rounded-xl
                  p-3
                "
              >
                <option>
                  Cash
                </option>

                <option>
                  UPI
                </option>

                <option>
                  Bank
                </option>

              </select>

              <button
                className="
                  bg-green-600 text-white
                  rounded-xl p-3
                "
              >
                Save
              </button>

            </form>

          </Section>

          <Section title="Payment History">

            <div className="
              space-y-3
            ">

              {paymentList.map((item) => (

                <div
                  key={item.id}
                  className="
                    border rounded-xl
                    p-4
                  "
                >

                  <div className="
                    flex justify-between
                    items-center
                  ">

                    <div>

                      <h2 className="
                        font-semibold
                      ">
                        ₹
                        {item.amountPaid}
                      </h2>

                      <p className="
                        text-sm text-gray-500
                        mt-1
                      ">
                        {item.paymentMethod}
                      </p>

                    </div>

                    <div className="
                      text-right
                    ">

                      <p className="
                        text-xs text-gray-400
                      ">
                        {item.paymentDate}
                      </p>

                      <button
                        onClick={() =>
                          deletePayment(
                            item.id
                          )
                        }
                        className="
                          text-red-500
                          text-sm mt-2
                        "
                      >
                        Delete
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          </Section>

        </>

      )}

    </div>
  );
}