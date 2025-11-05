/**
 * ✅ Updated Books Layout
 * Removed client directive and segment boundary so /books and /books/[isbn]
 * both share the global layout and trigger proper route transitions.
 */

export default function BooksLayout({ children }) {
  return children;
}
