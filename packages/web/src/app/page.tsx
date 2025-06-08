import Feed from "@/components/posts/feed";
import { Post } from "@/types/post";

async function fetchPosts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`);

    if (!res.ok) throw new Error("Failed to fetch posts");

    const data: Post[] = await res.json();

    return data;
  } catch (error) {
    throw new Error(`An error has occured: ${error}`);
  }
}

export default async function MainFeed() {
  const posts = await fetchPosts();

  return (
    <div>
      <Feed posts={posts} />
    </div>
  );
}
