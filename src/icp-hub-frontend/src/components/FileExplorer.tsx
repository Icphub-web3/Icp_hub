import React, { useState, useEffect } from 'react';
import apiService from '../services/api.js';
import './FileExplorer.css';

export interface FileNode {
  path: string;
  name: string;
  isFolder: boolean;
  size?: number;
  lastModified?: string | number;
  children?: FileNode[];
}

// Updated props interface to match what's passed from RepositoryDetail
export interface FileExplorerProps {
  repositoryId: string;
  currentPath: string;
  onFileSelect: (file: FileNode) => void | Promise<void>;
  onFileUpload?: () => void;
  refreshTrigger?: number; // Add this to trigger refresh
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  repositoryId,
  currentPath = '',
  onFileSelect,
  onFileUpload,
  refreshTrigger
}) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: FileNode } | null>(null);

  // Fetch files when component mounts or dependencies change
  useEffect(() => {
    fetchFiles();
  }, [repositoryId, currentPath, refreshTrigger]);

  // UPDATED: fetchFiles method
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiService.getFileTree(repositoryId, currentPath || '');
      
      if (result.success && result.data) {
        // The data should already be in tree format from backend
        if (result.data.nodes) {
          const mappedNodes = result.data.nodes.map(node => ({
              ...node,
              // Ensure lastModified has a value
              lastModified: node.lastModified || Date.now()
            }));
            setFiles(mappedNodes);
        } else if (Array.isArray(result.data)) {
          setFiles(result.data);
        } else {
          setFiles([]);
        }
      } else {
        setError('Failed to load files: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading files');
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: buildTree function
  const buildTree = (files: FileNode[]): FileNode[] => {
    // If files already have children, they're already in tree format
    if (files.some(f => f.children && f.children.length > 0)) {
      return files;
    }
    
    // Otherwise, build tree from flat list
    const tree: FileNode[] = [];
    const map: { [key: string]: FileNode } = {};
    
    // Sort files to ensure parents come before children
    const sortedFiles = [...files].sort((a, b) => {
      const depthA = a.path.split('/').length;
      const depthB = b.path.split('/').length;
      return depthA - depthB;
    });
    
    sortedFiles.forEach(file => {
      const node = { ...file, children: file.isFolder ? [] : undefined };
      map[file.path] = node;
      
      const parts = file.path.split('/');
      if (parts.length === 1 || currentPath === '') {
        // Root level
        tree.push(node);
      } else {
        // Find parent
        const parentPath = parts.slice(0, -1).join('/');
        if (map[parentPath] && map[parentPath].children) {
          map[parentPath].children!.push(node);
        } else {
          // If parent doesn't exist, add to root
          tree.push(node);
        }
      }
    });
    
    return tree;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleItemClick = (item: FileNode, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedItem(item.path);
    
    if (item.isFolder) {
      toggleFolder(item.path);
      // Navigate to folder - typically would update currentPath
    } else {
      // Call the onFileSelect prop passed from parent
      onFileSelect(item);
    }
  };

  const handleContextMenu = (event: React.MouseEvent, item: FileNode) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ x: event.clientX, y: event.clientY, item });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  // UPDATED: handleCreateFolder function
  const handleCreateFolder = async (parentPath: string) => {
    // This should trigger the CreateFolderModal
    // The actual creation is handled by the parent component
    if (onFileUpload) {
      onFileUpload(); // This triggers the modal in parent
    }
  };

  // ADDED: createNewFolder function
  const createNewFolder = async (folderName: string) => {
    try {
      const result = await apiService.createFolder(repositoryId, currentPath, folderName);
      if (result.success) {
        // Refresh the file list
        await fetchFiles();
      } else {
        setError('Failed to create folder: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      setError('Failed to create folder');
    }
  };

  // Handler for uploading files
  const handleUploadFile = (parentPath: string) => {
    console.log('Upload file to', parentPath);
    if (onFileUpload) {
      onFileUpload();
    }
    // You would typically implement a file upload dialog
  };

  // Handler for deleting items
  const handleDeleteItem = (path: string, isFolder: boolean) => {
    console.log('Delete', isFolder ? 'folder' : 'file', path);
    // Implement confirmation and deletion logic
  };

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (item: FileNode): string => {
    if (item.isFolder) {
      return expandedFolders.has(item.path) ? '📂' : '📁';
    }
    
    const extension = item.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return '📜';
      case 'ts':
      case 'tsx':
        return '🔷';
      case 'mo':
        return '🔵';
      case 'rs':
        return '🦀';
      case 'py':
        return '🐍';
      case 'json':
        return '📋';
      case 'md':
        return '📝';
      case 'html':
        return '🌐';
      case 'css':
      case 'scss':
        return '🎨';
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return '🖼️';
      case 'svg':
        return '🎭';
      case 'pdf':
        return '📕';
      case 'zip':
      case 'tar':
      case 'gz':
        return '📦';
      default:
        return '📄';
    }
  };

  const renderTreeNode = (node: FileNode, level: number = 0): React.ReactElement => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedItem === node.path;

    return (
      <div key={node.path} className="file-tree-node">
        <div
          className={`file-tree-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 20 + 10}px` }}
          onClick={(e) => handleItemClick(node, e)}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          <span className="file-icon">{getFileIcon(node)}</span>
          <span className="file-name">{node.name}</span>
          {!node.isFolder && (
            <span className="file-size">{formatFileSize(node.size)}</span>
          )}
        </div>
        
        {node.isFolder && isExpanded && node.children && (
          <div className="file-tree-children">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const treeData = buildTree(files);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (loading && files.length === 0) {
    return <div className="file-explorer-loading">Loading files...</div>;
  }
  
  if (error && files.length === 0) {
    return <div className="file-explorer-error">{error}</div>;
  }

  return (
    <div className="file-explorer">
      <div className="file-explorer-header">
        <div className="file-explorer-actions">
          <button 
            className="btn-small"
            onClick={() => handleCreateFolder(currentPath)}
            title="New folder"
          >
            📁+ New Folder
          </button>
          <button 
            className="btn-small"
            onClick={() => handleUploadFile(currentPath)}
            title="Upload files"
          >
            📤 Upload Files
          </button>
        </div>
      </div>

      <div className="file-tree">
        {treeData.length === 0 ? (
          <div className="empty-folder">
            <p>This folder is empty</p>
            <button 
              className="btn-primary"
              onClick={() => handleUploadFile(currentPath)}
            >
              Upload files
            </button>
          </div>
        ) : (
          treeData.map(node => renderTreeNode(node))
        )}
      </div>

      {contextMenu && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          {contextMenu.item.isFolder ? (
            <>
              <div 
                className="context-menu-item"
                onClick={() => {
                  handleCreateFolder(contextMenu.item.path);
                  closeContextMenu();
                }}
              >
                📁 New Folder
              </div>
              <div 
                className="context-menu-item"
                onClick={() => {
                  handleUploadFile(contextMenu.item.path);
                  closeContextMenu();
                }}
              >
                📤 Upload Files
              </div>
              <hr />
            </>
          ) : null}
          <div 
            className="context-menu-item delete"
            onClick={() => {
              handleDeleteItem(contextMenu.item.path, contextMenu.item.isFolder);
              closeContextMenu();
            }}
          >
            🗑️ Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
