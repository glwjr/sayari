import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";

const discussions = [
  {
    id: 1,
    title: "Atque perspiciatis et et aut ut porro voluptatem blanditiis?",
    href: "#",
    author: { name: "Leslie Alexander", href: "#" },
    date: "2d ago",
    dateTime: "2023-01-23T22:34Z",
    totalComments: 24,
  },
  {
    id: 2,
    title: "Et ratione distinctio nesciunt recusandae vel ab?",
    href: "#",
    author: { name: "Michael Foster", href: "#" },
    date: "2d ago",
    dateTime: "2023-01-23T19:20Z",
    totalComments: 6,
  },
  {
    id: 3,
    title: "Blanditiis perferendis fugiat optio dolor minus ut?",
    href: "#",
    author: { name: "Dries Vincent", href: "#" },
    date: "3d ago",
    dateTime: "2023-01-22T12:59Z",
    totalComments: 22,
  },
  {
    id: 4,
    title: "Voluptatum ducimus voluptatem qui in eum quasi consequatur vel?",
    href: "#",
    author: { name: "Lindsay Walton", href: "#" },
    date: "5d ago",
    dateTime: "2023-01-20T10:04Z",
    totalComments: 8,
  },
  {
    id: 5,
    title: "Perferendis cum qui inventore ut excepturi nostrum occaecati?",
    href: "#",
    author: { name: "Courtney Henry", href: "#" },
    date: "5d ago",
    dateTime: "2023-01-20T20:12Z",
    totalComments: 15,
  },
];

export default function Feed() {
  return (
    <ul role="list" className="divide-y divide-gray-100">
      {discussions.map((discussion) => (
        <li
          key={discussion.id}
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 py-5 sm:flex-nowrap"
        >
          <div>
            <p className="text-sm/6 font-semibold text-gray-900">
              <a href={discussion.href} className="hover:underline">
                {discussion.title}
              </a>
            </p>
            <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
              <p>
                <a href={discussion.author.href} className="hover:underline">
                  {discussion.author.name}
                </a>
              </p>
              <svg viewBox="0 0 2 2" className="size-0.5 fill-current">
                <circle r={1} cx={1} cy={1} />
              </svg>
              <p>
                <time dateTime={discussion.dateTime}>{discussion.date}</time>
              </p>
            </div>
          </div>
          <dl className="flex w-full flex-none justify-between gap-x-8 sm:w-auto">
            <div className="flex w-16 gap-x-2.5">
              <dt>
                <span className="sr-only">Total comments</span>
                <ChatBubbleLeftIcon
                  aria-hidden="true"
                  className="size-6 text-gray-400"
                />
              </dt>
              <dd className="text-sm/6 text-gray-900">
                {discussion.totalComments}
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
