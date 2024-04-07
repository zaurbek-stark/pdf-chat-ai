import React, { useEffect, useState } from 'react';
import Chat from './Chat';
import { fetchOpenAIResponse } from '../utils/fetchOpenAIResponse';
import PdfUploader from './PdfUploader';
import PDFViewer from './PDFViewer';

const ResumeUploader = () => {
  const [showChat, setShowChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialText, setInitialText] = useState<string>();
  const [pdfText, setPdfText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File>();
  console.log('pdfText:', pdfText);

  // TODO: this useEffect can be improved -> since we now handle multi-page pdfs, this useEffect method will be triggered for every page addition -> more API calls -> more cost
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
          <PdfUploader setIsLoading={setIsLoading} setPdfText={setPdfText} setSelectedFile={setSelectedFile} />
          {isLoading && <div className="loading-spinner"></div>}
        </div>
      ) : (
        <div style={{ display: 'flex', height: '100vh' }}>
          <div style={{ flex: '1 0 50%' }}>
            <PDFViewer file={selectedFile as File} />
          </div>
          <div style={{ flex: 1 }}>
            <Chat initialText={initialText} pdfText={pdfText} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUploader;
