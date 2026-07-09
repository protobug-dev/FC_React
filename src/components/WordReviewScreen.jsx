import React, { useEffect } from 'react';

const WordReviewScreen = ({ card, feedbackType, onNext, onLaunchHard }) => {
  
  // Слушатель Enter для быстрого переключения экрана-разбора по кнопке "Далее"
  useEffect(() => {
    const handleReviewEnter = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleReviewEnter);
    return () => window.removeEventListener('keydown', handleReviewEnter);
  }, [onNext]);

  const handleSpeak = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(card.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="panel test-box review-screen-layout">
      <div className={`review-status-banner ${feedbackType}`}>
        {feedbackType === 'success' ? '🎉 Правильный ответ!' : '❌ Ошибка в ответе!'}
      </div>

      <div className="review-card-body">
        <div className="review-word-row">
          <h1 className="review-main-word">{card.word}</h1>
          <button onClick={handleSpeak} className="test-audio-btn">🔊 Слушать</button>
        </div>
        
        <p className="review-translation-label">Перевод:</p>
        <h2 className="review-main-translation">{card.translation}</h2>

        {card.example && (
          <div className="review-example-container">
            <p className="example-title">📝 Пример употребления:</p>
            <p className="example-text">“{card.example}”</p>
            {card.exampleTranslation && <p className="example-subtext">({card.exampleTranslation})</p>}
          </div>
        )}
      </div>

      <div className="review-action-footer">
        <button className="primary-btn" onClick={onNext}>Далее ➡️</button>
        <button className="secondary-hard-trigger" onClick={onLaunchHard}>⚡ Проверить себя (Hard)</button>
      </div>
    </div>
  );
};

export default WordReviewScreen;
