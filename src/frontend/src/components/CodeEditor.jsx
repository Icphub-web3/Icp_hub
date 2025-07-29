import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Maximize2, 
  Minimize2,
  X,
  Plus,
  FolderTree,
  File,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useFileStore, useRepoStore } from '../store';

const CodeEditor = () => {
  const [theme, setTheme] = useState('vs-dark');
  const [language, setLanguage] = useState('javascript');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  
  const editorRef = useRef(null);
  const { 
    files, 
    openFiles, 
    activeFile, 
    fileTree, 
    openFile, 
    closeFile, 
    setActiveFile, 
    updateFileContent 
  } = useFileStore();
  
  const { currentRepo } = useRepoStore();

  // Mock file tree data
  const mockFileTree = {
    name: 'root',
    type: 'folder',
    children: [
      {
        name: 'src',
        type: 'folder',
        children: [
          { name: 'App.jsx', type: 'file', content: 'import React from "react";\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello ICPHub!</h1>\n    </div>\n  );\n}\n\nexport default App;' },
          { name: 'index.js', type: 'file', content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));' },
          {
            name: 'components',
            type: 'folder',
            children: [
              { name: 'Header.jsx', type: 'file', content: 'import React from "react";\n\nconst Header = () => {\n  return <header>ICPHub Header</header>;\n};\n\nexport default Header;' }
            ]
          }
        ]
      },
      { name: 'package.json', type: 'file', content: '{\n  "name": "icphub-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0"\n  }\n}' },
      { name: 'README.md', type: 'file', content: '# ICPHub Project\n\nThis is a sample project created in ICPHub.\n\n## Getting Started\n\n1. Clone the repository\n2. Install dependencies\n3. Start coding!' }
    ]
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop();
  };

  const getLanguageFromExtension = (extension) => {
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'rs': 'rust',
      'mo': 'motoko',
      'go': 'go',
      'java': 'java',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml'
    };
    return languageMap[extension] || 'plaintext';
  };

  const handleFileSelect = (file) => {
    const filePath = file.path || file.name;
    const extension = getFileExtension(file.name);
    const detectedLanguage = getLanguageFromExtension(extension);
    
    const fileData = {
      name: file.name,
      path: filePath,
      content: file.content || '',
      language: detectedLanguage
    };
    
    openFile(fileData);
    setLanguage(detectedLanguage);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Configure Monaco Editor
    monaco.editor.defineTheme('icphub-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' }
      ],
      colors: {
        'editor.background': '#1e293b',
        'editor.foreground': '#e2e8f0'
      }
    });
  };

  const handleEditorChange = (value) => {
    if (activeFile) {
      updateFileContent(activeFile.path, value);
    }
  };

  const toggleFolder = (folderName) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderName)) {
      newExpanded.delete(folderName);
    } else {
      newExpanded.add(folderName);
    }
    setExpandedFolders(newExpanded);
  };

  const FileTreeNode = ({ node, path = '', level = 0 }) => {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    const isExpanded = expandedFolders.has(fullPath);
    
    if (node.type === 'folder') {
      return (
        <div>
          <div 
            className={`flex items-center px-2 py-1 hover:bg-secondary-700 cursor-pointer text-secondary-200`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => toggleFolder(fullPath)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-1" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-1" />
            )}
            <FolderTree className="w-4 h-4 mr-2 text-primary-400" />
            <span className="text-sm">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child, index) => (
                <FileTreeNode 
                  key={index} 
                  node={child} 
                  path={fullPath} 
                  level={level + 1} 
                />
              ))}
            </div>
          )}
        </div>
      );
    }
    
    return (
      <div
        className={`flex items-center px-2 py-1 hover:bg-secondary-700 cursor-pointer text-secondary-200 ${
          activeFile?.name === node.name ? 'bg-primary-600' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 24}px` }}
        onClick={() => handleFileSelect({ ...node, path: fullPath })}
      >
        <File className="w-4 h-4 mr-2 text-secondary-400" />
        <span className="text-sm">{node.name}</span>
      </div>
    );
  };

  const SettingsPanel = () => (
    <div className="absolute top-12 right-4 bg-white border border-secondary-200 rounded-lg shadow-lg p-4 z-10 w-80">
      <h3 className="font-semibold mb-4">Editor Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full border border-secondary-200 rounded px-3 py-2"
          >
            <option value="vs-dark">Dark</option>
            <option value="light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <input
            type="range"
            min="10"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-secondary-600">{fontSize}px</span>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full border border-secondary-200 rounded px-3 py-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="rust">Rust</option>
            <option value="motoko">Motoko</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`flex h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* File Explorer */}
      <div className="w-80 bg-secondary-800 border-r border-secondary-700">
        <div className="p-3 border-b border-secondary-700">
          <h3 className="text-white font-medium">
            {currentRepo?.name || 'Project Files'}
          </h3>
        </div>
        <div className="overflow-y-auto h-full">
          <FileTreeNode node={mockFileTree} />
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tab Bar */}
        <div className="bg-secondary-100 border-b border-secondary-200 flex items-center">
          <div className="flex">
            {openFiles.map((file) => (
              <div
                key={file.path}
                className={`flex items-center px-4 py-2 border-r border-secondary-200 cursor-pointer ${
                  activeFile?.path === file.path 
                    ? 'bg-white border-b-2 border-primary-500' 
                    : 'hover:bg-secondary-50'
                }`}
                onClick={() => setActiveFile(file)}
              >
                <span className="text-sm mr-2">{file.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.path);
                  }}
                  className="hover:bg-secondary-200 rounded p-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          
          {/* Editor Actions */}
          <div className="ml-auto flex items-center space-x-2 px-4">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded hover:bg-secondary-200 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded hover:bg-secondary-200 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded hover:bg-secondary-200 transition-colors text-success"
              title="Run Code"
            >
              <Play className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          {activeFile ? (
            <Editor
              height="100%"
              language={activeFile.language || language}
              theme={theme}
              value={activeFile.content}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize,
                minimap: { enabled: true },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                folding: true,
                links: true,
                colorDecorators: true
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-secondary-50">
              <div className="text-center">
                <File className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-secondary-900 mb-2">No file selected</h3>
                <p className="text-secondary-600">Select a file from the explorer to start editing</p>
              </div>
            </div>
          )}
          
          {showSettings && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
