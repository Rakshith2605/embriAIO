"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, X, Loader2, User } from "lucide-react";

interface AccessRequest {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  reviewed_at: string | null;
  requester: { name: string | null; image: string | null; email: string } | null;
}

interface Props {
  courseId: string;
  pendingCount: number;
}

export function CourseNotifications({ courseId, pendingCount: initialCount }: Props) {
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [acting, setActing] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(initialCount);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/access/requests`);
      if (res.ok) {
        const data: AccessRequest[] = await res.json();
        setRequests(data);
        setPendingCount(data.filter((r) => r.status === "pending").length);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  function handleToggle() {
    if (!open) fetchRequests();
    setOpen(!open);
  }

  async function handleAction(requestId: string, action: "approve" | "deny") {
    setActing(requestId);
    try {
      const res = await fetch(`/api/courses/${courseId}/access/requests`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === requestId
              ? { ...r, status: action === "approve" ? "approved" : "denied", reviewed_at: new Date().toISOString() }
              : r
          )
        );
        setPendingCount((c) => Math.max(0, c - 1));
      }
    } catch {
      // silent
    } finally {
      setActing(null);
    }
  }

  return (
    <div ref={panelRef} className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={handleToggle}
        className="relative p-2 transition-colors hover:bg-[#EDE8D5]"
        style={{ border: "1px solid #C8B882", color: "#5C4E35" }}
        title="Access requests"
      >
        <Bell className="h-4 w-4" />
        {pendingCount > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full font-jetbrains text-[9px] font-bold"
            style={{ background: "#C0392B", color: "#FFFDF5" }}
          >
            {pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-[340px] shadow-lg"
          style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
        >
          {/* Header */}
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ borderBottom: "1px solid #C8B882" }}
          >
            <span className="font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: "#C0392B" }}>
              Access Requests
            </span>
            {pendingCount > 0 && (
              <span
                className="font-jetbrains text-[9px] px-1.5 py-0.5 rounded-full"
                style={{ background: "#FEE2E2", color: "#991B1B" }}
              >
                {pendingCount} pending
              </span>
            )}
          </div>

          {/* Content */}
          <div className="max-h-[320px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#C8B882" }} />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bell className="h-6 w-6 mx-auto mb-2" style={{ color: "#C8B882" }} />
                <p className="font-source-serif text-[13px]" style={{ color: "#8B7355" }}>
                  No access requests yet
                </p>
              </div>
            ) : (
              <div>
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="px-4 py-3"
                    style={{
                      borderBottom: "1px solid #EDE8D5",
                      background: req.status === "pending" ? "#FFFDF5" : "#F7F2E7",
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      {req.requester?.image ? (
                        <img
                          src={req.requester.image}
                          alt=""
                          className="w-7 h-7 rounded-full shrink-0 mt-0.5"
                        />
                      ) : (
                        <div
                          className="w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center"
                          style={{ background: "#EDE8D5" }}
                        >
                          <User className="h-3.5 w-3.5" style={{ color: "#8B7355" }} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="font-source-serif text-[13px] font-medium" style={{ color: "#1C1610" }}>
                          {req.requester?.name ?? req.requester?.email ?? "Unknown user"}
                        </p>
                        <p className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                          {new Date(req.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {req.message && (
                          <p className="font-source-serif text-[12px] mt-1 line-clamp-2" style={{ color: "#5C4E35" }}>
                            {req.message}
                          </p>
                        )}

                        {/* Actions / Status */}
                        {req.status === "pending" ? (
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              disabled={acting === req.id}
                              onClick={() => handleAction(req.id, "approve")}
                              className="flex items-center gap-1 px-2.5 py-1 font-jetbrains text-[9px] uppercase tracking-wider transition-colors hover:opacity-80 disabled:opacity-50"
                              style={{ background: "#059669", color: "#FFFDF5" }}
                            >
                              {acting === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={acting === req.id}
                              onClick={() => handleAction(req.id, "deny")}
                              className="flex items-center gap-1 px-2.5 py-1 font-jetbrains text-[9px] uppercase tracking-wider transition-colors hover:opacity-80 disabled:opacity-50"
                              style={{ background: "#C0392B", color: "#FFFDF5" }}
                            >
                              {acting === req.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 font-jetbrains text-[8px] uppercase tracking-wider"
                            style={{
                              background: req.status === "approved" ? "#E8F5E9" : "#FEE2E2",
                              color: req.status === "approved" ? "#2E7D32" : "#991B1B",
                              border: `1px solid ${req.status === "approved" ? "#C8E6C9" : "#FECACA"}`,
                            }}
                          >
                            {req.status === "approved" ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {req.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
