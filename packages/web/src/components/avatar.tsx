export default function Avatar({
  username,
}: {
  username?: string | undefined;
}) {
  if (!username) {
    return (
      <span className="inline-block size-6 overflow-hidden rounded-full bg-gray-100">
        <svg
          fill="currentColor"
          viewBox="0 0 24 24"
          className="size-full text-gray-300"
        >
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </span>
    );
  }

  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-500">
      <span className="text-xs font-medium text-white">
        {username[0].toUpperCase()}
      </span>
    </span>
  );
}
