import Profile from "@/components/users/profile";
import PostFeed from "@/components/posts/post-feed";
import { User } from "@/types/user";

async function fetchUserProfile(userId: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const [profileRes, postsRes] = await Promise.all([
      fetch(`${apiUrl}/users/${userId}`),
      fetch(`${apiUrl}/posts?userId=${userId}`),
    ]);

    if (!profileRes.ok) throw new Error("Failed to fetch user profile");
    if (!postsRes.ok) throw new Error("Failed to fetch user posts");

    const user: User = await profileRes.json();
    const posts = await postsRes.json();

    return { user, posts };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Unknown error");
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, posts } = await fetchUserProfile(id);

  return (
    <main>
      <Profile user={user} />
      {posts.length > 0 && (
        <div className="mt-6">
          <PostFeed type={`${user.username}'s Post`} posts={posts} />
        </div>
      )}
    </main>
  );
}
