import React, { useState, useEffect } from 'react';
import { useEnigmaStore } from '../store/enigmaStore';

export function EduModal() {
  const quiz = useEnigmaStore((state) => state.activeQuiz);
  const solveQuiz = useEnigmaStore((state) => state.solveQuiz);
  const closeQuiz = useEnigmaStore((state) => state.closeQuiz);

  const [selectedIdx, setSelectedIdx] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'

  // Reset state when quiz changes
  useEffect(() => {
    setSelectedIdx(null);
    setFeedback('');
    setFeedbackType('');
  }, [quiz]);

  if (!quiz) return null;

  const handleSelect = (idx) => {
    if (selectedIdx !== null) return; // already answered
    setSelectedIdx(idx);

    if (idx === quiz.correct) {
      setFeedback(quiz.successMsg);
      setFeedbackType('success');
      // Reward XP after a tiny delay
      setTimeout(() => {
        solveQuiz(true, 100);
      }, 2000);
    } else {
      setFeedback(quiz.failMsg);
      setFeedbackType('error');
    }
  };

  return (
    <div className="modal-backdrop active">
      <div className="modal-box">
        <div className="modal-header">
          <h2>{quiz.title}</h2>
          <button className="close-btn" onClick={closeQuiz}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{quiz.desc}</p>
          
          <div className="quiz-container">
            <div className="quiz-question">{quiz.question}</div>
            <div className="quiz-options">
              {quiz.options.map((opt, idx) => {
                let btnClass = 'option-btn';
                if (selectedIdx !== null) {
                  if (idx === quiz.correct) {
                    btnClass += ' correct';
                  } else if (idx === selectedIdx) {
                    btnClass += ' incorrect';
                  }
                }
                return (
                  <button 
                    key={idx}
                    className={btnClass}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedIdx !== null}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
            {feedback && (
              <div className={`feedback-area ${feedbackType}`}>
                {feedback}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
