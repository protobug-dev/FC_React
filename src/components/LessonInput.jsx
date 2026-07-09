import React, { useEffect, useRef } from 'react';
import './LessonBox.css';

const LessonInput = ({ value, onChange, onCheck, isDisabled, isEnToRu }) => {
  const inputRef = useRef(null);

  // Автоматический фокус на текстовое поле
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [isDisabled]);

  return (
    <input 
      type="text" 
      ref={inputRef}
      className="test-input"
      placeholder={isEnToRu ? "Введите русский перевод" : "Type English word"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      /* ИСПРАВЛЕНО: Enter теперь срабатывает ВСЕГДА, даже когда инпут disabled во время показа плашки */
      onKeyDown={(e) => e.key === 'Enter' && onCheck()}
      autoComplete="off"
    />
  );
};

export default LessonInput;
