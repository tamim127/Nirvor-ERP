import Link from 'next/link';
export default function NotFound() {
  return (
    <main className="standalone">
      <p className="eyebrow">NIRVOR</p>
      <h1>Page not found</h1>
      <p>This page is not available.</p>
      <Link href="/">Return to workspace</Link>
    </main>
  );
}
