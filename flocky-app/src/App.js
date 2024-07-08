import React, { useState, useRef, useEffect } from 'react';

const BulletPoint = ({ content, onUpdate, onEnter, isLast }) => {
  const [text, setText] = useState(content);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isLast) {
      inputRef.current.focus();
    }
  }, [isLast]);

  const handleChange = (e) => {
    setText(e.target.value);
    onUpdate(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter();
    }
  };

  return (
    <div className="flex items-center space-x-2 my-1">
      <span className="text-gray-400">•</span>
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-grow bg-transparent outline-none"
        placeholder="Type your note here..."
      />
    </div>
  );
};

const BulletPointApp = () => {
  const [bullets, setBullets] = useState([{ id: 1, content: '' }]);

  const addBullet = () => {
    const newBullet = { id: Date.now(), content: '' };
    setBullets([...bullets, newBullet]);
  };

  const updateBullet = (id, newContent) => {
    setBullets(bullets.map(bullet => 
      bullet.id === id ? { ...bullet, content: newContent } : bullet
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bullet Point Notes</h1>
      <div className="space-y-2">
        {bullets.map((bullet, index) => (
          <BulletPoint
            key={bullet.id}
            content={bullet.content}
            onUpdate={(newContent) => updateBullet(bullet.id, newContent)}
            onEnter={addBullet}
            isLast={index === bullets.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default BulletPointApp;