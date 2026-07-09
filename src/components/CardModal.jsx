import React, { useState, useEffect } from 'react';
import './CardModal.css';

const CardModal = ({ isOpen, onClose, onSave, editCard, uniqueTopics }) => {
  // Определяем безопасную дефолтную тему (строку, а не массив!)
  const defaultTopic = uniqueTopics && uniqueTopics.length > 0 ? uniqueTopics[0] : 'Общее';

  // Локальные состояния полей формы
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [exampleTranslation, setExampleTranslation] = useState('');
  const [levelStr, setLevelStr] = useState('A1');
  const [partOfSpeech, setPartOfSpeech] = useState('Существительное');
  const [topic, setTopic] = useState(defaultTopic);
  const [newTopic, setNewTopic] = useState('');

  // Состояния для блока автоперевода
  const [isTranslating, setIsTranslating] = useState(false);
  const [variants, setVariants] = useState([]);

  // УМНЫЙ ЭФФЕКТ: Синхронизируем форму при открытии
  useEffect(() => {
    if (isOpen) {
      if (editCard) {
        setWord(editCard.word || '');
        setTranslation(editCard.translation || '');
        setExample(editCard.example || '');
        setExampleTranslation(editCard.exampleTranslation || '');
        setLevelStr(editCard.levelStr || 'A1');
        setPartOfSpeech(editCard.partOfSpeech || 'Существительное');
        setTopic(editCard.topic || defaultTopic);
        setNewTopic('');
      } else {
        setWord('');
        setTranslation('');
        setExample('');
        setExampleTranslation('');
        setLevelStr('A1');
        setPartOfSpeech('Существительное');
        setTopic(defaultTopic);
        setNewTopic('');
      }
      setVariants([]);
    }
  }, [isOpen, editCard, uniqueTopics]);

  // Интеграция с MyMemory API
  const handleAutoTranslate = async () => {
    const cleanWord = word.trim();
    if (!cleanWord) {
      alert('Сначала введите английское слово!');
      return;
    }

    setIsTranslating(true);
    setVariants([]);

    try {
      const url = `https://translated.net{encodeURIComponent(cleanWord)}&langpair=en|ru`;
      const response = await fetch(url);
      if (!response.ok) throw new Error();
      const data = await response.json();

      if (data && data.responseData) {
        let uniqueTranslations = new Set();
        if (data.responseData.translatedText) {
          uniqueTranslations.add(data.responseData.translatedText.trim().toLowerCase());
        }

        if (data.matches) {
          data.matches.forEach(match => {
            if (match.translation) {
              const clean = match.translation.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim().toLowerCase();
              if (clean && clean.split(' ').length <= 2 && clean !== cleanWord.toLowerCase()) {
                uniqueTranslations.add(clean);
              }
            }
          });
        }

        const translationsArray = Array.from(uniqueTranslations);
        if (translationsArray.length > 0) {
          setVariants(translationsArray);
          setTranslation(translationsArray[0]); // Подставляем первую строку
        } else {
          setTranslation(data.responseData.translatedText || '');
        }

        let foundExample = '';
        let foundExampleTranslation = '';
        if (data.matches) {
          for (let match of data.matches) {
            if (match.segment && match.segment.toLowerCase() !== cleanWord.toLowerCase() && match.segment.length > cleanWord.length * 2) {
              foundExample = match.segment;
              foundExampleTranslation = match.translation || '';
              break;
            }
          }
        }
        setExample(foundExample);
        setExampleTranslation(foundExampleTranslation);
      }
    } catch (e) {
      alert('Ошибка соединения или перевода. Введите перевод вручную.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleVariantChange = (variant, isChecked) => {
    let currentTranslations = translation.split(',').map(t => t.trim()).filter(Boolean);
    if (isChecked) {
      if (!currentTranslations.includes(variant)) currentTranslations.push(variant);
    } else {
      currentTranslations = currentTranslations.filter(t => t !== variant);
    }
    setTranslation(currentTranslations.join(', '));
  };

  const handleSubmit = () => {
    if (!word.trim() || !translation.trim()) {
      alert('Заполните обязательные поля!');
      return;
    }

    const finalTopic = newTopic.trim() ? newTopic.trim() : topic;
    
    onSave({
      word: word.trim(),
      translation: translation.trim(),
      example: example.trim(),
      exampleTranslation: exampleTranslation.trim(),
      levelStr,
      partOfSpeech,
      topic: finalTopic
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay active" onClick={(e) => e.target.className.includes('modal-overlay') && onClose()}>
      <div className="modal-content">
        <button className="close-modal-btn" onClick={onClose}>✕</button>
        <h3>{editCard ? 'Редактировать карточку' : 'Добавить новую карточку'}</h3>
        
        <div className="flex-row">
          <input 
            type="text" 
            placeholder="Слово (английский)" 
            value={word} 
            onChange={(e) => setWord(e.target.value)} 
          />
          <button className="secondary" onClick={handleAutoTranslate} disabled={isTranslating}>
            {isTranslating ? '⏳ Ищу...' : '🔍 Автоперевод'}
          </button>
        </div>

        {variants.length > 0 && (
          <div className="variants-box" style={{ display: 'block' }}>
            <label>Выберите подходящие переводы:</label>
            <div className="variants-list">
              {variants.map((variant) => (
                <label key={variant} className="variant-item">
                  <input 
                    type="checkbox" 
                    value={variant} 
                    checked={translation.split(',').map(t => t.trim()).includes(variant)}
                    onChange={(e) => handleVariantChange(variant, e.target.checked)}
                  />
                  <span>{variant}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex-row">
          <input 
            type="text" 
            placeholder="Перевод (русский)" 
            value={translation} 
            onChange={(e) => setTranslation(e.target.value)} 
          />
        </div>
        <div className="flex-row">
          <input 
            type="text" 
            placeholder="Пример употребления (необязательно)" 
            value={example} 
            onChange={(e) => setExample(e.target.value)} 
          />
        </div>
        <div className="flex-row">
          <input 
            type="text" 
            placeholder="Перевод примера (необязательно)" 
            value={exampleTranslation} 
            onChange={(e) => setExampleTranslation(e.target.value)} 
          />
        </div>

        <div className="modal-parameters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '15px' }}>
          <div className="flex-row stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label className="modal-param-label" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Уровень:</label>
            <select value={levelStr} onChange={(e) => setLevelStr(e.target.value)} style={{ width: '100%' }}>
              {["A0", "A1", "A2", "B1", "B2", "C1", "C2"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="flex-row stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label className="modal-param-label" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Часть речи:</label>
            <select value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} style={{ width: '100%' }}>
              {["Существительное", "Глагол", "Прилагательное", "Наречие", "Междометие", "Местоимение"].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="flex-row stack" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <label className="modal-param-label" style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#7f8c8d' }}>Тема / Топик:</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: '100%' }}>
              {uniqueTopics.map(t => <option key={t} value={t}>{t}</option>)}
              {!uniqueTopics.includes(topic) && topic !== 'Общее' && <option value={topic}>{topic}</option>}
              {uniqueTopics.length === 0 && <option value="Общее">Общее</option>}
            </select>
          </div>
        </div>

        <div className="flex-row stack" style={{ marginTop: '5px' }}>
          <input 
            type="text" 
            placeholder="Или создайте новую тему/топик" 
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
          />
        </div>

        <div className="modal-footer" style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="primary-btn" onClick={handleSubmit}>
            {editCard ? 'Сохранить изменения' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;
