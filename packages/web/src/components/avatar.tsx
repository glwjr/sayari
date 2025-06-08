export default function Avatar({ username }: { username: string }) {
  return (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-gray-500">
      <span className="text-xs font-medium text-white">
        {username[0].toUpperCase()}
      </span>
    </span>
  );
}
