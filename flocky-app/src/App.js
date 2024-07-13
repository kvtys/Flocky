import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';

// BulletPoint component represents a single bullet point in the app
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
  isLast,
  setFocusId,
  onExit
}) => {
  // State to manage the text content of the bullet point
  const [text, setText] = useState(content);
  // Reference to the input element for focus management
  const inputRef = useRef(null);

  // Effect to focus on the last bullet point when it's created
  useEffect(() => {
    if (isLast) {
      inputRef.current.focus();
    }
  }, [isLast]);

  // Effect to focus on a specific bullet point when setFocusId matches
  useEffect(() => {
    if (id === setFocusId) {
      inputRef.current.focus();
    }
  }, [id, setFocusId]);

  // Handler for text changes in the input
  const handleChange = (e) => {
    setText(e.target.value);
    onUpdate(id, e.target.value);
  };

  // Handler for key presses in the input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (text.trim() === '' && level > 0) {
        onUnindent(id);
      } else {
        onEnter(id, level);
      }
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
      <div className="flex items-center space-x-4 my-1">
        {/* Indentation and toggle button */}
        <div className="flex items-center" style={{ width: `${level * 1.5}rem` }}>
          {children.length > 0 && (
            <button onClick={() => onToggle(id)} className="text-gray-400 ml-auto">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </div>
        <span className="text-gray-400">•</span>
        {/* Input field for bullet point content */}
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
      {/* Render child bullet points if expanded */}
      {isExpanded && children.length > 0 && (
        <div className="ml-4">
          {children.map(child => (
            <BulletPoint
              key={child.id}
              {...child}
              onUpdate={onUpdate}
              onEnter={onEnter}
              onIndent={onIndent}
              onUnindent={onUnindent}
              onToggle={onToggle}
              setFocusId={setFocusId}
              onExit={onExit}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Main component for the Bullet Point App
const BulletPointApp = () => {
  // State to manage all bullet points
  const [bullets, setBullets] = useState([{ id: 1, content: '', level: 0, children: [], isExpanded: true }]);
  // State to manage which bullet point should be focused
  const [focusId, setFocusId] = useState(null);

  // Function to update the content of a bullet point
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

  // Function to add a new bullet point
  const addBullet = (parentId, level) => {
    const newBullet = { id: Date.now(), content: '', level: level, children: [], isExpanded: true };
    const addBulletRecursive = (bullets) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === parentId) {
          const newBullets = [
            ...bullets.slice(0, i + 1),
            newBullet,
            ...bullets.slice(i + 1)
          ];
          setFocusId(newBullet.id);
          return newBullets;
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

  // Function to indent a bullet point
  const indentBullet = (id) => {
    const indentBulletRecursive = (bullets) => {
      for (let i = 1; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          const movedBullet = { ...bullets[i], level: bullets[i].level + 1 };
          const newBullets = [...bullets];
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

  // Function to unindent a bullet point
  const unindentBullet = (id) => {
    const unindentBulletRecursive = (bullets) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          const unindentedBullet = { ...bullets[i], level: 0 };
          const newBullets = [...bullets];
          newBullets.splice(i, 1);
          return { unindentedBullet, newBullets };
        }
        if (bullets[i].children.length > 0) {
          const result = unindentBulletRecursive( bullets[i].children );
          if (result) {
            const { unindentedBullet, newBullets } = result;
            return {
              unindentedBullet,
              newBullets: [
                ...bullets.slice(0, i),
                { ...bullets[i], children: newBullets },
                ...bullets.slice(i + 1)
              ]
            };
          }
        }
      }
      return null;
    };

    const result = unindentBulletRecursive(bullets);
    if (result) {
      const { unindentedBullet, newBullets } = result;
      setBullets([...newBullets, unindentedBullet]);
    }
  };

  // Function to exit the parent bullet point (unindent)
  const exitParent = (id) => {
    unindentBullet(id);
  };

  // Function to toggle the expanded state of a bullet point
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

  // Function to render all bullet points recursively
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
        onExit={exitParent}
        isLast={isLast && index === bullets.length - 1}
        setFocusId={focusId} 
      />
    ));
  };

  // Render the main app component
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Flocky</h1>
      <div className="space-y-2">
        {renderBullets(bullets, true)}
      </div>
    </div>
  );
};

export default BulletPointApp;