import React, { useState } from 'react';
import type { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';
import styles from '../styles/PdfUploader.module.css';
import { MdCloudUpload } from "react-icons/md";

type Props = {
  setPdfText: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | undefined>>;
};

const PdfUploader: React.FC<Props> = ({ setPdfText, setSelectedFile }) => {
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mergeTextContent = (textContent: TextContent) => {
    return textContent.items
      .map((item) => {
        const { str, hasEOL } = item as TextItem;
        return str + (hasEOL ? '\n' : '');
      })
      .join('');
  };

  const readPdf = async (pdfFile: File | undefined) => {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

    if (!pdfFile) return;
    setSelectedFile(pdfFile);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result;
      if (arrayBuffer && arrayBuffer instanceof ArrayBuffer) {
        const loadingTask = pdfjs.getDocument(new Uint8Array(arrayBuffer));
        loadingTask.promise.then(
          (pdfDoc) => {
            const numPages = pdfDoc.numPages;
            if (numPages > 4) {
              alert('Please note that due to the limitations of our free service, only the first 4 pages will be considered for processing.');
            }
            for(let i = 1; i <= Math.min(numPages, 4); i++) {
              pdfDoc.getPage(i).then((page) => {
                page.getTextContent().then((textContent) => {
                  const extractedText = mergeTextContent(textContent);
                  setPdfText(text => {
                    if (text == '') return `PAGE ${i}:\n\n${extractedText}\n------\n`;
                    return `${text}\n\nPAGE ${i}:\n\n${extractedText}\n------\n`;
                  });
                });
              });
            }
          },
          (reason) => {
            console.error(`Error during PDF loading: ${reason}`);
          }
        );
      }
    };
    reader.readAsArrayBuffer(pdfFile);
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setPdfText('');
    setError('');
    setIsLoading(true);

    try {
      const items = event.dataTransfer.items;

      if (!items || items.length !== 1) {
        throw new Error('Please drop a single file.');
      }
      const item = items[0];

      if (item.kind !== 'file' || item.type !== 'application/pdf') {
        throw new Error('Please drop a single PDF file.');
      }
      const file = item.getAsFile();

      if (!file) {
        throw new Error("The PDF wasn't uploaded correctly.");
      }
      await readPdf(file);
    } catch (error) {
      setError('There was an error reading the PDF. Please try again.');
    } finally {
      setIsLoading(false);
      setIsDragOver(false);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleButtonUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setIsLoading(true);
    setPdfText('');

    try {
      const file = event.target.files?.[0];
      if (!file) {
        setError("The PDF wasn't uploaded correctly.");
        setIsLoading(false);
        return;
      }
      await readPdf(file);
    } catch (error) {
      setError('There was an error reading the resume. Please try again.');
    }
  };

  return (
    <>
      <div
        className={`${styles.fileUploadBtnContainer} ${isDragOver ? styles.dragOver : ''}`}
        onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e)}
        onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e)}
        onDragEnter={(e: React.DragEvent<HTMLDivElement>) => handleDragEnter(e)}
      >
        {isLoading ? (
          <div className="loading-spinner"></div>
        ) : (
          <>
            <input
              type="file"
              id="file-upload"
              onChange={handleButtonUpload}
              accept="application/pdf"
              hidden
            />
            <label htmlFor="file-upload" className={`${styles.label} ${styles.mainBtn}`}>
              <MdCloudUpload /> Upload your PDF
            </label>
          </>
        )}
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </>
  );
};

export default PdfUploader;