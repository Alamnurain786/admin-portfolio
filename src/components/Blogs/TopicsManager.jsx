import React, { useState } from 'react';
import TextInput from '../UI/TextInput';
import Button from '../UI/Button';

const TopicsManager = ({ topics, onAddTopic, onRemoveTopic }) => {
  const [newTopic, setNewTopic] = useState('');

  const handleAddClick = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      onAddTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission if inside a form
      handleAddClick();
    }
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <TextInput
          id="newTopic"
          name="newTopic"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a topic"
          className="flex-grow"
        />
        <Button type="button" onClick={handleAddClick}>
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm flex items-center dark:bg-gray-700 dark:text-gray-200 break-words"
          >
            {topic}
            <button
              type="button"
              onClick={() => onRemoveTopic(topic)}
              className="ml-2 text-gray-500 over:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopicsManager;
