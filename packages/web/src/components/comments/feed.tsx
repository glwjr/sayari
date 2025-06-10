"use client";

import { useAuth } from "@/contexts/auth-context";
import CommentAvatar from "./avatar";
import { formatDistance } from "date-fns";

const activity = [
  {
    id: 1,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
  {
    id: 2,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
  {
    id: 3,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
  {
    id: 4,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
  {
    id: 5,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
  {
    id: 6,
    type: "commented",
    person: {
      name: "Chelsea Hagon",
      imageUrl:
        "https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    comment:
      "Called client, they reassured me the invoice would be paid by the 25th.",
    date: "3d ago",
    dateTime: new Date("2025-06-09T03:02:58.526Z"),
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function formatCommentDate(date: Date) {
  const formattedDate = formatDistance(date, new Date(), {
    addSuffix: true,
  });

  return formattedDate[0].toUpperCase() + formattedDate.slice(1);
}

export default function CommentFeed() {
  const { user, isAuthenticated } = useAuth();

  return (
    <>
      <ul role="list" className="space-y-6">
        {activity.map((activityItem, activityItemIdx) => (
          <li key={activityItem.id} className="relative flex gap-x-4">
            <div
              className={classNames(
                activityItemIdx === activity.length - 1 ? "h-6" : "-bottom-6",
                "absolute top-0 left-0 flex w-6 justify-center"
              )}
            >
              <div className="w-px bg-gray-200" />
            </div>
            <>
              <div className="relative">
                <CommentAvatar username={activityItem.person.name} />
              </div>
              <div className="flex-auto rounded-md p-3 ring-1 ring-gray-200 ring-inset">
                <div className="flex justify-between gap-x-4">
                  <div className="py-0.5 text-xs/5 text-gray-500">
                    <span className="font-medium text-gray-900">
                      {activityItem.person.name}
                    </span>{" "}
                    commented
                  </div>
                  <span className="flex-none py-0.5 text-xs/5 text-gray-500">
                    {`${formatCommentDate(activityItem.dateTime)}`}
                  </span>
                </div>
                <p className="text-sm/6 text-gray-500">
                  {activityItem.comment}
                </p>
              </div>
            </>
          </li>
        ))}
      </ul>

      {/* New comment form */}
      {isAuthenticated && user ? (
        <div className="mt-6 flex gap-x-4">
          <CommentAvatar username={user?.username} />
          <form action="#" className="relative flex-auto">
            <div className="overflow-hidden rounded-lg pb-12 outline-1 -outline-offset-1 outline-gray-300 focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-gray-800">
              <label htmlFor="comment" className="sr-only">
                Add your comment
              </label>
              <textarea
                id="comment"
                name="comment"
                rows={2}
                placeholder="Add your comment..."
                className="block w-full resize-none bg-transparent px-3 py-1.5 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none sm:text-sm/6"
                defaultValue={""}
              />
            </div>

            <div
              id="submit-comment"
              className="absolute inset-x-0 bottom-0 flex justify-between py-2 pr-2 pl-3"
            >
              <div className="flex items-center space-x-5" />
              <button
                type="submit"
                className="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      ) : (
        false
      )}
    </>
  );
}
