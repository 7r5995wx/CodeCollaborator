'use client';

import React, { useState } from 'react';
import { FileCode2, Plus, Trash2, FolderGit2 } from 'lucide-react';
import { FileItem, LanguageId } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/piston';

interface FileExplorerProps {
  files: FileItem[];
  activeFileId: string;
  onSelectFile: (id: string) => void;
  onCreateFile: (name: string, language: LanguageId) => void;
  onDeleteFile: (id: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [selectedLang, setSelectedLang] = useState<LanguageId>('javascript');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;
    
    let name = newFileName.trim();
    const ext = SUPPORTED_LANGUAGES[selectedLang]?.extension || 'txt';
    if (!name.endsWith(`.${ext}`)) {
      name = `${name}.${ext}`;
    }

    onCreateFile(name, selectedLang);
    setNewFileName('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-dark-900/50 p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
          Workspace Files
        </span>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 text-brand-400 hover:bg-brand-500/10 rounded transition-all flex items-center gap-1 text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New File</span>
        </button>
      </div>

      {/* New File Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="bg-dark-850 p-2.5 rounded-xl border border-brand-500/40 mb-3 space-y-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="File name (e.g. utils)"
            className="w-full bg-dark-950 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-white/10 focus:border-brand-500 outline-none"
            autoFocus
          />
          
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value as LanguageId)}
            className="w-full bg-dark-950 text-slate-200 text-xs px-2 py-1 rounded-lg border border-white/10 outline-none"
          >
            {Object.values(SUPPORTED_LANGUAGES).map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-2.5 py-1 bg-brand-600 hover:bg-brand-500 text-white rounded text-[11px] font-semibold"
            >
              Create
            </button>
          </div>
        </form>
      )}

      {/* File List */}
      <div className="space-y-1">
        {files.map((file) => {
          const isActive = file.id === activeFileId;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all group ${
                isActive
                  ? 'bg-brand-600/20 text-brand-300 border border-brand-500/30 font-semibold'
                  : 'text-slate-300 hover:bg-dark-850 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <FileCode2 className={`w-4 h-4 shrink-0 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                <span className="truncate">{file.name}</span>
              </div>

              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition-all"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
