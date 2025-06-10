"use client";

import { useEffect, useState } from "react";
import AdminPanelUserTable from "@/components/users/admin-panel-user-table";
import ProtectedRoute from "@/components/auth/protected-route";
import { LoadingProgress } from "@/components/common/loading-progress";
import ErrorFeedback from "@/components/common/error-feedback";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/auth";

export default function AdminHomePage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminHomeContent />
    </ProtectedRoute>
  );
}

function AdminHomeContent() {
  const [state, setState] = useState<{
    users: User[];
    isLoading: boolean;
    error: string | null;
  }>({
    users: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const users = await apiClient.get<User[]>("/users");
        setState({ users, isLoading: false, error: null });
      } catch (error) {
        setState({
          users: [],
          isLoading: false,
          error: (error as Error).message,
        });
      }
    }

    fetchData();
  }, []);

  if (state.isLoading) {
    return (
      <main>
        <LoadingProgress />
      </main>
    );
  }

  if (state.error) {
    return (
      <main>
        <ErrorFeedback error={state.error} />
      </main>
    );
  }

  return (
    <main>
      <AdminPanelUserTable users={state.users} />
    </main>
  );
}
