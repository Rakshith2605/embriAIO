"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Users,
  Award,
  Calendar,
  Loader2,
  User,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  Key,
  Copy,
  Check,
  Plus,
  Trash2,
  ExternalLink,
  Terminal,
} from "lucide-react";

interface ProfileData {
  profile: {
    id: string;
    name: string | null;
    image: string | null;
    joined: string;
  };
  isOwner: boolean;
  stats: {
    coursesCreated: number;
    coursesSubscribed: number;
    coursesCompleted: number;
  };
  createdCourses: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    accent_color: string;
    status: string;
    visibility: string;
    published_at: string | null;
    subscribers: number;
  }>;
  subscribedCourses: Array<{
    id: string;
    slug: string;
    title: string;
    description: string | null;
    accent_color: string;
    author: { id: string; name: string | null; image: string | null };
    subscribed_at: string;
  }>;
  completedCourses: Array<{
    courseId: string;
    slug: string;
    title: string;
    accent_color: string;
    completed_at: string;
    author: { id: string; name: string | null; image: string | null };
  }>;
}

interface TokenData {
  id: string;
  name: string;
  token_prefix: string;
  last_used_at: string | null;
  expires_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

type Tab = "created" | "subscribed" | "completed";

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.profileId as string;

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("created");
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [creatingToken, setCreatingToken] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`/api/profile/${profileId}`);
      if (!res.ok) throw new Error("Profile not found");
      const json = await res.json();
      setData(json);
      // Default to the tab with most content
      if (json.createdCourses.length > 0) setActiveTab("created");
      else if (json.subscribedCourses.length > 0) setActiveTab("subscribed");
      else setActiveTab("completed");
    } catch {
      setError("Profile not found");
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch("/api/tokens");
      if (res.ok) {
        const json = await res.json();
        setTokens(json.filter((t: TokenData) => !t.revoked_at));
      }
    } catch { /* silent */ }
  }, []);

  const createToken = async () => {
    setCreatingToken(true);
    try {
      const res = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: tokenName || "Claude MCP" }),
      });
      if (res.ok) {
        const json = await res.json();
        setNewToken(json.token);
        setTokenName("");
        fetchTokens();
      }
    } catch { /* silent */ }
    setCreatingToken(false);
  };

  const revokeToken = async (id: string) => {
    await fetch("/api/tokens", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchTokens();
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#C8B882" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-32">
        <User className="h-12 w-12 mx-auto mb-4" style={{ color: "#C8B882" }} />
        <p className="font-playfair font-bold text-[20px] mb-2" style={{ color: "#1C1610" }}>
          Profile not found
        </p>
        <Link href="/home" className="font-jetbrains text-[11px] uppercase tracking-wider" style={{ color: "#C0392B" }}>
          ← Back to home
        </Link>
      </div>
    );
  }

  const { profile, stats, createdCourses, subscribedCourses, completedCourses, isOwner } = data;
  const displayedCompleted = completedExpanded ? completedCourses : completedCourses.slice(0, 3);

  const tabs: { key: Tab; label: string; count: number; icon: typeof BookOpen }[] = [
    { key: "created", label: "Created", count: stats.coursesCreated, icon: BookOpen },
    { key: "subscribed", label: "Enrolled", count: stats.coursesSubscribed, icon: Users },
    { key: "completed", label: "Completed", count: stats.coursesCompleted, icon: Award },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Profile Header (Instagram-style) ─────────── */}
      <div className="flex items-start gap-8 mb-10">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.image ? (
            <img
              src={profile.image}
              alt={profile.name ?? ""}
              className="w-[120px] h-[120px] rounded-full object-cover"
              style={{ border: "3px solid #C8B882" }}
            />
          ) : (
            <div
              className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
              style={{ background: "#EDE8D5", border: "3px solid #C8B882" }}
            >
              <User className="h-12 w-12" style={{ color: "#8B7355" }} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-2">
          <h1 className="font-playfair font-bold text-[28px] mb-1 truncate" style={{ color: "#1C1610" }}>
            {profile.name ?? "Anonymous"}
          </h1>

          <div className="flex items-center gap-2 mb-5">
            <Calendar className="h-3.5 w-3.5" style={{ color: "#8B7355" }} />
            <span className="font-jetbrains text-[10px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
              Joined {new Date(profile.joined).toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </span>
            {isOwner && (
              <span
                className="ml-2 px-2 py-0.5 font-jetbrains text-[8px] uppercase tracking-wider"
                style={{ background: "#EDE8D5", color: "#5C4E35", border: "1px solid #C8B882" }}
              >
                You
              </span>
            )}
          </div>

          {/* Stat counters — Instagram-style row */}
          <div className="flex gap-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className="text-center group"
              >
                <span
                  className="block font-playfair font-bold text-[22px]"
                  style={{ color: activeTab === t.key ? "#C0392B" : "#1C1610" }}
                >
                  {t.count}
                </span>
                <span
                  className="font-jetbrains text-[9px] uppercase tracking-wider"
                  style={{ color: activeTab === t.key ? "#C0392B" : "#8B7355" }}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Underline ─────────────────────────────── */}
      <div className="flex mb-6" style={{ borderBottom: "1px solid #C8B882" }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className="flex items-center gap-2 px-6 py-3 font-jetbrains text-[10px] uppercase tracking-wider transition-colors"
            style={{
              color: activeTab === t.key ? "#C0392B" : "#8B7355",
              borderBottom: activeTab === t.key ? "2px solid #C0392B" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Claude MCP Connect (owner only) ──────────── */}
      {isOwner && (
        <div className="mb-6">
          <button
            type="button"
            onClick={() => {
              setShowConnect(!showConnect);
              if (!showConnect) fetchTokens();
            }}
            className="flex items-center gap-2 w-full px-4 py-3 font-jetbrains text-[10px] uppercase tracking-wider transition-colors hover:bg-[#F7F2E7]"
            style={{ background: "#FFFDF5", border: "1px solid #C8B882", color: "#5C4E35" }}
          >
            <Terminal className="h-3.5 w-3.5" style={{ color: "#C0392B" }} />
            Claude MCP Connect
            <span className="ml-auto">
              {showConnect ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
          </button>

          {showConnect && (
            <div
              className="p-5 space-y-5"
              style={{ background: "#FFFDF5", border: "1px solid #C8B882", borderTop: "none" }}
            >
              {/* Step 1: Server URL */}
              <div>
                <h3 className="font-playfair font-bold text-[14px] mb-2" style={{ color: "#1C1610" }}>
                  1. MCP Server URL
                </h3>
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{ background: "#F5F0E1", border: "1px solid #D4C9A8" }}
                >
                  <code className="font-jetbrains text-[11px] flex-1 select-all" style={{ color: "#1C1610" }}>
                    https://www.emraio.com/api/mcp
                  </code>
                  <button
                    type="button"
                    onClick={() => copyText("https://www.emraio.com/api/mcp", "url")}
                    className="shrink-0 p-1 transition-colors hover:bg-[#EDE8D5] rounded"
                  >
                    {copied === "url" ? (
                      <Check className="h-3.5 w-3.5" style={{ color: "#27AE60" }} />
                    ) : (
                      <Copy className="h-3.5 w-3.5" style={{ color: "#8B7355" }} />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2: Generate PAT */}
              <div>
                <h3 className="font-playfair font-bold text-[14px] mb-2" style={{ color: "#1C1610" }}>
                  2. Personal Access Token
                </h3>
                <p className="font-source-serif text-[12px] mb-3" style={{ color: "#5C4E35" }}>
                  Create a token to authenticate your MCP connection. Copy it immediately — it won&#39;t be shown again.
                </p>

                {/* New token display */}
                {newToken && (
                  <div
                    className="flex items-center gap-2 px-3 py-2 mb-3"
                    style={{ background: "#E8F5E9", border: "1px solid #81C784" }}
                  >
                    <Key className="h-3.5 w-3.5 shrink-0" style={{ color: "#27AE60" }} />
                    <code className="font-jetbrains text-[10px] flex-1 break-all select-all" style={{ color: "#1C1610" }}>
                      {newToken}
                    </code>
                    <button
                      type="button"
                      onClick={() => copyText(newToken, "newtoken")}
                      className="shrink-0 p-1 transition-colors hover:bg-[#C8E6C9] rounded"
                    >
                      {copied === "newtoken" ? (
                        <Check className="h-3.5 w-3.5" style={{ color: "#27AE60" }} />
                      ) : (
                        <Copy className="h-3.5 w-3.5" style={{ color: "#2E7D32" }} />
                      )}
                    </button>
                  </div>
                )}

                {/* Create token form */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Token name (optional)"
                    className="flex-1 px-3 py-2 font-jetbrains text-[11px] outline-none"
                    style={{ background: "#F5F0E1", border: "1px solid #D4C9A8", color: "#1C1610" }}
                  />
                  <button
                    type="button"
                    onClick={createToken}
                    disabled={creatingToken}
                    className="flex items-center gap-1.5 px-3 py-2 font-jetbrains text-[10px] uppercase tracking-wider transition-colors hover:opacity-90 disabled:opacity-50"
                    style={{ background: "#C0392B", color: "#FFFDF5" }}
                  >
                    {creatingToken ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="h-3 w-3" />
                    )}
                    Generate
                  </button>
                </div>

                {/* Existing tokens */}
                {tokens.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {tokens.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-3 px-3 py-2"
                        style={{ background: "#FAF8F0", border: "1px solid #E8E0CC" }}
                      >
                        <Key className="h-3 w-3 shrink-0" style={{ color: "#C8B882" }} />
                        <span className="font-jetbrains text-[10px] flex-1 truncate" style={{ color: "#5C4E35" }}>
                          {t.name} <span style={{ color: "#A08E6B" }}>({t.token_prefix}...)</span>
                        </span>
                        {t.last_used_at && (
                          <span className="font-jetbrains text-[9px] shrink-0" style={{ color: "#A08E6B" }}>
                            Used {new Date(t.last_used_at).toLocaleDateString()}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => revokeToken(t.id)}
                          className="shrink-0 p-1 transition-colors hover:bg-[#FDE8E8] rounded"
                          title="Revoke token"
                        >
                          <Trash2 className="h-3 w-3" style={{ color: "#C0392B" }} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 3: Connect in Claude */}
              <div>
                <h3 className="font-playfair font-bold text-[14px] mb-2" style={{ color: "#1C1610" }}>
                  3. Connect in Claude
                </h3>
                <ol className="space-y-2 font-source-serif text-[12px]" style={{ color: "#5C4E35" }}>
                  <li className="flex gap-2">
                    <span className="font-jetbrains text-[10px] shrink-0 mt-0.5" style={{ color: "#C0392B" }}>a.</span>
                    Open <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 underline" style={{ color: "#C0392B" }}>claude.ai <ExternalLink className="h-2.5 w-2.5 inline" /></a> → Settings → Integrations
                  </li>
                  <li className="flex gap-2">
                    <span className="font-jetbrains text-[10px] shrink-0 mt-0.5" style={{ color: "#C0392B" }}>b.</span>
                    Click <strong>Add custom MCP</strong> and paste the server URL above
                  </li>
                  <li className="flex gap-2">
                    <span className="font-jetbrains text-[10px] shrink-0 mt-0.5" style={{ color: "#C0392B" }}>c.</span>
                    When prompted, paste your Personal Access Token to authorize
                  </li>
                  <li className="flex gap-2">
                    <span className="font-jetbrains text-[10px] shrink-0 mt-0.5" style={{ color: "#C0392B" }}>d.</span>
                    You can now ask Claude to create courses, add resources, search YouTube, and find papers
                  </li>
                </ol>
              </div>

              {/* Available tools */}
              <div>
                <h3 className="font-playfair font-bold text-[14px] mb-2" style={{ color: "#1C1610" }}>
                  Available Tools
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: "create_course", desc: "Create a new learning course" },
                    { name: "list_courses", desc: "List your courses" },
                    { name: "get_course", desc: "Get course details" },
                    { name: "add_resource", desc: "Add video/paper/notebook" },
                    { name: "update_progress", desc: "Mark resource complete" },
                    { name: "search_youtube", desc: "Find YouTube videos" },
                    { name: "suggest_papers", desc: "Find research papers" },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="px-3 py-2"
                      style={{ background: "#FAF8F0", border: "1px solid #E8E0CC" }}
                    >
                      <code className="font-jetbrains text-[10px] block" style={{ color: "#C0392B" }}>
                        {tool.name}
                      </code>
                      <span className="font-source-serif text-[11px]" style={{ color: "#5C4E35" }}>
                        {tool.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content ───────────────────────────────── */}

      {/* Created Courses */}
      {activeTab === "created" && (
        <div>
          {createdCourses.length === 0 ? (
            <EmptyState icon={BookOpen} message="No courses created yet" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {createdCourses.map((course) => (
                <Link
                  key={course.id}
                  href={course.status === "published" ? `/course/${course.slug}` : isOwner ? `/create/${course.id}` : "#"}
                  className="group block p-4 transition-colors hover:bg-[#F7F2E7]"
                  style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
                >
                  {/* Accent bar */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-8 h-1 rounded-full"
                      style={{ background: accentToColor(course.accent_color) }}
                    />
                    {course.visibility === "restricted" && (
                      <Shield className="h-3 w-3" style={{ color: "#CA8A04" }} />
                    )}
                    {course.visibility === "private" && (
                      <Lock className="h-3 w-3" style={{ color: "#C0392B" }} />
                    )}
                    {isOwner && course.status === "draft" && (
                      <span
                        className="px-1.5 py-0.5 font-jetbrains text-[7px] uppercase tracking-wider"
                        style={{ background: "#FFF8E7", color: "#B8860B", border: "1px solid #E6D9A8" }}
                      >
                        Draft
                      </span>
                    )}
                  </div>

                  <h3
                    className="font-playfair font-bold text-[15px] mb-1 line-clamp-2 group-hover:text-[#C0392B] transition-colors"
                    style={{ color: "#1C1610" }}
                  >
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="font-source-serif text-[12px] line-clamp-2 mb-3" style={{ color: "#5C4E35" }}>
                      {course.description}
                    </p>
                  )}

                  {/* Subscriber count */}
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3 w-3" style={{ color: "#8B7355" }} />
                    <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                      {course.subscribers} subscriber{course.subscribers !== 1 ? "s" : ""}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subscribed Courses */}
      {activeTab === "subscribed" && (
        <div>
          {subscribedCourses.length === 0 ? (
            <EmptyState icon={Users} message="Not enrolled in any courses yet" />
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {subscribedCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/course/${course.slug}`}
                  className="group block p-4 transition-colors hover:bg-[#F7F2E7]"
                  style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
                >
                  <div
                    className="w-8 h-1 rounded-full mb-3"
                    style={{ background: accentToColor(course.accent_color) }}
                  />
                  <h3
                    className="font-playfair font-bold text-[15px] mb-1 line-clamp-2 group-hover:text-[#C0392B] transition-colors"
                    style={{ color: "#1C1610" }}
                  >
                    {course.title}
                  </h3>
                  {course.description && (
                    <p className="font-source-serif text-[12px] line-clamp-2 mb-3" style={{ color: "#5C4E35" }}>
                      {course.description}
                    </p>
                  )}

                  {/* Author */}
                  <div className="flex items-center gap-2">
                    {course.author?.image ? (
                      <img src={course.author.image} alt="" className="w-4 h-4 rounded-full" />
                    ) : (
                      <div className="w-4 h-4 rounded-full" style={{ background: "#EDE8D5" }} />
                    )}
                    <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                      {course.author?.name ?? "Unknown"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Completed Courses */}
      {activeTab === "completed" && (
        <div>
          {completedCourses.length === 0 ? (
            <EmptyState icon={Award} message="No courses completed yet" />
          ) : (
            <>
              <div className="space-y-3">
                {displayedCompleted.map((course) => (
                  <Link
                    key={course.courseId}
                    href={`/course/${course.slug}`}
                    className="group flex items-center gap-4 p-4 transition-colors hover:bg-[#F7F2E7]"
                    style={{ background: "#FFFDF5", border: "1px solid #C8B882" }}
                  >
                    {/* Completion badge */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "#E8F5E9", border: "2px solid #27AE60" }}
                    >
                      <Award className="h-5 w-5" style={{ color: "#27AE60" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-playfair font-bold text-[15px] truncate group-hover:text-[#C0392B] transition-colors"
                        style={{ color: "#1C1610" }}
                      >
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        {course.author?.image ? (
                          <img src={course.author.image} alt="" className="w-3.5 h-3.5 rounded-full" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full" style={{ background: "#EDE8D5" }} />
                        )}
                        <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#8B7355" }}>
                          {course.author?.name ?? "Unknown"}
                        </span>
                        <span className="font-jetbrains text-[9px] uppercase tracking-wider" style={{ color: "#A08E6B" }}>
                          Completed {new Date(course.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Accent dot */}
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ background: accentToColor(course.accent_color) }}
                    />
                  </Link>
                ))}
              </div>

              {/* Show more / less toggle */}
              {completedCourses.length > 3 && (
                <button
                  type="button"
                  onClick={() => setCompletedExpanded(!completedExpanded)}
                  className="flex items-center gap-2 mx-auto mt-4 px-4 py-2 font-jetbrains text-[10px] uppercase tracking-wider transition-colors hover:bg-[#EDE8D5]"
                  style={{ color: "#C0392B", border: "1px solid #C8B882" }}
                >
                  {completedExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" />
                      See all {completedCourses.length} completed
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof BookOpen; message: string }) {
  return (
    <div
      className="text-center py-16"
      style={{ background: "#FFFDF5", border: "1px dashed #C8B882" }}
    >
      <Icon className="h-8 w-8 mx-auto mb-3" style={{ color: "#C8B882" }} />
      <p className="font-source-serif text-[14px]" style={{ color: "#8B7355" }}>
        {message}
      </p>
    </div>
  );
}

function accentToColor(accent: string): string {
  const map: Record<string, string> = {
    violet: "#8B5CF6",
    blue: "#3B82F6",
    orange: "#F97316",
    emerald: "#10B981",
    cyan: "#06B6D4",
    pink: "#EC4899",
    yellow: "#EAB308",
    red: "#EF4444",
    indigo: "#6366F1",
    teal: "#14B8A6",
  };
  return map[accent] ?? "#C0392B";
}
