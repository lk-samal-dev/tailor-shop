// ============================================================
// CENTRAL MEASUREMENT FIELD CONFIG
// ============================================================
// This is the SINGLE SOURCE OF TRUTH for all measurement fields.
//
// To add a new field anywhere in the app, just add it here.
// It will automatically appear in:
//   - SmartMeasurement form
//   - CustomerProfile history cards
//   - Edit modal
//   - JPG export
//   - WhatsApp share text
//
// Field shape:
// {
//   key:         string  — must be unique per tab, used as Firebase key
//   label:       string  — human-readable label shown in UI
//   placeholder: string  — input hint (optional, falls back to "e.g. 20.5")
//   required:    boolean — if true, form blocks save when empty
// }
// ============================================================

export const measurementFields = {

  // ========================
  // KAMIJ
  // ========================

  kamij: [
    {
      key: "shoulder",
      label: "Shoulder",
      placeholder: "e.g. 16.5",
      required: true,
    },
    {
      key: "chest",
      label: "Chest",
      placeholder: "e.g. 38",
      required: true,
    },
    {
      key: "upperChest",
      label: "Upper Chest",
      placeholder: "e.g. 34",
      required: false,
    },
    {
      key: "waist",
      label: "Waist",
      placeholder: "e.g. 32",
      required: false,
    },
    {
      key: "hip",
      label: "Hip",
      placeholder: "e.g. 38",
      required: false,
    },
    {
      key: "stomach",
      label: "Stomach",
      placeholder: "e.g. 36",
      required: false,
    },
    {
      key: "length",
      label: "Length (Shoulder to bottom)",
      placeholder: "e.g. 42",
      required: true,
    },
    {
      key: "sleeve",
      label: "Sleeve",
      placeholder: "e.g. 24",
      required: false,
    },
    {
      key: "armhole",
      label: "Armhole",
      placeholder: "e.g. 24",
      required: false,
    },
    {
      key: "bicep",
      label: "Bicep",
      placeholder: "e.g. 13",
      required: false,
    },
  ],

  // ========================
  // PANT
  // ========================

  pant: [
    {
      key: "pantWaist",
      label: "Waist",
      placeholder: "e.g. 32",
      required: true,
    },
    {
      key: "pantLength",
      label: "Length",
      placeholder: "e.g. 40",
      required: true,
    },
    {
      key: "thigh",
      label: "Thigh",
      placeholder: "e.g. 22",
      required: false,
    },
    {
      key: "knee",
      label: "Knee",
      placeholder: "e.g. 16",
      required: false,
    },
    {
      key: "kaf",
      label: "KAF (Ankle)",
      placeholder: "e.g. 16",
      required: false,
    },
    {
      key: "pantHip",
      label: "Hip",
      placeholder: "e.g. 38",
      required: false,
    },
    {
      key: "mori",
      label: "Mori",
      placeholder: "e.g. 14",
      required: false,
    },
  ],

  // ========================
  // BLOUSE
  // ========================

  blouse: [
    {
      key: "blouseShoulder",
      label: "Shoulder",
      placeholder: "e.g. 16",
      required: true,
    },
    {
      key: "blouseLength",
      label: "Length",
      placeholder: "e.g. 16",
      required: true,
    },
    {
      key: "blouseChest",
      label: "Chest",
      placeholder: "e.g. 36",
      required: true,
    },
    {
      key: "blouseUpperChest",
      label: "Upper Chest",
      placeholder: "e.g. 34",
      required: false,
    },
    {
      key: "blouseWaist",
      label: "Waist",
      placeholder: "e.g. 30",
      required: false,
    },
    {
      key: "frontNeck",
      label: "Front Neck",
      placeholder: "e.g. 5",
      required: false,
    },
    {
      key: "backNeck",
      label: "Back Neck",
      placeholder: "e.g. 4",
      required: false,
    },
    {
      key: "blouseSleeve",
      label: "Sleeve",
      placeholder: "e.g. 6",
      required: false,
    },
    {
      key: "blouseMori",
      label: "Mori (Hand)",
      placeholder: "e.g. 14",
      required: false,
    },
    {
      key: "blouseUnderArm",
      label: "Under Arm",
      placeholder: "e.g. 14",
      required: false,
    },
    {
      key: "blouseBicep",
      label: "Bicep",
      placeholder: "e.g. 13",
      required: false,
    },
    {
      key: "blouseAF",
      label: "AF (Arm Front)",
      placeholder: "e.g. 13",
      required: false,
    },
    {
      key: "blouseDatPoint",
      label: "Dat Point",
      placeholder: "e.g. 13",
      required: false,
    },
    {
      key: "blouseDatGap",
      label: "Dat Gap",
      placeholder: "e.g. 13",
      required: false,
    },
  ],
};

// ============================================================
// HELPER: get a label for a raw key from any tab
// Used in CustomerProfile for pretty display in history cards,
// edit modal, and JPG export.
// ============================================================

export function getLabelForKey(key) {
  for (const fields of Object.values(measurementFields)) {
    const match = fields.find((f) => f.key === key);
    if (match) return match.label;
  }
  // Fallback: capitalise first letter (handles old/unknown keys safely)
  return key.charAt(0).toUpperCase() + key.slice(1);
}