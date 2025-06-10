import Profile from "@/components/users/profile";
import { User } from "@/types/auth";

async function fetchUser(id: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);

    if (!res.ok) throw new Error("Failed to fetch user");

    const data: User = await res.json();

    return data;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await fetchUser(id as string);

  return (
    <main>
      <Profile user={user} />
    </main>
  );
}
