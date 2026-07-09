import React from 'react';
import './LessonBox.css';

const LessonChoices = ({ choices, onCheck, isDisabled }) => {
  return (
    <div className="choices-grid">
      {/* ИСПРАВЛЕНО: выводим саму строку choice вместо choice.word */}
      {choices.map((choice, i) => (
        <button 
          key={i} 
          className="choice-btn"
          onClick={() => onCheck(choice)}
          disabled={isDisabled}
        >
          {choice}
        </button>
      ))}
    </div>
  );
};

export default LessonChoices;
