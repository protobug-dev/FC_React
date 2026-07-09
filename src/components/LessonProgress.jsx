import React from 'react';

const LessonProgress = ({ currentIndex, totalLength }) => {
  const progressPercent = totalLength > 0 ? (currentIndex / totalLength) * 100 : 0;

  return (
    <>
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
      </div>
      <h3>Вопрос {currentIndex + 1} из {totalLength}</h3>
    </>
  );
};

export default LessonProgress;
