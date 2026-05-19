import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import InputField from "../components/InputField";
import SummaryCard from "../components/SummaryCard";

import calculateTotal from "../utils/calculateTotal";
import calculateRemaining from "../utils/calculateRemaining";

export default function EmployeeDetails() {

  const { id } = useParams();

  // =========================
  // STATES
  // =========================

  const [incomeList, setIncomeList] = useState([]);
  const [paymentList, setPaymentList] = useState([]);
  const [editingIncomeId, setEditingIncomeId] =
  useState(null);

const [editingPaymentId, setEditingPaymentId] =
  useState(null);

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [totalIncome, setTotalIncome] = useState(0);
  const [totalPaid, setTotalPaid] = useState(0);

  const remainingBalance = calculateRemaining(
    totalIncome,
    totalPaid
  );

  // =========================
  // INCOME FORM
  // =========================

  const [formData, setFormData] = useState({
    incomeDate: new Date().toISOString().split("T")[0],
    dailyIncome: "",
    workNote: "",
  });

  // =========================
  // PAYMENT FORM
  // =========================

  const [paymentData, setPaymentData] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: "",
    paymentMethod: "Cash",
    paymentNote: "",
  });

  // =========================
  // HANDLERS
  // =========================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // FETCH INCOME
  // =========================

  const fetchIncome = async () => {

    try {

      const q = query(
        collection(db, "employee_income"),
        where("employeeId", "==", id)
      );

      const querySnapshot = await getDocs(q);

      const incomeData = [];

      querySnapshot.forEach((doc) => {
        incomeData.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const filteredIncome = incomeData.filter((item) =>
        item.incomeDate.startsWith(selectedMonth)
      );

      setIncomeList(filteredIncome);

      setTotalIncome(
        calculateTotal(filteredIncome, "dailyIncome")
      );

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
        collection(db, "employee_payments"),
        where("employeeId", "==", id)
      );

      const querySnapshot = await getDocs(q);

      const paymentArray = [];

      querySnapshot.forEach((doc) => {
        paymentArray.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      const filteredPayments = paymentArray.filter((item) =>
        item.paymentDate.startsWith(selectedMonth)
      );

      setPaymentList(filteredPayments);

      setTotalPaid(
        calculateTotal(filteredPayments, "amountPaid")
      );

    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    fetchIncome();
    fetchPayments();
  }, [selectedMonth]);

  // =========================
  // SAVE INCOME
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await addDoc(collection(db, "employee_income"), {
        employeeId: id,
        incomeDate: formData.incomeDate,
        dailyIncome: formData.dailyIncome,
        workNote: formData.workNote,
        createdAt: new Date(),
      });

      alert("Income Added");

      setFormData({
        incomeDate: new Date().toISOString().split("T")[0],
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

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();

    try {

      await addDoc(collection(db, "employee_payments"), {
        employeeId: id,
        paymentDate: paymentData.paymentDate,
        amountPaid: paymentData.amountPaid,
        paymentMethod: paymentData.paymentMethod,
        paymentNote: paymentData.paymentNote,
        createdAt: new Date(),
      });

      alert("Payment Added");

      setPaymentData({
        paymentDate: new Date().toISOString().split("T")[0],
        amountPaid: "",
        paymentMethod: "Cash",
        paymentNote: "",
      });

      fetchPayments();

    } catch (error) {
      console.error(error);
    }
    
  };

  const deleteIncome = async (id) => {

  try {

    await deleteDoc(
      doc(db, "employee_income", id)
    );

    fetchIncome();

  } catch (error) {
    console.error(error);
  }
};

  const deletePayment = async (id) => {

  try {

    await deleteDoc(
      doc(db, "employee_payments", id)
    );

    fetchPayments();

  } catch (error) {
    console.error(error);
  }
};

  return (
    <div>

      <PageHeader title="Employee Accounting" />

      {/* MONTH FILTER */}

      <SectionCard>

        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">

          <label className="font-semibold">
            Select Month
          </label>

          <input
            type="month"
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value)
            }
            className="border p-3 rounded-xl"
          />

        </div>

      </SectionCard>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

        <SummaryCard
          title="Total Earnings"
          value={`₹${totalIncome}`}
          color="bg-green-100"
        />

        <SummaryCard
          title="Total Paid"
          value={`₹${totalPaid}`}
          color="bg-blue-100"
        />

        <SummaryCard
          title="Remaining"
          value={`₹${remainingBalance}`}
          color="bg-red-100"
        />

      </div>

      {/* DAILY INCOME */}

      <SectionCard>

        <h2 className="text-2xl font-bold mb-5">
          Add Daily Income
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <InputField
            type="date"
            name="incomeDate"
            value={formData.incomeDate}
            onChange={handleChange}
          />

          <InputField
            name="dailyIncome"
            value={formData.dailyIncome}
            onChange={handleChange}
            placeholder="Daily Income"
          />

          <InputField
            name="workNote"
            value={formData.workNote}
            onChange={handleChange}
            placeholder="Work Note"
          />

          <button
            className="bg-green-600 text-white p-3 rounded-xl"
          >
            Save Income
          </button>

        </form>

      </SectionCard>

      {/* PAYMENT */}

      <SectionCard>

        <h2 className="text-2xl font-bold mb-5">
          Add Payment
        </h2>

        <form
          onSubmit={handlePaymentSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >

          <InputField
            type="date"
            name="paymentDate"
            value={paymentData.paymentDate}
            onChange={handlePaymentChange}
          />

          <InputField
            name="amountPaid"
            value={paymentData.amountPaid}
            onChange={handlePaymentChange}
            placeholder="Amount Paid"
          />

          <select
            name="paymentMethod"
            value={paymentData.paymentMethod}
            onChange={handlePaymentChange}
            className="border p-3 rounded-xl"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Bank</option>
          </select>

          <InputField
            name="paymentNote"
            value={paymentData.paymentNote}
            onChange={handlePaymentChange}
            placeholder="Payment Note"
          />

          <button
            className="bg-blue-600 text-white p-3 rounded-xl"
          >
            Save Payment
          </button>

        </form>

      </SectionCard>

      {/* INCOME HISTORY */}

      <SectionCard>

        <h2 className="text-2xl font-bold mb-5">
          Income History
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {incomeList.map((income) => (

            <div
              key={income.id}
              className="border p-4 rounded-xl"
            >

              <p>
                <strong>Date:</strong>
                {income.incomeDate}
              </p>

              <p>
                <strong>Income:</strong>
                ₹{income.dailyIncome}
              </p>

              <p>
                <strong>Note:</strong>
                {income.workNote}
              </p>
              <div className="flex gap-3 mt-4">

                <button
                  onClick={() => deleteIncome(income.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg "> Delete </button>
              </div>

            </div>

          ))}

        </div>

      </SectionCard>

      {/* PAYMENT HISTORY */}

      <SectionCard>

        <h2 className="text-2xl font-bold mb-5">
          Payment History
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {paymentList.map((payment) => (

            <div
              key={payment.id}
              className="border p-4 rounded-xl"
            >

              <p>
                <strong>Date:</strong>
                {payment.paymentDate}
              </p>

              <p>
                <strong>Paid:</strong>
                ₹{payment.amountPaid}
              </p>

              <p>
                <strong>Method:</strong>
                {payment.paymentMethod}
              </p>

              <p>
                <strong>Note:</strong>
                {payment.paymentNote}
              </p>
              <div className="flex gap-3 mt-4">

                  <button
                      onClick={() => deletePayment(payment.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg" > Delete </button>

                </div>

            </div>

          ))}

        </div>

      </SectionCard>

    </div>
  );
}