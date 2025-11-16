"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

  // Read values from URL
  const page = Number(searchParams.get("page") || "1");
  const pageSize = Number(searchParams.get("pageSize") || "10");
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  // Helper to update query string
  const updateQuery = (updates) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    // Whenever filters change, reset to page 1 unless page explicitly provided
    if (!("page" in updates)) {
      params.set("page", "1");
    }

    router.push(`/admin/orders?${params.toString()}`);
  };

  // Fetch data whenever URL query changes
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
              // Make sure your adminAuth middleware checks this correctly
              // or uses cookies/session instead
              Authorization: "Bearer bba_admin_token",
            },
          }
        );

        if (!res.ok) {
          throw new Error("Failed to load orders");
        }

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
  }, [searchParams]);

  const handleSearchChange = (e) => {
    updateQuery({ search: e.target.value });
  };

  const handleStatusChange = (e) => {
    updateQuery({ status: e.target.value });
  };

  const handleDateFromChange = (e) => {
    updateQuery({ dateFrom: e.target.value });
  };

  const handleDateToChange = (e) => {
    updateQuery({ dateTo: e.target.value });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    if (value === "date_desc") {
      updateQuery({ sortBy: "createdAt", sortOrder: "desc" });
    } else if (value === "date_asc") {
      updateQuery({ sortBy: "createdAt", sortOrder: "asc" });
    } else if (value === "amount_desc") {
      updateQuery({ sortBy: "amount", sortOrder: "desc" });
    } else if (value === "amount_asc") {
      updateQuery({ sortBy: "amount", sortOrder: "asc" });
    }
  };

  const handlePageChange = (newPage) => {
    if (!pagination) return;
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateQuery({ page: newPage });
  };

  const handlePageSizeChange = (e) => {
    updateQuery({ pageSize: e.target.value, page: 1 });
  };

  const currentSortValue =
    sortBy === "amount"
      ? `amount_${sortOrder}`
      : `date_${sortOrder}`;

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
              View and manage all parent orders, payments, and statuses.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Search (txRef, parent email/name, order ID)
              </label>
              <input
                type="text"
                placeholder="e.g. john@example.com or BBA-1234"
                value={search}
                onChange={handleSearchChange}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={handleStatusChange}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Date from */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Date from
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Date to
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Sort + page size */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Sort by
                </label>
                <select
                  value={currentSortValue}
                  onChange={handleSortChange}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="date_desc">Newest first</option>
                  <option value="date_asc">Oldest first</option>
                  <option value="amount_desc">Amount (high → low)</option>
                  <option value="amount_asc">Amount (low → high)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Rows per page
              </span>
              <select
                value={pageSize}
                onChange={handlePageSizeChange}
                className="px-2 py-1 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              Loading orders...
            </div>
          ) : error ? (
            <div className="p-6 text-sm text-red-500">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-sm text-slate-500 dark:text-slate-400">
              No orders found for the current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Order / Tx Ref
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Parent
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-xs text-slate-600 dark:text-slate-300">
                      Items
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const latestPayment =
                      order.payments && order.payments.length > 0
                        ? order.payments[0]
                        : null;

                    const amount =
                      order.totalAmount ??
                      latestPayment?.amount ??
                      0;
                    const currency =
                      order.currency ??
                      latestPayment?.currency ??
                      "UGX";

                    return (
                      <tr
                        key={order.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <td className="px-4 py-3 align-top whitespace-nowrap text-xs text-slate-600 dark:text-slate-300">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "-"}
                        </td>
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-mono text-slate-800 dark:text-slate-100">
                            #{order.id}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {order.txRef || latestPayment?.txRef || "-"}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-medium text-slate-800 dark:text-slate-100">
                            {order.parent?.name || "Unknown parent"}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {order.parent?.email}
                          </div>
                          <div className="text-slate-400 dark:text-slate-500">
                            {order.parent?.city && order.parent?.country
                              ? `${order.parent.city}, ${order.parent.country}`
                              : order.parent?.country || ""}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-xs">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {currency}{" "}
                            {Number(amount).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top text-xs">
                          {latestPayment ? (
                            <>
                              <div className="text-slate-800 dark:text-slate-100">
                                {latestPayment.channel || "-"}
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
                        <td className="px-4 py-3 align-top text-xs">
                          <span
                            className={classNames(
                              "inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold",
                              order.status === "PAID"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                                : order.status === "PENDING"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
                                : order.status === "FAILED" ||
                                  order.status === "CANCELLED"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                            )}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-right text-xs">
                          <div className="text-slate-700 dark:text-slate-200">
                            {order.items?.length || 0} items
                          </div>
                          {/* Later we can add a "View" button that opens a detail drawer using GET /api/admin/orders/:id */}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination footer */}
        {pagination && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div>
              {pagination.total > 0 && (
                <span>
                  Showing{" "}
                  {(pagination.page - 1) * pagination.pageSize + 1}–{" "}
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.total
                  )}{" "}
                  of {pagination.total} orders
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={classNames(
                  "px-3 py-1 rounded-md border text-xs",
                  page <= 1
                    ? "border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className={classNames(
                  "px-3 py-1 rounded-md border text-xs",
                  page >= pagination.totalPages
                    ? "border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-600 cursor-not-allowed"
                    : "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
