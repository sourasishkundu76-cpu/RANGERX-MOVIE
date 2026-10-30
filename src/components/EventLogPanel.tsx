import React, { useRef, useEffect } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { LogEntry } from '../types/simulation';

interface EventLogPanelProps {
  logs: LogEntry[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const EventLogPanel: React.FC<EventLogPanelProps> = ({
  logs,
  isCollapsed,
  onToggleCollapse,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogBadge = (type: LogEntry['type']) => {
    switch (type) {
      case 'critical':
        return 'text-red-400 font-semibold';
      case 'warning':
        return 'text-amber-400 font-semibold';
      case 'success':
        return 'text-emerald-400 font-semibold';
      default:
        return 'text-cyan-400';
    }
  };

  return (
    <aside
      className={`fixed left-4 top-16 z-20 w-72 md:w-80 rounded-lg bg-black/85 backdrop-blur-md border border-cyan-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] transition-all duration-300 ${
        isCollapsed ? 'h-10 overflow-hidden' : 'h-72 md:h-80'
      }`}
    >
      {/* Header */}
      <div
        onClick={onToggleCollapse}
        className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/20 bg-cyan-950/30 cursor-pointer hover:bg-cyan-900/30 transition-colors select-none"
      >
        <div className="flex items-center gap-2 text-xs font-tactical font-semibold tracking-wider text-cyan-200">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span>TACTICAL EVENT LOG</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 text-cyan-300 font-mono-num">
            {logs.length}
          </span>
        </div>
        <button
          className="text-slate-400 hover:text-white transition-colors"
          aria-label={isCollapsed ? 'Expand log' : 'Collapse log'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Log Body */}
      {!isCollapsed && (
        <div
          ref={scrollRef}
          className="p-2.5 h-[calc(100%-2.5rem)] overflow-y-auto space-y-1.5 font-mono text-[11px] leading-relaxed scrollbar-thin scrollbar-thumb-cyan-700/50"
        >
          {logs.length === 0 ? (
            <div className="text-slate-500 italic py-4 text-center">
              Awaiting telemetry stream...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-0.5 hover:bg-cyan-950/20 px-1 rounded transition-colors"
              >
                <span className="text-slate-500 font-mono-num shrink-0">
                  [{log.timestamp}]
                </span>
                <span className={`break-words ${getLogBadge(log.type)}`}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
