import React, { useState } from 'react';

// Компонент принимает объект карточки (card), а также функции редактирования и удаления из App.jsx
const FlashCard = ({ card, onEdit, onDelete }) => {
  // Локальный стейт: перевернута ли конкретно эта карточка прямо сейчас
  const [isFlipped, setIsFlipped] = useState(false);

  // Извлекаем нужные переменные из объекта слова
  const { 
    word, translation, example, exampleTranslation, 
    levelStr, partOfSpeech, topic, stats, reviewLvl, nextReview 
  } = card;

  const correct = stats ? stats.correct : 0;
  const wrong = stats ? stats.wrong : 0;
  const currentLvl = reviewLvl || 1;

  // Проверка: нужно ли повторять слово прямо сейчас
  const isDue = nextReview ? new Date(nextReview) <= new Date() : true;

  // Вычисляем CSS-классы в зависимости от прогресса слова
  let dueClass = '';
  if (currentLvl === 6) dueClass = 'archived-card';
  else if (isDue) dueClass = 'due-card';

  // Метод озвучки английского слова (Web Speech API)
  const handleSpeak = (e) => {
    e.stopPropagation(); // 🧠 Блокируем всплытие клика, чтобы карточка не переворачивалась!
    if (!word) return;
    
    window.speechSynthesis.cancel(); // Сбрасываем прошлый звук
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Слегка замедленный темп для учебного восприятия
    window.speechSynthesis.speak(utterance);
  };

  // Метод безопасного переворота карточки по клику
  const handleFlip = () => {
    // Запрещаем переворачивать полностью выученные (архивные) слова
    if (currentLvl === 6) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="card-container">
      <div 
        className={`card ${dueClass} ${isFlipped ? 'flipped' : ''}`} 
        onClick={handleFlip}
      >
        {/* === ЛИЦЕВАЯ СТОРОНА КАРТОЧКИ === */}
        <div className="card-front">
          <div className="card-header-row">
            <div className="card-header-tags">
              <span className="tag-mini tag-lvl">{levelStr || 'A1'}</span>
              <span className="tag-mini tag-pos">{partOfSpeech || 'Сущ.'}</span>
              <span className="tag-mini tag-topic">{topic || 'Общее'}</span>
            </div>
          </div>
          
          <div className="card-content">
            <div className="main-card-word-row">
              <span className="main-card-word">{word}</span>
              <button className="audio-btn inline-audio" onClick={handleSpeak}>🔊</button>
            </div>
            {example && <div className="card-example-box">“{example}”</div>}
          </div>
          
          <div className="card-footer-row">
            {currentLvl === 6 ? (
              <div className="master-badge">🥇 Выучено</div>
            ) : (
              <div className={`lvl-badge lvl-badge-${currentLvl}`}>{currentLvl}</div>
            )}
            <div className="card-stats">
              <span className="stat-ok">✓ {correct}</span>
              <span className="stat-fail">✗ {wrong}</span>
            </div>
            <div className="card-toolbar">
              <button 
                className="icon-btn btn-edit" 
                title="Редактировать" 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                ✏️
              </button>
              <button 
                className="icon-btn btn-delete" 
                title="Удалить" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        {/* === ОБРАТНАЯ СТОРОНА КАРТОЧКИ === */}
        <div className="card-back">
          <div className="card-header-row">
            <div className="card-header-tags">
              <span className="tag-mini tag-lvl">{levelStr || 'A1'}</span>
              <span className="tag-mini tag-pos">{partOfSpeech || 'Сущ.'}</span>
              <span className="tag-mini tag-topic">{topic || 'Общее'}</span>
            </div>
          </div>
          
          <div className="card-content">
            <div className="main-card-word target-translation">{translation}</div>
            {exampleTranslation && (
              <div className="card-example-box translation-box">({exampleTranslation})</div>
            )}
          </div>
          
          <div className="card-footer-row">
            {currentLvl === 6 ? (
              <div className="master-badge">🥇 Выучено</div>
            ) : (
              <div className={`lvl-badge lvl-badge-${currentLvl}`}>{currentLvl}</div>
            )}
            <div className="card-stats">
              <span className="stat-ok">✓ {correct}</span>
              <span className="stat-fail">✗ {wrong}</span>
            </div>
            <div className="card-toolbar">
              <button 
                className="icon-btn btn-edit" 
                title="Редактировать" 
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                ✏️
              </button>
              <button 
                className="icon-btn btn-delete" 
                title="Удалить" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
