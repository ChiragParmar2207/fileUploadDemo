import { useState } from 'react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="App">
      <div className="app-header">
        <h1>File Upload System</h1>
        <p className="app-subtitle">
          Upload and manage files across AWS S3, Cloudinary, and Local Storage
        </p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Files
        </button>
        <button
          className={`tab-btn ${activeTab === 'view' ? 'active' : ''}`}
          onClick={() => setActiveTab('view')}
        >
          View Files
        </button>
      </div>

      <div className="tab-content">{activeTab === 'upload' ? <FileUpload /> : <FileDisplay />}</div>
    </div>
  );
}

export default App;
