import React, { useState, useEffect } from 'react';
import './QuizViewer.css';
import { getPDFUrl } from '../lib/supabase';

const QuizViewer = ({ quiz, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [answerKey, setAnswerKey] = useState({});
  const [loading, setLoading] = useState(true);
  const [showQuestionNav, setShowQuestionNav] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    // Ensure proper mobile viewport behavior
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
    
    const loadQuizData = async () => {
      try {
        // Load PDF from Supabase
        console.log('Loading PDF from Supabase:', quiz.pdfFilename);
        const pdfUrl = await getPDFUrl(quiz.pdfFilename);
        console.log('PDF URL:', pdfUrl);
        setPdfUrl(pdfUrl);

        // Answer key is already in the quiz object from Supabase
        if (quiz.answerKey) {
          setAnswerKey(quiz.answerKey);
        } else {
          console.error('No answer key found in quiz data');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        
        // Fallback to localStorage for development
        try {
          const pdfData = localStorage.getItem(`papers/${quiz.pdfFilename}`);
          if (pdfData) {
            const fileData = JSON.parse(pdfData);
            setPdfUrl(fileData.data);
          }
          
          const keyData = localStorage.getItem(`keys/${quiz.jsonFilename}`);
          if (keyData) {
            const parsedKey = JSON.parse(keyData);
            setAnswerKey(parsedKey);
          }
          
          setLoading(false);
        } catch (fallbackError) {
          console.error('Fallback loading failed:', fallbackError);
          alert('Error loading quiz data');
          onBack();
        }
      }
    };

    loadQuizData();
  }, [quiz, onBack]);

  const questions = Object.keys(answerKey).sort((a, b) => parseInt(a) - parseInt(b));
  const currentQuestionData = answerKey[currentQuestion];

  const handleAnswerChange = (answer) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestion]: answer
    });
  };

  const handleNext = () => {
    if (showResult) {
      // Update current score if answer was correct
      if (isCorrect()) {
        setCurrentScore(prev => prev + currentQuestionData.marks);
      }
      
      // Move to next question after showing result
      if (currentQuestion < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
        setShowResult(false);
      } else {
        // Quiz completed
        calculateFinalScore();
      }
    } else {
      // Show result for current question
      setShowResult(true);
    }
  };

  const handleQuestionJump = (questionNum) => {
    setCurrentQuestion(parseInt(questionNum));
    setShowResult(false);
    setShowQuestionNav(false);
  };

  const getQuestionStatus = (qNum) => {
    if (userAnswers[qNum]) {
      return 'answered';
    }
    return 'unanswered';
  };

  const calculateFinalScore = () => {
    let score = 0;
    questions.forEach(qNum => {
      const questionData = answerKey[qNum];
      const userAnswer = userAnswers[qNum];
      if (userAnswer === questionData.answer) {
        score += questionData.marks;
      }
    });
    setTotalScore(score);
  };

  const isCorrect = () => {
    const userAnswer = userAnswers[currentQuestion];
    return userAnswer === currentQuestionData?.answer;
  };

  const renderAnswerOptions = () => {
    if (!currentQuestionData) return null;

    const questionType = currentQuestionData.questionType?.toLowerCase();
    const userAnswer = userAnswers[currentQuestion];
    const correctAnswer = currentQuestionData.answer;

    if (questionType === 'mcq' || questionType === 'msq') {
      const options = ['A', 'B', 'C', 'D'];
      return (
        <div className="answer-options">
          {options.map(option => {
            let className = 'option-btn';
            
            if (showResult) {
              if (option === correctAnswer) {
                className += ' correct-option';
              }
              if (option === userAnswer && option !== correctAnswer) {
                className += ' wrong-option';
              }
            } else if (userAnswer === option) {
              className += ' selected';
            }

            return (
              <button
                key={option}
                className={className}
                onClick={() => handleAnswerChange(option)}
                disabled={showResult}
              >
                {option}
                {showResult && option === correctAnswer && ' ✓'}
                {showResult && option === userAnswer && option !== correctAnswer && ' ✗'}
              </button>
            );
          })}
        </div>
      );
    } else if (questionType === 'integer' || questionType === 'numerical') {
      return (
        <div className="answer-input">
          <input
            type="number"
            placeholder="Enter your answer"
            value={userAnswers[currentQuestion] || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            disabled={showResult}
            className={`number-input ${showResult ? (userAnswer === correctAnswer ? 'correct-input' : 'wrong-input') : ''}`}
          />
          {showResult && (
            <div className="input-feedback">
              {userAnswer === correctAnswer ? (
                <span className="correct-feedback">✓ Correct</span>
              ) : (
                <span className="wrong-feedback">✗ Correct answer: {correctAnswer}</span>
              )}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
          <h1>Loading Quiz...</h1>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '1.2rem'
        }}>
          📄 Loading quiz data...
        </div>
      </div>
    );
  }

  if (currentQuestion > questions.length) {
    // Quiz completed - show final results
    const maxScore = questions.reduce((sum, qNum) => sum + answerKey[qNum].marks, 0);
    
    return (
      <div className="quiz-container">
        <div className="quiz-header">
          <button className="back-btn" onClick={onBack}>
            ← Back to Home
          </button>
          <h1>🎉 Quiz Completed!</h1>
        </div>
        
        <div className="final-results">
          <div className="score-display">
            <h2>Your Final Score</h2>
            <div className="score-circle">
              <span className="score">{totalScore}</span>
              <span className="max-score">/ {maxScore}</span>
            </div>
            <div className="percentage">
              {Math.round((totalScore / maxScore) * 100)}%
            </div>
          </div>
          
          <div className="question-summary">
            <h3>Question Summary</h3>
            {questions.map(qNum => {
              const questionData = answerKey[qNum];
              const userAnswer = userAnswers[qNum];
              const correct = userAnswer === questionData.answer;
              
              return (
                <div key={qNum} className={`summary-item ${correct ? 'correct' : 'incorrect'}`}>
                  <span>Q{qNum}: {correct ? '✅' : '❌'}</span>
                  <span>Your answer: {userAnswer || 'Not answered'}</span>
                  <span>Correct: {questionData.answer}</span>
                  <span>Marks: {correct ? questionData.marks : 0}/{questionData.marks}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Home
        </button>
        <h1>{quiz.name}</h1>
        <div className="progress-info">
          <div className="progress">
            Q {currentQuestion}/{questions.length}
          </div>
          <div className="current-score">
            Score: {currentScore}/{questions.reduce((sum, qNum) => sum + answerKey[qNum]?.marks || 0, 0)}
          </div>
        </div>
      </div>

      <div className="quiz-content">
        <div className="pdf-viewer">
          {pdfUrl ? (
            <>
              {/* Mobile-only PDF Controls */}
              <div className="mobile-pdf-controls">
                <div className="mobile-page-controls">
                  <button 
                    className="mobile-control-btn"
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(Math.max(1, currentPage - 1));
                    }}
                    disabled={currentPage <= 1}
                  >
                    ← Prev
                  </button>
                  <span className="mobile-page-info">Page {currentPage}</span>
                  <button 
                    className="mobile-control-btn"
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(currentPage + 1);
                    }}
                  >
                    Next →
                  </button>
                </div>
                <div className="mobile-zoom-controls">
                  <button 
                    className="mobile-control-btn"
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      setZoomLevel(Math.max(50, zoomLevel - 25));
                    }}
                  >
                    🔍-
                  </button>
                  <span className="mobile-zoom-info">{zoomLevel}%</span>
                  <button 
                    className="mobile-control-btn"
                    onTouchStart={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      setZoomLevel(Math.min(200, zoomLevel + 25));
                    }}
                  >
                    🔍+
                  </button>
                </div>
              </div>
              
              {/* Desktop PDF with 150% zoom */}
              <iframe
                src={`${pdfUrl}#zoom=150`}
                title="Quiz PDF"
                className="pdf-iframe desktop-pdf"
                width="100%"
                height="100%"
                style={{ border: 'none', borderRadius: '10px' }}
              />
              
              {/* Mobile PDF with native gestures enabled */}
              <div className="mobile-pdf-container">
                <iframe
                  key={`${currentPage}-${zoomLevel}`}
                  src={`${pdfUrl}#page=${currentPage}&zoom=${zoomLevel}&view=FitH`}
                  title="Quiz PDF"
                  className="pdf-iframe mobile-pdf"
                  width="100%"
                  height="100%"
                  style={{ 
                    border: 'none', 
                    borderRadius: '0 0 10px 10px',
                    touchAction: 'pan-x pan-y pinch-zoom'
                  }}
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '1rem'
            }}>
              📄 Loading PDF...
            </div>
          )}
        </div>

        <div className="answer-panel">
          <div className="question-info">
            <div className="question-header">
              <h3>Question {currentQuestion}</h3>
              <button 
                className="nav-toggle-btn"
                onClick={() => setShowQuestionNav(!showQuestionNav)}
                title="Question Navigation"
              >
                📋
              </button>
            </div>
            {currentQuestionData && (
              <>
                <p>Type: {currentQuestionData.questionType}</p>
                <p>Marks: {currentQuestionData.marks}</p>
              </>
            )}
          </div>

          {showQuestionNav && (
            <div className="question-nav-panel">
              <div className="nav-header">
                <span>Jump to Question:</span>
                <button 
                  className="nav-close-btn"
                  onClick={() => setShowQuestionNav(false)}
                >
                  ✕
                </button>
              </div>
              <div className="question-grid">
                {questions.map(qNum => (
                  <button
                    key={qNum}
                    className={`question-nav-btn ${
                      parseInt(qNum) === currentQuestion ? 'current' : ''
                    } ${getQuestionStatus(qNum)}`}
                    onClick={() => handleQuestionJump(qNum)}
                  >
                    {qNum}
                  </button>
                ))}
              </div>
              <div className="nav-legend">
                <span className="legend-item">
                  <span className="legend-dot answered"></span>
                  Answered
                </span>
                <span className="legend-item">
                  <span className="legend-dot current"></span>
                  Current
                </span>
                <span className="legend-item">
                  <span className="legend-dot unanswered"></span>
                  Unanswered
                </span>
              </div>
            </div>
          )}

          {renderAnswerOptions()}

          {showResult && (
            <div className={`result-compact ${isCorrect() ? 'correct' : 'incorrect'}`}>
              <div className="result-line">
                <span className="result-icon">{isCorrect() ? '✅' : '❌'}</span>
                <span className="result-text">{isCorrect() ? 'Correct!' : 'Wrong'}</span>
                <span className="marks-compact">+{isCorrect() ? currentQuestionData?.marks : 0}</span>
              </div>
              
              {!isCorrect() && (
                <div className="answer-line">
                  <span>You: <span className="wrong-answer">{userAnswers[currentQuestion]}</span></span>
                  <span>Correct: <span className="right-answer">{currentQuestionData?.answer}</span></span>
                </div>
              )}
            </div>
          )}

          <button 
            className="next-btn"
            onClick={handleNext}
            disabled={!userAnswers[currentQuestion] && !showResult}
          >
            {showResult 
              ? (currentQuestion < questions.length ? 'Next Question →' : 'View Final Results')
              : 'Submit Answer'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizViewer;