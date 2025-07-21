// src/providers/CopilotKitProvider.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import { CopilotKit } from "@copilotkit/react-core";
import { CopilotPopup } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";
import { useAuth } from '../contexts/AuthContext';
import CopilotStateProvider from './CopilotStateProvider';

const CopilotKitProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const initRef = useRef(false);

  // Memoize config to prevent re-initialization
  const copilotConfig = useMemo(() => ({
    runtimeUrl: import.meta.env.VITE_COPILOT_URL || "http://localhost:5000/copilotkit",
    instructions: `You are an intelligent assistant for a task management system. 
    You can help users manage projects, tasks, and teams. 
    You have access to the current state of all projects, tasks, user information, 
    and can perform actions like creating tasks and projects, updating task statuses, 
    and providing insights on productivity and workload.`,
    onError: (error) => {
      console.error('CopilotKit Error:', error);
    }
  }), []);

  // Log initialization only once
  useEffect(() => {
    if (!initRef.current && isAuthenticated) {
      console.log('🚀 CopilotKit: Initialized for authenticated user');
      initRef.current = true;
    }
  }, [isAuthenticated]);

  // Don't render anything while auth is loading
  if (authLoading) {
    return <>{children}</>;
  }

  // Only wrap with CopilotKit if authenticated
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <CopilotKit {...copilotConfig}>
      <CopilotStateProvider>
        {children}
      </CopilotStateProvider>
      <CopilotPopup />
    </CopilotKit>
  );
};

export default CopilotKitProvider;