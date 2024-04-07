import { Document, Page, pdfjs } from 'react-pdf';
import { useState } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ file }: { file: File }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  return (
    <div>
      <header style={{ textAlign: 'center', margin: '10px 0', position: 'sticky', top: 0, zIndex: 1000 }}>
        {pageNumber}/{numPages}
      </header>
      <div style={{ height: '80vh', overflowY: 'scroll' }}>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="pdf-document">
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              className="pdf-page"
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
