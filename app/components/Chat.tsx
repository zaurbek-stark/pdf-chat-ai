'use client';

import { useState, useRef, useEffect } from 'react';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';
import { useUser, useClerk } from '@clerk/nextjs';

type ChatProps = {
  pdfText: string;
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

const MAX_MESSAGES_PER_DAY = 20;

const Chat: React.FC<ChatProps> = ({ pdfText }) => {
  console.log('pdfText:', pdfText);
  const [input, setInput] = useState('');;
  const initialMessage = {
    author: aiAuthor,
    text: 'Hello, I am Bob the PDF AI Chatter. How can I help you?',
    type: 'text',
    timestamp: +new Date(),
  };
  const initialAiMessage = {
    role: 'assistant',
    content: 'Hello, I am Bob the PDF AI Chatter. How can I help you?',
  };
  const [chatMessages, setChatMessages] = useState<Message[]>([initialMessage]);
  const [aiMessages, setAiMessages] = useState<aiMessage[]>([]);
  const chatContainer = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const { openSignUp } = useClerk();

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
    
    if (!user){
      openSignUp();
      return;
    }

    const message = e.currentTarget['input-field'].value;
    setInput('');

    const currentDate = new Date().toISOString().slice(0, 10);
    const storedDate = localStorage.getItem('lastMessageDate');
    const messageCount = parseInt(localStorage.getItem('messageCount') || '0');

    if (storedDate !== currentDate) {
      localStorage.setItem('lastMessageDate', currentDate);
      localStorage.setItem('messageCount', '0');
    } else if (messageCount >= MAX_MESSAGES_PER_DAY) {
      alert('Sorry, you have reached the maximum number of messages for today.');
      return;
    }

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

    const messageToSend = [...aiMessages, {
      role: 'user',
      content: `ROLE: You are an expert at analyzing text and answering questions on it.
-------
TASK:
1. The user will provide a text from a PDF. Take the personality of the character that
would be the most fiting to be an expert on the material of the text.
(e.g. if you get a text about chemistry, your personality should be that of a chemistry teacher.)
2. Answer to the user's questions based on it. Your replies are short (less than 150 characters) and to the point, unless
specified otherwise.
-------
PDF TEXT: ${pdfText}
-------
USER MESSAGE: ${message}` 
    }];

    const response = await fetchOpenAIResponse({
      messages: messageToSend, 
      setMessage: (msg) => setChatMessages(messages => 
        [...messages.slice(0, messages.length-1), {
          author: aiAuthor,
          text: msg,
          type: 'text',
          timestamp: +new Date()
        }]
      ),
      setError: (error) => {
        if (error.status === 401) {
          openSignUp();
        }
      }
    });
    setAiMessages(messages => [...messages, {role: 'user', content: message }, {role: 'assistant', content: response }]);

    localStorage.setItem('messageCount', (messageCount + 1).toString());
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
        <input name="input-field" type="text" placeholder="Ask anything" onChange={(e) => setInput(e.target.value)} value={input} />
        <button type="submit" className="send-button" />
      </form>
    </div>
  );
}

export default Chat;