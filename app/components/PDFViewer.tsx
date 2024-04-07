import { Document, Page, pdfjs } from 'react-pdf';
import { useState, useEffect, useRef } from 'react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = ({ file }: { file: File }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const observer = useRef<IntersectionObserver>();
  const pageElementsRef = useRef<(HTMLDivElement | null)[]>([]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    pageElementsRef.current = pageElementsRef.current.slice(0, numPages);
  }

  // The only purpose of this useEffect is so that the page number would update dynamically while scrolling
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5, // Adjust the threshold to when you consider the page is visible
    };

    observer.current = new IntersectionObserver((entries) => {
      const visiblePage = entries.find(entry => entry.isIntersecting);
      if (visiblePage) {
        setPageNumber(Number(visiblePage.target.getAttribute('data-page-number')));
      }
    }, options);

    const { current: currentObserver } = observer;

    pageElementsRef.current.forEach((page) => {
      if (page) currentObserver.observe(page);
    });

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [numPages]); // Reinitialize observer when numPages changes

  return (
    <div>
      <header style={{ textAlign: 'center', margin: '10px 0', position: 'sticky', top: 0, zIndex: 1000 }}>
        {pageNumber}/{numPages}
      </header>
      <div style={{ height: '80vh', overflowY: 'scroll' }}>
        <Document file={file} onLoadSuccess={onDocumentLoadSuccess} className="pdf-document">
          {Array.from(new Array(numPages), (el, index) => (
            <div ref={el => pageElementsRef.current[index] = el} data-page-number={index + 1} key={index}>
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                className="pdf-page"
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
