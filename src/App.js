import React, { useState, useEffect } from 'react';
import './App.css';
import UploadSection from './components/UploadSection';
import SavedPapers from './components/SavedPapers';
import QuizViewer from './components/QuizViewer';

function App() {
  const [savedPapers, setSavedPapers] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Load saved papers from localStorage on app start
  useEffect(() => {
    const saved = localStorage.getItem('savedPapers');
    if (saved) {
      setSavedPapers(JSON.parse(saved));
    }
  }, []);

  const handleSavePaper = (paperData) => {
    const newPaper = {
      id: Date.now(),
      name: paperData.name,
      pdfFilename: paperData.pdfFilename,
      jsonFilename: paperData.jsonFilename,
      questionCount: paperData.questionCount,
      createdAt: new Date().toLocaleDateString()
    };
    setSavedPapers([...savedPapers, newPaper]);
    
    // Also save to localStorage for persistence
    const allPapers = [...savedPapers, newPaper];
    localStorage.setItem('savedPapers', JSON.stringify(allPapers));
  };

  const handleOpenQuiz = (paper) => {
    setCurrentQuiz(paper);
    setShowQuiz(true);
  };

  const handleBackToHome = () => {
    setShowQuiz(false);
    setCurrentQuiz(null);
  };

  if (showQuiz && currentQuiz) {
    return (
      <QuizViewer 
        quiz={currentQuiz} 
        onBack={handleBackToHome}
      />
    );
  }

  return (
    <div className="App">
      <div className="container">
        <header className="app-header">
          <h1>📄 PDF Quiz Manager</h1>
          <p>Upload PDFs and answer keys to create interactive quizzes</p>
        </header>
        
        <UploadSection onSave={handleSavePaper} />
        <SavedPapers papers={savedPapers} onOpenQuiz={handleOpenQuiz} />
      </div>
    </div>
  );
}

export default App;