
import React, { useState } from 'react';
import { QuickAccessLink } from '../types';
import { EditIcon, DeleteIcon, AddIcon } from './icons';

interface QuickAccessProps {
  links: QuickAccessLink[];
  onAddLink: (name: string, url: string) => void;
  onDeleteLink: (id: string) => void;
}

const QuickAccess: React.FC<QuickAccessProps> = ({ links, onAddLink, onDeleteLink }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const handleAdd = () => {
    // Basic URL validation
    let finalUrl = url;
    if (!/^https?:\/\//i.test(url)) {
      finalUrl = 'https://' + url;
    }
    onAddLink(name, finalUrl);
    setName('');
    setUrl('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Quick Access</h2>
        <button onClick={() => setIsEditing(!isEditing)} className="p-2 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors" aria-label="Edit Quick Access">
          <EditIcon />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
        {links.map(link => (
          <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="relative group flex flex-col items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700/50 transition-colors">
            <img src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=32`} alt={`${link.name} favicon`} className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium truncate w-full text-center">{link.name}</span>
            {isEditing && (
              <button onClick={(e) => { e.preventDefault(); onDeleteLink(link.id); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <DeleteIcon size={12} />
              </button>
            )}
          </a>
        ))}
      </div>
      {isEditing && (
        <div className="flex flex-col sm:flex-row gap-2">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g., GitHub)" className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL (e.g., github.com)" className="flex-1 px-4 py-2 bg-neutral-100 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white" />
          <button onClick={handleAdd} className="bg-black text-white dark:bg-white dark:text-black font-semibold px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
            <AddIcon /> Add
          </button>
        </div>
      )}
    </div>
  );
};

export default QuickAccess;
