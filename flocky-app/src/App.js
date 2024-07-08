import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, Circle } from 'lucide-react';

const Block = ({ content, level = 0, onZoom, onUpdate, onNewBlock }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [blocks, setBlocks] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const toggleExpand = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleZoom = (e) => {
    e.stopPropagation();
    onZoom({ content: editedContent, blocks });
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(editedContent);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
      onNewBlock(level);
    }
  };

  const addBlock = (parentLevel) => {
    if (parentLevel === level) {
      setBlocks([...blocks, { content: 'New block', blocks: [] }]);
    }
  };

  return (
    <div className="my-1">
      <div 
        className={`p-2 rounded ${level === 0 ? 'bg-white' : 'bg-gray-100'} hover:bg-gray-200 transition-colors duration-200 flex items-center`}
      >
        <button onClick={toggleExpand} className="mr-2">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <button onClick={handleZoom} className="mr-2">
          <Circle size={16} />
        </button>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none"
          />
        ) : (
          <span onClick={handleEdit} className="flex-grow cursor-text">
            {editedContent}
          </span>
        )}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ml-6 mt-1"
          >
            {blocks.map((block, index) => (
              <Block 
                key={index} 
                content={block.content} 
                level={level + 1}
                onZoom={onZoom}
                onUpdate={(newContent) => {
                  const newBlocks = [...blocks];
                  newBlocks[index].content = newContent;
                  setBlocks(newBlocks);
                }}
                onNewBlock={addBlock}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BlockNotesApp = () => {
  const [zoomedBlock, setZoomedBlock] = useState(null);
  const [blocks, setBlocks] = useState([
    { content: 'Welcome to Block Notes!', blocks: [] },
  ]);

  const handleZoom = (block) => {
    setZoomedBlock(block);
  };

  const handleZoomOut = () => {
    setZoomedBlock(null);
  };

  const addRootBlock = () => {
    setBlocks([...blocks, { content: 'New block', blocks: [] }]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Block Notes App</h1>
      <button 
        onClick={addRootBlock}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-200"
      >
        Add Root Block
      </button>
      <AnimatePresence mode="wait">
        {zoomedBlock ? (
          <motion.div
            key="zoomed"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <button 
              onClick={handleZoomOut}
              className="mb-2 px-2 py-1 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
            >
              Zoom Out
            </button>
            <Block 
              content={zoomedBlock.content} 
              blocks={zoomedBlock.blocks} 
              onZoom={handleZoom}
              onUpdate={(newContent) => {
                setZoomedBlock({ ...zoomedBlock, content: newContent });
              }}
              onNewBlock={() => {}}
            />
          </motion.div>
        ) : (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {blocks.map((block, index) => (
              <Block 
                key={index} 
                content={block.content} 
                blocks={block.blocks}
                onZoom={handleZoom}
                onUpdate={(newContent) => {
                  const newBlocks = [...blocks];
                  newBlocks[index].content = newContent;
                  setBlocks(newBlocks);
                }}
                onNewBlock={(level) => {
                  if (level === 0) {
                    setBlocks([...blocks, { content: 'New block', blocks: [] }]);
                  }
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlockNotesApp;