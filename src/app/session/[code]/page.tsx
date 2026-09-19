'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Navbar 
} from '@/components/Navbar';
import { CodeEditor } from '@/components/Editor/CodeEditor';
import { OutputConsole } from '@/components/Terminal/OutputConsole';
import { WebPreview } from '@/components/Terminal/WebPreview';
import { ParticipantList } from '@/components/Sidebar/ParticipantList';
import { WaitingRoomModal } from '@/components/Sidebar/WaitingRoomModal';
import { ChatPanel } from '@/components/Sidebar/ChatPanel';
import { FileExplorer } from '@/components/Sidebar/FileExplorer';
import { InviteModal } from '@/components/UI/InviteModal';

import { 
  UserSession, 
  FileItem, 
  ChatMessage, 
  ExecutionResult, 
  LanguageId, 
  ThemeId,
  PeerSignalMessage 
} from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';
import { RealtimeClient, getRandomColor } from '@/lib/realtime';

import { 
  Users, 
  MessageSquare, 
  FolderTree, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle,
  Code2,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function SessionWorkspace() {
  const params = useParams();
  const router = useRouter();
  const roomCode = typeof params?.code === 'string' ? params.code.toUpperCase() : '';

  // User & Room State
  const [currentUserId] = useState(() => `user_${Math.random().toString(36).substring(2, 9)}`);
  const [userName, setUserName] = useState('Developer');
  const [isHost, setIsHost] = useState(false);
  const [userColor] = useState(getRandomColor);
  const [userStatus, setUserStatus] = useState<'active' | 'waiting' | 'rejected'>('active');

  const [sessionTitle, setSessionTitle] = useState('CodeCollaborator Session');
  const [approvalRequired, setApprovalRequired] = useState(true);
  const [passcode, setPasscode] = useState('');

  // Sidebar Tab
  const [sidebarTab, setSidebarTab] = useState<'files' | 'users' | 'chat'>('files');
  const [activeTabMode, setActiveTabMode] = useState<'code' | 'web'>('code');

  // Editor State
  const [activeLanguage, setActiveLanguage] = useState<LanguageId>('javascript');
  const [activeTheme, setActiveTheme] = useState<ThemeId>('vs-dark');

  const [files, setFiles] = useState<FileItem[]>([
    {
      id: 'main_file',
      name: 'main.js',
      language: 'javascript',
      content: SUPPORTED_LANGUAGES.javascript.sampleCode,
    },
  ]);
  const [activeFileId, setActiveFileId] = useState('main_file');

  // Stdin Program Input State
  const [stdinInput, setStdinInput] = useState('');

  // Participants & Queue
  const [participants, setParticipants] = useState<UserSession[]>([]);
  const [waitingUsers, setWaitingUsers] = useState<UserSession[]>([]);

  // Messages & Execution
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isConsoleExpanded, setIsConsoleExpanded] = useState(true);

  // Modals
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isWaitingRoomOpen, setIsWaitingRoomOpen] = useState(false);

  // Realtime Engine Ref
  const realtimeRef = useRef<RealtimeClient | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  // Initialize Session Config & User Info
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load session user info from sessionStorage / localStorage
    const storedUser = sessionStorage.getItem(`user_${roomCode}`) || localStorage.getItem(`user_${roomCode}`);
    const storedConfig = sessionStorage.getItem(`config_${roomCode}`) || localStorage.getItem(`config_${roomCode}`);

    let name = 'Developer';
    let hostFlag = false;

    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      name = parsed.name || 'Developer';
      hostFlag = !!parsed.isHost;
    } else {
      // Prompt name if joining directly via URL
      name = prompt('Enter your name to join session:', 'Guest') || 'Guest';
      sessionStorage.setItem(`user_${roomCode}`, JSON.stringify({ name, isHost: false }));
    }

    setUserName(name);
    setIsHost(hostFlag);

    if (storedConfig) {
      const parsedConfig = JSON.parse(storedConfig);
      setSessionTitle(parsedConfig.title || 'Collaborative Session');
      setApprovalRequired(parsedConfig.approvalRequired ?? true);
      setPasscode(parsedConfig.passcode || '');
      if (parsedConfig.language && SUPPORTED_LANGUAGES[parsedConfig.language as LanguageId]) {
        setActiveLanguage(parsedConfig.language);
        setFiles([
          {
            id: 'main_file',
            name: `main.${SUPPORTED_LANGUAGES[parsedConfig.language as LanguageId].extension}`,
            language: parsedConfig.language,
            content: SUPPORTED_LANGUAGES[parsedConfig.language as LanguageId].sampleCode,
          },
        ]);
      }
    }

    // Host is active immediately. Guests set waiting or active depending on approval rule.
    if (hostFlag) {
      setUserStatus('active');
    } else {
      setUserStatus('waiting');
    }

    // Initialize Realtime P2P / Mesh Client
    const client = new RealtimeClient(roomCode, currentUserId, name, hostFlag, userColor);
    realtimeRef.current = client;

    client.initPeerJS().then(() => {
      if (hostFlag) {
        setParticipants([
          {
            id: currentUserId,
            name: name,
            isHost: true,
            color: userColor,
            joinedAt: Date.now(),
            status: 'active',
          },
        ]);
        addSystemMessage(`Session "${roomCode}" created by Host ${name}. Waiting for collaborators.`);
      } else {
        // Send JOIN_REQUEST immediately over broadcast channel + WebRTC
        client.sendMessage({
          type: 'JOIN_REQUEST',
          senderId: currentUserId,
          payload: {
            name,
            color: userColor,
          },
        });
        addSystemMessage(`Sending join request for session "${roomCode}" as ${name}...`);
      }
    });

    // Listen to incoming messages
    const unsubscribe = client.onMessage((msg: PeerSignalMessage) => {
      handleIncomingMessage(msg);
    });

    return () => {
      unsubscribe();
      client.disconnect();
    };
  }, [roomCode]);

  const addSystemMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `sys_${Date.now()}_${Math.random()}`,
        senderId: 'system',
        senderName: 'System',
        senderColor: '#3b82f6',
        text,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);
  };

  // Handle incoming signals
  const handleIncomingMessage = useCallback(
    (msg: PeerSignalMessage) => {
      const { type, senderId, payload } = msg;

      switch (type) {
        case 'JOIN_REQUEST':
          if (isHost) {
            const newUser: UserSession = {
              id: senderId,
              name: payload.name,
              isHost: false,
              color: payload.color || getRandomColor(),
              joinedAt: Date.now(),
              status: approvalRequired ? 'waiting' : 'active',
            };

            if (approvalRequired) {
              setWaitingUsers((prev) => {
                const exists = prev.some((u) => u.id === senderId);
                if (exists) return prev;
                return [...prev, newUser];
              });

              // Automatically open waiting room modal for Host so it's impossible to miss!
              setIsWaitingRoomOpen(true);
              addSystemMessage(`🔔 ${payload.name} is waiting in queue to join.`);
            } else {
              setParticipants((prev) => [...prev.filter((u) => u.id !== senderId), newUser]);
              
              // Send approve join state back
              realtimeRef.current?.sendMessage({
                type: 'APPROVE_JOIN',
                senderId: currentUserId,
                payload: {
                  targetUserId: senderId,
                  files,
                  activeFileId,
                  activeLanguage,
                  sessionTitle,
                },
              });
              addSystemMessage(`${payload.name} joined the session.`);
            }
          }
          break;

        case 'APPROVE_JOIN':
          if (payload.targetUserId === currentUserId) {
            setUserStatus('active');
            if (payload.files) setFiles(payload.files);
            if (payload.activeFileId) setActiveFileId(payload.activeFileId);
            if (payload.activeLanguage) setActiveLanguage(payload.activeLanguage);
            addSystemMessage('🎉 Host approved your request! Welcome to the live session.');
          }
          break;

        case 'REJECT_JOIN':
          if (payload.targetUserId === currentUserId) {
            setUserStatus('rejected');
          }
          break;

        case 'CODE_CHANGE':
          setFiles((prev) =>
            prev.map((f) => (f.id === payload.fileId ? { ...f, content: payload.content } : f))
          );
          break;

        case 'ACTIVE_FILE_CHANGE':
          setActiveFileId(payload.fileId);
          break;

        case 'CREATE_FILE':
          setFiles((prev) => [...prev, payload.file]);
          setActiveFileId(payload.file.id);
          break;

        case 'DELETE_FILE':
          setFiles((prev) => prev.filter((f) => f.id !== payload.fileId));
          break;

        case 'CHAT_MESSAGE':
          setMessages((prev) => [...prev, payload.message]);
          break;

        case 'TERMINAL_OUTPUT':
          setExecutionResult(payload.result);
          setIsConsoleExpanded(true);
          addSystemMessage(`${payload.executedBy} ran ${payload.result.language} code.`);
          break;

        default:
          break;
      }
    },
    [isHost, approvalRequired, currentUserId, files, activeFileId, activeLanguage, sessionTitle]
  );

  // Host Approve/Deny actions
  const handleApproveUser = (targetUserId: string) => {
    const userToApprove = waitingUsers.find((u) => u.id === targetUserId);
    if (!userToApprove) return;

    setWaitingUsers((prev) => prev.filter((u) => u.id !== targetUserId));
    setParticipants((prev) => [...prev, { ...userToApprove, status: 'active' }]);

    realtimeRef.current?.sendMessage({
      type: 'APPROVE_JOIN',
      senderId: currentUserId,
      payload: {
        targetUserId,
        files,
        activeFileId,
        activeLanguage,
        sessionTitle,
      },
    });

    addSystemMessage(`Approved ${userToApprove.name}.`);
  };

  const handleRejectUser = (targetUserId: string) => {
    setWaitingUsers((prev) => prev.filter((u) => u.id !== targetUserId));

    realtimeRef.current?.sendMessage({
      type: 'REJECT_JOIN',
      senderId: currentUserId,
      payload: {
        targetUserId,
      },
    });
  };

  // Resend join request from guest side if needed
  const handleResendJoinRequest = () => {
    if (realtimeRef.current) {
      realtimeRef.current.sendMessage({
        type: 'JOIN_REQUEST',
        senderId: currentUserId,
        payload: {
          name: userName,
          color: userColor,
        },
      });
      addSystemMessage('Resent join request to Host...');
    }
  };

  // Code change broadcast
  const handleCodeChange = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f))
    );

    realtimeRef.current?.sendMessage({
      type: 'CODE_CHANGE',
      senderId: currentUserId,
      payload: {
        fileId: activeFileId,
        content: newContent,
      },
    });
  };

  // Language Change
  const handleLanguageChange = (lang: LanguageId) => {
    setActiveLanguage(lang);
    const spec = SUPPORTED_LANGUAGES[lang];
    if (spec) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === activeFileId
            ? { ...f, language: lang, name: `main.${spec.extension}`, content: spec.sampleCode }
            : f
        )
      );
      
      realtimeRef.current?.sendMessage({
        type: 'CODE_CHANGE',
        senderId: currentUserId,
        payload: {
          fileId: activeFileId,
          content: spec.sampleCode,
        },
      });
    }
  };

  // Code Execution handler
  const handleRunCode = async () => {
    if (!activeFile) return;

    setIsExecuting(true);
    setIsConsoleExpanded(true);

    try {
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: activeLanguage,
          code: activeFile.content,
        }),
      });

      const data = await response.json();
      setExecutionResult(data);

      // Broadcast output to room
      realtimeRef.current?.sendMessage({
        type: 'TERMINAL_OUTPUT',
        senderId: currentUserId,
        payload: {
          result: data,
          executedBy: userName,
        },
      });
    } catch (e: any) {
      setExecutionResult({
        stdout: '',
        stderr: e.message || 'Failed to execute code.',
        output: e.message || 'Execution error.',
        code: 1,
        language: activeLanguage,
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Send Chat message
  const handleSendMessage = (text: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random()}`,
      senderId: currentUserId,
      senderName: userName,
      senderColor: userColor,
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);

    realtimeRef.current?.sendMessage({
      type: 'CHAT_MESSAGE',
      senderId: currentUserId,
      payload: {
        message: newMsg,
      },
    });
  };

  // WAITING ROOM SCREEN FOR GUESTS
  if (userStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-dark-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="bg-dark-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-bounce">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">Waiting for Host Approval</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hi <strong className="text-white">{userName}</strong>! You are in the queue for session <strong className="text-brand-400 font-mono">{roomCode}</strong>. The host has been notified to approve your access.
            </p>
          </div>

          <div className="bg-dark-850 p-4 rounded-xl border border-white/5 flex items-center justify-center gap-3">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs font-mono text-amber-300 font-semibold">
              Host Reviewing Request...
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResendJoinRequest}
              className="flex-1 py-2.5 bg-brand-600/20 hover:bg-brand-600/30 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Resend Signal</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex-1 py-2.5 bg-dark-800 hover:bg-dark-750 text-slate-300 rounded-xl text-xs font-semibold border border-white/10 transition-all"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REJECTED SCREEN FOR GUESTS
  if (userStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-dark-950 text-slate-100 flex items-center justify-center p-6">
        <div className="bg-dark-900 border border-rose-500/30 rounded-3xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <XCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">Join Request Denied</h2>
            <p className="text-xs text-slate-400">The host declined entry to session {roomCode}.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Return to Landing Page
          </button>
        </div>
      </div>
    );
  }

  // ACTIVE MAIN IDE WORKSPACE
  return (
    <div className="h-screen w-screen bg-dark-950 flex flex-col overflow-hidden text-slate-100">
      {/* Header Bar */}
      <Navbar
        roomCode={roomCode}
        sessionTitle={sessionTitle}
        isHost={isHost}
        activeLanguage={activeLanguage}
        activeTheme={activeTheme}
        onLanguageChange={handleLanguageChange}
        onThemeChange={setActiveTheme}
        onRunCode={handleRunCode}
        isExecuting={isExecuting}
        participantCount={participants.length}
        waitingCount={waitingUsers.length}
        onOpenInvite={() => setIsInviteOpen(true)}
        onOpenWaitingRoom={() => setIsWaitingRoomOpen(true)}
        onLeaveSession={() => router.push('/')}
        activeTab={activeTabMode}
        onTabChange={setActiveTabMode}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 sm:w-72 bg-dark-900 border-r border-white/10 flex flex-col shrink-0">
          {/* Sidebar Tabs */}
          <div className="flex bg-dark-850 p-1 border-b border-white/5">
            <button
              onClick={() => setSidebarTab('files')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === 'files' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Files</span>
            </button>

            <button
              onClick={() => setSidebarTab('users')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all relative ${
                sidebarTab === 'users' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Users ({participants.length})</span>
            </button>

            <button
              onClick={() => setSidebarTab('chat')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                sidebarTab === 'chat' ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarTab === 'files' && (
              <FileExplorer
                files={files}
                activeFileId={activeFileId}
                onSelectFile={(id) => {
                  setActiveFileId(id);
                  realtimeRef.current?.sendMessage({
                    type: 'ACTIVE_FILE_CHANGE',
                    senderId: currentUserId,
                    payload: { fileId: id },
                  });
                }}
                onCreateFile={(name, lang) => {
                  const newFile: FileItem = {
                    id: `file_${Date.now()}`,
                    name,
                    language: lang,
                    content: SUPPORTED_LANGUAGES[lang]?.sampleCode || '',
                  };
                  setFiles((prev) => [...prev, newFile]);
                  setActiveFileId(newFile.id);
                  realtimeRef.current?.sendMessage({
                    type: 'CREATE_FILE',
                    senderId: currentUserId,
                    payload: { file: newFile },
                  });
                }}
                onDeleteFile={(id) => {
                  setFiles((prev) => prev.filter((f) => f.id !== id));
                  if (activeFileId === id && files.length > 1) {
                    setActiveFileId(files[0].id);
                  }
                  realtimeRef.current?.sendMessage({
                    type: 'DELETE_FILE',
                    senderId: currentUserId,
                    payload: { fileId: id },
                  });
                }}
              />
            )}

            {sidebarTab === 'users' && (
              <ParticipantList
                participants={participants}
                currentUserId={currentUserId}
                isHost={isHost}
                onKickUser={(uid) => {
                  setParticipants((prev) => prev.filter((p) => p.id !== uid));
                }}
              />
            )}

            {sidebarTab === 'chat' && (
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                currentUserId={currentUserId}
              />
            )}
          </div>
        </aside>

        {/* Central Workspace: Editor or Web Preview */}
        <main className="flex-1 flex flex-col overflow-hidden bg-dark-950">
          {activeTabMode === 'code' ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Monaco Code Editor */}
              <div className="flex-1 relative overflow-hidden">
                <CodeEditor
                  value={activeFile?.content || ''}
                  onChange={handleCodeChange}
                  language={activeLanguage}
                  theme={activeTheme}
                  participants={participants}
                />
              </div>

              {/* Execution Console Terminal Drawer */}
              <OutputConsole
                result={executionResult}
                isExecuting={isExecuting}
                onClear={() => setExecutionResult(null)}
                onBroadcastOutput={() => {
                  if (executionResult) {
                    realtimeRef.current?.sendMessage({
                      type: 'TERMINAL_OUTPUT',
                      senderId: currentUserId,
                      payload: { result: executionResult, executedBy: userName },
                    });
                  }
                }}
                isExpanded={isConsoleExpanded}
                onToggleExpand={() => setIsConsoleExpanded(!isConsoleExpanded)}
                stdin={stdinInput}
                onStdinChange={setStdinInput}
                codeContent={activeFile?.content || ''}
              />
            </div>
          ) : (
            <WebPreview code={activeFile?.content || ''} />
          )}
        </main>
      </div>

      {/* Invite Share Modal */}
      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        roomCode={roomCode}
        sessionTitle={sessionTitle}
        passcode={passcode}
        approvalRequired={approvalRequired}
      />

      {/* Waiting Room Host Approval Modal */}
      <WaitingRoomModal
        isOpen={isWaitingRoomOpen}
        onClose={() => setIsWaitingRoomOpen(false)}
        waitingUsers={waitingUsers}
        onApprove={handleApproveUser}
        onReject={handleRejectUser}
      />
    </div>
  );
}
