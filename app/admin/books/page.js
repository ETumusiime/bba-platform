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
    const { data, error } = await supabase.from('books').insert([newBook]);
    if (error) setError(error.message);
    else {
      setMessage('✅ Book added!');
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
    <main style={{ padding: 30, fontFamily: 'sans-serif' }}>
      <h1>📘 Admin – Manage Books</h1>

      <form onSubmit={addBook} style={{ marginTop: 20, marginBottom: 30 }}>
        <h3>Add Book</h3>
        <input placeholder="ISBN" value={newBook.isbn} onChange={e=>setNewBook({...newBook,isbn:e.target.value})} required/>
        <input placeholder="Title" value={newBook.title} onChange={e=>setNewBook({...newBook,title:e.target.value})} required/>
        <input placeholder="Author" value={newBook.author} onChange={e=>setNewBook({...newBook,author:e.target.value})}/>
        <input placeholder="Subject" value={newBook.subject} onChange={e=>setNewBook({...newBook,subject:e.target.value})}/>
        <input placeholder="Year Level" value={newBook.year_level} onChange={e=>setNewBook({...newBook,year_level:e.target.value})}/>
        <input placeholder="Price" type="number" value={newBook.price} onChange={e=>setNewBook({...newBook,price:e.target.value})}/>
        <input placeholder="Currency" value={newBook.currency} onChange={e=>setNewBook({...newBook,currency:e.target.value})}/>
        <input placeholder="Supplier" value={newBook.supplier} onChange={e=>setNewBook({...newBook,supplier:e.target.value})}/>
        <input placeholder="Stock" type="number" value={newBook.stock} onChange={e=>setNewBook({...newBook,stock:e.target.value})}/>
        <button type="submit" style={{ marginLeft: 10 }}>➕ Add</button>
      </form>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      <h3>Current Books</h3>
      <ul>
        {books.map(b => (
          <li key={b.id} style={{ marginBottom: 8 }}>
            <strong>{b.title}</strong> — {b.subject ?? '—'} ({b.year_level ?? '—'}) | {b.currency} {Number(b.price).toLocaleString()}
            <button onClick={() => deleteBook(b.id)} style={{ marginLeft: 10, color: 'red' }}>🗑 Delete</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
