import React, { useState, useEffect, useRef } from 'react';
import './index.css'; 
import './components/HeaderSettings.css';
import './components/ComboBox.css';       
import './components/FilterCardsGrid.css';
import './components/CardsGrid.css';

import FlashCard from './components/FlashCard';
import CardModal from './components/CardModal';
import LessonBox from './components/LessonBox';
import { StorageService } from './services/storage';

function App() {
  // --- Единственный живой массив карточек ---
  const [cards, setCards] = useState([]);
  
  // Состояния управления всплывающими окнами
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCardIndex, setEditingCardIndex] = useState(null);
  const [isLessonActive, setIsLessonActive] = useState(false);

  // Стейт для двухстрелочного меню Бэкапа (Импорт/Экспорт)
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [lessonSize, setLessonSize] = useState(10);
  const syncRef = useRef(null);

  // Синхронизация данных при первом старте
  useEffect(() => {
    const initData = async () => {
      let localCards = StorageService.getCards();
      if (localCards.length === 0) {
        localCards = await StorageService.loadDefaultData();
      }
      setCards(localCards);
      setLessonSize(StorageService.getLessonSize());
    };
    initData();
  }, []);

  // Автоматическое закрытие меню бэкапа при клике в пустую зону экрана
  useEffect(() => {
    const handleClickOutsideSync = (event) => {
      if (syncRef.current && !syncRef.current.contains(event.target)) {
        setIsSyncOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutsideSync);
    return () => document.removeEventListener('click', handleClickOutsideSync);
  }, []);

  // Сортировка слов на главном экране по алфавиту
  const sortedCards = [...cards].sort((a, b) => 
    a.word.toLowerCase().localeCompare(b.word.toLowerCase(), 'en')
  );

  const handleOpenCreateModal = () => {
    setEditingCardIndex(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (realIndex) => {
    setEditingCardIndex(realIndex);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (realIndex) => {
    if (window.confirm('Удалить эту карточку?')) {
      const updatedCards = [...cards];
      updatedCards.splice(realIndex, 1);
      setCards(updatedCards);
      StorageService.saveCards(updatedCards);
    }
  };

  const handleSaveCard = (formData) => {
    let updatedCards = [...cards];
    if (editingCardIndex !== null && editingCardIndex > -1) {
      updatedCards[editingCardIndex] = { ...cards[editingCardIndex], ...formData };
    } else {
      updatedCards.push({
        ...formData,
        reviewLvl: 1,
        stats: { correct: 0, wrong: 0 },
        nextReview: new Date().toISOString()
      });
    }
    setCards(updatedCards);
    StorageService.saveCards(updatedCards);
    setIsModalOpen(false);
  };

  const handleLessonSizeChange = (newSize) => {
    const sizeNum = parseInt(newSize, 10);
    setLessonSize(sizeNum);
    StorageService.saveLessonSize(sizeNum);
  };

  const handleExport = () => {
    StorageService.exportJSON(cards);
    setIsSyncOpen(false);
  };

  const handleImport = (event) => {
    const file = event.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.cards && Array.isArray(importedData.cards)) {
          setCards(importedData.cards);
          StorageService.saveCards(importedData.cards);
          alert('Данные успешно импортированы! 🎉');
        } else {
          alert('Неверный формат файла бэкапа.');
        }
      } catch (err) {
        alert('Ошибка при чтении JSON файла.');
      }
    };
    reader.readAsText(file);
    setIsSyncOpen(false);
  };

  const handleFinishLesson = () => {
    StorageService.saveCards(cards);
    setIsLessonActive(false);
  };

  const handleStopLesson = () => {
    setIsLessonActive(false);
  };
  // --- Универсальное меню бэкапа под значком 📦 ---
  const renderSyncMenu = () => (
    <div className="data-sync-menu-container" ref={syncRef}>
      <button 
        className="data-sync-toggle-btn" 
        onClick={() => setIsSyncOpen(!isSyncOpen)}
        title="Импорт / Экспорт данных"
      >
        <span className="icon">📦</span>
        <span className="btn-label-text">Хранение</span>
      </button>
      <div className={`data-sync-dropdown ${isSyncOpen ? 'active' : ''}`}>
        <button onClick={handleExport}>💾 Экспорт данных (JSON)</button>
        <input 
          type="file" 
          id="importFileInput" 
          accept=".json" 
          style={{ display: 'none' }} 
          onChange={handleImport} 
        />
        <button onClick={() => document.getElementById('importFileInput').click()}>
          📂 Импорт данных (JSON)
        </button>
      </div>
    </div>
  );

  return (
    <div className="container">
      {isLessonActive ? (
        <LessonBox 
          cards={cards}
          activeFilters={{ level: 'all', partOfSpeech: 'all', topic: 'all' }}
          lessonSize={lessonSize}
          onFinish={handleFinishLesson}
          onAbort={handleStopLesson}
        />
      ) : (
        <>
          {/* === ШАПКА ПРИЛОЖЕНИЯ (Для ПК видна, на мобилках полностью скрыта через CSS) === */}
          <header className="app-header">
            <h1>🎓 Smart Flashcards Pro</h1>
          </header>

          {/* === СБАЛАНСИРОВАННАЯ ОДНОСТРОЧНАЯ ПАНЕЛЬ С КРУПНЫМ PLAY СЛЕНА === */}
          <div className="filter-zone">
            
            {/* 1. КНОПКА PLAY С КРУПНЫМ ЗЕЛЕНЫМ 3D-ТРЕУГОЛЬНИКОМ (ТЕПЕРЬ ПЕРВАЯ СЛЕВА) */}
            <div className="play-action-group" title="Запустить тренировку">
              <button className="success-btn" onClick={() => setIsLessonActive(true)}></button>
            </div>

            {/* 2. КНОПКА ДОБАВЛЕНИЯ СЛОВА */}
            <button 
              className="minimal-add-card-btn" 
              onClick={handleOpenCreateModal}
              title="Добавить новое слово"
            >
              <span className="icon">➕</span>
              <span className="btn-label-text">Добавить новое слово</span>
            </button>

            {/* 3. БЛОК КОЛИЧЕСТВА КАРТОЧЕК В УРОКЕ */}
            <div className="lesson-size-inline-group" title="Карточек в уроке">
              <span className="lesson-size-icon">📚</span>
              <span className="btn-label-text">Карточек в уроке:</span>
              <select 
                id="lessonSizeSelect" 
                value={lessonSize} 
                onChange={(e) => handleLessonSizeChange(e.target.value)}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
              </select>
            </div>

            {/* 4. МЕНЮ БЭКАПА ПОД ЗНАЧКОМ 📦 */}
            {renderSyncMenu()}
          </div>

          {/* === СБАЛАНСИРОВАННАЯ СЕТКА КАРТОЧЕК СЛОВ === */}
          <div className="grid">
            {sortedCards.map((card) => {
              const realIndex = cards.indexOf(card);
              return (
                <FlashCard 
                  key={card.word} 
                  card={card} 
                  onEdit={() => handleOpenEditModal(realIndex)}
                  onDelete={() => handleDeleteCard(realIndex)}
                />
              );
            })}
          </div>

          <CardModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveCard}
            editCard={editingCardIndex !== null ? cards[editingCardIndex] : null}
            uniqueTopics={[]} 
          />
        </>
      )}
    </div>
  );
}

export default App;
