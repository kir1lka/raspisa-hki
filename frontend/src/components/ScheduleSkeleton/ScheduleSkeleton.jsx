function SkeletonCard() {
  return (
    <div className="flex min-h-[120px] overflow-hidden rounded-card border-[calc(2px/(var(--ui-base)*var(--ui-zoom)))] border-line bg-surface md:min-h-[160px]">
      <div className="flex w-20 shrink-0 flex-col items-center justify-between py-5 md:w-28 md:py-7">
        <div className="h-4 w-12 rounded bg-line/70" />
        <div className="h-8 w-6 rounded bg-line/70" />
        <div className="h-4 w-12 rounded bg-line/70" />
      </div>
      <div className="my-auto h-[80%] w-1 shrink-0 rounded-card bg-sep" />
      <div className="flex flex-1 flex-col justify-center gap-3 px-5 py-5 md:px-7">
        <div className="h-6 w-3/4 rounded bg-line/70 md:h-8" />
        <div className="h-4 w-1/2 rounded bg-line/60 md:h-5" />
      </div>
    </div>
  )
}

export default function ScheduleSkeleton() {
  return (
    <div className="animate-pulse" aria-hidden>
      {[0, 1].map((section) => (
        <section key={section} className="mt-4 md:mt-6">
          <div className="h-12 rounded-card bg-line/70 md:h-14" />
          <div className="mt-3 flex flex-col gap-3 md:mt-4 md:gap-4">
            {[0, 1, 2].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
