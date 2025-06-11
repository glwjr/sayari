"use client";

import { useState } from "react";
import { Switch } from "@headlessui/react";
import { apiClient } from "@/lib/api-client";
import { User } from "@/types/user";

interface ToggleProps {
  userId: string;
  initialValue?: boolean;
  onToggleComplete?: (newValue: boolean) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

export default function Toggle({
  userId,
  initialValue = false,
  onToggleComplete,
  onError,
  disabled,
}: ToggleProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (newValue: boolean) => {
    setEnabled(newValue);
    setIsLoading(true);

    try {
      const user = await apiClient.patch<User>(`/users/${userId}`, {
        isActive: newValue,
      });

      onToggleComplete?.(newValue);

      return user;
    } catch (error) {
      setEnabled(!newValue);

      const errorObj =
        error instanceof Error ? error : new Error("Unknown error occurred");
      onError?.(errorObj);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Switch
      checked={enabled}
      onChange={handleToggle}
      disabled={isLoading || disabled}
      className={`group relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:outline-hidden data-checked:bg-gray-800 ${
        isLoading || disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <span className="sr-only">Update user&apos;s active status</span>
      <span className="pointer-events-none relative inline-block size-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out group-data-checked:translate-x-5">
        {isLoading ? (
          <span className="absolute inset-0 flex size-full items-center justify-center">
            <svg
              className="size-3 animate-spin text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </span>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-200 ease-in group-data-checked:opacity-0 group-data-checked:duration-100 group-data-checked:ease-out"
            >
              <svg
                fill="none"
                viewBox="0 0 12 12"
                className="size-3 text-gray-400"
              >
                <path
                  d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              aria-hidden="true"
              className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-checked:opacity-100 group-data-checked:duration-200 group-data-checked:ease-in"
            >
              <svg
                fill="currentColor"
                viewBox="0 0 12 12"
                className="size-3 text-gray-800"
              >
                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
              </svg>
            </span>
          </>
        )}
      </span>
    </Switch>
  );
}
