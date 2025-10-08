import React from 'react';

const SavedPapers = ({ papers, onOpenQuiz }) => {
  if (papers.length === 0) {
    return (
      <div className="card">
        <h2>📚 Saved Papers</h2>
        <p style={{ textAlign: 'center', opacity: 0.7, padding: '40px 0' }}>
          No saved papers yet. Upload your first quiz above!
        </p>
      </div>
    );
  }

  return (
    <div className="card saved-papers">
      <h2>📚 Saved Papers ({papers.length})</h2>
      <div className="papers-grid">
        {papers.map((paper) => (
          <div 
            key={paper.id} 
            className="paper-card"
            onClick={() => onOpenQuiz(paper)}
          >
            <div className="paper-title">{paper.name}</div>
            <div className="paper-info">
              📄 PDF: {paper.pdfFilename || 'PDF file'}
            </div>
            <div className="paper-info">
              🔑 Questions: {paper.questionCount}
            </div>
            <div className="paper-info">
              📅 Created: {paper.createdAt}
            </div>
            <div style={{ 
              marginTop: '15px', 
              padding: '8px 15px', 
              background: 'rgba(76, 175, 80, 0.2)', 
              borderRadius: '5px', 
              textAlign: 'center',
              fontSize: '0.9rem'
            }}>
              Click to start quiz →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPapers;