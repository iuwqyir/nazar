export default function Loader() {
  return (
    <div className="flex items-center justify-center p-2">
      <div className="animate-spin w-4 h-4 border-t-2 border-b-2 border-zinc-600 dark:border-zinc-500 rounded-full" />
      <span className="ml-2 text-zinc-900 dark:text-zinc-300">Loading...</span>
    </div>
  )
}
