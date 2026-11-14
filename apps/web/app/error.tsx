'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="standalone">
      <h1>Something went wrong</h1>
      <p>Please try again. Your browser preferences are kept on this device.</p>
      <button type="button" className="button button--primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
