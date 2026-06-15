import { useEffect, useRef } from "react";
import Message from "./Message";

export default function ChatArea({ messages, loading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="message-list" role="log" aria-live="polite" aria-label="Conversation">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}

      {loading && (
        <div className="message message--assistant" aria-label="AI is typing">
          <div className="message-avatar" aria-hidden="true"><AvatarIcon /></div>
          <div className="message-bubble message-bubble--assistant">
            <div className="typing-indicator" aria-hidden="true">
              <span /><span /><span />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}

function AvatarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>;
}
