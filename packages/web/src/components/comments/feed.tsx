"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistance } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import { Comment } from "@/types/comment";
import CommentAvatar from "./avatar";
import { apiClient } from "@/lib/api-client";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function formatCommentDate(date: Date) {
  const formattedDate = formatDistance(date, new Date(), {
    addSuffix: true,
  });
  return formattedDate[0].toUpperCase() + formattedDate.slice(1);
}

export default function CommentFeed({
  comments = [],
  postId,
}: {
  comments?: Comment[];
  postId: string;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [error, setError] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!content.trim() || !user) return;

      try {
        await apiClient.post<Comment>(`/posts/${postId}/comments`, {
          content,
          userId: user.id,
          postId,
        });
        setContent("");
        router.refresh();
      } catch (error) {
        setError((error as Error).message);
      }
    },
    [content, user, postId, router]
  );

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <>
      {isAuthenticated && user && (
        <div className="my-6 flex gap-x-4">
          <CommentAvatar username={user.username} />
          <form className="relative flex-auto" onSubmit={handleSubmit}>
            <div className="overflow-hidden rounded-lg pb-12 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-gray-800">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                id="comment"
                name="content"
                rows={2}
                placeholder="Add your comment..."
                className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3">
              <div className="flex items-center space-x-5" />
              <button
                type="submit"
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
                disabled={!content.trim()}
              >
                Submit
              </button>
            </div>
            {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          </form>
        </div>
      )}

      <ul role="list" className="space-y-6">
        {comments.map((comment, commentIndex) => (
          <li key={comment.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                commentIndex === comment.content.length - 1
                  ? "h-6"
                  : "-bottom-6",
                "absolute top-0 left-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            <div className="relative">
              <CommentAvatar username={comment.user.username} />
            </div>
            <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 ring-inset">
              <div className="flex justify-between gap-x-4">
                <div className="py-0.5 text-xs/5 text-gray-500">
                  <span className="font-medium text-gray-900">
                    {comment.user.username}
                  </span>{" "}
                  commented
                </div>
                <span className="flex-none py-0.5 text-xs/5 text-gray-500">
                  {formatCommentDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm/6 text-gray-500">{comment.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
