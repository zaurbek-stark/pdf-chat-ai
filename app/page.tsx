'use client';

import React, { useEffect, useState } from 'react';
import Chat from './components/Chat';
import { fetchOpenAIResponse } from './utils/fetchOpenAIResponse';
import PdfUploader from './components/PdfUploader';
import PDFViewer from './components/PDFViewer';

export default function Home() {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState<string>();
  const [pdfText, setPdfText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File>();
  console.log('pdfText:', pdfText);

  useEffect(() => {
    const startInterview = async (text: string) => {
      const messageToSend = `PDF TEXT: ${pdfText}`;
      await fetchOpenAIResponse({
        messages: [{ role: 'user', content: messageToSend }],
        setMessage: (msg) => setInitialText(msg),
        setError: (error) => console.error(error)
      });
    }

    if (isLoading && pdfText !== '') {
      startInterview(pdfText).then(() => {
        setIsLoading(false);
        setShowChat(true);
      });
    }
  }, [pdfText]);

  return (
    <main className="App">
      <div className='container'>
        <div className="form-wrapper">
          <p className="instructions-text">{!showChat ? 'Start the interview with Bob The Interviewer.' : 'Answer Bob\'s questions.'}</p>
          {!showChat ? (
            <div className='request-form-wrapper'>
              <PdfUploader setIsLoading={setIsLoading} setPdfText={setPdfText} setSelectedFile={setSelectedFile} />
              {isLoading && <div className="loading-spinner"></div>}
            </div>
          ) : (
            <div style={{ display: 'flex', width: '100%' }}>
              <div style={{ width: '50%' }}>
                <PDFViewer file={selectedFile as File} />
              </div>
              <div style={{ width: '50%' }}>
                <Chat initialText={initialText} pdfText={pdfText} />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}