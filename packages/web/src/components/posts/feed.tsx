import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { formatDate } from "date-fns";
import { Post } from "@/types/post";

export default function Feed({ type, posts }: { type: string; posts: Post[] }) {
  return (
    <>
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl/7 font-semibold text-gray-900">{type} Feed</h3>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <ul role="list" className="divide-y divide-gray-100 px-4 sm:px-0 mt-6">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 first:pt-0 sm:flex-nowrap"
            >
              <div>
                <p className="text-md/6 font-semibold text-gray-900">
                  <a href={`/posts/${post.id}`} className="hover:underline">
                    {post.title}
                  </a>
                </p>
                <div className="mt-1 flex items-center gap-x-2 text-sm/5 text-gray-500">
                  <p>
                    <a
                      href={`/users/${post.user.id}`}
                      className="hover:underline"
                    >
                      Posted by {post.user.username}
                    </a>
                  </p>
                  <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                    <circle r={1} cx={1} cy={1} />
                  </svg>
                  <p>{formatDate(`${post.createdAt}`, "PPPPp")}</p>
                </div>
              </div>
              <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
                <div className="flex w-16 gap-x-2">
                  <dt>
                    <span className="sr-only">Total comments</span>
                    <ChatBubbleLeftIcon
                      aria-hidden="true"
                      className="size-5 text-gray-400"
                    />
                  </dt>
                  <dd className="text-sm/5 text-gray-900">
                    {post.commentCount}
                  </dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
