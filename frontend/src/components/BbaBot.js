'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function BbaBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: '👋 Hi! I’m BBA Bot. Ask me for book suggestions (e.g., “Year 5 English”).' },
  ]);
  const [input, setInput] = useState('');
  const [books, setBooks] = useState([]);

  // preload book list
  useEffect(() => {
    supabase.from('books').select('*').then(({ data }) => setBooks(data || []));
  }, []);

  function toggleChat() {
    setOpen(!open);
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;
    const query = input.toLowerCase();
    const suggestions = books.filter(
      b =>
        b.title.toLowerCase().includes(query) ||
        b.subject?.toLowerCase().includes(query) ||
        b.year?.toString().includes(query)
    );
    const reply = suggestions.length
      ? `I found ${suggestions.length} book(s):\n` +
        suggestions.map(b => `• ${b.title} — ${b.subject} (Year ${b.year})`).join('\n')
      : "Sorry, I couldn’t find books for that query.";
    setMessages([...messages, { from: 'user', text: input }, { from: 'bot', text: reply }]);
    setInput('');
  }

  return (
    <>
      <button
        onClick={toggleChat}
        style={{
          position: 'fixed', bottom: 20, right: 20, background: '#2563eb', color: 'white',
          border: 0, borderRadius: '50%', width: 60, height: 60, fontSize: 24, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}
      >
        💬
      </button>

      {open && (
        <div style={{
          position: 'fixed', bottom: 90, right: 20, width: 300, background: 'white',
          borderRadius: 8, boxShadow: '0 2px 12px rgba(0,0,0,0.2)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column', fontFamily: 'Segoe UI'
        }}>
          <div style={{ background: '#2563eb', color: 'white', padding: 10, fontWeight: 'bold' }}>
            Ask BBA Bot
          </div>
          <div style={{ flex: 1, padding: 10, maxHeight: 250, overflowY: 'auto' }}>
            {messages.map((m, i) => (
              <p key={i} style={{ margin: '6px 0', whiteSpace: 'pre-wrap',
                color: m.from === 'bot' ? '#111' : '#2563eb', textAlign: m.from === 'bot' ? 'left' : 'right' }}>
                {m.text}
              </p>
            ))}
          </div>
          <form onSubmit={handleSend} style={{ display: 'flex', borderTop: '1px solid #eee' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a question..."
              style={{ flex: 1, padding: 8, border: 'none', outline: 'none' }}
            />
            <button type="submit" style={{
              background: '#2563eb', color: 'white', border: 0, padding: '0 16px', cursor: 'pointer'
            }}>➤</button>
          </form>
        </div>
      )}
    </>
  );
}
