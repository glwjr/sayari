"use client";

import { useEffect, useState } from "react";
import { LoadingProgress } from "@/components/common/loading-progress";
import PostFeed from "@/components/posts/post-feed";
import { Post } from "@/types/post";

export default function HotFeed() {
  const [state, setState] = useState<{
    posts: Post[] | [];
    isLoading: boolean;
    error: string | null;
  }>({
    posts: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts/hot`);

        if (!res.ok) throw new Error("Failed to fetch posts");

        const posts: Post[] = await res.json();

        setState({ posts, isLoading: false, error: null });
      } catch (error) {
        setState({
          posts: [],
          isLoading: false,
          error: (error as Error).message,
        });
      }
    }

    fetchPosts();
  }, []);

  if (state.isLoading) {
    return (
      <main>
        <LoadingProgress />
      </main>
    );
  }

  return (
    <main>
      <PostFeed type="Hot" posts={state.posts} />
    </main>
  );
}
