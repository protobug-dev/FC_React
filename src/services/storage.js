// Сервисный модуль для работы с локальным хранилищем (Storage Service)

const CARDS_KEY = 'smart_cards_react';
const LESSON_SIZE_KEY = 'smart_lesson_size_react';
const ACTIVITY_KEY = 'smart_daily_activity_react';

export const StorageService = {
  getCards() {
    return JSON.parse(localStorage.getItem(CARDS_KEY)) || [];
  },

  saveCards(cards) {
    localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
  },

  getLessonSize() {
    return parseInt(localStorage.getItem(LESSON_SIZE_KEY)) || 10;
  },

  saveLessonSize(size) {
    localStorage.setItem(LESSON_SIZE_KEY, size);
  },

  getDailyActivity() {
    const todayStr = new Date().toLocaleDateString();
    const savedData = JSON.parse(localStorage.getItem(ACTIVITY_KEY));
    if (savedData && savedData.date === todayStr) {
      return savedData.completedCount || 0;
    }
    return 0;
  },

  incrementDailyActivity() {
    const todayStr = new Date().toLocaleDateString();
    const currentCount = this.getDailyActivity();
    const updatedData = { date: todayStr, completedCount: currentCount + 1 };
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(updatedData));
    return updatedData.completedCount;
  },

  // Асинхронная загрузка бэкапа при первом визите
  async loadDefaultData() {
    try {
      const response = await fetch('./FlashCards_backup.json');
      if (!response.ok) return [];

      const importedData = await response.json();
      if (importedData.cards && Array.isArray(importedData.cards)) {
        // Гарантируем совместимость структуры полей
        const preparedCards = importedData.cards.map(card => ({
          ...card,
          topic: card.topic || card.category || "Общее",
          levelStr: card.levelStr || card.level || "A1",
          reviewLvl: card.reviewLvl || 1,
          stats: card.stats || { correct: 0, wrong: 0 },
          nextReview: card.nextReview || new Date().toISOString()
        }));

        this.saveCards(preparedCards);
        return preparedCards;
      }
      return [];
    } catch (error) {
      console.error('Не удалось автоматически загрузить стартовые карточки:', error);
      return [];
    }
  },

  exportJSON(cards) {
    const dataToExport = { cards };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const blobUrl = URL.createObjectURL(blob);
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", blobUrl);
    downloadAnchor.setAttribute("download", "flashcards_react_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(blobUrl);
  }
};
