import React, { useState, useEffect, useRef } from 'react';

const ComboBox = ({ label, items, selectedValue, onSelect }) => {
  // Локальное состояние: открыто это конкретное выпадающее меню на экране или нет
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Если в стейте лежит техническое значение 'all', пишем красивое слово 'Все'
  const displayLabel = selectedValue === 'all' ? 'Все' : selectedValue;

  // Умный хук: если меню открыто и пользователь кликнул мимо него — закрываем выпадашку
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    // Обязательно убираем слушатель при демонтаже компонента, чтобы не перегружать память телефона
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="filter-group" ref={containerRef}>
      <span className="filter-label">{label}:</span>
      
      <div className={`custom-select-container ${isOpen ? 'open' : ''}`}>
        {/* Триггер переключения видимости списка */}
        <button 
          type="button"
          className="custom-select-trigger" 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{displayLabel}</span>
          <span className="custom-select-arrow">▼</span>
        </button>

        {/* Среда опций рендерится в DOM только тогда, когда isOpen равно true */}
        {isOpen && (
          <div className="custom-select-options">
            <div 
              className="custom-select-option" 
              onClick={() => { onSelect('all'); setIsOpen(false); }}
            >
              Все
            </div>
            
            {/* Рендерим пункты, которые нам передал родительский компонент */}
            {items.map((item) => (
              <div 
                key={item} 
                className="custom-select-option" 
                onClick={() => { onSelect(item); setIsOpen(false); }}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComboBox;
