// HelpLink Component for in-app help
import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const HelpLink = ({ topic, className = "" }) => {
  const helpTopics = {
    'create-test-suite': {
      title: 'Creating Test Suites',
      url: 'https://github.com/your-repo/docs#creating-test-suites',
      description: 'Learn how to create, edit, and manage test suites'
    },
    'ai-assistant': {
      title: 'AI Test Generation',
      url: 'https://github.com/your-repo/docs#ai-test-generation',
      description: 'Use AI to generate test cases from natural language descriptions'
    },
    'run-tests': {
      title: 'Running Tests',
      url: 'https://github.com/your-repo/docs#running-tests',
      description: 'Execute test suites and view real-time results'
    },
    'sample-data': {
      title: 'Sample Data',
      url: 'https://github.com/your-repo/docs#sample-data',
      description: 'Manage sample data for testing and development'
    },
    'invitations': {
      title: 'Team Invitations',
      url: 'https://github.com/your-repo/docs#team-invitations',
      description: 'Invite team members and manage project access'
    },
    'account-switching': {
      title: 'Account Switching',
      url: 'https://github.com/your-repo/docs#account-switching',
      description: 'Switch between personal and invited project contexts'
    },
    'reporting': {
      title: 'Test Reports',
      url: 'https://github.com/your-repo/docs#test-reports',
      description: 'View and export test execution reports'
    }
  };

  const helpInfo = helpTopics[topic];
  
  if (!helpInfo) {
    return null;
  }

  return (
    <a
      href={helpInfo.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors ${className}`}
      title={helpInfo.description}
    >
      <QuestionMarkCircleIcon className="h-3 w-3" />
      <span>{helpInfo.title}</span>
    </a>
  );
};

export default HelpLink;
