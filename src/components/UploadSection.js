import React, { useState } from 'react';

const UploadSection = ({ onSave }) => {
  const [pdfFile, setPdfFile] = useState(null);
  const [answerKey, setAnswerKey] = useState(null);
  const [paperName, setPaperName] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [jsonInputMethod, setJsonInputMethod] = useState('file'); // 'file' or 'paste'
  const [pastedJson, setPastedJson] = useState('');

  const handlePdfUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const handleJsonUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target.result);
          setAnswerKey(json);
          setPastedJson(''); // Clear pasted JSON when file is uploaded
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid JSON file');
    }
  };

  const handleJsonPaste = (event) => {
    const jsonText = event.target.value;
    setPastedJson(jsonText);
    
    if (jsonText.trim()) {
      try {
        const json = JSON.parse(jsonText);
        setAnswerKey(json);
        console.log('JSON parsed successfully:', json);
        // Clear file input when JSON is pasted
        const fileInput = document.getElementById('json-input');
        if (fileInput) {
          fileInput.value = '';
        }
      } catch (error) {
        console.log('JSON parse error:', error);
        setAnswerKey(null);
      }
    } else {
      setAnswerKey(null);
    }
  };

  const saveFileToFolder = async (file, folder, filename) => {
    // In a real app, you'd save to server. For demo, we'll use localStorage
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileData = {
          name: filename,
          data: e.target.result,
          type: file.type,
          size: file.size
        };
        localStorage.setItem(`${folder}/${filename}`, JSON.stringify(fileData));
        resolve(filename);
      };
      reader.readAsDataURL(file);
    });
  };

  const saveJsonToFolder = (jsonData, filename) => {
    const jsonString = JSON.stringify(jsonData, null, 2);
    localStorage.setItem(`keys/${filename}`, jsonString);
    return filename;
  };

  const handleSave = async () => {
    if (!pdfFile || !answerKey || !paperName.trim()) {
      alert('Please upload both files and enter a paper name');
      return;
    }

    try {
      // Generate unique filenames
      const timestamp = Date.now();
      const pdfFilename = `${paperName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      const jsonFilename = `${paperName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.json`;

      // Save files
      console.log('Saving PDF with filename:', pdfFilename);
      await saveFileToFolder(pdfFile, 'papers', pdfFilename);
      console.log('Saving JSON with filename:', jsonFilename);
      saveJsonToFolder(answerKey, jsonFilename);
      console.log('Files saved successfully');

      onSave({
        name: paperName,
        pdfFilename: pdfFilename,
        jsonFilename: jsonFilename,
        answerKey: answerKey,
        questionCount: Object.keys(answerKey).length
      });

      // Reset form
      setPdfFile(null);
      setAnswerKey(null);
      setPaperName('');
      setPastedJson('');
      setShowSuccess(true);
      
      // Clear file inputs
      document.getElementById('pdf-input').value = '';
      if (document.getElementById('json-input')) {
        document.getElementById('json-input').value = '';
      }

      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert('Error saving files. Please try again.');
      console.error('Save error:', error);
    }
  };

  return (
    <div className="card">
      <h2>📤 Upload New Quiz</h2>
      
      <input
        type="text"
        placeholder="Enter paper name..."
        value={paperName}
        onChange={(e) => setPaperName(e.target.value)}
        className="paper-name-input"
      />

      <div className="upload-section">
        <div className="upload-box" onClick={() => document.getElementById('pdf-input').click()}>
          <span className="upload-icon">📄</span>
          <div className="upload-text">Upload PDF</div>
          <div className="upload-subtext">Click to select PDF file</div>
          <input
            id="pdf-input"
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="file-input"
          />
          {pdfFile && (
            <div className="file-preview">
              ✅ {pdfFile.name}
            </div>
          )}
        </div>

        <div className="json-upload-section">
          <div className="json-method-selector">
            <button 
              className={`method-btn ${jsonInputMethod === 'file' ? 'active' : ''}`}
              onClick={() => setJsonInputMethod('file')}
            >
              📁 Upload File
            </button>
            <button 
              className={`method-btn ${jsonInputMethod === 'paste' ? 'active' : ''}`}
              onClick={() => setJsonInputMethod('paste')}
            >
              📋 Paste JSON
            </button>
          </div>

          {jsonInputMethod === 'file' ? (
            <div className="upload-box" onClick={() => document.getElementById('json-input').click()}>
              <span className="upload-icon">🔑</span>
              <div className="upload-text">Upload Answer Key</div>
              <div className="upload-subtext">Click to select JSON file</div>
              <input
                id="json-input"
                type="file"
                accept=".json"
                onChange={handleJsonUpload}
                className="file-input"
              />
            </div>
          ) : (
            <div className="json-paste-area">
              <textarea
                placeholder="Paste your JSON answer key here...&#10;&#10;Example:&#10;{&#10;  &quot;1&quot;: {&#10;    &quot;questionType&quot;: &quot;MCQ&quot;,&#10;    &quot;answer&quot;: &quot;A&quot;,&#10;    &quot;marks&quot;: 2&#10;  }&#10;}"
                value={pastedJson}
                onChange={handleJsonPaste}
                className="json-textarea"
                rows="8"
              />
            </div>
          )}

          {answerKey && (
            <div className="file-preview">
              ✅ Answer key loaded ({Object.keys(answerKey).length} questions)
            </div>
          )}
        </div>
      </div>

      {/* Debug info - remove in production */}
      <div style={{ 
        fontSize: '0.8rem', 
        opacity: 0.7, 
        marginBottom: '10px',
        background: 'rgba(255,255,255,0.1)',
        padding: '10px',
        borderRadius: '5px'
      }}>
        Debug: PDF: {pdfFile ? '✅' : '❌'} | 
        Answer Key: {answerKey ? '✅' : '❌'} | 
        Paper Name: {paperName.trim() ? '✅' : '❌'}
      </div>

      <button 
        className="save-btn" 
        onClick={handleSave}
        disabled={!pdfFile || !answerKey || !paperName.trim()}
      >
        💾 Save Quiz Paper
      </button>

      {showSuccess && (
        <div className="success-message">
          ✅ Quiz paper saved successfully!
        </div>
      )}
    </div>
  );
};

export default UploadSection;