"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import OrderDetailsDrawer from "./OrderDetailsDrawer";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("bba_admin_token")
      : "";

  // Query params
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    if (!("page" in updates)) {
      params.set("page", "1");
    }

    router.push(`/admin/orders?${params.toString()}`);
  };

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const qs = searchParams.toString();

        const res = await fetch(
          `/api/admin/orders${qs ? `?${qs}` : ""}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to load orders");
        const data = await res.json();

        setOrders(data.orders || []);
        setPagination(data.pagination || null);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [searchParams, token]);

  const currentSortValue =
    sortBy === "amount"
      ? `amount_${sortOrder}`
      : `date_${sortOrder}`;

  // OPEN DRAWER
  const openDrawer = (orderId) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-indigo-800 dark:text-indigo-300">
              Orders
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              View and manage all parent orders, payments, statuses, and
              student assignments.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">
                Search (txRef, email, order ID)
              </label>
              <input
                type="text"
                placeholder="e.g. john@example.com"
                value={search}
                onChange={(e) => updateQuery({ search: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => updateQuery({ status: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              >
                <option value="ALL">All</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Date from */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">
                Date from
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => updateQuery({ dateFrom: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">
                Date to
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => updateQuery({ dateTo: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 mb-1">
                Sort by
              </label>
              <select
                value={currentSortValue}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "date_desc")
                    updateQuery({ sortBy: "createdAt", sortOrder: "desc" });
                  if (v === "date_asc")
                    updateQuery({ sortBy: "createdAt", sortOrder: "asc" });
                  if (v === "amount_desc")
                    updateQuery({ sortBy: "amount", sortOrder: "desc" });
                  if (v === "amount_asc")
                    updateQuery({ sortBy: "amount", sortOrder: "asc" });
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
              >
                <option value="date_desc">Newest first</option>
                <option value="date_asc">Oldest first</option>
                <option value="amount_desc">Amount high → low</option>
                <option value="amount_asc">Amount low → high</option>
              </select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs">Rows</span>
              <select
                value={pageSize}
                onChange={(e) =>
                  updateQuery({ pageSize: e.target.value, page: 1 })
                }
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-sm text-slate-500">Loading orders…</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs">Date</th>
                    <th className="px-4 py-3 text-left text-xs">
                      Order / Tx
                    </th>
                    <th className="px-4 py-3 text-left text-xs">Parent</th>
                    <th className="px-4 py-3 text-left text-xs">Amount</th>
                    <th className="px-4 py-3 text-left text-xs">Payment</th>
                    <th className="px-4 py-3 text-left text-xs">Status</th>
                    {/* NEW – Assignment Progress */}
                    <th className="px-4 py-3 text-left text-xs">
                      Assignments
                    </th>
                    <th className="px-4 py-3 text-right text-xs">Items</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const latestPayment = order.payments?.[0] || null;

                    const amount =
                      order.totalAmount ??
                      latestPayment?.amount ??
                      0;

                    const currency =
                      order.currency ??
                      latestPayment?.currency ??
                      "UGX";

                    // Assignment stats per order
                    const totalItems = order.items?.length || 0;
                    const assignedItems =
                      order.items?.filter((i) => i.student).length || 0;
                    const completion =
                      totalItems === 0
                        ? 100
                        : Math.round(
                            (assignedItems / totalItems) * 100
                          );

                    let assignmentBadgeClass =
                      "inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold ";
                    let assignmentBarClass =
                      "h-1.5 rounded-full ";
                    let assignmentLabel = "";

                    if (totalItems === 0) {
                      assignmentBadgeClass +=
                        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
                      assignmentBarClass +=
                        "bg-slate-300 dark:bg-slate-700";
                      assignmentLabel = "No items";
                    } else if (completion === 100) {
                      assignmentBadgeClass +=
                        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200";
                      assignmentBarClass +=
                        "bg-emerald-500 dark:bg-emerald-400";
                      assignmentLabel = "100% assigned";
                    } else if (completion === 0) {
                      assignmentBadgeClass +=
                        "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200";
                      assignmentBarClass +=
                        "bg-rose-500 dark:bg-rose-400";
                      assignmentLabel = "0% assigned";
                    } else {
                      assignmentBadgeClass +=
                        "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200";
                      assignmentBarClass +=
                        "bg-amber-500 dark:bg-amber-400";
                      assignmentLabel = `${assignedItems}/${totalItems} assigned`;
                    }

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                      >
                        {/* Date */}
                        <td className="px-4 py-3 align-top text-xs">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>

                        {/* Order ID & TxRef */}
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-mono text-slate-800 dark:text-slate-100">
                            #{order.id}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {order.txRef ||
                              order.flutterwaveTxRef ||
                              latestPayment?.txRef ||
                              "-"}
                          </div>
                        </td>

                        {/* Parent */}
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {order.parent?.name || order.parentName || "Unknown"}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {order.parent?.email || order.parentEmail}
                          </div>
                          <div className="text-slate-400 dark:text-slate-500">
                            {(order.parent?.city || order.city) &&
                            (order.parent?.country || order.country)
                              ? `${order.parent?.city || order.city}, ${
                                  order.parent?.country || order.country
                                }`
                              : order.parent?.country || order.country || ""}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {currency} {Number(amount).toLocaleString()}
                          </div>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3 align-top text-xs">
                          {latestPayment ? (
                            <>
                              <div className="text-slate-800 dark:text-slate-100">
                                {latestPayment.channel}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400">
                                {latestPayment.status}
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-500 dark:text-slate-400">
                              No payment record
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 align-top text-xs">
                          <span
                            className={classNames(
                              "px-2 py-1 rounded-full text-[11px] font-semibold",
                              order.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                : order.status === "PENDING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                                : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                            )}
                          >
                            {order.status}
                          </span>
                        </td>

                        {/* Assignments – automation summary */}
                        <td className="px-4 py-3 align-top text-xs min-w-[140px]">
                          <div className="mb-1">
                            <span className={assignmentBadgeClass}>
                              {assignmentLabel}
                            </span>
                          </div>
                          {totalItems > 0 && (
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={assignmentBarClass}
                                style={{ width: `${completion}%` }}
                              />
                            </div>
                          )}
                        </td>

                        {/* Items + VIEW BUTTON */}
                        <td className="px-4 py-3 align-top text-right text-xs">
                          <div className="text-slate-700 dark:text-slate-200">
                            {order.items?.length || 0} items
                          </div>

                          <button
                            onClick={() => openDrawer(order.id)}
                            className="mt-1 inline-flex items-center text-indigo-600 dark:text-indigo-300 hover:underline"
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="mt-4 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>
              Showing{" "}
              {(pagination.page - 1) * pagination.pageSize + 1}–{" "}
              {Math.min(
                pagination.page * pagination.pageSize,
                pagination.total
              )}{" "}
              of {pagination.total}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  updateQuery({ page: pagination.page - 1 })
                }
                disabled={pagination.page <= 1}
                className="px-3 py-1 border rounded disabled:opacity-40 border-slate-300 dark:border-slate-700"
              >
                Prev
              </button>

              <button
                onClick={() =>
                  updateQuery({ page: pagination.page + 1 })
                }
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40 border-slate-300 dark:border-slate-700"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ➤ ORDER DETAILS DRAWER */}
      <OrderDetailsDrawer
        open={drawerOpen}
        orderId={selectedOrderId}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
