import { useState } from 'react';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your SoftDeploy testing assistant. I can help you debug issues, create tests, and troubleshoot problems. What can I help you with?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const getDebugResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Debug responses
    if (lowerMessage.includes('sample data') || lowerMessage.includes('no data')) {
      return 'I can help with sample data issues! Try refreshing the page or clearing localStorage. The sample data should appear automatically when you first visit Test Management. If not, let me know and I can help debug further.';
    }
    
    if (lowerMessage.includes('blank') || lowerMessage.includes('empty')) {
      return 'Blank screen issues are usually navigation problems. Try refreshing the page or going back to the main dashboard. I can help you navigate through the testing workflow step by step.';
    }
    
    if (lowerMessage.includes('test') && lowerMessage.includes('not working')) {
      return 'Test execution issues can be tricky! Let me help you troubleshoot. First, check if the server is running, then verify your test configuration. I can guide you through each step.';
    }
    
    if (lowerMessage.includes('cypress') || lowerMessage.includes('k6') || lowerMessage.includes('playwright')) {
      return 'For external tools like Cypress, k6, or Playwright, try the Quick Test feature! Click the "Quick Test" button next to the tool and paste your script. This bypasses the GUI and runs your code directly.';
    }
    
    if (lowerMessage.includes('api') || lowerMessage.includes('functional') || lowerMessage.includes('performance')) {
      return 'I can help you create API, Functional, or Performance tests! Start by selecting the test type, then add steps. For API tests, use JSONPlaceholder as a base URL. For functional tests, try simple navigation. For performance tests, start with low user counts.';
    }
    
    if (lowerMessage.includes('error') || lowerMessage.includes('failed')) {
      return 'Errors are learning opportunities! Share the specific error message and I can help you fix it. Common issues include incorrect URLs, missing configurations, or server connectivity problems.';
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
      return 'I\'m here to help! Try these steps: 1) Create a test folder, 2) Add a test suite, 3) Configure your test steps, 4) Run the test. If you get stuck at any step, just ask me!';
    }
    
    // Default responses
    const responses = [
      'I can help you with testing, debugging, and troubleshooting. What specific issue are you facing?',
      'Let me help you get your tests working! Are you having issues with sample data, test execution, or navigation?',
      'I\'m here to debug any problems you encounter. Describe what you\'re trying to do and what\'s not working.',
      'SoftDeploy testing platform can be tricky at first. I can guide you through creating and running tests step by step.',
      'Having trouble with the testing tools? I can help you with API tests, functional tests, performance tests, or external tools like Cypress.'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage = inputMessage.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInputMessage('');
    setIsTyping(true);
    
    setTimeout(() => {
      const response = getDebugResponse(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #10b981, #06b6d4)',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}
      >
        🤖
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '350px',
      height: '500px',
      backgroundColor: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            🤖
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>SoftDeploy AI</div>
            <div style={{ color: '#9ca3af', fontSize: '12px' }}>Online</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '18px'
          }}
        >
          ×
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '8px 12px',
              borderRadius: '12px',
              backgroundColor: message.type === 'user' ? '#10b981' : '#0d1117',
              color: message.type === 'user' ? 'black' : 'white',
              fontSize: '14px'
            }}>
              {message.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid #30363d',
        display: 'flex',
        gap: '8px'
      }}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me anything about testing or debugging..."
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: '8px 12px',
            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
            border: 'none',
            borderRadius: '8px',
            color: 'black',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default AIChatbot;