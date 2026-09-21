import axios from "axios";
import { useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "How has my training looked this week?",
  "What should I work on before my next game?",
  "Am I training enough for my goals?",
];

function Coach() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function sendQuestion(question: string) {
    if (!question.trim() || sending) return;

    setError("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await axios.post("http://localhost:5001/coach/ask", {
        question,
        history: messages,
      });

      setMessages([...nextMessages, { role: "assistant", content: response.data.answer }]);
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : "Could not reach the AI Coach right now.";
      setError(message);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    sendQuestion(input);
  }

  return (
    <div className="app">
      <h1 className="title">AI Coach</h1>
      <p className="subtitle">Ask questions about your training, games, and stats</p>

      <div className="chat-container">
        {messages.length === 0 && (
          <div className="chat-suggestions">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="add-button secondary"
                onClick={() => sendQuestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`chat-bubble ${message.role}`}>
              {message.content}
            </div>
          ))}
          {sending && <div className="chat-bubble assistant">Thinking...</div>}
        </div>

        {error && <p style={{ color: "#f87171" }}>{error}</p>}

        <form className="chat-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask about your training..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export default Coach;
