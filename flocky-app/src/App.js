import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

const BulletPoint = ({ 
  id, 
  content, 
  level, 
  children, 
  onUpdate, 
  onEnter, 
  onIndent, 
  onUnindent, 
  onToggle, 
  isExpanded,
  isLast 
}) => {
  const [text, setText] = useState(content);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isLast) {
      inputRef.current.focus();
    }
  }, [isLast]);

  const handleChange = (e) => {
    setText(e.target.value);
    onUpdate(id, e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnter(id, level);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onUnindent(id);
      } else {
        onIndent(id);
      }
    }
  };

  return (
    <div>
      <div className={`flex items-center space-x-2 my-1`} style={{ marginLeft: `${level * 1.5}rem` }}>
        {children.length > 0 && (
          <button onClick={() => onToggle(id)} className="text-gray-400">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
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
      {isExpanded && children.length > 0 && (
        <div>
          {children.map(child => (
            <BulletPoint
              key={child.id}
              {...child}
              onUpdate={onUpdate}
              onEnter={onEnter}
              onIndent={onIndent}
              onUnindent={onUnindent}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BulletPointApp = () => {
  const [bullets, setBullets] = useState([{ id: 1, content: '', level: 0, children: [], isExpanded: true }]);

  const updateBullet = (id, newContent) => {
    const updateBulletRecursive = (bullets) => {
      return bullets.map(bullet => {
        if (bullet.id === id) {
          return { ...bullet, content: newContent };
        }
        if (bullet.children.length > 0) {
          return { ...bullet, children: updateBulletRecursive(bullet.children) };
        }
        return bullet;
      });
    };
    setBullets(updateBulletRecursive(bullets));
  };

  const addBullet = (parentId, level) => {
    const newBullet = { id: Date.now(), content: '', level: level, children: [], isExpanded: true };
    const addBulletRecursive = (bullets) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === parentId) {
          return [
            ...bullets.slice(0, i + 1),
            newBullet,
            ...bullets.slice(i + 1)
          ];
        }
        if (bullets[i].children.length > 0) {
          const newChildren = addBulletRecursive(bullets[i].children);
          if (newChildren !== bullets[i].children) {
            return [
              ...bullets.slice(0, i),
              { ...bullets[i], children: newChildren },
              ...bullets.slice(i + 1)
            ];
          }
        }
      }
      return bullets;
    };
    setBullets(addBulletRecursive(bullets));
  };

  const indentBullet = (id) => {
    const indentBulletRecursive = (bullets) => {
      for (let i = 1; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          const movedBullet = { ...bullets[i], level: bullets[i].level + 1 };
          const newBullets = [...bullets];
          if (!newBullets[i - 1].children) {
            newBullets[i - 1].children = [];
          }
          newBullets[i - 1].children.push(movedBullet);
          newBullets.splice(i, 1);
          return newBullets;
        }
        if (bullets[i].children.length > 0) {
          const newChildren = indentBulletRecursive(bullets[i].children);
          if (newChildren !== bullets[i].children) {
            return [
              ...bullets.slice(0, i),
              { ...bullets[i], children: newChildren },
              ...bullets.slice(i + 1)
            ];
          }
        }
      }
      return bullets;
    };
    setBullets(indentBulletRecursive(bullets));
  };

  const unindentBullet = (id) => {
    // Implementation for unindenting (moving a bullet point to a higher level)
    // This is more complex and would require restructuring the bullet hierarchy
    console.log("Unindent not implemented yet");
  };

  const toggleBullet = (id) => {
    const toggleBulletRecursive = (bullets) => {
      return bullets.map(bullet => {
        if (bullet.id === id) {
          return { ...bullet, isExpanded: !bullet.isExpanded };
        }
        if (bullet.children.length > 0) {
          return { ...bullet, children: toggleBulletRecursive(bullet.children) };
        }
        return bullet;
      });
    };
    setBullets(toggleBulletRecursive(bullets));
  };

  const renderBullets = (bullets, isLast = false) => {
    return bullets.map((bullet, index) => (
      <BulletPoint
        key={bullet.id}
        {...bullet}
        onUpdate={updateBullet}
        onEnter={addBullet}
        onIndent={indentBullet}
        onUnindent={unindentBullet}
        onToggle={toggleBullet}
        isLast={isLast && index === bullets.length - 1}
      />
    ));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Bullet Point Notes</h1>
      <div className="space-y-2">
        {renderBullets(bullets, true)}
      </div>
    </div>
  );
};

export default BulletPointApp;