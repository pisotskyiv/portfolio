export default function BookLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-6 py-12">
      <h1 className="text-lg font-medium text-muted">Schedule a call</h1>
      <div className="flex flex-col gap-3 text-sm text-text">
        <p className="invisible">Booking placeholder as Name.</p>
        <button
          disabled
          className="rounded border border-accent/40 px-3 py-1.5 text-accent opacity-50"
        >
          Confirm
        </button>
      </div>
    </main>
  );
}
