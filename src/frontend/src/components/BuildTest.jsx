import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Terminal,
  FileText,
  Download,
  Settings,
  Filter,
  Search
} from 'lucide-react';
import { useBuildStore } from '../store';
import { formatDistanceToNow } from 'date-fns';

const BuildTest = () => {
  const [activeTab, setActiveTab] = useState('builds');
  const [selectedBuild, setSelectedBuild] = useState(null);
  const [buildConfig, setBuildConfig] = useState({
    command: 'npm run build',
    environment: 'production',
    notifications: true
  });
  const [testConfig, setTestConfig] = useState({
    command: 'npm test',
    coverage: true,
    parallel: false
  });
  const [isRunning, setIsRunning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    builds,
    tests,
    currentBuild,
    isBuilding,
    isTesting,
    setBuilds,
    setTests,
    setCurrentBuild,
    setBuilding,
    setTesting,
    addBuild,
    addTest
  } = useBuildStore();

  // Mock build and test data
  useEffect(() => {
    const mockBuilds = [
      {
        id: '1',
        status: 'success',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3500000),
        duration: 65,
        command: 'npm run build',
        branch: 'main',
        commit: 'abc123f',
        logs: 'Build completed successfully\nBundle size: 2.3MB\nOptimizations applied'
      },
      {
        id: '2',
        status: 'failed',
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 7100000),
        duration: 45,
        command: 'npm run build',
        branch: 'main',
        commit: 'def456g',
        logs: 'Build failed\nError: Module not found\nCheck dependencies'
      },
      {
        id: '3',
        status: 'running',
        startTime: new Date(Date.now() - 120000),
        duration: 120,
        command: 'npm run build',
        branch: 'development',
        commit: 'ghi789h',
        logs: 'Building...\nCompiling TypeScript\nBundling assets'
      }
    ];

    const mockTests = [
      {
        id: '1',
        status: 'success',
        startTime: new Date(Date.now() - 1800000),
        endTime: new Date(Date.now() - 1750000),
        duration: 32,
        command: 'npm test',
        passed: 47,
        failed: 0,
        coverage: 85.2,
        logs: 'All tests passed\nCoverage: 85.2%\n47 tests completed'
      },
      {
        id: '2',
        status: 'failed',
        startTime: new Date(Date.now() - 3600000),
        endTime: new Date(Date.now() - 3580000),
        duration: 28,
        command: 'npm test',
        passed: 42,
        failed: 5,
        coverage: 78.9,
        logs: '5 tests failed\nCoverage: 78.9%\nCheck failing tests'
      }
    ];

    setBuilds(mockBuilds);
    setTests(mockTests);
  }, [setBuilds, setTests]);

  const runBuild = async () => {
    setBuilding(true);
    setIsRunning(true);
    
    const newBuild = {
      id: Date.now().toString(),
      status: 'running',
      startTime: new Date(),
      command: buildConfig.command,
      branch: 'main',
      commit: 'latest',
      logs: 'Starting build...\n'
    };
    
    addBuild(newBuild);
    setCurrentBuild(newBuild);
    
    // Simulate build process
    setTimeout(() => {
      const completedBuild = {
        ...newBuild,
        status: Math.random() > 0.3 ? 'success' : 'failed',
        endTime: new Date(),
        duration: Math.floor(Math.random() * 120) + 30,
        logs: newBuild.logs + (Math.random() > 0.3 ? 
          'Build completed successfully\nBundle optimized\nDeployment ready' :
          'Build failed\nSyntax error found\nCheck your code')
      };
      
      // Update the build in the store
      const updatedBuilds = builds.map(b => 
        b.id === newBuild.id ? completedBuild : b
      );
      setBuilds([completedBuild, ...builds.filter(b => b.id !== newBuild.id)]);
      setCurrentBuild(completedBuild);
      setBuilding(false);
      setIsRunning(false);
    }, 5000);
  };

  const runTests = async () => {
    setTesting(true);
    setIsRunning(true);
    
    const newTest = {
      id: Date.now().toString(),
      status: 'running',
      startTime: new Date(),
      command: testConfig.command,
      logs: 'Starting tests...\n'
    };
    
    addTest(newTest);
    
    // Simulate test process
    setTimeout(() => {
      const passed = Math.floor(Math.random() * 50) + 30;
      const failed = Math.floor(Math.random() * 5);
      const completedTest = {
        ...newTest,
        status: failed === 0 ? 'success' : 'failed',
        endTime: new Date(),
        duration: Math.floor(Math.random() * 60) + 20,
        passed,
        failed,
        coverage: Math.floor(Math.random() * 30) + 70,
        logs: newTest.logs + `Tests completed\nPassed: ${passed}\nFailed: ${failed}\nCoverage: ${Math.floor(Math.random() * 30) + 70}%`
      };
      
      const updatedTests = tests.map(t => 
        t.id === newTest.id ? completedTest : t
      );
      setTests([completedTest, ...tests.filter(t => t.id !== newTest.id)]);
      setTesting(false);
      setIsRunning(false);
    }, 3000);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-error" />;
      case 'running':
        return <RefreshCw className="w-5 h-5 text-warning animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-secondary-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = (activeTab === 'builds' ? builds : tests).filter(item => {
    const matchesSearch = item.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.commit?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const BuildList = () => (
    <div className="space-y-3">
      {filteredItems.map((build) => (
        <div
          key={build.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedBuild?.id === build.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-200 hover:border-secondary-300'
          }`}
          onClick={() => setSelectedBuild(build)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(build.status)}
              <div>
                <h4 className="font-medium text-secondary-900">
                  Build #{build.id}
                </h4>
                <p className="text-sm text-secondary-600">
                  {build.branch && `${build.branch} • `}
                  {build.commit && `${build.commit.slice(0, 7)} • `}
                  {formatDistanceToNow(build.startTime, { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(build.status)}`}>
              {build.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <span>{build.command}</span>
            {build.duration && (
              <span>{build.duration}s</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const TestList = () => (
    <div className="space-y-3">
      {filteredItems.map((test) => (
        <div
          key={test.id}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedBuild?.id === test.id
              ? 'border-primary-500 bg-primary-50'
              : 'border-secondary-200 hover:border-secondary-300'
          }`}
          onClick={() => setSelectedBuild(test)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {getStatusIcon(test.status)}
              <div>
                <h4 className="font-medium text-secondary-900">
                  Test Run #{test.id}
                </h4>
                <p className="text-sm text-secondary-600">
                  {formatDistanceToNow(test.startTime, { addSuffix: true })}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
              {test.status}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <span>{test.command}</span>
            <div className="flex items-center space-x-4">
              {test.passed !== undefined && (
                <span className="text-success">✓ {test.passed}</span>
              )}
              {test.failed !== undefined && test.failed > 0 && (
                <span className="text-error">✗ {test.failed}</span>
              )}
              {test.coverage && (
                <span>{test.coverage}% coverage</span>
              )}
              {test.duration && (
                <span>{test.duration}s</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const LogViewer = () => {
    if (!selectedBuild) {
      return (
        <div className="flex items-center justify-center h-full text-secondary-500">
          <div className="text-center">
            <Terminal className="w-12 h-12 mx-auto mb-3" />
            <p>Select a build or test to view logs</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-secondary-200">
          <h3 className="font-medium">
            {activeTab === 'builds' ? 'Build' : 'Test'} Logs - #{selectedBuild.id}
          </h3>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-secondary-100 rounded transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-secondary-100 rounded transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-secondary-900 text-secondary-100 p-4 rounded font-mono text-sm whitespace-pre-wrap">
            {selectedBuild.logs || 'No logs available'}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-secondary-900">Build & Test</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={runTests}
            disabled={isRunning}
            className="flex items-center space-x-2 px-4 py-2 border border-secondary-200 rounded-lg hover:bg-secondary-50 transition-colors disabled:opacity-50"
          >
            {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Tests</span>
          </button>
          <button
            onClick={runBuild}
            disabled={isRunning}
            className="flex items-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            {isBuilding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Build</span>
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Build/Test List */}
        <div className="lg:col-span-1 bg-white rounded-lg border border-secondary-200 flex flex-col">
          <div className="border-b border-secondary-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('builds')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'builds'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Builds ({builds.length})
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'tests'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-600 hover:text-secondary-900'
                }`}
              >
                Tests ({tests.length})
              </button>
            </div>
          </div>

          <div className="p-4 border-b border-secondary-200">
            <div className="flex space-x-2 mb-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-secondary-200 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-secondary-200 rounded px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failed">Failed</option>
                <option value="running">Running</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {activeTab === 'builds' ? <BuildList /> : <TestList />}
          </div>
        </div>

        {/* Log Viewer */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-secondary-200">
          <LogViewer />
        </div>
      </div>
    </div>
  );
};

export default BuildTest;
