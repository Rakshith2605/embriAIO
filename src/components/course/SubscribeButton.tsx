"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface SubscribeButtonProps {
  courseId: string;
  isOwner: boolean;
}

export function SubscribeButton({ courseId, isOwner }: SubscribeButtonProps) {
  const { data: session } = useSession();
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    const res = await fetch(`/api/courses/${courseId}/subscribe`);
    const data = await res.json();
    setSubscribed(data.subscribed);
    setLoading(false);
  }, [courseId]);

  useEffect(() => {
    if (session) checkSubscription();
    else setLoading(false);
  }, [session, checkSubscription]);

  const toggleSubscribe = async () => {
    setLoading(true);
    const method = subscribed ? "DELETE" : "POST";
    await fetch(`/api/courses/${courseId}/subscribe`, { method });
    setSubscribed(!subscribed);
    setLoading(false);
  };

  if (!session || isOwner) return null;

  return (
    <button
      onClick={toggleSubscribe}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 font-jetbrains text-[11px] uppercase tracking-wider transition-all disabled:opacity-50"
      style={{
        background: subscribed ? "transparent" : "#C0392B",
        color: subscribed ? "#C0392B" : "#FFFDF5",
        border: `1px solid ${subscribed ? "#C0392B" : "transparent"}`,
      }}
    >
      {loading ? "..." : subscribed ? "Unsubscribe" : "Subscribe"}
    </button>
  );
}
