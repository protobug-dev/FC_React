import React from 'react';

// Компонент принимает функцию выбора (wantsTestOut)
const TestOutConfirm = ({ onChoice }) => {
  return (
    <div className="test-out-confirm-box" style={{ display: 'block' }}>
      <p className="test-out-title">🤔 Вы хорошо знаете это слово?</p>
      <p className="test-out-subtitle">
        Оставить его в обычной тренировке или пройдём жёсткую проверку и уберём навсегда из обучения?
      </p>
      <div className="test-out-buttons">
        <button className="secondary" onClick={() => onChoice(false)}>
          Оставить в тренировках
        </button>
        <button className="purple-btn" onClick={() => onChoice(true)}>
          Пройти жёсткую проверку ⚡
        </button>
      </div>
    </div>
  );
};

export default TestOutConfirm;
