"use client";
import { useRouter } from "next/navigation";

export default function ParentDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-bbaGray flex flex-col">
      <header className="bg-bbaBlue text-white py-4 px-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold">BBA Parent Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-bbaGold text-bbaBlue font-semibold px-4 py-2 rounded-md hover:opacity-90 transition"
        >
          Logout
        </button>
      </header>

      <main className="flex-1 p-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bbaBlue">
          <h2 className="text-lg font-semibold text-bbaBlue mb-2">
            My Children
          </h2>
          <p className="text-gray-600">
            View and manage enrolled students linked to your account.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bbaGold">
          <h2 className="text-lg font-semibold text-bbaGold mb-2">
            Book Orders
          </h2>
          <p className="text-gray-600">
            Check book order history, payments, and status.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-bbaBlue">
          <h2 className="text-lg font-semibold text-bbaBlue mb-2">
            Support
          </h2>
          <p className="text-gray-600">
            Reach out for help or clarification from the BBA support team.
          </p>
        </div>
      </main>

      <footer className="text-center py-4 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} Bethel Bridge Academy — All Rights Reserved
      </footer>
    </div>
  );
}
