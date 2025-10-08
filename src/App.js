import React, { useState, useEffect } from 'react';
import './App.css';
import UploadSection from './components/UploadSection';
import SavedPapers from './components/SavedPapers';
import QuizViewer from './components/QuizViewer';
import { getPapers } from './lib/supabase';

function App() {
  const [savedPapers, setSavedPapers] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);

  // Load saved papers from Supabase on app start
  useEffect(() => {
    const loadPapers = async () => {
      try {
        const papers = await getPapers();
        const formattedPapers = papers.map(paper => ({
          id: paper.id,
          name: paper.name,
          pdfFilename: paper.pdf_filename,
          answerKey: paper.answer_key,
          questionCount: paper.question_count,
          createdAt: new Date(paper.created_at).toLocaleDateString()
        }));
        setSavedPapers(formattedPapers);
      } catch (error) {
        console.error('Error loading papers:', error);
        // Fallback to localStorage for development
        const saved = localStorage.getItem('savedPapers');
        if (saved) {
          setSavedPapers(JSON.parse(saved));
        }
      }
    };
    
    loadPapers();
  }, []);

  const handleSavePaper = (paperData) => {
    setSavedPapers([paperData, ...savedPapers]);
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