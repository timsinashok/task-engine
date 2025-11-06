
import React, { useState } from 'react';
import { Item } from '../types';
import { DeleteIcon, AddIcon } from './icons';

interface ItemListProps {
  title: string;
  items: Item[];
  placeholder: string;
  onAddItem: (text: string) => void;
  onToggleItem: (id: string, completed: boolean) => void;
  onDeleteItem: (id: string) => void;
}

const ItemList: React.FC<ItemListProps> = ({ title, items, placeholder, onAddItem, onToggleItem, onDeleteItem }) => {
  const [newItemText, setNewItemText] = useState('');

  const handleAddItem = () => {
    onAddItem(newItemText);
    setNewItemText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ul className="space-y-3 flex-grow overflow-y-auto">
        {items.map(item => (
          <li key={item.id} className="flex items-center group">
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleItem(item.id, item.completed)}
              className="h-5 w-5 rounded border-gray-300 text-black dark:text-white focus:ring-black dark:focus:ring-white bg-transparent dark:bg-transparent"
            />
            <span className={`ml-3 flex-1 ${item.completed ? 'line-through text-neutral-500 dark:text-neutral-400' : ''}`}>
              {item.text}
            </span>
            <button onClick={() => onDeleteItem(item.id)} className="ml-2 text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
              <DeleteIcon />
            </button>
          </li>
        ))}
         {items.length === 0 && (
          <p className="text-neutral-400 text-sm">Nothing here yet. Add something below!</p>
        )}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full px-4 py-2 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
        />
        <button onClick={handleAddItem} className="bg-black text-white dark:bg-white dark:text-black font-semibold px-4 py-2 rounded-lg transition flex-shrink-0">
            <AddIcon />
        </button>
      </div>
    </div>
  );
};

export default ItemList;
