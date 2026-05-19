import { useState, useEffect } from "react";

import { useParams } from "react-router-dom";

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

import PageHeader from "../components/PageHeader";
import SectionCard from "../components/SectionCard";
import InputField from "../components/InputField";

export default function CustomerDetails() {

  const { id } = useParams();

  // =========================
  // STATES
  // =========================

  const [activeTab, setActiveTab] =
    useState("kamij");

  const [measurements, setMeasurements] =
    useState([]);

  const [formData, setFormData] = useState({

    // DATE

    measurementDate:
      new Date().toISOString().split("T")[0],

    // KAMIJ

    shoulder: "",
    chest: "",
    upperChest: "",
    breast: "",
    waist: "",
    stomach: "",
    hip: "",
    length: "",

    // PANT

    pantLength: "",
    thigh: "",
    knee: "",
    kaf: "",
    mori: "",

    // BLOUSE

    neckDeep: "",
    frontV: "",
    backV: "",
    sleeveLength: "",
    underArm: "",
    bicep: "",
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
  // FETCH MEASUREMENTS
  // =========================

  const fetchMeasurements = async () => {

    try {

      const q = query(
        collection(db, "measurements"),
        where("customerId", "==", id)
      );

      const querySnapshot = await getDocs(q);

      const list = [];

      querySnapshot.forEach((doc) => {
        list.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setMeasurements(list);

    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  // =========================
  // SAVE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await addDoc(collection(db, "measurements"), {
        customerId: id,
        ...formData,
        createdAt: new Date(),
      });

      alert("Measurement Saved");

      fetchMeasurements();

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>

      <PageHeader title="Customer Measurements" />

      {/* TABS */}

      <div className="
        flex flex-wrap gap-3 mb-6
      ">

        <button
          onClick={() => setActiveTab("kamij")}
          className={`
            px-5 py-3 rounded-xl font-semibold
            ${activeTab === "kamij"
              ? "bg-blue-600 text-white"
              : "bg-white"
            }
          `}
        >
          Kamij
        </button>

        <button
          onClick={() => setActiveTab("pant")}
          className={`
            px-5 py-3 rounded-xl font-semibold
            ${activeTab === "pant"
              ? "bg-blue-600 text-white"
              : "bg-white"
            }
          `}
        >
          Pant
        </button>

        <button
          onClick={() => setActiveTab("blouse")}
          className={`
            px-5 py-3 rounded-xl font-semibold
            ${activeTab === "blouse"
              ? "bg-blue-600 text-white"
              : "bg-white"
            }
          `}
        >
          Blouse
        </button>

      </div>

      {/* FORM */}

      <SectionCard>

        <form
          onSubmit={handleSubmit}
          className="
            grid grid-cols-1
            md:grid-cols-2
            lg:grid-cols-3
            gap-4
          "
        >

          {/* DATE */}

          <InputField
            type="date"
            name="measurementDate"
            value={formData.measurementDate}
            onChange={handleChange}
          />

          {/* ========================= */}
          {/* KAMIJ */}
          {/* ========================= */}

          {activeTab === "kamij" && (

            <>

              <InputField
                name="shoulder"
                value={formData.shoulder}
                onChange={handleChange}
                placeholder="Shoulder"
              />

              <InputField
                name="chest"
                value={formData.chest}
                onChange={handleChange}
                placeholder="Chest"
              />

              <InputField
                name="upperChest"
                value={formData.upperChest}
                onChange={handleChange}
                placeholder="Upper Chest"
              />

              <InputField
                name="breast"
                value={formData.breast}
                onChange={handleChange}
                placeholder="Breast"
              />

              <InputField
                name="waist"
                value={formData.waist}
                onChange={handleChange}
                placeholder="Waist"
              />

              <InputField
                name="stomach"
                value={formData.stomach}
                onChange={handleChange}
                placeholder="Stomach"
              />

              <InputField
                name="hip"
                value={formData.hip}
                onChange={handleChange}
                placeholder="Hip"
              />

              <InputField
                name="length"
                value={formData.length}
                onChange={handleChange}
                placeholder="Length"
              />

            </>

          )}

          {/* ========================= */}
          {/* PANT */}
          {/* ========================= */}

          {activeTab === "pant" && (

            <>

              <InputField
                name="pantLength"
                value={formData.pantLength}
                onChange={handleChange}
                placeholder="Pant Length"
              />

              <InputField
                name="thigh"
                value={formData.thigh}
                onChange={handleChange}
                placeholder="Thigh"
              />

              <InputField
                name="knee"
                value={formData.knee}
                onChange={handleChange}
                placeholder="Knee"
              />

              <InputField
                name="kaf"
                value={formData.kaf}
                onChange={handleChange}
                placeholder="Kaf"
              />

              <InputField
                name="mori"
                value={formData.mori}
                onChange={handleChange}
                placeholder="Mori"
              />

            </>

          )}

          {/* ========================= */}
          {/* BLOUSE */}
          {/* ========================= */}

          {activeTab === "blouse" && (

            <>

              <InputField
                name="neckDeep"
                value={formData.neckDeep}
                onChange={handleChange}
                placeholder="Neck Deep"
              />

              <InputField
                name="frontV"
                value={formData.frontV}
                onChange={handleChange}
                placeholder="Front V"
              />

              <InputField
                name="backV"
                value={formData.backV}
                onChange={handleChange}
                placeholder="Back V"
              />

              <InputField
                name="sleeveLength"
                value={formData.sleeveLength}
                onChange={handleChange}
                placeholder="Sleeve Length"
              />

              <InputField
                name="underArm"
                value={formData.underArm}
                onChange={handleChange}
                placeholder="Under Arm"
              />

              <InputField
                name="bicep"
                value={formData.bicep}
                onChange={handleChange}
                placeholder="Bicep"
              />

            </>

          )}

          {/* SAVE */}

          <button
            className="
              bg-blue-600 text-white
              p-3 rounded-xl
            "
          >
            Save Measurements
          </button>

        </form>

      </SectionCard>

      {/* HISTORY */}

      <SectionCard>

        <h2 className="
          text-2xl font-bold mb-5
        ">
          Measurement History
        </h2>

        <div className="
          grid grid-cols-1
          md:grid-cols-2
          gap-4
        ">

          {measurements.map((item) => (

            <div
              key={item.id}
              className="
                border p-4 rounded-xl
              "
            >

              <p>
                <strong>Date:</strong>
                {item.measurementDate}
              </p>

              <p>
                <strong>Shoulder:</strong>
                {item.shoulder}
              </p>

              <p>
                <strong>Chest:</strong>
                {item.chest}
              </p>

              <p>
                <strong>Waist:</strong>
                {item.waist}
              </p>

              <p>
                <strong>Pant Length:</strong>
                {item.pantLength}
              </p>

            </div>

          ))}

        </div>

      </SectionCard>

    </div>
  );
}