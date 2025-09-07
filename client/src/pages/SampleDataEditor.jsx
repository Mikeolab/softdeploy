import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SampleDataEditor = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('projects');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({});

  const dataTypes = [
    { key: 'users', label: 'Users', icon: '👥' },
    { key: 'projects', label: 'Projects', icon: '📁' },
    { key: 'testSuites', label: 'Test Suites', icon: '🧪' },
    { key: 'testRuns', label: 'Test Runs', icon: '🏃' }
  ];

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const promises = dataTypes.map(async (type) => {
        const response = await fetch(`/api/sample-data/${type.key}`);
        const result = await response.json();
        return { [type.key]: result.success ? result.data : [] };
      });

      const results = await Promise.all(promises);
      const combinedData = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setData(combinedData);
    } catch (error) {
      console.error('Error loading sample data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataType = async (type) => {
    try {
      const response = await fetch(`/api/sample-data/${type}`);
      const result = await response.json();
      if (result.success) {
        setData(prev => ({ ...prev, [type]: result.data }));
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    }
  };

  const saveItem = async (type, item) => {
    try {
      const isNew = !item.id || item.id.startsWith('new-');
      const url = `/api/sample-data/${type}`;
      const method = isNew ? 'POST' : 'PUT';
      
      let requestBody;
      if (isNew) {
        requestBody = item;
      } else {
        const updatedData = data[type].map(d => d.id === item.id ? item : d);
        requestBody = { data: updatedData };
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      if (result.success) {
        await loadDataType(type);
        setEditingItem(null);
        setNewItem({});
      } else {
        alert(`Error saving ${type}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error saving ${type}:`, error);
      alert(`Error saving ${type}`);
    }
  };

  const deleteItem = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;

    try {
      const response = await fetch(`/api/sample-data/${type}/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      if (result.success) {
        await loadDataType(type);
      } else {
        alert(`Error deleting ${type}: ${result.error}`);
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      alert(`Error deleting ${type}`);
    }
  };

  const startEditing = (item, type) => {
    setEditingItem({ ...item, _type: type });
  };

  const addNewItem = (type) => {
    setNewItem({ _type: type });
  };

  const renderItemEditor = (item, type) => {
    const fields = getFieldsForType(type);
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">
          {item.id?.startsWith('new-') ? 'Add New' : 'Edit'} {type}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={item[field.key] || ''}
                  data-testid={`${type}-${field.key}-input`}
                  onChange={(e) => {
                    if (item.id?.startsWith('new-')) {
                      setNewItem(prev => ({ ...prev, [field.key]: e.target.value }));
                    } else {
                      setEditingItem(prev => ({ ...prev, [field.key]: e.target.value }));
                    }
                  }}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={item[field.key] || ''}
                  data-testid={`${type}-${field.key}-input`}
                  onChange={(e) => {
                    if (item.id?.startsWith('new-')) {
                      setNewItem(prev => ({ ...prev, [field.key]: e.target.value }));
                    } else {
                      setEditingItem(prev => ({ ...prev, [field.key]: e.target.value }));
                    }
                  }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={() => {
              setEditingItem(null);
              setNewItem({});
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => saveItem(type, item.id?.startsWith('new-') ? newItem : item)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            data-testid={`save-${type}-btn`}
          >
            {item.id?.startsWith('new-') ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  const getFieldsForType = (type) => {
    const fieldMaps = {
      users: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'role', label: 'Role', type: 'text' }
      ],
      projects: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'environment', label: 'Environment', type: 'text' },
        { key: 'user_id', label: 'User ID', type: 'text' }
      ],
      testSuites: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Name', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'test_type', label: 'Test Type', type: 'text' },
        { key: 'tool_id', label: 'Tool ID', type: 'text' },
        { key: 'base_url', label: 'Base URL', type: 'url' }
      ],
      testRuns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'test_suite_id', label: 'Test Suite ID', type: 'text' },
        { key: 'project_id', label: 'Project ID', type: 'text' },
        { key: 'user_id', label: 'User ID', type: 'text' },
        { key: 'status', label: 'Status', type: 'text' },
        { key: 'total_steps', label: 'Total Steps', type: 'number' },
        { key: 'passed_steps', label: 'Passed Steps', type: 'number' },
        { key: 'failed_steps', label: 'Failed Steps', type: 'number' },
        { key: 'total_time', label: 'Total Time (ms)', type: 'number' }
      ]
    };
    return fieldMaps[type] || [];
  };

  const renderDataTable = (type) => {
    const items = data[type] || [];
    const fields = getFieldsForType(type);

    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden" data-testid={`${type}-table`}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {dataTypes.find(dt => dt.key === type)?.icon} {dataTypes.find(dt => dt.key === type)?.label}
          </h3>
          <button
            onClick={() => addNewItem(type)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            data-testid={`add-${type}-btn`}
          >
            + Add New
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {fields.slice(0, 4).map(field => (
                  <th key={field.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {field.label}
                  </th>
                ))}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.map((item, index) => (
                <tr key={item.id || index}>
                  {fields.slice(0, 4).map(field => (
                    <td key={field.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {field.type === 'textarea' ? 
                        (item[field.key]?.substring(0, 50) + (item[field.key]?.length > 50 ? '...' : '')) :
                        item[field.key]
                      }
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEditing(item, type)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                      data-testid={`edit-${type}-btn`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteItem(type, item.id)}
                      className="text-red-600 hover:text-red-900"
                      data-testid={`delete-${type}-btn`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sample data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="sample-data-editor">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sample Data Editor</h1>
              <p className="mt-2 text-gray-600">Manage editable sample data for testing and development</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              data-testid="back-to-dashboard-btn"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" data-testid="data-type-tabs">
              {dataTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveTab(type.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === type.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  data-testid={`tab-${type.key}`}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Show editor if editing */}
          {(editingItem || newItem._type) && (
            <div className="mb-6">
              {renderItemEditor(editingItem || { ...newItem, id: `new-${Date.now()}` }, activeTab)}
            </div>
          )}

          {/* Show data table */}
          {renderDataTable(activeTab)}
        </div>
      </div>
    </div>
  );
};

export default SampleDataEditor;
