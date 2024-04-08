'use client';

import React, { useState } from 'react';
import Chat from './components/Chat';
import PdfUploader from './components/PdfUploader';
import PDFViewer from './components/PDFViewer';

export default function Home() {
  const [pdfText, setPdfText] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File>();

  return (
    <main className="App">
      <div className='container'>
        <div className="flex flex-col md:flex-row w-full h-full gap-8 px-4 md:p-0">
          <div className="relative w-full md:w-1/2">
            {pdfText ? 
              <PDFViewer file={selectedFile as File} />
              : <PdfUploader setPdfText={setPdfText} setSelectedFile={setSelectedFile} />
            }
          </div>
          <div className="h-full md:h-auto w-full md:w-1/2">
            <Chat pdfText={pdfText} />
          </div>
        </div>
      </div>
    </main>
  );
}