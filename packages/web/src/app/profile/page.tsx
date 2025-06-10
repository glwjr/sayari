"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { LoadingProgress } from "@/components/common/loading-progress";
import Profile from "@/components/users/profile";
import ErrorFeedback from "@/components/common/error-feedback";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/auth";

interface ProfileState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const [state, setState] = useState<ProfileState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await apiClient.get<User>("/auth/profile");
        setState({
          user: response,
          loading: false,
          error: null,
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: "Failed to load profile data. Please try again.",
        });
      }
    };

    fetchUserProfile();
  }, []);

  if (state.loading) {
    return (
      <main>
        <LoadingProgress />
      </main>
    );
  }

  if (!state.user) {
    return (
      <main>
        <ErrorFeedback error="No profile data available." />
      </main>
    );
  }

  return (
    <main>
      <Profile user={state.user} />
    </main>
  );
}
