import { formatDistance } from "date-fns";
import { User } from "@/types/auth";

export default function Profile({ user }: { user: User }) {
  const registeredDate = formatDistance(user.createdAt, new Date(), {
    addSuffix: true,
  });

  return (
    <div>
      <div className="px-4 sm:px-0">
        <h3 className="text-2xl/7 font-semibold text-gray-900">
          {user.username}
        </h3>
      </div>
      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">Username</dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {user.username}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm/6 font-medium text-gray-900">
              Date Registered
            </dt>
            <dd className="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {registeredDate[0].toUpperCase() + registeredDate.slice(1)}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
