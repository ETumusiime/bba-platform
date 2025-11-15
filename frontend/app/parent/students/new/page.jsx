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
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [schoolYear, setSchoolYear] = useState(1);
  const [whatsapp, setWhatsapp] = useState("");

  const [country, setCountry] = useState("Uganda");
  const [city, setCity] = useState("");
  const [neighbourhood, setNeighbourhood] = useState("");

  const [showCreds, setShowCreds] = useState(null);

  const countries = useMemo(() => Object.keys(locationData), []);
  const cities = useMemo(() => Object.keys(locationData[country] || {}), [country]);
  const neighbourhoods = useMemo(
    () => locationData[country]?.[city] || [],
    [country, city]
  );

  /* -------------------------------------------------------------------------- */
  /* 🚀 Submission handler                                                      */
  /* -------------------------------------------------------------------------- */
  const onSubmit = async (e) => {
    e.preventDefault();

    if (!fullName || !dob || !email || !city || !neighbourhood || !password) {
      toast.error("Please complete all required fields");
      return;
    }

    // Strong password check
    const strongPassword = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPassword.test(password)) {
      toast.error(
        "Password must be at least 8 characters long and include both letters and numbers"
      );
      return;
    }

    try {
      const token = localStorage.getItem("bba_parent_token");

      if (!token) {
        toast.error("Please log in again.");
        router.push("/login");
        return;
      }

      const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

      const res = await fetch(`${API}/api/parent/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          dateOfBirth: dob,
          schoolYear: String(schoolYear),
          whatsapp,
          country,
          city,
          neighbourhood,
        }),
      });

      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to create student");
        return;
      }

      /* ---------------------------------------------------------------------- */
      /* 🧹 Clear form on success                                               */
      /* ---------------------------------------------------------------------- */
      setFullName("");
      setDob("");
      setEmail("");
      setPassword("");
      setWhatsapp("");
      setCountry("Uganda");
      setCity("");
      setNeighbourhood("");
      setSchoolYear(1);

      setShowCreds({
        username: json.data.email,
        tempPassword: password,
      });

      toast.success("Student created successfully!");
    } catch (err) {
      console.error("❌ Registration error:", err);
      toast.error("Something went wrong. Try again.");
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
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              placeholder="e.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth *</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (Username) *</label>
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
            <label className="block text-sm font-medium mb-1">School Year *</label>
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

          {/* Password */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Enter student password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
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

        {/* Location */}
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
            <label className="block text-sm font-medium mb-1">Neighbourhood *</label>
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

      {/* SUCCESS MODAL */}
      {showCreds && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-semibold mb-2 text-green-700">
              🎉 Student Account Created!
            </h2>
            <p className="text-gray-600 mb-4">
              The account for <strong>{showCreds.username}</strong> has been created successfully.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
              <div><strong>Username:</strong> {showCreds.username}</div>
              <div><strong>Password:</strong> {showCreds.tempPassword}</div>
              <p className="text-xs text-gray-500 mt-1">
                Shown once — please save these now.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <a
                href={`/student/login?email=${encodeURIComponent(showCreds.username)}`}
                className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Open Student Login
              </a>

              <button
                onClick={() => {
                  setShowCreds(null);
                  toast.success("Ready to register another student!");
                }}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
              >
                Register Another Student
              </button>

              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                Back to Dashboard
              </button>

              <button
                onClick={() => router.push("/parent/students")}
                className="px-4 py-2 rounded-md border hover:bg-gray-100"
              >
                View All Students
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
