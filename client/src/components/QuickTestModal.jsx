// client/src/components/QuickTestModal.jsx
import { useState } from 'react';
import { 
  XMarkIcon, 
  PlayIcon, 
  CodeBracketIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const QuickTestModal = ({ isOpen, onClose, tool, onExecute }) => {
  const [script, setScript] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  if (!isOpen || !tool?.quickTest) return null;

  const handleExecute = async () => {
    if (!script.trim()) {
      alert('Please paste your script first');
      return;
    }

    setIsRunning(true);
    setResults(null);

    try {
      const result = await onExecute({
        toolId: tool.id,
        script: script.trim(),
        language: tool.quickTest.language,
        fileExtension: tool.quickTest.fileExtension
      });

      setResults(result);
    } catch (error) {
      setResults({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleClose = () => {
    setScript('');
    setResults(null);
    setIsRunning(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CodeBracketIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {tool.quickTest.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.quickTest.description}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(90vh-200px)]">
          {/* Script Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Paste Your {tool.name} Script
              </label>
              <textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder={tool.quickTest.placeholder}
                className="w-full h-96 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono text-sm"
                spellCheck={false}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleExecute}
                disabled={!script.trim() || isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlayIcon className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run Script'}
              </button>
              
              <button
                onClick={() => setScript('')}
                disabled={isRunning}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Execution Results
            </h3>
            
            {isRunning && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <div>
                    <p className="text-blue-800 dark:text-blue-200 font-medium">
                      Running {tool.name} script...
                    </p>
                    <p className="text-blue-600 dark:text-blue-300 text-sm">
                      This may take a few moments
                    </p>
                  </div>
                </div>
              </div>
            )}

            {results && (
              <div className={`border rounded-lg p-4 ${
                results.success 
                  ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                  : 'bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700'
              }`}>
                <div className="flex items-start gap-3">
                  {results.success ? (
                    <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      results.success 
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {results.success ? 'Script Executed Successfully' : 'Script Execution Failed'}
                    </h4>
                    
                    {results.success ? (
                      <div className="mt-2 space-y-2">
                        {results.summary && (
                          <div className="text-sm text-green-700 dark:text-green-300">
                            <p><strong>Summary:</strong> {results.summary}</p>
                          </div>
                        )}
                        {results.duration && (
                          <div className="text-sm text-green-700 dark:text-green-300">
                            <p><strong>Duration:</strong> {results.duration}</p>
                          </div>
                        )}
                        {results.tests && (
                          <div className="text-sm text-green-700 dark:text-green-300">
                            <p><strong>Tests:</strong> {results.tests.passed}/{results.tests.total} passed</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-red-700 dark:text-red-300">
                          <strong>Error:</strong> {results.error}
                        </p>
                      </div>
                    )}
                    
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Executed at: {new Date(results.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!isRunning && !results && (
              <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-8 text-center">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  Paste your {tool.name} script and click "Run Script" to see results here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CodeBracketIcon className="h-4 w-4" />
                {tool.quickTest.language}
              </span>
              <span className="flex items-center gap-1">
                <DocumentTextIcon className="h-4 w-4" />
                {tool.quickTest.fileExtension}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <ClockIcon className="h-4 w-4" />
              Quick Test Mode
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickTestModal;
