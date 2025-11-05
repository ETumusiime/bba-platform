// frontend/utils/categoryMap.js

// ✅ Mapping for friendly vs internal names
export const categoryMap = {
  "Cambridge Early Years": "Early Years",
  "Cambridge Primary": "Primary",
  "Cambridge Lower Secondary": "Lower Secondary",
  "Cambridge Upper Secondary": "Upper Secondary",
  "Cambridge Advanced": "Advanced",
};

// ✅ Reverse map for lookup flexibility
export const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryMap).map(([friendly, internal]) => [internal, friendly])
);
