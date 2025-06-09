"use client";

import { useEffect, useState } from "react";
import AdminPanelUserTable from "@/components/users/user-table";
import ProtectedRoute from "@/components/auth/protected-route";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/auth";
import { LoadingProgress } from "@/components/common/loading-progress";
import ErrorFeedback from "@/components/common/error-feedback";

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
    return <LoadingProgress />;
  }

  if (state.error) {
    return <ErrorFeedback error={state.error} />;
  }

  return (
    <>
      <AdminPanelUserTable users={state.users} />
    </>
  );
}
