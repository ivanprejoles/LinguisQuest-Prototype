"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";

import {
  Search,
  Users,
  UserPlus,
  Zap,
  BookOpen,
  Library,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  TrendingUp,
  CalendarDays,
} from "lucide-react";

import { PageShell } from "@/components/global/admin/foundation/page-shell";

type UserItem = {
  id: string;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  foundationExp: number;
  storyWinCount: number;
};

type UsersResponse = {
  stats: {
    totalUsers: number;
    newUsers: number;
    totalXp: number;
    foundationRecords: number;
    storyWins: number;
  };
  users: UserItem[];
};

const PAGE_SIZE = 20;

const formatNumber = (value: number) =>
  new Intl.NumberFormat().format(value);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

async function fetchUsers(): Promise<UsersResponse> {
  const response = await fetch("/api/admin/users", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load users");
  }

  return response.json();
}

export default function UsersPage() {
  const params = useParams<{ adminId: string }>();
  const adminId = params.adminId;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");

  const {
    data,
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchUsers,
    staleTime: 30_000,
  });

  const stats = data?.stats;

  // Search users locally
  const filteredUsers = useMemo(() => {
        const users = data?.users ?? [];
        const normalizedSearch = search.trim().toLowerCase();

        if (!normalizedSearch) {
        return users;
        }

        return users.filter((user) =>
        (user.name ?? "Unnamed user")
            .toLowerCase()
            .includes(normalizedSearch)
        );
    }, [data?.users, search]);

    // Sort users locally
    const sortedUsers = useMemo(() => {
        const users = [...filteredUsers];

        switch (sort) {
            case "oldest":
            return users.sort(
                (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
            );

            case "xp":
            return users.sort(
                (a, b) => b.foundationExp - a.foundationExp
            );

            case "wins":
            return users.sort(
                (a, b) => b.storyWinCount - a.storyWinCount
            );

            case "name":
            return users.sort((a, b) =>
                (a.name ?? "").localeCompare(b.name ?? "")
            );

            case "newest":
            default:
            return users.sort(
                (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            );
        }
    }, [filteredUsers, sort]);

  // Paginate users locally
  const totalPages = Math.max(
    1,
    Math.ceil(sortedUsers.length / PAGE_SIZE)
  );

  const paginatedUsers = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;

    return sortedUsers.slice(
      startIndex,
      startIndex + PAGE_SIZE
    );
  }, [sortedUsers, page]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    setPage(1);
  };

  const statCards = [
    {
      label: "Total users",
      value: stats?.totalUsers,
      icon: Users,
      description: "Registered accounts",
    },
    {
      label: "New this week",
      value: stats?.newUsers,
      icon: UserPlus,
      description: "Joined in the last 7 days",
    },
    {
      label: "Total XP earned",
      value: stats?.totalXp,
      icon: Zap,
      description: "Across all users",
    },
    {
        label: "Foundation records",
        value: stats?.foundationRecords,
        icon: BookOpen,
        description: "Recorded stage progress",
    },
    {
        label: "Story wins",
        value: stats?.storyWins,
        icon: Library,
        description: "Total wins across story sessions",
    },
  ];

  return (
    <PageShell className="h-full min-h-0 overflow-y-auto">
      <div className="mx-auto w-full max-w-screen-2xl min-w-0 space-y-6 p-4 text-gray-900 sm:p-6 lg:p-8 dark:text-white">
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-cyan-600 dark:text-cyan-400">
            <Users className="h-4 w-4" />
            Administration
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Users
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Monitor registered users and their learning activity.
          </p>
        </header>

        {/* Statistics */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map(
            ({ label, value, icon: Icon, description }) => (
              <div
                key={label}
                className="rounded-2xl border border-gray-200 bg-white p-5 text-gray-900 shadow-sm transition-colors dark:border-white/10 dark:bg-card dark:text-white"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-400">
                    <Icon className="h-5 w-5" />
                  </div>

                  <TrendingUp className="h-4 w-4 text-cyan-500/60 dark:text-cyan-400/50" />
                </div>

                <p className="text-2xl font-bold tabular-nums">
                  {value === undefined
                    ? "—"
                    : formatNumber(value)}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-800 dark:text-gray-200">
                  {label}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              </div>
            )
          )}
        </section>

        {/* User List */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                All users
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Search and manage the user list.
              </p>
            </div>

            {data && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {formatNumber(filteredUsers.length)} users found
              </div>
            )}
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

              <input
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search users by name..."
                className="h-11 w-full rounded-xl border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus-visible:border-cyan-500 focus-visible:ring-2 focus-visible:ring-cyan-500/20 dark:border-white/10 dark:bg-background dark:text-white dark:placeholder:text-gray-500"
              />
            </div>

            <div className="relative sm:w-48">
              <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

              <select
                value={sort}
                onChange={(event) => handleSortChange(event.target.value)}
                >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="xp">Highest Foundation EXP</option>
                <option value="wins">Most Story Wins</option>
                <option value="name">Name A–Z</option>
            </select>
            </div>
          </div>

          {/* User Directory */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-sm dark:border-white/10 dark:bg-card dark:text-white">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-white/10">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                User directory
              </h3>
            </div>

            {/* PageShell handles scrolling */}
            <div>
              {isPending ? (
                <div className="p-12 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading users...
                </div>
              ) : isError ? (
                <div className="p-12 text-center text-sm text-red-600 dark:text-red-400">
                  {error instanceof Error
                    ? error.message
                    : "Unable to load users."}
                </div>
              ) : paginatedUsers.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-white/[0.06]">
                  {paginatedUsers.map((user) => (
                    <Link
                      key={user.id}
                      href={`/admin-portal/${adminId}/accounts/${user.id}`}
                      className="flex flex-col gap-4 px-5 py-4 text-gray-900 transition-colors hover:bg-cyan-50/70 focus-visible:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-cyan-500 dark:text-white dark:hover:bg-cyan-400/[0.04] dark:focus-visible:bg-cyan-400/10 sm:flex-row sm:items-center sm:justify-between"
                    >
                      {/* User Identity */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cyan-50 dark:bg-cyan-400/10">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-semibold text-cyan-600 dark:text-cyan-400">
                              {(user.name?.[0] ?? "?").toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900 dark:text-white">
                            {user.name || "Unnamed user"}
                          </p>

                          <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <CalendarDays className="h-3 w-3" />
                            Joined {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* User Statistics */}
                        <div className="grid grid-cols-2 gap-4 sm:min-w-[300px]">
                        <div>
                            <p className="font-semibold tabular-nums text-gray-900 dark:text-white">
                            {formatNumber(user.foundationExp)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                            Foundation EXP
                            </p>
                        </div>

                        <div>
                            <p className="font-semibold tabular-nums text-gray-900 dark:text-white">
                            {formatNumber(user.storyWinCount)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                            Story Wins
                            </p>
                        </div>
                        </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <Users className="mx-auto mb-3 h-8 w-8 text-cyan-500/50" />

                  <p className="font-medium text-gray-900 dark:text-white">
                    No users found
                  </p>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Try changing your search.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data && totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-400"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((current) =>
                        Math.min(totalPages, current + 1)
                      )
                    }
                    className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:text-gray-300 dark:hover:border-cyan-400/30 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-400"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </PageShell>
  );
}