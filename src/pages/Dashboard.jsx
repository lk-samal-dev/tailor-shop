import { useEffect, useState } from "react";

import {
  collection,
  getDocs,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import { db } from "../firebase/config";

export default function Dashboard() {

  const navigate =
    useNavigate();

  // =========================
  // STATES
  // =========================

  const [customerCount,
    setCustomerCount] =
    useState(0);

  const [employeeCount,
    setEmployeeCount] =
    useState(0);

  const [measurementCount,
    setMeasurementCount] =
    useState(0);

  const [monthlyIncome,
    setMonthlyIncome] =
    useState(0);

  const [monthlyPaid,
    setMonthlyPaid] =
    useState(0);

  // =========================
  // MONTH
  // =========================

  const currentMonth =
    new Date()
      .toISOString()
      .slice(0, 7);

  // =========================
  // FETCH
  // =========================

  const fetchDashboardData =
    async () => {

    try {

      // CUSTOMERS

      const customerSnapshot =
        await getDocs(
          collection(db, "customers")
        );

      setCustomerCount(
        customerSnapshot.size
      );

      // EMPLOYEES

      const employeeSnapshot =
        await getDocs(
          collection(db, "employees")
        );

      setEmployeeCount(
        employeeSnapshot.size
      );

      // MEASUREMENTS

      const measurementSnapshot =
        await getDocs(
          collection(db, "measurements")
        );

      setMeasurementCount(
        measurementSnapshot.size
      );

      // EMPLOYEE INCOME

      const incomeSnapshot =
        await getDocs(
          collection(
            db,
            "employee_income"
          )
        );

      let incomeTotal = 0;

      incomeSnapshot.forEach((doc) => {

        const data =
          doc.data();

        if (
          data.incomeDate?.startsWith(
            currentMonth
          )
        ) {

          incomeTotal += Number(
            data.dailyIncome
          );
        }
      });

      setMonthlyIncome(
        incomeTotal
      );

      // EMPLOYEE PAYMENTS

      const paymentSnapshot =
        await getDocs(
          collection(
            db,
            "employee_payments"
          )
        );

      let paymentTotal = 0;

      paymentSnapshot.forEach((doc) => {

        const data =
          doc.data();

        if (
          data.paymentDate?.startsWith(
            currentMonth
          )
        ) {

          paymentTotal += Number(
            data.amountPaid
          );
        }
      });

      setMonthlyPaid(
        paymentTotal
      );

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {

    fetchDashboardData();

  }, []);

  // =========================
  // CALCULATIONS
  // =========================

  const remaining =
    monthlyIncome - monthlyPaid;

  // =========================
  // QUICK ACTIONS
  // =========================

  const quickActions = [

    {
      title: "Add Customer",
      icon: "fa-user-plus",
      color:
        "from-blue-500 to-indigo-600",
      route: "/customers",
    },

    {
      title: "Measurements",
      icon: "fa-ruler-combined",
      color:
        "from-purple-500 to-pink-600",
      route: "/measurements",
    },

    {
      title: "Employees",
      icon: "fa-users",
      color:
        "from-green-500 to-emerald-600",
      route: "/employees",
    },

  ];

  // =========================
  // UI
  // =========================

  return (

    <div className="
      min-h-screen

      bg-[#eef2f9]

      p-4 md:p-6

      space-y-6
    ">

      {/* TOP */}

      <div className="
        flex items-center
        justify-between
      ">

        <div>

          <h1 className="
            text-2xl md:text-3xl
            font-bold
            text-gray-800
          ">
            Dashboard
          </h1>

          <p className="
            text-sm
            text-gray-500
            mt-1
          ">
            Welcome back, Mr. Pradip !!
          </p>

        </div>

        <div className="
          hidden md:flex

          h-12 w-12

          rounded-2xl

          bg-gradient-to-r
          from-blue-600
          to-indigo-700

          items-center
          justify-center

          text-white
        ">

          <i className="
            fa-solid fa-shirt
          "></i>

        </div>

      </div>

      {/* STATS */}

      <div className="
        grid
        grid-cols-2
        lg:grid-cols-3
        gap-4
      ">

        <StatCard
          title="Customers"
          value={customerCount}
          icon="fa-users"
          color="blue"
        />

        <StatCard
          title="Employees"
          value={employeeCount}
          icon="fa-user-tie"
          color="green"
        />

        <StatCard
          title="Measurements"
          value={measurementCount}
          icon="fa-ruler"
          color="purple"
        />

        <StatCard
          title="Income"
          value={`₹${monthlyIncome}`}
          icon="fa-indian-rupee-sign"
          color="yellow"
        />

        <StatCard
          title="Paid"
          value={`₹${monthlyPaid}`}
          icon="fa-wallet"
          color="cyan"
        />

        <StatCard
          title="Remaining Outstanding"
          value={`₹${remaining}`}
          icon="fa-scale-balanced"
          color="red"
        />

      </div>

      {/* QUICK ACTIONS */}

      <div>

        <div className="
          flex items-center
          justify-between
          mb-4
        ">

          <h2 className="
            text-lg font-semibold
            text-gray-800
          ">
            Quick Actions
          </h2>

        </div>

        <div className="
          grid
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-3

          gap-4
        ">

          {quickActions.map(
            (action) => (

            <button
              key={action.title}

              onClick={() =>
                navigate(
                  action.route
                )
              }

              className={`
                bg-gradient-to-r
                ${action.color}

                rounded-2xl

                p-4

                text-left

                text-white

                shadow-[0_4px_14px_rgba(0,0,0,0.08)]

                hover:scale-[1.02]

                transition-all
              `}
            >

              <div className="
                h-11 w-11

                rounded-xl

                bg-white/20

                flex items-center
                justify-center

                mb-4
              ">

                <i className={`
                  fa-solid
                  ${action.icon}
                  text-lg
                `}></i>

              </div>

              <h3 className="
                text-sm
                font-semibold
              ">
                {action.title}
              </h3>

            </button>

          ))}

        </div>

      </div>

      {/* PRIORITIES */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-5
      ">

    {/* BUSINESS OVERVIEW */}

<div className="
  bg-white

  rounded-2xl

  p-5

  shadow-[0_2px_10px_rgba(0,0,0,0.04)]
">

  <div className="
    flex items-center
    justify-between
    mb-5
  ">

    <h2 className="
      text-lg font-semibold
      text-gray-800
    ">
      Business Overview
    </h2>

    <span className="
      text-xs

      bg-blue-100
      text-blue-600

      px-3 py-1

      rounded-full
    ">
      Live
    </span>

  </div>

  <div className="
    space-y-4
  ">

    <PriorityItem
      title="Total Customers"
      value={customerCount}
    />

    <PriorityItem
      title="Total Employees"
      value={employeeCount}
    />

    <PriorityItem
      title="Measurements Taken"
      value={measurementCount}
    />

  </div>

</div>
        {/* EMPLOYEE */}

        <div className="
          bg-white

          rounded-2xl

          p-5

          shadow-[0_2px_10px_rgba(0,0,0,0.04)]
        ">

          <div className="
            flex items-center
            justify-between
            mb-5
          ">

            <h2 className="
              text-lg font-semibold
            ">
              Employee Summary
            </h2>

            <span className="
              text-xs

              bg-green-100
              text-green-600

              px-3 py-1

              rounded-full
            ">
              This Month
            </span>

          </div>

          <div className="
            space-y-4
          ">

            <PriorityItem
              title="Total Income"
              value={`₹${monthlyIncome}`}
            />

            <PriorityItem
              title="Salary Paid"
              value={`₹${monthlyPaid}`}
            />

            <PriorityItem
              title="Remaining"
              value={`₹${remaining}`}
            />

          </div>

        </div>

      </div>

    </div>
  );
}

// =========================
// STAT CARD
// =========================

function StatCard({
  title,
  value,
  icon,
  color,
}) {

  const colors = {

    blue:
      "bg-blue-100 text-blue-600",

    green:
      "bg-green-100 text-green-600",

    purple:
      "bg-purple-100 text-purple-600",

    yellow:
      "bg-yellow-100 text-yellow-600",

    cyan:
      "bg-cyan-100 text-cyan-600",

    red:
      "bg-red-100 text-red-600",
  };

  return (

    <div className="
      bg-white

      rounded-2xl

      p-4

      shadow-[0_2px_10px_rgba(0,0,0,0.04)]
    ">

      <div className="
        flex items-center
        justify-between
      ">

        <div>

          <p className="
            text-xs
            text-gray-400
          ">
            {title}
          </p>

          <h2 className="
            text-xl
            font-bold
            mt-1
            text-gray-800
          ">
            {value}
          </h2>

        </div>

        <div className={`
          h-11 w-11

          rounded-xl

          flex items-center
          justify-center

          ${colors[color]}
        `}>

          <i className={`
            fa-solid
            ${icon}
          `}></i>

        </div>

      </div>

    </div>
  );
}

// =========================
// PRIORITY ITEM
// =========================

function PriorityItem({
  title,
  value,
}) {

  return (

    <div className="
      flex items-center
      justify-between

      border border-gray-100

      rounded-xl

      px-4 py-3
    ">

      <span className="
        text-sm
        text-gray-500
      ">
        {title}
      </span>

      <span className="
        text-sm
        font-semibold
        text-gray-800
      ">
        {value}
      </span>

    </div>
  );
}