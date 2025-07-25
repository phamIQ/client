// components/Chat.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot,
  History,
  Settings,
  Plus,
  Search,
  Send,
  User,
  Loader2,
  AlertCircle,
  Info,
  Leaf,
  Sparkles,
  Copy,
  Check,
  Clock,
  Trash2,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Microscope,
  Target,
  Calendar,
  FileText
} from "lucide-react";
import SidebarLayout from '../components/SidebarLayout';
import { useAuth } from '../hooks/useAuth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Spinner from "@/components/ui/Spinner";
import ReactMarkdown from 'react-markdown';

// Types
interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}

interface ChatState {
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
}

type Message = {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
};

type ChatContext = {
  disease: string;
  cropType: string;
  confidence: number;
  severity: string;
  filename?: string;
  created_at?: string;
  image_url?: string;
};

const Chat: React.FC = () => {
  // State
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "bot",
      content: "Hello! I'm phamiq AI.",
      timestamp: new Date()
    }
  ]);
  const [chatState, setChatState] = useState<ChatState>({
    isLoading: false,
    error: null,
    isConnected: true
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Navigation
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Sidebar configuration
  const sidebarItems: SidebarItem[] = [
    { icon: Plus, label: 'Analysis', href: '/upload' },
    { icon: History, label: 'History', href: '/history' },
    { icon: Bot, label: 'Chat', href: '/chat', active: true },
    { icon: Search, label: 'Discovery', href: '/discovery' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ];

  // Load chat context from localStorage on mount
  useEffect(() => {
    const contextData = localStorage.getItem('chatContext');
    if (contextData) {
      try {
        const context: ChatContext = JSON.parse(contextData);
        setChatContext(context);
        
        // Auto-generate initial message based on context
        const initialMessage = generateInitialMessage(context);
        setMessages([
          {
            id: 1,
            type: "bot",
            content: initialMessage,
            timestamp: new Date()
          }
        ]);
        
        // Clear the context from localStorage
        localStorage.removeItem('chatContext');
      } catch (error) {
        console.error('Error parsing chat context:', error);
      }
    }
  }, []);

  // Load chat history on mount
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadChatHistory();
    }
  }, [isAuthenticated, authLoading]);

  // Test chat connection on mount
  useEffect(() => {
    const testConnection = async () => {
      // Only test connection if user is authenticated
      if (!isAuthenticated || authLoading) {
        return;
      }
      
      try {
        // First test if API is reachable
        const isBackendReachable = await fetch("/test-backend");
        if (!isBackendReachable) {
          setChatState(prev => ({ 
            ...prev, 
            isConnected: false,
            error: 'Backend server is not reachable. Please ensure you have an internet connection.',
            isLoading: false
          }));
          return;
        }
        
        const isAvailable = await fetch("/is-available");
        setChatState(prev => ({ 
          ...prev, 
          isConnected: isAvailable.ok,
          error: isAvailable.ok ? null : 'Chat service is not available. Please check your connection.',
          isLoading: false
        }));
      } catch (error) {
        console.error('Connection test failed:', error);
        setChatState(prev => ({ 
          ...prev, 
          isConnected: false,
          error: 'Failed to connect to chat service.',
          isLoading: false
        }));
      }
    };

    testConnection();
  }, [isAuthenticated, authLoading]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Clear error after 5 seconds
  useEffect(() => {
    if (chatState.error) {
      const timer = setTimeout(() => {
        setChatState(prev => ({ ...prev, error: null }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [chatState.error]);

  // Generate initial message based on disease context
  const generateInitialMessage = (context: ChatContext): string => {
    const severityIcon = getSeverityIcon(context.severity);
    const confidenceLevel = getConfidenceLevel(context.confidence);
    
    return `I've analyzed your **${context.disease}** detection in **${context.cropType}** crops. Here's what I found:

**Analysis Results:**
${severityIcon} **Severity Level:** ${context.severity}
${confidenceLevel.icon} **Detection Confidence:** ${(context.confidence * 100).toFixed(0)}% (${confidenceLevel.text})

**I can help you with:**
• **Treatment options** specifically for ${context.disease} in ${context.cropType}
• **Prevention strategies** to avoid future outbreaks
• **Management practices** for ${context.severity} severity cases
• **Chemical and biological control** methods
• **Cultural practices** to reduce disease spread
• **Monitoring and early detection** techniques

What specific aspect of ${context.disease} management would you like to discuss? I can provide detailed treatment plans, prevention strategies, or answer any questions about managing this disease in your ${context.cropType} crops.`;
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return '🔴';
      case 'moderate':
        return '🟡';
      case 'mild':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Get confidence level
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.9) return { icon: '🎯', text: 'Very High' };
    if (confidence >= 0.8) return { icon: '✅', text: 'High' };
    if (confidence >= 0.7) return { icon: '⚠️', text: 'Good' };
    if (confidence >= 0.6) return { icon: '❓', text: 'Moderate' };
    return { icon: '❌', text: 'Low' };
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'moderate':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'mild':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const history = await fetch("/get-chat-history?limit=20");
      if (!history.ok) {
        throw new Error("Failed to load chat history");
      }
      const data: any[] = await history.json(); // Changed to any[]
      // setChatHistory(data); // This line was removed as per the edit hint
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Load specific chat
  const loadChat = async (chatId: string) => {
    try {
      const chat = await fetch(`/get-chat-by-id/${chatId}`);
      if (!chat.ok) {
        throw new Error("Failed to load chat");
      }
      const data: { messages: Message[] } = await chat.json();
      setMessages(data.messages.map((msg: any, index: number) => ({
        id: index + 1,
        type: msg.role === 'user' ? 'user' : 'bot',
        content: msg.content,
        timestamp: new Date(msg.timestamp || Date.now())
      })));
      setCurrentChatId(chatId);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    try {
      const response = await fetch(`/delete-chat/${chatId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }
      await loadChatHistory();
      if (currentChatId === chatId) {
        handleClearChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  // Retry connection function
  const retryConnection = async () => {
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const isAvailable = await fetch("/is-available");
      setChatState(prev => ({ 
        ...prev, 
        isConnected: isAvailable.ok,
        error: isAvailable.ok ? null : 'Chat service is not available. Please check your connection.',
        isLoading: false
      }));
    } catch (error) {
      console.error('Retry connection failed:', error);
      setChatState(prev => ({ 
        ...prev, 
        isConnected: false,
        error: 'Failed to connect to chat service.',
        isLoading: false
      }));
    }
  };

  // Clear chat function
  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: "bot",
        content: "Hello! I'm your agricultural AI assistant. I can help you with crop management, disease identification, farming techniques, and more. How can I assist you today?",
        timestamp: new Date()
      }
    ]);
    setChatContext(null);
    setCurrentChatId(null);
  };

  // Copy message function
  const handleCopyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
  };

  // Handle sending message
  const handleSendMessage = useCallback(async (): Promise<void> => {
    if (!message.trim() || chatState.isLoading) return;
    
    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: message.trim(),
      timestamp: new Date()
    };
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setChatState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Call backend /chat/ endpoint
      const chatUrl = "/chat/";
      console.log("Sending chat message to:", chatUrl);
      let systemPrompt = undefined;
      if (chatContext) {
        systemPrompt = `You are an agricultural AI assistant. The user is asking about the following disease detection: Disease: ${chatContext.disease}, Crop: ${chatContext.cropType}, Confidence: ${(chatContext.confidence * 100).toFixed(0)}%, Severity: ${chatContext.severity}. Provide context-aware, expert advice.`;
      }
      const payload = systemPrompt
        ? { message: userMessage.content, system_prompt: systemPrompt }
        : { message: userMessage.content };
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || response.statusText);
      }
      const data = await response.json();
      const botMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setChatState(prev => ({ ...prev, isConnected: true }));
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setChatState(prev => ({ 
        ...prev, 
        error: errorMessage,
        isConnected: false 
      }));
      
      // Add error message to chat
      const errorBotMessage: Message = {
        id: Date.now() + 1,
        type: "bot",
        content: `I'm sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setChatState(prev => ({ ...prev, isLoading: false }));
    }
  }, [message, chatState.isLoading, navigate]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Handle navigation
  const handleNavigation = useCallback((href: string): void => {
    navigate(href);
  }, [navigate]);

  // Handle textarea change
  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setMessage(e.target.value);
  }, []);

  // Clear error manually
  const clearError = useCallback((): void => {
    setChatState(prev => ({ ...prev, error: null }));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Function to format message content with better styling
  const formatMessageContent = (content: string) => {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n');
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => {
          // Check if this is a heading (starts with ** and ends with **)
          if (paragraph.match(/^\*\*.*\*\*$/)) {
            const heading = paragraph.replace(/\*\*(.*?)\*\*/g, '$1');
            return (
              <div key={index} className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900 leading-relaxed">
                  {heading}
                </h3>
              </div>
            );
          }
          
          // Check if paragraph contains numbered list
          if (paragraph.match(/^\d+\.\s/)) {
            const lines = paragraph.split('\n');
            const title = lines[0];
            const listItems = lines.slice(1).filter(line => line.trim());
            
            return (
              <div key={index} className="space-y-3">
                <h3 className="font-bold text-gray-900 text-base">
                  {title.replace(/\*\*(.*?)\*\*/g, '$1')}
                </h3>
                <ul className="list-decimal list-inside space-y-2 ml-4">
                  {listItems.map((item, itemIndex) => {
                    const cleanItem = item.replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = cleanItem.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = cleanItem.substring(0, colonIndex + 1);
                      const description = cleanItem.substring(colonIndex + 1);
                      
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          {cleanItem}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains bullet points with headings
          if (paragraph.includes('**') && paragraph.includes(':')) {
            const [title, ...points] = paragraph.split('\n');
            const cleanTitle = title.replace(/\*\*(.*?)\*\*/g, '$1');
            
            return (
              <div key={index} className="space-y-2">
                <div className="font-bold text-gray-900 text-base">
                  {cleanTitle}
                </div>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {points.map((point, pointIndex) => {
                    const pointText = point.trim().replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = pointText.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = pointText.substring(0, colonIndex + 1);
                      const description = pointText.substring(colonIndex + 1);
                      
                      return (
                        <li key={pointIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={pointIndex} className="text-gray-700 text-sm leading-relaxed">
                          {pointText}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains bullet points (starts with • or -)
          if (paragraph.match(/^[•\-]\s/)) {
            const lines = paragraph.split('\n');
            const listItems = lines.filter(line => line.trim());
            
            return (
              <div key={index} className="space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4">
                  {listItems.map((item, itemIndex) => {
                    const cleanItem = item.replace(/^[•\-]\s/, '').replace(/\*\*(.*?)\*\*/g, '$1');
                    const colonIndex = cleanItem.indexOf(':');
                    
                    if (colonIndex !== -1) {
                      const label = cleanItem.substring(0, colonIndex + 1);
                      const description = cleanItem.substring(colonIndex + 1);
                      
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          <span className="font-semibold text-gray-900">{label}</span>
                          {description}
                        </li>
                      );
                    } else {
                      return (
                        <li key={itemIndex} className="text-gray-700 text-sm leading-relaxed">
                          {cleanItem}
                        </li>
                      );
                    }
                  })}
                </ul>
              </div>
            );
          }
          
          // Check if paragraph contains inline bold text
          if (paragraph.includes('**')) {
            const parts = paragraph.split(/\*\*(.*?)\*\*/);
            return (
              <p key={index} className="text-gray-700 text-sm leading-relaxed">
                {parts.map((part, partIndex) => {
                  if (partIndex % 2 === 1) {
                    // This is bold text
                    return (
                      <span key={partIndex} className="font-semibold text-gray-900">
                        {part}
                      </span>
                    );
                  } else {
                    // This is regular text
                    return part;
                  }
                })}
              </p>
            );
          }
          
          // Regular paragraph
          return (
            <p key={index} className="text-gray-700 text-sm leading-relaxed">
              {paragraph}
            </p>
          );
        })}
      </div>
    );
  };

  // Show loading state while authentication is being checked
  if (authLoading) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Checking authentication...</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <SidebarLayout>
        <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Bot className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">Please log in to access the AI chat assistant.</p>
              <Button onClick={() => navigate('/login')} className="bg-teal-600 hover:bg-teal-700">
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen md:ml-24 relative">
        {/* Chat History Sidebar */}
        {showHistory && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Chat History</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                {/* chatHistory.length === 0 ? ( // This line was removed as per the edit hint
                  <p className="text-sm text-gray-500">No chat history yet</p>
                ) : ( */}
                  {/* chatHistory.map((chat) => ( // This line was removed as per the edit hint
                    <div
                      key={chat.id}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentChatId === chat.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div
                        className="flex-1 min-w-0"
                        onClick={() => loadChat(chat.id)}
                      >
                        <h4 className="font-medium text-gray-900 truncate">
                          {chat.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          {new Date(chat.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteChat(chat.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                        title="Delete chat"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )) */}
                {/* )} */}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Disease Context Banner */}
        {chatContext && showContextDetails && (
          <div className="bg-white border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">Disease Analysis Context</h3>
                </div>
                <button
                  onClick={() => setShowContextDetails(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  title="Hide details"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Disease Info */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                      <h4 className="font-medium text-blue-900 text-sm">Disease</h4>
                    </div>
                    <p className="text-blue-800 font-semibold">{chatContext.disease}</p>
                  </CardContent>
                </Card>

                {/* Crop Type */}
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium text-green-900 text-sm">Crop Type</h4>
                    </div>
                    <p className="text-green-800 font-semibold">{chatContext.cropType}</p>
                  </CardContent>
                </Card>

                {/* Severity */}
                <Card className={`border ${getSeverityColor(chatContext.severity)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      <h4 className="font-medium text-sm">Severity</h4>
                    </div>
                    <p className="font-semibold">{chatContext.severity}</p>
                  </CardContent>
                </Card>

                {/* Confidence */}
                <Card className="bg-gray-50 border-gray-200">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900 text-sm">Confidence</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getConfidenceColor(chatContext.confidence)}`}>
                        {(chatContext.confidence * 100).toFixed(0)}%
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getConfidenceLevel(chatContext.confidence).text}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Details */}
              {(chatContext.filename || chatContext.created_at) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                    {chatContext.filename && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span>File: {chatContext.filename}</span>
                      </div>
                    )}
                    {chatContext.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Analyzed: {new Date(chatContext.created_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {chatState.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mx-4 my-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-red-700">{chatState.error}</p>
                {!chatState.isConnected && (
                  <button
                    onClick={retryConnection}
                    disabled={chatState.isLoading}
                    className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    {chatState.isLoading ? 'Retrying...' : 'Retry Connection'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Connection Loading */}
        {chatState.isLoading && !chatState.isConnected && !chatState.error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-4 my-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="animate-spin w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-700">Testing connection to chat service...</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-4 py-4 bg-white">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`rounded-lg px-4 py-3 max-w-[85%] ${msg.type === "user" ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-900"}`}>
                    {msg.type === "user" ? (
                      <div className="text-sm leading-relaxed">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {chatState.isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-4 py-3 bg-gray-50 text-gray-900 flex items-center gap-2">
                    <Spinner size={16} />
                    <span className="text-sm">...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Input Container */}
        <div className="bg-white border-t border-gray-200 px-4 py-4">
          <form
            className="flex items-end gap-3 max-w-3xl mx-auto"
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
          >
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Message PhamIQ..."
              className="flex-1 min-h-[44px] max-h-32 resize-none border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '128px' }}
            />
            <Button
              type="submit"
              disabled={!message.trim() || chatState.isLoading}
              className="w-10 h-10 p-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default Chat;