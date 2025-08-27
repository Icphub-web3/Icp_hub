import React, { useState, useEffect, useRef } from 'react';
import './CreateFolderModal.css';

interface CreateFolderModalProps {
  currentPath: string;
  onClose: () => void;
  onCreate: (folderName: string) => Promise<void>;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  currentPath,
  onClose,
  onCreate
}) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Auto-focus the input field when modal opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreate(folderName);
      onClose();
    } catch (error) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Folder</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Location</label>
              <div className="parent-path">
                /{currentPath}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="folderName">Folder name</label>
              <input
                id="folderName"
                ref={inputRef}
                type="text"
                value={folderName}
                onChange={e => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoComplete="off"
                disabled={isCreating}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={isCreating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={!folderName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFolderModal;
