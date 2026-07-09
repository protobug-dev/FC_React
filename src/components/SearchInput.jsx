import React from 'react';

// Компонент получает: текущий текст поиска (value), функцию его обновления (onChange) и цифру остатка (filteredCount)
const SearchInput = ({ value, onChange, filteredCount }) => {
  return (
    <div className="search-group">
      <div className="search-input-wrapper">
        {/* Тонкая современная векторная SVG-лупа */}
        <svg 
          className="search-icon-svg" 
          xmlns="http://w3.org" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="2" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z" 
          />
        </svg>
        
        {/* Управляемый инпут: React полностью контролирует ввод текста */}
        <input 
          type="text" 
          id="appSearchInput" 
          placeholder="Поиск слова или перевода..." 
          value={value}
          onChange={(e) => onChange(e.target.value)} // Передаем буквы наверх в стейт при каждой нажатой клавише
          autoComplete="off"
        />
        
        {/* Пастельная круглая пилюля интерактивного счётчика */}
        <span className="search-counter-badge">
          {filteredCount}
        </span>
      </div>
    </div>
  );
};

export default SearchInput;
