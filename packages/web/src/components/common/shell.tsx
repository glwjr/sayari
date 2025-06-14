"use client";

import Image from "next/image";
import Link from "next/link";
import { redirect, usePathname } from "next/navigation";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import {
  Bars3Icon,
  PencilSquareIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/auth-context";
import ShellAvatar from "./shell-avatar";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Shell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    redirect(pathname);
  };

  const navigation = [
    { name: "Feed", href: "/", current: pathname.endsWith("/") },
    { name: "Hot", href: "/hot", current: pathname.endsWith("/hot") },
  ];

  return (
    <>
      <div className="min-h-full">
        <div className="bg-gray-800 pb-32">
          <Disclosure as="nav" className="bg-gray-800">
            {({ close }) => (
              <>
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                  <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                    <div className="flex items-center">
                      <div className="shrink-0">
                        <Link href="/">
                          <Image
                            alt="Sayari"
                            src="/planet-white.svg"
                            priority
                            height={8}
                            width={8}
                            className="mx-auto h-8 w-auto"
                          />
                        </Link>
                      </div>
                      <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              aria-current={item.current ? "page" : undefined}
                              className={classNames(
                                item.current
                                  ? "bg-gray-900 text-white"
                                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                                "rounded-md px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                              )}
                            >
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-4 flex items-center md:ml-6">
                        {isAuthenticated ? (
                          <Link
                            href="/posts/create"
                            className="cursor-pointer relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden"
                          >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">Create post</span>
                            <PencilSquareIcon
                              aria-hidden="true"
                              className="size-6"
                            />
                          </Link>
                        ) : (
                          <a
                            href="/auth/login"
                            className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                          >
                            Log In
                          </a>
                        )}

                        {/* Profile dropdown */}
                        <Menu as="div" className="relative ml-3">
                          {({ close }) => (
                            <>
                              {isAuthenticated && user ? (
                                <>
                                  <div>
                                    <MenuButton className="cursor-pointer relative flex max-w-xs items-center rounded-full text-sm hover:ring-2 hover:ring-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                                      <span className="absolute -inset-1.5" />
                                      <span className="sr-only">
                                        Open user menu
                                      </span>
                                      <ShellAvatar username={user.username} />
                                    </MenuButton>
                                  </div>
                                  <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                  >
                                    {user.role === "admin" ? (
                                      <MenuItem>
                                        <a
                                          href="/admin"
                                          className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                        >
                                          Admin Panel
                                        </a>
                                      </MenuItem>
                                    ) : (
                                      false
                                    )}
                                    <MenuItem>
                                      <a
                                        href={`/users/${user.id}`}
                                        className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                      >
                                        Your Profile
                                      </a>
                                    </MenuItem>
                                    <MenuItem>
                                      <button
                                        onClick={() => {
                                          close();
                                          handleLogout();
                                        }}
                                        className="cursor-pointer w-full text-left block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                      >
                                        Log Out
                                      </button>
                                    </MenuItem>
                                  </MenuItems>
                                </>
                              ) : (
                                <MenuItems
                                  transition
                                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                  <MenuItem>
                                    <a
                                      href="/auth/login"
                                      className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                                    >
                                      Log In
                                    </a>
                                  </MenuItem>
                                </MenuItems>
                              )}
                            </>
                          )}
                        </Menu>
                      </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                      {/* Mobile menu button */}
                      <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                        <span className="absolute -inset-0.5" />
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon
                          aria-hidden="true"
                          className="block size-6 group-data-open:hidden"
                        />
                        <XMarkIcon
                          aria-hidden="true"
                          className="hidden size-6 group-data-open:block"
                        />
                      </DisclosureButton>
                    </div>
                  </div>
                </div>

                <DisclosurePanel className="md:hidden">
                  <div className="space-y-1 px-2 py-3 sm:px-3">
                    {navigation.map((item) => (
                      <DisclosureButton
                        key={item.name}
                        as="a"
                        href={item.href}
                        aria-current={item.current ? "page" : undefined}
                        className={classNames(
                          item.current
                            ? "bg-gray-900 text-white"
                            : "text-gray-300 hover:bg-gray-700 hover:text-white",
                          "block rounded-md px-3 py-2 text-base font-medium"
                        )}
                      >
                        {item.name}
                      </DisclosureButton>
                    ))}
                  </div>
                  <div className="border-t border-gray-700 pt-4 pb-3">
                    {isAuthenticated && user ? (
                      <>
                        <div className="flex items-center px-5">
                          <div className="shrink-0">
                            <ShellAvatar username={user.username} />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-400">
                              {user.username}
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 space-y-1 px-2">
                          {user.role === "admin" ? (
                            <DisclosureButton
                              as="a"
                              href="/admin"
                              className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                            >
                              Admin Panel
                            </DisclosureButton>
                          ) : (
                            false
                          )}
                          <DisclosureButton
                            as="a"
                            href="/create"
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            Create Post
                          </DisclosureButton>
                          <DisclosureButton
                            as="a"
                            href={`/users/${user.id}`}
                            className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            Your Profile
                          </DisclosureButton>
                          <button
                            onClick={() => {
                              close();
                              handleLogout();
                            }}
                            className="w-full text-left cursor-pointer block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                          >
                            Log Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-1 px-2">
                        <DisclosureButton
                          as="a"
                          href="/auth/login"
                          className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white"
                        >
                          Log In
                        </DisclosureButton>
                      </div>
                    )}
                  </div>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        </div>

        <main className="-mt-32">
          <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
            <div className="rounded-lg bg-white px-9 py-10 shadow-sm sm:px-10">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
