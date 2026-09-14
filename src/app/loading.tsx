export default function Loading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-lab-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-lab-accent" />
        Loading diagnostics…
      </div>
    </div>
  )
}
