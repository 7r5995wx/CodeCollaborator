'use client';

import React, { useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import { LanguageId, ThemeId, UserSession } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: LanguageId;
  theme: ThemeId;
  readOnly?: boolean;
  participants: UserSession[];
  onCursorChange?: (lineNumber: number, column: number) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  theme,
  readOnly = false,
  participants,
  onCursorChange,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  const langSpec = SUPPORTED_LANGUAGES[language] || SUPPORTED_LANGUAGES.javascript;

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Custom Theme Definitions
    monaco.editor.defineTheme('one-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c6370', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c678dd' },
        { token: 'string', foreground: '98c379' },
        { token: 'number', foreground: 'd19a66' },
      ],
      colors: {
        'editor.background': '#0d1117',
        'editor.foreground': '#abb2bf',
        'editor.lineHighlightBackground': '#1c2333',
        'editorLineNumber.foreground': '#4b5263',
      },
    });

    monaco.editor.defineTheme('cyberpunk', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '00f0ff', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'ff007f' },
        { token: 'string', foreground: '00ff9f' },
      ],
      colors: {
        'editor.background': '#090b10',
        'editor.foreground': '#f0f0f0',
        'editor.lineHighlightBackground': '#1b003a',
        'editorLineNumber.foreground': '#ff007f',
      },
    });

    // Listen to cursor selection changes
    editor.onDidChangeCursorPosition((e) => {
      if (onCursorChange) {
        onCursorChange(e.position.lineNumber, e.position.column);
      }
    });
  };

  const handleEditorChange: OnChange = (val) => {
    if (val !== undefined) {
      onChange(val);
    }
  };

  return (
    <div className="relative w-full h-full bg-dark-900 flex flex-col overflow-hidden">
      <Editor
        height="100%"
        width="100%"
        language={langSpec.monacoLanguage}
        value={value}
        theme={theme === 'cyberpunk' || theme === 'one-dark' ? theme : 'vs-dark'}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          readOnly: readOnly,
          minimap: { enabled: true },
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontLigatures: true,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: 'on',
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          padding: { top: 12, bottom: 12 },
          lineNumbersMinChars: 3,
        }}
      />
    </div>
  );
};
