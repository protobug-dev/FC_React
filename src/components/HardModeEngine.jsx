import React, { useState, useEffect, useRef } from 'react';
import LessonChoices from './LessonChoices';
import LessonInput from './LessonInput';

const HardModeEngine = ({ card, allCards, onClose, onArchive }) => {
  const [step, setStep] = useState(1); // Шаги 1, 2, 3, 4
  const [phase, setPhase] = useState('question'); // 'question' | 'result'
  const [inputValue, setInputValue] = useState('');
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState({ text: '', type: '' });
  
  const hasErrors = useRef(false);
  const isFinished = step > 4;

  const stepConfigs = {
    1: { label: "ШАГ 1/4: Выберите русский перевод", type: "choice:en-ru", isEnToRu: true },
    2: { label: "⚡ ШАГ 2/4: Выберите английское слово", type: "choice:ru-en", isEnToRu: false },
    3: { label: "🔥 ШАГ 3/4: Введите русский перевод руками", type: "typed:en-ru", isEnToRu: true },
    4: { label: "💀 ШАГ 4/4: Наберите английское слово руками", type: "typed:ru-en", isEnToRu: false },
  };

  const currentConfig = stepConfigs[step];

  // Генерация вариантов ответов для шагов 1 и 2 с отсечением синонимов
  useEffect(() => {
    if (isFinished || phase !== 'question' || !currentConfig) return;
    setInputValue('');
    setFeedback({ text: '', type: '' });

    if (currentConfig.type.startsWith('choice:')) {
      const correctAns = currentConfig.isEnToRu 
        ? card.translation.split(',')[0].trim() 
        : card.word.trim();
        
      let pool = allCards.map(c => {
        return currentConfig.isEnToRu ? c.translation.split(',')[0].trim() : c.word.trim();
      }).filter(ans => ans.toLowerCase() !== correctAns.toLowerCase());
      
      let shuffledFakes = [...new Set(pool)].sort(() => Math.random() - 0.5).slice(0, 3);
      setChoices([...shuffledFakes, correctAns].sort(() => Math.random() - 0.5));
    }
  }, [step, phase, isFinished]);

  // Валидатор ответов
  const handleCheck = (chosenAnswer = null) => {
    if (phase === 'result') return;

    const answer = (chosenAnswer || inputValue).trim().toLowerCase();
    
    const validOptions = currentConfig.isEnToRu
      ? card.translation.split(',').map(t => t.trim().toLowerCase())
      : [card.word.trim().toLowerCase()];

    const isCorrect = validOptions.includes(answer);

    if (isCorrect) {
      setFeedback({ text: "Абсолютно верно! ✔️", type: "success" });
    } else {
      hasErrors.current = true;
      const correctDisplay = currentConfig.isEnToRu ? card.translation : card.word;
      setFeedback({ text: `Ошибка! Правильный ответ: ${correctDisplay}`, type: "error" });
    }
    setPhase('result'); 
  };

  // ИСПРАВЛЕНО: Чистый перехватчик Enter для инпутов, полностью исключающий двойной вызов функций
  const handleInputEnterPress = () => {
    if (phase === 'question') {
      handleCheck(); 
    }
  };

  const handleNext = () => {
    setPhase('question');
    setStep(prev => prev + 1);
  };
  // Реф для управления фокусом кнопки "Далее"
  const nextBtnRef = useRef(null);

  // ИСПРАВЛЕНО: Автоматический перевод фокуса на кнопку "Далее" при фазе результата
  useEffect(() => {
    if (phase === 'result' && nextBtnRef.current) {
      setTimeout(() => nextBtnRef.current?.focus(), 50);
    }
  }, [phase]);

  if (isFinished) {
    return (
      <div className="panel test-box hard-mode-layout text-center">
        <h2 className="hard-title-banner">🏁 Результаты Хард-Проверки</h2>
        <div className="hard-summary-card">
          <p className="hard-word-display">Слово: <strong>{card.word}</strong></p>
          {hasErrors.current ? (
            <p className="hard-status-text error">❌ Проверка не пройдена. Были допущены ошибки.</p>
          ) : (
            <p className="hard-status-text success">🥇 Идеально! Все 4 этапа пройдены без единой ошибки!</p>
          )}
        </div>
        <div className="hard-action-footer">
          {!hasErrors.current ? (
            <>
              <button className="primary-btn purple-btn" onClick={() => onArchive(card)}>📥 Убрать из обучения</button>
              <button className="secondary-hard" onClick={() => onClose(true)}>Оставить изучать</button>
            </>
          ) : (
            <button className="primary-btn purple-btn" onClick={() => onClose(false)}>Продолжить урок</button>
          )}
        </div>
      </div>
    );
  }

  const isInputMode = currentConfig?.type?.startsWith('typed:');

  return (
    <div className="panel test-box hard-mode-layout">
      <div className="hard-badge-indicator">⚡ РЕЖИМ ЖЕСТКОЙ ПРОВЕРКИ СЛОВА</div>
      <div className="hard-step-label">{currentConfig?.label}</div>
      
      <div className="hard-target-word">
        {currentConfig?.isEnToRu ? card.word : card.translation}
      </div>

      <div className="hard-interactive-zone">
        {phase === 'question' ? (
          isInputMode ? (
            <LessonInput value={inputValue} onChange={setInputValue} onCheck={handleInputEnterPress} isDisabled={false} isEnToRu={currentConfig.isEnToRu} />
          ) : (
            <LessonChoices choices={choices} onCheck={handleCheck} isDisabled={false} />
          )
        ) : (
          <div className={`hard-feedback-banner ${feedback.type}`}>{feedback.text}</div>
        )}
      </div>

      <div className="hard-footer-controls">
        {phase === 'question' ? (
          isInputMode && <button className="primary-btn purple-btn" onClick={() => handleCheck()}>Проверить</button>
        ) : (
          /* ИСПРАВЛЕНО: Добавлен ref={nextBtnRef} для перехвата фокуса Enter нативно, без багов */
          <button ref={nextBtnRef} className="primary-btn purple-btn" onClick={handleNext}>Далее ➡️</button>
        )}
      </div>
    </div>
  );
};

export default HardModeEngine;
