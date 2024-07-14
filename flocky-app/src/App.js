import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, CircleDot, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// BulletPoint component represents a single bullet point in the app
const BulletPoint = ({ 
  id, 
  parentId,
  content, 
  level, 
  children, 
  onUpdate, 
  onEnter, 
  onIndent, 
  onUnindent, 
  onToggle,
  onArrowDown,
  onArrowUp,
  isExpanded,
  isLast,
  setFocusId,
  onExit,
  onDelete,
  onZoomIn,
  isNew
}) => {
  // State to manage the text content of the bullet point
  const [text, setText] = useState(content);
  // Reference to the input element for focus management
  const inputRef = useRef(null);

  // Effect to focus on the last bullet point when it's created
  useEffect(() => {
    if (isLast || isNew) {
      inputRef.current.focus();
    }
  }, [isLast, isNew]);
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
        onEnter(id, null, level);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        onUnindent(id);
      } else {
        onIndent(id);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onArrowDown(id);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onArrowUp(id);
    } else if (e.key === 'Backspace') {
      if(text.trim() === '') {
        onDelete(id);
      }
    }
  };

  const bulletVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };


  return (
    <motion.div
      variants={bulletVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.2 }}
      className={`transition-all duration-100 ease-out ${isNew ? 'ml-4 opacity-0' : 'ml-4 opacity-100'}`}
    >
      <div className="flex items-center space-x-2 my-1">
        <div className="flex items-center">
          {children.length > 0 && (
            <button
              onClick={() => onToggle(id)}
              className="text-gray-400 hover:text-gray-600 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-90"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight size={16} />
              </motion.div>
            </button>
          )}
          {children.length > 0 ? 
            <button 
              onClick={() => onZoomIn(id)} 
              className="text-gray-500 hover:text-gray-400 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-90"
            >
              <CircleDot size={14}/>
            </button> : 
            <span className="text-gray-400 ml-5">•</span>
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-grow bg-transparent outline-none rounded px-1 transition-all duration-200 ease-in-out"
          placeholder="Type your note here..."
        />
      </div>
      <AnimatePresence initial={false}>
        {isExpanded && children.length > 0 && (
          <motion.div
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={{
              expanded: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="ml-4 overflow-hidden"
          >
            {children.map(child => (
              <BulletPoint
                key={child.id}
                {...child}
                onUpdate={onUpdate}
                onEnter={onEnter}
                onIndent={onIndent}
                onUnindent={onUnindent}
                onToggle={onToggle}
                onArrowDown={onArrowDown}
                onArrowUp={onArrowUp}
                setFocusId={setFocusId}
                onExit={onExit}
                onDelete={onDelete}
                onZoomIn={onZoomIn}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main component for the Bullet Point App
const BulletPointApp = () => {
  const [bullets, setBullets] = useState([{ id: 1, parentId: null, content: '', level: 0, children: [], isExpanded: true }]);
  const [focusId, setFocusId] = useState(null);
  const [zoomedBulletId, setZoomedBulletId] = useState(null);

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
  const addBullet = (parentIndex, parentId, level) => {
    const newBullet = { 
      id: Date.now(), 
      parentId, 
      content: '', 
      level: level, 
      children: [], 
      isExpanded: true,
      isNew: true  // Add this flag for new bullets
    };
    const addBulletRecursive = (bullets) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === parentIndex) {
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
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          const movedBullet = { ...bullets[i], level: bullets[i].level + 1, parentId: bullets[i - 1].id };
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
    const unindentBulletRecursive = (bullets, parentId = null) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          console.log("unindenting: ", bullets[i].content, " setting level to: ", Math.max(0, bullets[i].level - 1));
          const unindentedBullet = { ...bullets[i], level: Math.max(0, bullets[i].level - 1), parentId };
          const newBullets = [...bullets];
          newBullets.splice(i, 1);
          return { unindentedBullet, newBullets, parentId };
        }
        if (bullets[i].children.length > 0) {
          const result = unindentBulletRecursive(bullets[i].children, bullets[i].id);
          if (result) {
            return {
              ...result,
              newBullets: [
                ...bullets.slice(0, i),
                { ...bullets[i], children: result.newBullets },
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
      const { unindentedBullet, newBullets, parentId } = result;
      
      setBullets(prevBullets => {
        const insertAfterParent = (bullets, parentId, bulletToInsert) => {
          console.log("inserting after parent: ", parentId);
          if(bulletToInsert.level === 0) {
            bulletToInsert.parentId = null;
          };
          for (let i = 0; i < bullets.length; i++) {
            if (bullets[i].id === parentId) {
              console.log("placing after: ", bullets[i].content + " at index: " + i);
              return [
                ...bullets.slice(0, i + 1),
                bulletToInsert,
                ...bullets.slice(i + 1)
              ];
            }
            if (bullets[i].children.length > 0) {
              const newChildren = insertAfterParent(bullets[i].children, parentId, bulletToInsert);
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

        if (parentId === null) {
          // If the bullet was already at the top level, just update its level
          return newBullets.map(b => b.id === id ? unindentedBullet : b);
        } else {
          // Otherwise, insert the unindented bullet after its parent
          return insertAfterParent(newBullets, parentId, unindentedBullet);
        }
      });
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

  const findNextFocusable = (bullets, currentId, goingUp = false) => {
    let found = false;
    let next = null;

    const traverse = (items, parent = null) => {
      for (let i = 0; i < items.length; i++) {
        if (found && !next) {
          if (goingUp) {
            if (i > 0) {
              next = findLastChild(items[i - 1]);
            } else if (parent) {
              next = parent.id;
            }
          } else {
            next = items[i].id;
          }
          return;
        }
        if (items[i].id === currentId) {
          found = true;
          if (goingUp) {
            if (i > 0) {
              next = findLastChild(items[i - 1]);
            } else if (parent) {
              next = parent.id;
            }
            return;
          }
        }
        if (items[i].children.length > 0 && items[i].isExpanded) {
          traverse(items[i].children, items[i]);
          if (next) return;
        }
      }
    };

    const findLastChild = (item) => {
      if (item.children.length > 0 && item.isExpanded) {
        return findLastChild(item.children[item.children.length - 1]);
      }
      return item.id;
    };

    traverse(bullets);
    return next;
  };

  const arrowDown = (id) => {
    const nextId = findNextFocusable(bullets, id);
    if (nextId) {
      setFocusId(nextId);
    }
  };

  const arrowUp = (id) => {
    const prevId = findNextFocusable(bullets, id, true);
    if (prevId) {
      setFocusId(prevId);
    }
  };

  const deleteBullet = (id) => {
    const deleteBulletRecursive = (bullets) => {
      for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].id === id) {
          // Remove the current bullet
          const newBullets = [...bullets.slice(0, i), ...bullets.slice(i + 1)];
          
          // Set focus to the previous bullet if it exists, or the next one if it doesn't
          if (i > 0) {
            setFocusId(bullets[i - 1].id);
          } else if (newBullets.length > 0) {
            setFocusId(newBullets[0].id);
          }
          
          return newBullets;
        }
        if (bullets[i].children.length > 0) {
          const newChildren = deleteBulletRecursive(bullets[i].children);
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

    setBullets(deleteBulletRecursive(bullets));
  };

  const zoomIn = (id) => {
    setZoomedBulletId(id);
  };

  const zoomOut = () => {
    const currentBullet = findBulletById(bullets, zoomedBulletId);
    setZoomedBulletId(currentBullet.parentId);
  };

  const findBulletById = (bullets, id) => {
    for (const bullet of bullets) {
      if (bullet.id === id) {
        return bullet;
      }
      if (bullet.children.length > 0) {
        const found = findBulletById(bullet.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const renderBullets = (bullets, isLast = false) => {
    console.log('rendering bullets: ', JSON.stringify(bullets));
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
        onArrowDown={arrowDown}
        onArrowUp={arrowUp}
        onDelete={deleteBullet}
        isLast={isLast && index === bullets.length - 1}
        setFocusId={focusId}
        onZoomIn={() => zoomIn(bullet.id)}
      />
    ));
  };

  const renderZoomedContent = () => {
    if (!zoomedBulletId) {
      return renderBullets(bullets, true);
    }

    const zoomedBullet = findBulletById(bullets, zoomedBulletId);
    if (!zoomedBullet) return null;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="transition-all duration-300 ease-in-out"
      >
        <div className="flex items-center mb-4">
          <button
            onClick={zoomOut}
            className="mr-2 transition-all duration-200 ease-in-out transform hover:scale-110 active:scale-90"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">{zoomedBullet.content}</h2>
        </div>
        {renderBullets(zoomedBullet.children, true)}
      </motion.div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
        Flocky
      </h1>
      <AnimatePresence mode="wait">
        <motion.div
          key={zoomedBulletId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          {renderZoomedContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BulletPointApp;