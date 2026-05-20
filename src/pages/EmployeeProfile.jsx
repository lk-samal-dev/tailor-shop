import { useEffect, useState } from "react";

import {
  addDoc,
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

import { db } from "../firebase/config";

import Section from "../components/SectionCard";
import TabButton from "../components/TabButton";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

export default function EmployeeProfile() {

  const { id } = useParams();

  const navigate = useNavigate();

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

  const [loading, setLoading] =
    useState(false);

  const [editingEmployee,
    setEditingEmployee] =
    useState(false);

  const [editEmployeeData,
    setEditEmployeeData] =
    useState({
      name: "",
      mobile: "",
    });

  const [editingIncome,
    setEditingIncome] =
    useState(null);

  const [editingPayment,
    setEditingPayment] =
    useState(null);

  const [confirmOpen,
    setConfirmOpen] =
    useState(false);

  const [confirmType,
    setConfirmType] =
    useState("");

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

    const [saving, setSaving] =
            useState(false);

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

        const data = {
          id: employeeSnap.id,
          ...employeeSnap.data(),
        };

        setEmployee(data);

        setEditEmployeeData({
          name: data.name || "",
          mobile: data.mobile || "",
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

      querySnapshot.forEach((docItem) => {

        const data = docItem.data();

        if (
          data.incomeDate?.startsWith(
            selectedMonth
          )
        ) {

          list.push({
            id: docItem.id,
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

      querySnapshot.forEach((docItem) => {

        const data = docItem.data();

        if (
          data.paymentDate?.startsWith(
            selectedMonth
          )
        ) {

          list.push({
            id: docItem.id,
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
  // TOAST
  // =========================

  const showToast = (
    message,
    type = "success"
  ) => {

    setToastMessage(message);

    setToastType(type);

    setToastOpen(true);
  };

  // =========================
  // SAVE INCOME
  // =========================

  const saveIncome = async (e) => {
  e.preventDefault();

  if (saving) return;

  setSaving(true);

  try {
    // Validation
    if (!incomeData.dailyIncome) {
      showToast("Enter Daily Income", "error");
      return;
    }

    if (Number(incomeData.dailyIncome) <= 0) {
      showToast("Income must be greater than 0", "error");
      return;
    }

    // Save to Firestore
    await addDoc(
      collection(db, "employee_income"),
      {
        employeeId: id,
        ...incomeData,
        createdAt: new Date(),
      }
    );

    // Reset form
    setIncomeData({
      incomeDate: new Date().toISOString().split("T")[0],
      dailyIncome: "",
      workNote: "",
    });

    // Refresh data
    fetchIncome();

    showToast("Income Added");

  } catch (error) {
    console.error(error);

    showToast("Failed To Save", "error");

  } finally {
    setSaving(false);
  }
};

  // =========================
  // SAVE PAYMENT
  // =========================

  const savePayment = async (e) => {

    e.preventDefault();
    
    if (!paymentData.amountPaid) {

  showToast(
    "Enter Payment Amount",
    "error"
  );

  return;
}

if (
  Number(paymentData.amountPaid) <= 0
) {

  showToast(
    "Payment must be greater than 0",
    "error"
  );

  return;
}

if (
  Number(paymentData.amountPaid) >
  remaining
) {

  showToast(
    "Payment exceeds remaining salary",
    "error"
  );

  return;
}

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

      showToast(
        "Payment Added"
      );

    } catch (error) {

      console.error(error);

      showToast(
        "Failed To Save",
        "error"
      );
    }
  };

  // =========================
  // UPDATE EMPLOYEE
  // =========================

  const updateEmployee = async () => {

    if (!editEmployeeData.name.trim()) {

    showToast(
      "Enter Employee Name",
      "error"
  );

  return;
}

if (
  !/^[0-9]{10}$/.test(
    editEmployeeData.mobile
  )
) {

  showToast(
    "Enter valid 10 digit mobile number",
    "error"
  );

  return;
}

    try {

      await updateDoc(
        doc(db, "employees", id),
        {
          name: editEmployeeData.name,
          mobile: editEmployeeData.mobile,
        }
      );

      fetchEmployee();

      setEditingEmployee(false);

      showToast(
        "Employee Updated"
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE EMPLOYEE
  // =========================

  const deleteEmployee = async () => {

    try {

      await deleteDoc(
        doc(db, "employees", id)
      );

      navigate("/employees");

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE INCOME
  // =========================

  const deleteIncome = async (incomeId) => {

    try {

      await deleteDoc(
        doc(
          db,
          "employee_income",
          incomeId
        )
      );

      fetchIncome();

      setConfirmOpen(false);

      showToast(
        "Income Deleted"
      );

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE PAYMENT
  // =========================

  const deletePayment = async (paymentId) => {

    try {

      await deleteDoc(
        doc(
          db,
          "employee_payments",
          paymentId
        )
      );

      fetchPayments();

      setConfirmOpen(false);

      showToast(
        "Payment Deleted"
      );

    } catch (error) {

      console.error(error);
    }
  };

  // UPDATE INCOME

  const updateIncome =
  async () => {

  try {

    await updateDoc(
      doc(
        db,
        "employee_income",
        editingIncome.id
      ),
      editingIncome
    );

    fetchIncome();

    setEditingIncome(null);

    showToast(
      "Income Updated"
    );

  } catch (error) {

    console.error(error);
  }
};

// UPDATE PAYMENT
const updatePayment =
  async () => {

  try {

    await updateDoc(
      doc(
        db,
        "employee_payments",
        editingPayment.id
      ),
      editingPayment
    );

    fetchPayments();

    setEditingPayment(null);

    showToast(
      "Payment Updated"
    );

  } catch (error) {

    console.error(error);
  }
};

  return (

    <div className="
      min-h-screen
      bg-[#f4f7fc]
      p-4 md:p-6
      space-y-5
      pb-10
    ">

      <div className="
        bg-gradient-to-r
        from-[#1e293b]
        to-[#334155]
        rounded-3xl
        p-5
        text-white
      ">

        <div className="
          flex flex-col md:flex-row
          md:items-center
          md:justify-between
          gap-4
        ">

          <div>

            <h1 className="
              text-2xl font-bold
            ">
              {employee?.name}
            </h1>

            <p className="
              text-slate-300 mt-1
            ">
              {employee?.mobile}
            </p>

          </div>

          <div className="flex gap-2">

            <button
              onClick={() =>
                setEditingEmployee(true)
              }
              className="
                px-4 py-3
                rounded-2xl
                bg-white/10
                border border-white/20
                text-sm
              "
            >
              Edit
            </button>

            <button
              onClick={() => {

                setConfirmType(
                  "employee"
                );

                setConfirmOpen(true);
              }}
              className="
                px-4 py-3
                rounded-2xl
                bg-red-500/20
                border border-red-300/20
                text-sm
              "
            >
              Delete
            </button>

          </div>

        </div>

      </div>

      <div className="
        grid grid-cols-2
        md:grid-cols-4
        gap-3
      ">

        <div className="
          bg-white rounded-2xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-slate-400
          ">
            Earnings
          </p>

          <h2 className="
            text-xl font-bold mt-1
          ">
            ₹{totalIncome}
          </h2>

        </div>

        <div className="
          bg-white rounded-2xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-slate-400
          ">
            Paid
          </p>

          <h2 className="
            text-xl font-bold mt-1
          ">
            ₹{totalPaid}
          </h2>

        </div>

        <div className="
          bg-white rounded-2xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-slate-400
          ">
            Remaining
          </p>

          <h2 className="
            text-xl font-bold mt-1
            text-emerald-600
          ">
            ₹{remaining}
          </h2>

        </div>

        <div className="
          bg-white rounded-2xl
          p-4 shadow-sm
        ">

          <p className="
            text-xs text-slate-400
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
              border rounded-xl
              p-2 w-full
            "
          />

        </div>

      </div>

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

      {activeTab === "earnings" && (

  <Section title="Daily Earnings">

    <form
      onSubmit={saveIncome}
      className="
        space-y-3
        mb-5
      "
    >

      <div className="
        grid
        md:grid-cols-2
        gap-3
      ">

        <input
          type="date"

          value={incomeData.incomeDate}

          onChange={(e) =>
            setIncomeData({
              ...incomeData,
              incomeDate:
                e.target.value,
            })
          }

          className="
            w-full

            border
            border-slate-200

            rounded-2xl

            px-4 py-3
          "
        />

        <input
          type="number"

          step="0.01"

          placeholder="Daily Income"

          value={incomeData.dailyIncome}

          onChange={(e) =>
            setIncomeData({
              ...incomeData,
              dailyIncome:
                e.target.value,
            })
          }

          className="
            w-full

            border
            border-slate-200

            rounded-2xl

            px-4 py-3
          "
        />

      </div>

      <textarea
        placeholder="Work Note"

        value={incomeData.workNote}

        onChange={(e) =>
          setIncomeData({
            ...incomeData,
            workNote:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3

          min-h-[90px]
        "
      />

      <button
          type="submit"
          disabled={saving}
          className="
            bg-gradient-to-r
            from-cyan-500
            to-blue-600
            text-white
            rounded-2xl
            px-5 py-3
            disabled:opacity-50
            disabled:cursor-not-allowed
          ">
          {saving ? "Saving..." : "Save Income"}
        </button>

    </form>

    <div className="
      space-y-3
    ">

      {incomeList.map((item) => (

        <div
          key={item.id}

          className="
            bg-slate-50

            border
            border-slate-200

            rounded-2xl

            p-4
          "
        >

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

               <h3 className="font-semibold">
                  ₹{item.dailyIncome}
                </h3>

                <p className="
                  text-xs
                  text-slate-400
                  mt-1 ">
                  {item.incomeDate}
                </p>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {item.workNote}
              </p>

            </div>

            <div className="
              flex gap-2
            ">

              <button
                onClick={() =>
                  setEditingIncome(item)
                }

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
                  fa-pen-to-square
                "></i>

              </button>

              <button
                onClick={() => {

                  setDeleteId(item.id);

                  setConfirmType(
                    "income"
                  );

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
                "></i>

              </button>

            </div>

          </div>

        </div>

      ))}

    </div>

  </Section>

)}

{activeTab === "payments" && (

  <Section title="Payments">

    <form
      onSubmit={savePayment}
      className="
        space-y-3
        mb-5
      "
    >

      <div className="
        grid
        md:grid-cols-2
        gap-3
      ">

        <input
          type="date"

          value={paymentData.paymentDate}

          onChange={(e) =>
            setPaymentData({
              ...paymentData,
              paymentDate:
                e.target.value,
            })
          }

          className="
            w-full

            border
            border-slate-200

            rounded-2xl

            px-4 py-3
          "
        />

        <input
          type="number"

          step="0.01"

          placeholder="Amount Paid"

          value={paymentData.amountPaid}

          onChange={(e) =>
            setPaymentData({
              ...paymentData,
              amountPaid:
                e.target.value,
            })
          }

          className="
            w-full

            border
            border-slate-200

            rounded-2xl

            px-4 py-3
          "
        />

      </div>

      <input
        type="text"

        placeholder="Payment Method"

        value={paymentData.paymentMethod}

        onChange={(e) =>
          setPaymentData({
            ...paymentData,
            paymentMethod:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <textarea
        placeholder="Payment Note"

        value={paymentData.paymentNote}

        onChange={(e) =>
          setPaymentData({
            ...paymentData,
            paymentNote:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3

          min-h-[90px]
        "
      />

      <button
        type="submit"

        className="
          bg-gradient-to-r
          from-cyan-500
          to-blue-600

          text-white

          rounded-2xl

          px-5 py-3
        "
      >
        Save Payment
      </button>

    </form>

    <div className="
      space-y-3
    ">

      {paymentList.map((item) => (

        <div
          key={item.id}

          className="
            bg-slate-50

            border
            border-slate-200

            rounded-2xl

            p-4
          "
        >

          <div className="
            flex
            items-center
            justify-between
          ">

            <div>

              <h3 className="
                font-semibold
              ">
                ₹{item.amountPaid}
              </h3>

              <p className="text-xs
                 text-slate-400 mt-1">
                {item.paymentDate}
              </p>

              <p className="
                text-sm
                text-slate-500
                mt-1
              ">
                {item.paymentMethod}
              </p>

            </div>

            <div className="
              flex gap-2
            ">

              <button
                onClick={() =>
                  setEditingPayment(item)
                }

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
                  fa-pen-to-square
                "></i>

              </button>

              <button
                onClick={() => {

                  setDeleteId(item.id);

                  setConfirmType(
                    "payment"
                  );

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
                "></i>

              </button>

            </div>

          </div>

        </div>

      ))}

    </div>

  </Section>

)}

    {editingIncome && (

  <div className="
    fixed inset-0

    bg-black/40
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

      space-y-3
    ">

      <h2 className="
        text-lg
        font-semibold
      ">
        Edit Income
      </h2>

      <input
        type="date"

        value={editingIncome.incomeDate}

        onChange={(e) =>
          setEditingIncome({
            ...editingIncome,
            incomeDate:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <input
        type="number"

        value={editingIncome.dailyIncome}

        onChange={(e) =>
          setEditingIncome({
            ...editingIncome,
            dailyIncome:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <textarea
        value={editingIncome.workNote}

        onChange={(e) =>
          setEditingIncome({
            ...editingIncome,
            workNote:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3

          min-h-[90px]
        "
      />

      <div className="
        flex gap-2
      ">

        <button
          onClick={updateIncome}

          className="
            flex-1

            bg-blue-600
            text-white

            rounded-2xl

            py-3
          "
        >
          Save
        </button>

        <button
          onClick={() =>
            setEditingIncome(null)
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

  {editingEmployee && (

  <div className="
    fixed inset-0

    bg-black/40
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

      space-y-4
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <h2 className="
            text-lg
            font-semibold
          ">
            Edit Employee
          </h2>

          <p className="
            text-sm
            text-slate-500
            mt-1
          ">
            Update employee details
          </p>

        </div>

        <button
          onClick={() =>
            setEditingEmployee(false)
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

      <input
        type="text"

        placeholder="Employee Name"

        value={editEmployeeData.name}

        onChange={(e) =>
          setEditEmployeeData({
            ...editEmployeeData,
            name: e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <input
        type="text"

        placeholder="Mobile Number"

        value={editEmployeeData.mobile}

        onChange={(e) =>
          setEditEmployeeData({
            ...editEmployeeData,
            mobile: e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <div className="
        flex gap-2
      ">

        <button
          onClick={updateEmployee}

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
          Save Changes
        </button>

        <button
          onClick={() =>
            setEditingEmployee(false)
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

      <ConfirmModal
        open={confirmOpen}
        title="Delete Item"
        message="Deleting employee will also remove salary history and payment records."
        danger={true}
        confirmText="Delete"
        onCancel={() =>
          setConfirmOpen(false)
        }
        onConfirm={() => {

          if (
            confirmType === "employee"
          ) {
            deleteEmployee();
          }

          if (
            confirmType === "income"
          ) {
            deleteIncome(deleteId);
          }

          if (
            confirmType === "payment"
          ) {
            deletePayment(deleteId);
          }
        }}
      />

      {editingPayment && (

  <div className="
    fixed inset-0

    bg-black/40
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

      space-y-3
    ">

      <h2 className="
        text-lg
        font-semibold
      ">
        Edit Payment
      </h2>

      <input
        type="date"

        value={editingPayment.paymentDate}

        onChange={(e) =>
          setEditingPayment({
            ...editingPayment,
            paymentDate:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <input
        type="number"

        value={editingPayment.amountPaid}

        onChange={(e) =>
          setEditingPayment({
            ...editingPayment,
            amountPaid:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <input
        type="text"

        value={editingPayment.paymentMethod}

        onChange={(e) =>
          setEditingPayment({
            ...editingPayment,
            paymentMethod:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3
        "
      />

      <textarea
        value={editingPayment.paymentNote}

        onChange={(e) =>
          setEditingPayment({
            ...editingPayment,
            paymentNote:
              e.target.value,
          })
        }

        className="
          w-full

          border
          border-slate-200

          rounded-2xl

          px-4 py-3

          min-h-[90px]
        "
      />

      <div className="
        flex gap-2
      ">

        <button
          onClick={updatePayment}

          className="
            flex-1

            bg-blue-600
            text-white

            rounded-2xl

            py-3
          "
        >
          Save
        </button>

        <button
          onClick={() =>
            setEditingPayment(null)
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
