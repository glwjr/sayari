"use client";

import ErrorFeedback from "@/components/common/error-feedback";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <main>
      <ErrorFeedback error={error.message} />
    </main>
  );
}
