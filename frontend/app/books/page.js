'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, subject, year_level, price, currency')
        .limit(20);
      if (error) setError(error.message);
      else setBooks(data || []);
    })();
  }, []);

  return (
    <main style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>📚 Available Books</h1>
      {error && <p style={{ color: 'crimson' }}>Error: {error}</p>}
      {books.length === 0 ? (
        <p>No books found.</p>
      ) : (
        <ul>
          {books.map((b) => (
            <li key={b.id}>
              <strong>{b.title}</strong> — {b.subject ?? '—'} ({b.year_level ?? '—'})
              &nbsp;| {b.currency} {Number(b.price).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
