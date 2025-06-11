import Link from "next/link";
import { formatDate } from "date-fns";
import { User } from "@/types/user";
import Toggle from "./toggle";

export default function AdminPanelUserTable({ users }: { users: User[] }) {
  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base/7 font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in the database including their username,
            account creation date, active status, and role.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="cursor-pointer block rounded-md bg-gray-800 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-gray-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Add user
          </button>
        </div>
      </div>
      <div className="mt-8">
        <table className="min-w-full -mx-0 divide-y divide-gray-100">
          <thead>
            <tr>
              <th
                scope="col"
                className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
              >
                Username
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Created At
              </th>
              <th
                scope="col"
                className="hidden px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:table-cell"
              >
                Number of Posts
              </th>
              <th
                scope="col"
                className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
              >
                User Role
              </th>
              <th
                scope="col"
                className="py-3.5 pr-5 pl-3 text-right text-sm font-semibold text-gray-900 sm:pr-1"
              >
                Active
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0">
                  <Link href={`users/${user.id}`} className="hover:underline">
                    {user.username}
                  </Link>
                </td>
                <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                  {`${formatDate(user.createdAt, "PPPp")}`}
                </td>
                <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-500 sm:table-cell">
                  {user.postCount}
                </td>
                <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500">
                  {user.role}
                </td>
                <td className="py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap sm:pr-0">
                  <Toggle
                    userId={user.id}
                    initialValue={user.isActive}
                    disabled={user.role === "admin"}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
