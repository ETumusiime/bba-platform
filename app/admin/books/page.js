'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

export default function AdminBooksPage() {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({
    isbn: '',
    title: '',
    author: '',
    subject: '',
    year_level: '',
    price: '',
    currency: 'UGX',
    supplier: '',
    stock: ''
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  async function loadBooks() {
    const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setBooks(data);
  }

  async function addBook(e) {
    e.preventDefault();
    setError(null); setMessage('');
    const { error } = await supabase.from('books').insert([newBook]);
    if (error) setError(error.message);
    else {
      setMessage('✅ Book added successfully!');
      setNewBook({ isbn: '', title: '', author: '', subject: '', year_level: '', price: '', currency: 'UGX', supplier: '', stock: '' });
      loadBooks();
    }
  }

  async function deleteBook(id) {
    if (!confirm('Delete this book?')) return;
    const { error } = await supabase.from('books').delete().eq('id', id);
    if (error) alert(error.message);
    else loadBooks();
  }

  useEffect(() => { loadBooks(); }, []);

  return (
    <main style={{
      padding: '40px',
      fontFamily: 'Segoe UI, sans-serif',
      backgroundColor: '#f9fafb',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>📘 Admin – Manage Books</h1>

      <section style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '40px'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Add New Book</h2>

        <form
          onSubmit={addBook}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px'
          }}
        >
          <input placeholder="ISBN" value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} required />
          <input placeholder="Title" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
          <input placeholder="Author" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} />
          <input placeholder="Subject" value={newBook.subject} onChange={e => setNewBook({ ...newBook, subject: e.target.value })} />
          <input placeholder="Year Level" value={newBook.year_level} onChange={e => setNewBook({ ...newBook, year_level: e.target.value })} />
          <input placeholder="Price" type="number" value={newBook.price} onChange={e => setNewBook({ ...newBook, price: e.target.value })} />
          <input placeholder="Currency" value={newBook.currency} onChange={e => setNewBook({ ...newBook, currency: e.target.value })} />
          <input placeholder="Supplier" value={newBook.supplier} onChange={e => setNewBook({ ...newBook, supplier: e.target.value })} />
          <input placeholder="Stock" type="number" value={newBook.stock} onChange={e => setNewBook({ ...newBook, stock: e.target.value })} />

          <button
            type="submit"
            style={{
              gridColumn: '1 / -1',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            ➕ Add Book
          </button>
        </form>

        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}
        {error && <p style={{ color: 'crimson', marginTop: '10px' }}>{error}</p>}
      </section>

      <section style={{
        background: '#fff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>Current Books</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Title</th>
              <th style={{ padding: '10px' }}>Subject</th>
              <th style={{ padding: '10px' }}>Year Level</th>
              <th style={{ padding: '10px' }}>Price</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px' }}>{b.title}</td>
                <td style={{ padding: '10px' }}>{b.subject}</td>
                <td style={{ padding: '10px' }}>{b.year_level}</td>
                <td style={{ padding: '10px' }}>{b.currency} {Number(b.price).toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <button
                    onClick={() => deleteBook(b.id)}
                    style={{
                      color: 'white',
                      background: '#dc2626',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
