import { useState } from 'react';

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your SoftDeploy assistant. How can I help you today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages(prev => [...prev, { type: 'user', text: inputMessage }]);
    
    setTimeout(() => {
      const responses = [
        'I can help you with deployment questions, pricing information, or technical support.',
        'SoftDeploy offers automated CI/CD pipelines with 99.9% success rate. Would you like to know more?',
        'Our platform supports multiple deployment strategies. What specific feature are you interested in?',
        'Let me connect you with our technical documentation. Is there a particular integration you need help with?'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { type: 'bot', text: randomResponse }]);
    }, 1000);
    
    setInputMessage('');
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
          placeholder="Ask me anything..."
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