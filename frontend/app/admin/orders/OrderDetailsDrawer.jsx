"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  CreditCard,
  User,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";

const API =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function OrderDetailsDrawer({ open, orderId, onClose }) {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showDebug, setShowDebug] = useState(false);

  // Student assignment
  const [assignItem, setAssignItem] = useState(null);
  const [familyStudents, setFamilyStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [reassignedItems, setReassignedItems] = useState([]);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("bba_admin_token")
      : "";

  /* ------------------------------------------------------------ */
  /* Load order                                                    */
  /* ------------------------------------------------------------ */
  const loadOrder = async (id) => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API}/api/admin/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load order details");

      const json = await res.json();

      // backend returns { order: {...} }
      setOrder(json.order);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------------ */
  /* Open drawer → load order                                     */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (open && orderId) {
      loadOrder(orderId);
    }
  }, [open, orderId, token]);

  /* ------------------------------------------------------------ */
  /* Load students when an item is selected                       */
  /* ------------------------------------------------------------ */
  useEffect(() => {
    if (!assignItem || !order) return;

    const loadStudents = async () => {
      try {
        const res = await fetch(
          `${API}/api/admin/orders/${order.id}/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const json = await res.json();
        setFamilyStudents(json.students || []);

        // Preselect current student
        setSelectedStudentId(assignItem.student?.id || "");
      } catch (err) {
        console.error("Student load failed:", err);
      }
    };

    loadStudents();
  }, [assignItem, order, token]);

  /* ------------------------------------------------------------ */
  /* Assignment stats (Phase 4 – Automation Step 1, quantity-aware) */
  /* ------------------------------------------------------------ */
  const getAssignmentStats = () => {
    if (order?.assignmentStats) {
      const {
        totalCopies,
        assignedCopies,
        unassignedCopies,
        completionPercent,
      } = order.assignmentStats;

      return {
        totalItems: totalCopies,
        assignedItems: assignedCopies,
        unassignedItems: unassignedCopies,
        completion: completionPercent,
      };
    }

    // Fallback (if backend not enriched for some reason)
    if (!order || !order.items) {
      return {
        totalItems: 0,
        assignedItems: 0,
        unassignedItems: 0,
        completion: 100,
      };
    }

    let totalCopies = 0;
    let assignedCopies = 0;

    order.items.forEach((i) => {
      const qty =
        typeof i.quantity === "number" && i.quantity > 0 ? i.quantity : 1;
      const assignedCount =
        typeof i.assignedCount === "number"
          ? i.assignedCount
          : i.student
          ? 1
          : 0;
      totalCopies += qty;
      assignedCopies += assignedCount;
    });

    const unassignedCopies = Math.max(totalCopies - assignedCopies, 0);
    const completion =
      totalCopies === 0
        ? 100
        : Math.round((assignedCopies / totalCopies) * 100);

    return {
      totalItems: totalCopies,
      assignedItems: assignedCopies,
      unassignedItems: unassignedCopies,
      completion,
    };
  };

  const stats = getAssignmentStats();

  let progressBarColor = "bg-emerald-500 dark:bg-emerald-400";
  let progressBadgeColor =
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";

  if (stats.totalItems > 0 && stats.completion === 0) {
    // 0% assigned
    progressBarColor = "bg-rose-500 dark:bg-rose-400";
    progressBadgeColor =
      "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
  } else if (
    stats.totalItems > 0 &&
    stats.completion > 0 &&
    stats.completion < 100
  ) {
    // partial
    progressBarColor = "bg-amber-500 dark:bg-amber-400";
    progressBadgeColor =
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
  }

  /* ------------------------------------------------------------ */
  /* MAIN UI                                                      */
  /* ------------------------------------------------------------ */
  return (
    <div
      className={`fixed inset-0 z-[9999] flex justify-end transition-all duration-300 ${
        open
          ? "pointer-events-auto bg-black/30 backdrop-blur-sm"
          : "pointer-events-none bg-transparent"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Drawer Panel */}
      <div
        className={`w-full sm:w-[480px] md:w-[560px] lg:w-[620px] h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-xl transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between border-b px-4 bg-slate-100 dark:bg-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Order #{orderId}
          </h2>

          <button
            className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-indigo-600" size={28} />
            </div>
          )}

          {!loading && error && (
            <div className="text-red-500 text-center py-10">{error}</div>
          )}

          {!loading && order && (
            <>
              {/* ------------ ORDER SUMMARY ------------ */}
              <section className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-3 text-slate-700 dark:text-slate-200">
                  Order Summary
                </h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span
                      className={`font-semibold ${
                        order.status === "PAID"
                          ? "text-emerald-600"
                          : order.status === "FAILED" ||
                            order.status === "CANCELLED"
                          ? "text-rose-600"
                          : "text-amber-600"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Created:</span>
                    <span>
                      <Calendar size={14} className="inline mr-1" />
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Amount:</span>
                    <span className="font-bold">
                      UGX{" "}
                      {Number(
                        order.grandTotalUGX ?? order.totalAmount ?? 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </section>

              {/* ------------ PARENT INFO ------------ */}
              <section>
                <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  Parent Information
                </h3>

                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <User size={18} className="text-indigo-500" />
                    <span className="font-semibold">
                      {order.parentName || order.parent?.name}
                    </span>
                  </div>
                  <div className="text-slate-500">
                    {order.parentEmail || order.parent?.email}
                  </div>
                  <div className="text-slate-500">
                    {order.city || order.parent?.city},{" "}
                    {order.country || order.parent?.country}
                  </div>
                </div>
              </section>

              {/* ------------ PAYMENT INFO ------------ */}
              <section>
                <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  Payment Information
                </h3>

                {/* Verify Button */}
                {order.payments?.length > 0 && (
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);

                        const res = await fetch(
                          `${API}/api/admin/orders/verify/${order.id}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );

                        const json = await res.json();
                        if (!json.success)
                          throw new Error(json.message);

                        setOrder(json.order);
                      } catch (err) {
                        alert("Verification failed: " + err.message);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="mt-1 mb-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-md"
                  >
                    Verify Payment Status
                  </button>
                )}

                {order.payments?.length > 0 ? (
                  order.payments.map((p) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm mb-3"
                    >
                      <div className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                        {p.channel} — {p.status}
                      </div>

                      <div className="space-y-1 text-slate-600 dark:text-slate-300">
                        <div>
                          <strong>TxRef:</strong> {p.txRef}
                        </div>
                        <div>
                          <strong>Amount:</strong> UGX{" "}
                          {Number(p.amount).toLocaleString()}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {new Date(p.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-500">
                    No payment records found.
                  </div>
                )}
              </section>

              {/* ------------ ORDER ITEMS + AUTOMATION ------------ */}
              <section>
                <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
                  Items (Books)
                </h3>

                {/* Assignment summary (quantity-aware) */}
                {stats.totalItems > 0 && (
                  <div className="mb-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 dark:text-slate-300">
                          Assignment progress:
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full font-semibold ${progressBadgeColor}`}
                        >
                          {stats.assignedItems} / {stats.totalItems} copies •{" "}
                          {stats.completion}%
                        </span>
                      </div>

                      {stats.unassignedItems > 0 && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-300">
                          {stats.unassignedItems} copies not assigned
                        </span>
                      )}
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-1.5 ${progressBarColor}`}
                        style={{ width: `${stats.completion}%` }}
                      />
                    </div>

                    {stats.unassignedItems > 0 && (
                      <div className="flex items-start gap-2 text-[11px] text-amber-700 dark:text-amber-200 bg-amber-50/90 dark:bg-amber-900/20 px-3 py-2 rounded-md">
                        <AlertTriangle size={12} className="mt-[1px]" />
                        <span>
                          Some purchased copies are not yet mapped to a
                          student. Please assign each copy to exactly one
                          student to keep license usage accurate.
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-3 py-2 text-left">Book</th>
                        <th className="px-3 py-2 text-left">ISBN</th>
                        <th className="px-3 py-2 text-left">Qty</th>
                        <th className="px-3 py-2 text-left">Assigned To</th>
                        <th className="px-3 py-2 text-left">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items?.map((item) => {
                        const quantity =
                          typeof item.quantity === "number" &&
                          item.quantity > 0
                            ? item.quantity
                            : 1;

                        const assignedCount =
                          typeof item.assignedCount === "number"
                            ? item.assignedCount
                            : item.student
                            ? 1
                            : 0;

                        const unassignedCount = Math.max(
                          quantity - assignedCount,
                          0
                        );

                        const hasStudent = !!item.student;
                        const isReassigned = reassignedItems.includes(
                          item.id
                        );

                        // Color logic based on quantities (RED / YELLOW / GREEN)
                        let badgeClass =
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ";
                        if (quantity <= 0) {
                          badgeClass +=
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                        } else if (assignedCount <= 0) {
                          // no copies assigned
                          badgeClass +=
                            "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300";
                        } else if (assignedCount < quantity) {
                          // partial
                          badgeClass +=
                            "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200";
                        } else {
                          // fully assigned for this item
                          badgeClass +=
                            "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200";
                        }

                        let badgeText = "Not assigned";
                        if (hasStudent) {
                          badgeText = item.student.fullName;
                          if (isReassigned) {
                            badgeText += " (reassigned)";
                          }
                        } else if (quantity > 0 && assignedCount > 0) {
                          badgeText = `Assigned (${assignedCount}/${quantity})`;
                        }

                        return (
                          <tr
                            key={item.id}
                            className="border-t border-slate-200 dark:border-slate-700"
                          >
                            <td className="px-3 py-2">
                              {item.book?.title || item.title}
                            </td>

                            <td className="px-3 py-2">
                              {item.book?.isbn || item.isbn}
                            </td>

                            <td className="px-3 py-2">{quantity}</td>

                            <td className="px-3 py-2">
                              <div className="flex flex-col gap-1">
                                <span className={badgeClass}>{badgeText}</span>

                                {/* Assigned X / Y */}
                                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                  Assigned {assignedCount} / {quantity}
                                </span>

                                {/* Missing copies warning */}
                                {unassignedCount > 0 && (
                                  <span className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300">
                                    <AlertTriangle size={11} />
                                    {unassignedCount}{" "}
                                    {unassignedCount === 1
                                      ? "copy"
                                      : "copies"}{" "}
                                    unassigned
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-3 py-2">
                              <button
                                onClick={() => setAssignItem(item)}
                                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                              >
                                {hasStudent ? "Reassign" : "Assign"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ------------ RAW JSON ------------ */}
              <section>
                <button
                  onClick={() => setShowDebug(!showDebug)}
                  className="flex items-center gap-2 text-indigo-600 dark:text-indigo-300 text-sm"
                >
                  {showDebug ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  Show raw JSON (debug)
                </button>

                {showDebug && (
                  <pre className="mt-3 p-3 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-auto border border-slate-700">
                    {JSON.stringify(order, null, 2)}
                  </pre>
                )}
              </section>
            </>
          )}
        </div>
      </div>

      {/* ---------------- ASSIGN / REASSIGN MODAL ---------------- */}
      {assignItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl w-full max-w-md border dark:border-slate-700 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {assignItem.student ? "Reassign Student" : "Assign Student"}
            </h3>

            {assignItem.student && (
              <div className="flex items-start gap-2 mb-4 text-xs text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-md">
                <AlertTriangle size={14} className="mt-[2px]" />
                <div>
                  <div>
                    Currently assigned to:{" "}
                    <strong>{assignItem.student.fullName}</strong>
                  </div>
                  <div>
                    Reassigning will move this license to a different
                    student.
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm mb-2 text-slate-700 dark:text-slate-200">
              Book:{" "}
              <strong>
                {assignItem.book?.title || assignItem.title}
              </strong>
            </div>

            {familyStudents.length === 0 ? (
              <div className="text-slate-500 text-sm mb-4">
                This parent has no registered students.
              </div>
            ) : (
              <select
                className="w-full border border-slate-300 dark:border-slate-700 p-2 rounded-lg dark:bg-slate-800 text-sm mb-4"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {familyStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.email}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setAssignItem(null);
                  setSelectedStudentId("");
                }}
                className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-700 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  if (!selectedStudentId) {
                    alert("Select a student");
                    return;
                  }

                  try {
                    const res = await fetch(`${API}/api/admin/orders/assign`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        orderItemId: assignItem.id,
                        studentId: selectedStudentId,
                      }),
                    });

                    const json = await res.json();

                    if (!json.success) {
                      alert(json.message || "Assignment failed");
                      return;
                    }

                    const changing =
                      assignItem.student &&
                      assignItem.student.id !== selectedStudentId;

                    if (changing) {
                      setReassignedItems((prev) =>
                        prev.includes(assignItem.id)
                          ? prev
                          : [...prev, assignItem.id]
                      );
                    }

                    await loadOrder(order.id);

                    alert("Assignment saved");
                  } catch (err) {
                    alert("Failed to assign student: " + err.message);
                  } finally {
                    setAssignItem(null);
                    setSelectedStudentId("");
                  }
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
              >
                {assignItem.student ? "Reassign" : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
