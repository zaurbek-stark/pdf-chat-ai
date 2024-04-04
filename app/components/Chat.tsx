'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';

type ChatProps = {
  initialText?: string;
  pdfText: string;
};

const userAuthor = {
  username: 'User',
  id: 1,
  avatarUrl: '/user-avatar.jpg',
};

const aiAuthor = {
  username: 'Bob The Interviewer',
  id: 2,
  avatarUrl: '/bob.jpg',
};

type Message = {
  author: {
    username: string;
    id: number;
    avatarUrl: string;
  }
  text: string;
  type: string;
  timestamp: number;
}

type aiMessage = {
  role: string;
  content: string;
}

const Chat: React.FC<ChatProps> = ({ initialText, pdfText }) => {
  const [input, setInput] = useState('');;
  const initialMessage = {
    author: aiAuthor,
    text: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?',
    type: 'text',
    timestamp: +new Date(),
  };
  const pdfMessage = {
    role: 'system',
    content: `Here is text extracted from a PDF. Answer questions on it:\n\n${pdfText}`
  };
  const initialAiMessage = {
    role: 'assistant',
    content: initialText ?? 'Hello, I am Bob the Interviewer. How can I help you?',
  };
  const [chatMessages, setChatMessages] = useState<Message[]>([initialMessage]);
  const [aiMessages, setAiMessages] = useState<aiMessage[]>([pdfMessage, initialAiMessage]);
  const chatContainer = useRef<HTMLDivElement>(null);

  const scroll = () => {
    const { offsetHeight, scrollHeight, scrollTop } = chatContainer.current as HTMLDivElement
    if (scrollHeight >= scrollTop + offsetHeight) {
      chatContainer.current?.scrollTo(0, scrollHeight + 200)
    }
  }

  useEffect(() => {
    scroll();
  }, [chatMessages]);

  const handleOnSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = e.currentTarget['input-field'].value;
    setInput('');

    setChatMessages(messages => [...messages, {
      author: userAuthor,
      text: message,
      type: 'text',
      timestamp: +new Date()
    }, {
      author: aiAuthor,
      text: '...',
      type: 'text',
      timestamp: +new Date()
    }]);

    const messageToSend = [...aiMessages, {role: 'user', content: message }];

    const response = await fetchOpenAIResponse({
      messages: messageToSend, 
      setMessage: (msg) => setChatMessages(messages => 
        [...messages.slice(0, messages.length-1), {
          author: aiAuthor,
          text: msg,
          type: 'text',
          timestamp: +new Date()
        }]
      )
    });
    setAiMessages(messages => [...messages, {role: 'user', content: message }, {role: 'assistant', content: response }]);
  }

  const renderResponse = () => {
    return (
      <div ref={chatContainer} className="response">
        {chatMessages.map((m, index) => (
          <div key={index} className={`chat-line ${m.author.username === 'User' ? 'user-chat' : 'ai-chat'}`}>
            <Image className="avatar" alt="avatar" src={m.author.avatarUrl} width={32} height={32} />
            <div style={{width: 592, marginLeft: '16px' }}>
              <div className="message">
                <MarkdownRenderer>{m.text}</MarkdownRenderer>
              </div>
              {index < chatMessages.length-1 && <div className="horizontal-line"/>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="chat">
      {renderResponse()}
      <form onSubmit={handleOnSendMessage} className="chat-form">
        <input name="input-field" type="text" placeholder="Say anything" onChange={(e) => setInput(e.target.value)} value={input} />
        <button type="submit" className="send-button" />
      </form>
    </div>
  );
}

export default Chat;