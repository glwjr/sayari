"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import ErrorFeedback from "@/components/common/error-feedback";
import ProtectedRoute from "@/components/auth/protected-route";
import { apiClient } from "@/lib/api-client";
import { Post } from "@/types/post";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <ProtectedRoute>
      <EditPostPageContent params={params} />
    </ProtectedRoute>
  );
}

function EditPostPageContent({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user, clearError } = useAuth();
  const [state, setState] = useState<{
    post: Post | null;
    isLoading: boolean;
    error: string | null;
  }>({
    post: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const postId = (await params).id;
        const post = await apiClient.get<Post>(`/posts/${postId}`);

        setState({ post, isLoading: false, error: null });
      } catch (error) {
        setState({
          post: null,
          isLoading: false,
          error: (error as Error).message,
        });
      }
    }

    fetchPost();
  }, [params]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const data = new FormData(event.currentTarget);
      const body = {
        title: data.get("title"),
        content: data.get("content"),
        userId: user?.id,
      };

      const post = await apiClient.patch<Post>(
        `/posts/${(await params).id}`,
        body
      );

      router.push(`/posts/${post.id}`);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: (error as Error).message,
      }));
    }
  };

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.error, clearError]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-12">
        {state.error ? <ErrorFeedback error={state.error} /> : false}
        <div className="pb-6">
          <h2 className="text-base/7 font-semibold text-gray-900">Edit post</h2>

          <div className="mt-6 border-t border-gray-100 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="mt-6 sm:col-span-full">
              <label
                htmlFor="title"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Title<span className="text-red-500">*</span>
              </label>
              <div className="mt-2">
                <div className="flex items-center rounded-md bg-white pl-3 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-gray-800">
                  <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    defaultValue={state.post?.title || ""}
                    className="block min-w-0 grow py-1.5 pr-3 pl-1 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                  />
                </div>
              </div>
            </div>

            <div className="col-span-full">
              <label
                htmlFor="content"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Body text (optional)
              </label>
              <div className="mt-2">
                <textarea
                  id="content"
                  name="content"
                  rows={3}
                  defaultValue={state.post?.content || ""}
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-gray-800 sm:text-sm/6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Link
          onClick={() => router.back()}
          href="#"
          replace
          className="text-sm/6 font-semibold text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          className="rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
        >
          Save
        </button>
      </div>
    </form>
  );
}
