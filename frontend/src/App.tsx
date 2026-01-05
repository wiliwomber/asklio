import PdfUploadForm from "./components/PdfUploadForm";

function App() {
  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">AskLio</p>
          <h1>Upload a procurement PDF</h1>
          <p className="lede">
            Select a PDF document and send it to the backend. Only valid PDF files are accepted.
          </p>
        </div>
      </header>

      <main className="content">
        <PdfUploadForm />
      </main>
    </div>
  );
}

export default App;
