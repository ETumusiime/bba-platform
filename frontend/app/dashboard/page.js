"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("bba_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/parents/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (res.status === 403 && data?.redirect) {
          router.push(data.redirect);
          return;
        }

        setProfile(data);
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const daysLeft = profile?.trial_end_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(profile.trial_end_date) - new Date()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  const handleLogout = () => {
    localStorage.removeItem("bba_token");
    router.replace("/login");
  };

  const handleSubscribe = () => {
    router.push("/billing");
  };

  if (loading)
    return (
      <div className="dash-wrapper">
        <p>Loading your dashboard…</p>
      </div>
    );

  if (error)
    return (
      <div className="dash-wrapper">
        <p>{error}</p>
      </div>
    );

  return (
    <div className="dash-wrapper">
      <div className="dash-card-wide">
        <header className="dash-header">
          <h1>👋 Welcome, {profile?.name || "Parent"}!</h1>
          {profile?.subscription_status === "trial" ? (
            <>
              <p>⏳ Your free trial ends on {new Date(profile.trial_end_date).toLocaleDateString()}</p>
              <span className="dash-countdown">{daysLeft} days left</span>
            </>
          ) : (
            <p>✅ You are on an active subscription.</p>
          )}
        </header>

        <div className="dash-grid-horizontal">
          <div className="mini-card">
            <h3>Children</h3>
            <p>Add and manage your learners.</p>
            <button onClick={() => router.push("/children")}>Open →</button>
          </div>
          <div className="mini-card">
            <h3>Book Catalogue</h3>
            <p>Search by Subject, Code, or ISBN.</p>
            <button onClick={() => router.push("/books")}>Browse →</button>
          </div>
          <div className="mini-card">
            <h3>Subscription</h3>
            <p>View your trial or manage billing.</p>
            <button onClick={() => router.push("/billing")}>Manage →</button>
          </div>
        </div>

        <div className="dash-buttons-bottom">
          {profile?.subscription_status === "trial" && (
            <button onClick={handleSubscribe}>Subscribe Now</button>
          )}
          <button onClick={handleLogout} className="logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
