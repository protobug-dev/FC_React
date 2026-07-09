import React, { useState, useEffect, useRef } from 'react';
import LessonProgress from './LessonProgress';
import LessonChoices from './LessonChoices';
import LessonInput from './LessonInput';
import WordReviewScreen from './WordReviewScreen';
import HardModeEngine from './HardModeEngine';
import './LessonBox.css';

const LessonBox = ({ cards, activeFilters, lessonSize, onFinish, onAbort }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [choices, setChoices] = useState([]);
  const [isExamFinished, setIsExamFinished] = useState(false);
  
  // Фазы стейт-машины: 'question' | 'review' | 'hard'
  const [phase, setPhase] = useState('question');
  const [lastFeedbackType, setFeedbackType] = useState('success');

  const uniqueCardsCount = useRef(new Set());

  // Сборка интервальной сессии один раз при старте
  useEffect(() => {
    let pool = cards.filter(c => {
      const matchLvl = activeFilters.level === 'all' || c.levelStr === activeFilters.level;
      const matchPos = activeFilters.partOfSpeech === 'all' || c.partOfSpeech === activeFilters.partOfSpeech;
      const matchTopic = activeFilters.topic === 'all' || c.topic === activeFilters.topic;
      return matchLvl && matchPos && matchTopic && c.reviewLvl !== 6;
    });

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    let selected = [...shuffle(pool)].slice(0, lessonSize);

    if (selected.length === 0) { setQueue(null); return; }

    let generatedQueue = selected.map(card => {
      const lvl = card.reviewLvl || 1;
      if (lvl === 1) {
        return { card, type: 'choice:en-ru', isFirstTry: true }; 
      } else if (lvl <= 3) {
        return { card, type: Math.random() > 0.5 ? 'choice:en-ru' : 'choice:ru-en', isFirstTry: true };
      } else {
        return { card, type: Math.random() > 0.5 ? 'typed:en-ru' : 'typed:ru-en', isFirstTry: true };
      }
    });

    setQueue(generatedQueue);
    setCurrentIndex(0);
    setPhase('question');
  }, []);

  const currentTask = queue && queue.length > 0 ? queue[currentIndex] : null;

  // --- ИСПРАВЛЕНО: НАДЁЖНАЯ ГЕНЕРАЦИЯ ВАРИАНТОВ ОТВЕТОВ С ОТСЕЧЕНИЕМ СИНОНИМОВ ---
  useEffect(() => {
    if (!currentTask || isExamFinished || phase !== 'question') return;
    setInputValue('');

    if (currentTask.type.startsWith('choice:')) {
      const isEnToRu = currentTask.type.endsWith('en-ru');
      
      // ИСПРАВЛЕНО: Для кнопки берём только первый синоним до запятой через split(',')[0]
      const correctAns = isEnToRu 
        ? currentTask.card.translation.split(',')[0].trim() 
        : currentTask.card.word.trim();
      
      // Вычищаем синонимы из пула ложных ответов, чтобы на кнопках всегда были одиночные чистые слова
      let poolOfAnswers = cards.map(c => {
        return isEnToRu ? c.translation.split(',')[0].trim() : c.word.trim();
      }).filter(ans => ans.toLowerCase() !== correctAns.toLowerCase());
      
      let shuffledFakes = [...new Set(poolOfAnswers)].sort(() => Math.random() - 0.5).slice(0, 3);
      setChoices([...shuffledFakes, correctAns].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, phase, isExamFinished, queue]);

  if (queue === null) {
    return (
      <div className="panel test-box text-center">
        <h3>Слова для тренировки по данным фильтрам не найдены!</h3>
        <button className="secondary" onClick={onAbort}>Назад</button>
      </div>
    );
  }

  if (queue.length === 0) {
    return <div className="panel test-box text-center"><h3>⏳ Загрузка тренировки...</h3></div>;
  }

  if (isExamFinished) {
    return (
      <div className="panel test-box text-center">
        <h3>Урок завершен!</h3>
        <h1 style={{ margin: '15px 0', color: 'var(--success-color)' }}>Отличная работа 🎯</h1>
        <p style={{ color: '#64748b' }}>Пройдено карточек: {uniqueCardsCount.current.size} из {queue.length}</p>
        <br />
        <button className="primary-btn" onClick={onAbort}>Завершить 🏁</button>
      </div>
    );
  }

  const handleSpeak = () => {
    if (!currentTask) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentTask.card.word);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // --- ИСПРАВЛЕНО: ЖЁСТКАЯ ОЧИСТКА ВСЕХ ВНУТРЕННИХ ПРОБЕЛОВ СИНОНИМОВ ПРИ ПРОВЕРКЕ ---
  const handleCheckAnswer = (chosenAnswer = null) => {
    if (phase !== 'question') return;

    const isEnToRu = currentTask.type.endsWith('en-ru');
    const answer = (chosenAnswer || inputValue).trim().toLowerCase();
    
    // ИСПРАВЛЕНО: .map(t => t.trim().toLowerCase()) гарантирует уничтожение невидимых пробелов
    const validOptions = isEnToRu
      ? currentTask.card.translation.split(',').map(t => t.trim().toLowerCase())
      : [currentTask.card.word.trim().toLowerCase()];

    const isCorrect = validOptions.includes(answer);
    uniqueCardsCount.current.add(currentTask.card.word);

    if (!currentTask.card.stats) currentTask.card.stats = { correct: 0, wrong: 0 };
    let currentLvl = currentTask.card.reviewLvl || 1;

    if (isCorrect) {
      setFeedbackType('success');
      if (currentTask.isFirstTry) {
        currentTask.card.stats.correct += 1;
        currentLvl = Math.min(6, currentLvl + 1);
        const daysMap = { 1: 1, 2: 2, 3: 4, 4: 7, 5: 14, 6: 30 };
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + daysMap[currentLvl]);
        currentTask.card.nextReview = nextDate.toISOString();
        currentTask.card.reviewLvl = currentLvl;
      }
    } else {
      setFeedbackType('error');
      if (currentTask.isFirstTry) {
        currentTask.card.stats.wrong += 1;
        currentTask.card.reviewLvl = 1;
        currentTask.card.nextReview = new Date().toISOString();
      }
      currentTask.isFirstTry = false;
    }

    setPhase('review');
  };
  const handleNextWord = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(prev => prev + 1);
      setPhase('question');
    } else {
      setIsExamFinished(true);
      onFinish(uniqueCardsCount.current.size);
    }
  };

  const handleArchiveFromHard = (cardToArchive) => {
    cardToArchive.reviewLvl = 6;
    cardToArchive.nextReview = new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString();
    handleNextWord();
  };

  const handleCloseHardWithoutArchive = (wasSuccessfulButLeft) => {
    handleNextWord();
  };

  // --- РОУТЕР ЭКРАНОВ СТЕЙТ-МАШИНЫ ---
  if (phase === 'hard') {
    return (
      <HardModeEngine 
        card={currentTask.card} 
        allCards={cards} 
        onClose={handleCloseHardWithoutArchive} 
        onArchive={handleArchiveFromHard} 
      />
    );
  }

  if (phase === 'review') {
    return (
      <WordReviewScreen 
        card={currentTask.card} 
        feedbackType={lastFeedbackType} 
        onNext={handleNextWord} 
        onLaunchHard={() => setPhase('hard')} 
      />
    );
  }

  const isInputMode = currentTask.type.startsWith('typed:');
  const isEnToRuDirection = currentTask.type.endsWith('en-ru');

  return (
    <div className="panel test-box">
      <LessonProgress currentIndex={currentIndex} totalLength={queue.length} />
      
      <div className="test-exercise-label">
        {isInputMode 
          ? (isEnToRuDirection ? 'Введите русский перевод' : 'Type English word')
          : (isEnToRuDirection ? 'Выберите перевод слова' : 'Выберите английский эквивалент')}
      </div>
      
      <div className="test-word">
        {isEnToRuDirection ? currentTask.card.word : currentTask.card.translation}
      </div>

      {isEnToRuDirection && <button onClick={handleSpeak} className="test-audio-btn" style={{ marginBottom: '15px' }}>🔊</button>}
      <br />

      <div id="lessonInteractiveZone">
        {isInputMode ? (
          <LessonInput value={inputValue} onChange={setInputValue} onCheck={handleCheckAnswer} isDisabled={false} isEnToRu={isEnToRuDirection} />
        ) : (
          <LessonChoices choices={choices} onCheck={handleCheckAnswer} isDisabled={false} />
        )}
        <br />
        {isInputMode && <button className="primary-btn" onClick={() => handleCheckAnswer()}>Проверить</button>}
      </div>
      
      <button className="secondary" onClick={onAbort} style={{ marginTop: '15px' }}>Прервать урок</button>
    </div>
  );
};

export default LessonBox;
