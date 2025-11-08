"use client";

import { useState, useMemo } from "react";
import locationData from "../../../_lib/locationData";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function RegisterStudentPage() {
  const router = useRouter();

  /* -------------------------------------------------------------------------- */
  /* 🧾 Form state                                                              */
  /* -------------------------------------------------------------------------- */
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [schoolYear, setSchoolYear] = useState(1);
  const [whatsapp, setWhatsapp] = useState("");

  const [country, setCountry] = useState("Uganda");
  const [city, setCity] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");

  const [showCreds, setShowCreds] = useState(null); // { username, tempPassword }

  const countries = useMemo(() => Object.keys(locationData), []);
  const cities = useMemo(() => Object.keys(locationData[country] || {}), [country]);
  const neighbourhoods = useMemo(
    () => locationData[country]?.[city] || [],
    [country, city]
  );

  /* -------------------------------------------------------------------------- */
  /* 🚀 Form submission                                                         */
  /* -------------------------------------------------------------------------- */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !dob || !email || !city || !neighbourhood) {
      toast.error("Please complete all required fields");
      return;
    }

    const [firstName, ...rest] = fullName.trim().split(" ");
    const lastName = rest.join(" ") || "-";

    try {
      const token = localStorage.getItem("bba_parent_token");

      // 🧩 Debug token preview before sending
      if (!token) {
        console.error("🚫 No parent token found in localStorage");
        toast.error("Parent not authenticated. Please log in again.");
        router.push("/login");
        return;
      } else {
        console.log(
          "🧩 Frontend token preview:",
          token.slice(0, 30) + "..." + token.slice(-30)
        );
      }

      // Always point to backend (default localhost:5000 or env var)
      const API = process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:5000";

      const res = await fetch(`${API}/api/parent/children`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          dob,
          schoolYear: Number(schoolYear),
          whatsapp_phone: whatsapp || undefined,
          address: { country, city, neighbourhood },
        }),
      });

      // If backend failed or returned HTML, handle gracefully
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Backend returned invalid response. Check backend server (port 5000)."
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create student");
      }

      setShowCreds(data.credentials);
      toast.success("✅ Student account created successfully!");
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error(err.message || "Something went wrong.");
    }
  };

  /* -------------------------------------------------------------------------- */
  /* 🎨 UI Rendering                                                            */
  /* -------------------------------------------------------------------------- */
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Register Student</h1>

      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-white rounded-xl p-5 shadow"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Full Name *
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Date of Birth *
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email (Username) *
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="student@email.com"
              />
              <a
                href="https://accounts.google.com/signup"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 border rounded-md text-blue-600 hover:bg-blue-50"
              >
                Create Gmail
              </a>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              School Year *
            </label>
            <select
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            >
              {Array.from({ length: 13 }, (_, i) => i + 1).map((y) => (
                <option key={y} value={y}>
                  {`Year ${y}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Student WhatsApp (optional)
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="+2567xxxxxxx"
            />
          </div>
        </div>

        {/* Location Fields */}
        <div className="grid md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-sm font-medium mb-1">Country *</label>
            <select
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setCity("");
                setNeighbourhood("");
              }}
              className="w-full border rounded-md px-3 py-2"
            >
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City *</label>
            <select
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setNeighbourhood("");
              }}
              className="w-full border rounded-md px-3 py-2"
            >
              <option value="" disabled>
                Select city
              </option>
              {cities.map((cty) => (
                <option key={cty} value={cty}>
                  {cty}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Neighbourhood *
            </label>
            <select
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              disabled={!city}
            >
              <option value="" disabled>
                Select neighbourhood
              </option>
              {(neighbourhoods.length ? neighbourhoods : ["Other"]).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Create Student
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showCreds && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-3">Student Credentials</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Username:</span>{" "}
                {showCreds.username}
              </div>
              <div>
                <span className="font-medium">Temporary Password:</span>{" "}
                {showCreds.tempPassword}
              </div>
              <p className="text-gray-600">
                Shown once. Please save these now.
              </p>
            </div>
            <div className="mt-4 flex gap-2">
              <a
                href="/student/login"
                className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Open Student Login
              </a>
              <button
                onClick={() => {
                  setShowCreds(null);
                  router.push("/parent/students");
                }}
                className="px-3 py-2 rounded-md border hover:bg-gray-100"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
