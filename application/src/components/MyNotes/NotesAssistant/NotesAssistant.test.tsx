import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import NotesAssistant from './NotesAssistant';
import { NotesApiClient, NoteQuestionResponse } from 'lib/api/notes';

describe('NotesAssistant', () => {
  const setup = async (response?: NoteQuestionResponse) => {
    const mockAskQuestion = jest.fn();

    if (response) {
      mockAskQuestion.mockResolvedValue(response);
    } else {
      mockAskQuestion.mockRejectedValue(new Error('Failed to process question'));
    }

    const mockClient = {
      askQuestion: mockAskQuestion,
    } as unknown as NotesApiClient;

    render(<NotesAssistant apiClient={mockClient} />);

    return { mockAskQuestion };
  };

  it('disables ask button when the question is empty', () => {
    render(<NotesAssistant apiClient={{} as NotesApiClient} />);

    const submitButton = screen.getByTestId('notes-assistant-submit');
    expect(submitButton).toBeDisabled();
  });

  it('submits a question and displays the answer with sources', async () => {
    const mockResponse: NoteQuestionResponse = {
      answer: 'You mentioned two tasks: A and B.\n- [Source 1]',
      sources: [
        {
          noteId: 'note-1',
          title: 'Standup Notes',
          snippet: 'Remember to finish task A.',
          score: 0.87,
          chunkId: 'chunk-1',
        },
      ],
      usedFallback: false,
    };

    const { mockAskQuestion } = await setup(mockResponse);

    const input = screen.getByTestId('notes-assistant-input') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'What tasks are pending?' } });

    const submitButton = screen.getByTestId('notes-assistant-submit');
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockAskQuestion).toHaveBeenCalledTimes(1));

    expect(mockAskQuestion).toHaveBeenCalledWith('What tasks are pending?');

    expect(screen.getByTestId('notes-assistant-response')).toBeInTheDocument();
    expect(screen.getByText(/You mentioned two tasks/i)).toBeInTheDocument();
    expect(screen.getByTestId('notes-assistant-source-chunk-1')).toBeInTheDocument();
  });

  it('shows an error when the API call fails', async () => {
    const { mockAskQuestion } = await setup();

    const input = screen.getByTestId('notes-assistant-input') as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: 'Tell me about customers' } });

    fireEvent.click(screen.getByTestId('notes-assistant-submit'));

    await waitFor(() => expect(mockAskQuestion).toHaveBeenCalled());

    expect(screen.getByTestId('notes-assistant-error')).toBeInTheDocument();
  });
});

