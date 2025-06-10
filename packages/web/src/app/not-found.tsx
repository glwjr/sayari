"use client";

import ErrorFeedback from "@/components/common/error-feedback";

export default function NotFound() {
  return (
    <main>
      <ErrorFeedback error={`Page not found :(`} />
    </main>
  );
}
