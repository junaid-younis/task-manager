// src/components/copilot/CopilotProvider.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCopilotState } from '../../hooks/useCopilotState';
import { useCopilotActions } from '../../hooks/useCopilotActions';

const CopilotProvider = ({ children }) => {
  const { isAuthenticated: _IS_AUTHENTICATED } = useAuth();

  // Always call hooks - they will handle the authentication check internally
  useCopilotState();
  useCopilotActions();

  return <>{children}</>;
};

export default CopilotProvider;