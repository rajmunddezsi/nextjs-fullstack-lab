"use client";

import { Role } from "@/generated/prisma/enums";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const TIMEOUT_IN_MS = 500;

type QueryType = "query" | "role" | "status";

export default function UserSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = params.get("query") || "";
  const role = params.get("role") || "";
  const status = params.get("status") || "";

  const searchFilters = useRef<{
    query: string;
    role: string;
    status: string;
  }>({
    query,
    role,
    status,
  });

  useEffect(() => {
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, []);

  const userSearch = () => {
    const nextParams = new URLSearchParams(params);
    const filters = searchFilters.current;

    if (filters.query) {
      nextParams.set("query", filters.query);
    } else {
      nextParams.delete("query");
    }

    if (filters.role) {
      nextParams.set("role", filters.role);
    } else {
      nextParams.delete("role");
    }

    if (filters.status) {
      nextParams.set("status", filters.status);
    } else {
      nextParams.delete("status");
    }

    const queryString = nextParams.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleSearch = (
    searchText: string,
    queryType: QueryType,
    timeout = 0,
  ) => {
    searchFilters.current[queryType] = searchText;

    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => userSearch(), timeout);
  };

  return (
    <div>
      <label htmlFor="search">Search users</label>
      <input
        type="text"
        name="search"
        id="search"
        defaultValue={query}
        onChange={(e) => handleSearch(e.target.value, "query", TIMEOUT_IN_MS)}
      />

      <label htmlFor="role">Search role</label>
      <select
        name="role"
        id="role"
        defaultValue={role}
        onChange={(e) => handleSearch(e.target.value, "role")}
      >
        <option value="">Select role</option>
        <option value={Role.ADMIN}>{Role.ADMIN}</option>
        <option value={Role.USER}>{Role.USER}</option>
      </select>

      <label htmlFor="status">Status</label>
      <select
        name="status"
        id="status"
        defaultValue={status}
        onChange={(e) => handleSearch(e.target.value, "status")}
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
