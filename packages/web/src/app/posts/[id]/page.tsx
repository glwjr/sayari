"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "date-fns";
import {
  CalendarIcon,
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/20/solid";
import { useAuth } from "@/contexts/auth-context";
import CommentFeed from "@/components/comments/feed";
import { LoadingProgress } from "@/components/common/loading-progress";
import { apiClient } from "@/lib/api-client";
import { Post } from "@/types/post";

export default function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [state, setState] = useState<{
    post: Post | null;
    isLoading: boolean;
    error: string | null;
  }>({
    post: null,
    isLoading: true,
    error: null,
  });

  async function handleDelete(postId: string) {
    try {
      await apiClient.delete(`/posts/${postId}`);

      router.push("/");
    } catch (error) {
      setState({
        post: null,
        isLoading: false,
        error: (error as Error).message,
      });
    }
  }

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

  if (state.isLoading)
    return (
      <main>
        <LoadingProgress />
      </main>
    );

  if (state.error || !state.post) {
    throw new Error(state.error ?? "Unknown error");
  }

  return (
    <main>
      <div className="lg:flex lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl/7 font-bold text-gray-800 sm:truncate sm:text-2xl sm:tracking-tight">
            {state.post.title}
          </h2>
          <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <UserCircleIcon
                aria-hidden="true"
                className="mr-1.5 size-5 shrink-0 text-gray-400"
              />
              <Link
                href={`/users/${state.post.user.id}`}
                className="hover:underline"
              >
                Posted by {state.post.user.username}
              </Link>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-600">
              <CalendarIcon
                aria-hidden="true"
                className="mr-1.5 size-5 shrink-0 text-gray-400"
              />
              {formatDate(`${state.post.createdAt}`, "PPPPp")}
            </div>
          </div>
        </div>
        {isAuthenticated ? (
          <div className="mt-5 flex lg:mt-0 lg:ml-4">
            {state.post.user.id === user?.id && (
              <span>
                <button
                  onClick={() => {
                    router.push(`/posts/${state.post?.id}/edit`);
                  }}
                  type="button"
                  className="cursor-pointer inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-800 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <PencilSquareIcon
                    aria-hidden="true"
                    className="mr-1.5 -ml-0.5 size-5 text-gray-400"
                  />
                  Edit
                </button>
              </span>
            )}
            {(state.post.user.id === user?.id || user?.role === "admin") && (
              <span>
                <button
                  onClick={() => handleDelete(state.post!.id)}
                  type="button"
                  className="cursor-pointer ml-3 inline-flex items-center rounded-md bg-gray-800 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  <TrashIcon
                    aria-hidden="true"
                    className="mr-1.5 -ml-0.5 size-5 text-white"
                  />
                  Delete
                </button>
              </span>
            )}
          </div>
        ) : (
          false
        )}
      </div>

      {state.post.content ? (
        <div className="flex mt-6 text-sm text-gray-700">
          <div>
            <p>{state.post.content}</p>
          </div>
        </div>
      ) : (
        false
      )}
      <div className="mt-8">
        <CommentFeed postId={state.post.id} comments={state.post.comments} />
      </div>
    </main>
  );
}
