# PDF Quiz Manager

A React application for creating interactive quizzes from PDF files with JSON answer keys.

## Features

- 📄 Upload PDF files containing quiz questions
- 🔑 Upload JSON answer keys with question details
- 💾 Save and manage multiple quiz papers
- 📱 Mobile-responsive design
- 🎯 Interactive quiz taking with immediate feedback
- 📊 Score tracking and detailed results

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Answer Key Format

The JSON answer key should follow this structure:

```json
{
  "1": {
    "questionType": "MCQ",
    "answer": "A",
    "marks": 2
  },
  "2": {
    "questionType": "INTEGER",
    "answer": "42",
    "marks": 4
  }
}
```

### Question Types Supported:
- **MCQ**: Multiple Choice Questions (A, B, C, D)
- **MSQ**: Multiple Select Questions (A, B, C, D)
- **INTEGER**: Numerical integer answers
- **NUMERICAL**: Decimal number answers

### Required Fields:
- `questionType`: Type of question (MCQ, MSQ, INTEGER, NUMERICAL)
- `answer`: Correct answer
- `marks`: Points awarded for correct answer

## Usage

1. **Upload Quiz**: 
   - Enter a name for your quiz paper
   - Upload a PDF file containing questions
   - Upload a JSON file with the answer key
   - Click "Save Quiz Paper"

2. **Take Quiz**:
   - Click on any saved paper to start the quiz
   - View the PDF and answer questions one by one
   - Get immediate feedback after each answer
   - View final score and detailed results

3. **Question Navigation**:
   - Answer each question using the provided interface
   - MCQ/MSQ: Click on A, B, C, or D buttons
   - INTEGER/NUMERICAL: Enter your answer in the input box
   - Click "Submit Answer" to see if you're correct
   - Click "Next Question" to continue

## Mobile Support

The app is fully responsive and works great on mobile devices with:
- Touch-friendly interface
- Optimized layouts for small screens
- Easy PDF viewing and navigation

## Sample Files

Check `sample-answer-key.json` for an example of the correct JSON format.

## Technologies Used

- React 18
- CSS3 with responsive design
- File API for PDF and JSON handling
- Local storage for quiz management