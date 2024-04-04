import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import PdfUploader from './PdfUploader';

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState<string>();
  const [pdfText, setPdfText] = useState<string>('');
  console.log('pdfText:', pdfText);

  useEffect(() => {
    const startInterview = async (text: string) => {
      const messageToSend = `PDF TEXT: ${pdfText}`;
      await fetchOpenAIResponse({
        messages: [{role: 'user', content: messageToSend }],
        setMessage: (msg) => setInitialText(msg)});
    }

    if (isLoading && pdfText !== '') {
      startInterview(pdfText).then(() => {
        setIsLoading(false);
        setShowChat(true);
      });
    }
  }, [pdfText]);

  return (
    <div className="form-wrapper">
      <p className="instructions-text">{!showChat ? 'Start the interview with Bob The Interviewer.' : 'Answer Bob\'s questions.'}</p>
      {!showChat ? (
        <div className='request-form-wrapper'>
          <PdfUploader setIsLoading={setIsLoading} setPdfText={setPdfText} />
          {isLoading && <div className="loading-spinner"></div>}
        </div>
      ) : (
        <Chat initialText={initialText} pdfText={pdfText} />
      )}
    </div>
  );
};

export default ResumeUploader;
