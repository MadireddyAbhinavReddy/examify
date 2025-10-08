import React, { useState } from 'react';
import { uploadPDF, savePaper } from '../lib/supabase';

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

  const saveToSupabase = async (pdfFile, answerKey, paperName) => {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const pdfFilename = `${paperName.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.pdf`;
      
      console.log('🚀 Starting Supabase upload process...');
      console.log('📄 PDF File:', pdfFile.name, 'Size:', pdfFile.size, 'bytes');
      console.log('🔑 Answer Key:', Object.keys(answerKey).length, 'questions');
      console.log('📝 Generated filename:', pdfFilename);
      
      // Upload PDF to Supabase Storage
      console.log('📤 Uploading PDF to Supabase Storage...');
      const uploadResult = await uploadPDF(pdfFile, pdfFilename);
      console.log('✅ PDF Upload successful:', uploadResult);
      
      // Save paper data to Supabase Database
      const paperData = {
        name: paperName,
        pdf_filename: pdfFilename,
        answer_key: answerKey,
        question_count: Object.keys(answerKey).length,
        created_at: new Date().toISOString()
      };
      
      console.log('💾 Saving paper metadata to database...');
      console.log('📊 Paper data:', paperData);
      const savedPaper = await savePaper(paperData);
      console.log('✅ Database save successful:', savedPaper);
      
      return {
        id: savedPaper.id,
        name: savedPaper.name,
        pdfFilename: savedPaper.pdf_filename,
        answerKey: savedPaper.answer_key,
        questionCount: savedPaper.question_count,
        createdAt: new Date(savedPaper.created_at).toLocaleDateString()
      };
    } catch (error) {
      console.error('❌ Error saving to Supabase:', error);
      console.error('Error details:', error.message);
      if (error.details) console.error('Error details:', error.details);
      if (error.hint) console.error('Error hint:', error.hint);
      throw error;
    }
  };

  const handleSave = async () => {
    if (!pdfFile || !answerKey || !paperName.trim()) {
      alert('Please upload both files and enter a paper name');
      return;
    }

    try {
      console.log('Saving to Supabase...');
      const savedPaper = await saveToSupabase(pdfFile, answerKey, paperName);
      
      onSave(savedPaper);

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