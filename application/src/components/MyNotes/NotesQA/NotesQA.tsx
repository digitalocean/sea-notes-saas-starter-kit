'use client';

import React, { useState } from 'react';
import { Button, TextField, Paper, CircularProgress } from '@mui/material';
import { NotesApiClient } from 'lib/api/notes';

const api = new NotesApiClient();

const NotesQA: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    setLoading(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await api.askQuestion(question);
      setAnswer(res.answer);
    } catch (err) {
      console.error(err);
      setError('Failed to get an answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper style={{ padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <TextField
          fullWidth
          label="Ask a question about your notes"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <Button variant="contained" onClick={ask} disabled={!question || loading}>
          {loading ? <CircularProgress size={20} /> : 'Ask'}
        </Button>
      </div>

      {answer && (
        <div style={{ marginTop: 12 }}>
          <strong>Answer</strong>
          <div style={{ whiteSpace: 'pre-wrap' }}>{answer}</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, color: 'red' }}>{error}</div>
      )}
    </Paper>
  );
};

export default NotesQA;
