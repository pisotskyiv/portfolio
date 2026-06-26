import { Nav } from "@/components/sections/Nav";

export default function CaseStudyLoading() {
  return (
    <>
      <Nav />
      <main id="main-content" className="mx-auto max-w-5xl px-12 py-16">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_220px]">
          <div className="flex animate-pulse flex-col gap-12">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-32 rounded bg-surface" />
              <div className="h-8 w-64 rounded bg-surface" />
            </div>
            <div className="h-28 rounded bg-surface" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-4">
                <div className="h-6 w-48 rounded bg-surface" />
                <div className="h-4 w-full rounded bg-surface" />
                <div className="h-4 w-5/6 rounded bg-surface" />
                <div className="h-4 w-4/5 rounded bg-surface" />
              </div>
            ))}
          </div>
          <div className="hidden animate-pulse flex-col gap-3 lg:flex">
            <div className="h-3 w-20 rounded bg-surface" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-36 rounded bg-surface" />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
