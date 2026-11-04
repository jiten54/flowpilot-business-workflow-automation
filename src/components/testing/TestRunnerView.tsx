import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, 
  Play, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Terminal, 
  ChevronDown, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { TestScenarioResult } from '../../types';
import { runAutomatedTestSuite } from '../../services/testSuite';

export const TestRunnerView: React.FC = () => {
  const [testResults, setTestResults] = useState<TestScenarioResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<{ completed: number; total: number; current: string }>({
    completed: 0,
    total: 7,
    current: '',
  });
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({});

  const executeTests = async () => {
    setIsRunning(true);
    const results = await runAutomatedTestSuite((completed, total, current) => {
      setProgress({ completed, total, current });
    });
    setTestResults(results);
    setIsRunning(false);
    // Expand all logs by default on run
    const expandedMap: Record<string, boolean> = {};
    results.forEach(r => { expandedMap[r.id] = true; });
    setExpandedLogs(expandedMap);
  };

  // Run automatically on first mount to show initial pass state
  useEffect(() => {
    executeTests();
  }, []);

  const passedCount = testResults.filter(r => r.status === 'PASSED').length;
  const failedCount = testResults.filter(r => r.status === 'FAILED').length;
  const totalDuration = testResults.reduce((acc, r) => acc + r.durationMs, 0);

  const toggleLog = (id: string) => {
    setExpandedLogs(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Automated Quality Assurance & Test Runner Suite
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              7 Test Scenarios
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated verification for RBAC boundaries, validation constraints, ₹10k dual-tier threshold, and notification retries
          </p>
        </div>

        <button
          onClick={executeTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Play className={`w-3.5 h-3.5 fill-white ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Test Suites...' : 'Run All Test Suites'}</span>
        </button>
      </div>

      {/* Test Execution Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Passed Scenarios</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span>{passedCount} / {testResults.length || 7}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Failed Assertions</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 flex items-center gap-2">
            {failedCount > 0 ? (
              <span className="text-rose-600 flex items-center gap-1">
                <XCircle className="w-5 h-5 text-rose-500" /> {failedCount}
              </span>
            ) : (
              <span className="text-slate-400">0</span>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Pass Success Rate</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {testResults.length > 0 ? Math.round((passedCount / testResults.length) * 100) : 100}%
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-xs text-slate-500 mb-1">Total Execution Time</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-blue-600">
            {totalDuration}ms
          </div>
        </div>
      </div>

      {/* Progress Bar when running */}
      {isRunning && (
        <div className="p-4 bg-slate-900 rounded-xl text-slate-200 text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Executing test suite in real-time...</span>
            <span>{progress.completed} of {progress.total}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-200" 
              style={{ width: `${(progress.completed / progress.total) * 100}%` }}
            />
          </div>
          <div className="text-blue-400 text-[11px] truncate">{progress.current}</div>
        </div>
      )}

      {/* Test Scenarios Cards List */}
      <div className="space-y-4">
        {testResults.map(test => {
          const isPassed = test.status === 'PASSED';
          const isExpanded = !!expandedLogs[test.id];

          return (
            <div
              key={test.id}
              className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-colors ${
                isPassed ? 'border-slate-200 hover:border-slate-300' : 'border-rose-300 bg-rose-50/20'
              }`}
            >
              <div 
                onClick={() => toggleLog(test.id)}
                className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-700">{test.id}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                        {test.suite}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-[11px] font-mono text-slate-400 tabular-nums">{test.durationMs}ms</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{test.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{test.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {test.status}
                  </span>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {/* Collapsible Details & Logs */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Expected Assertion
                      </div>
                      <div className="font-medium text-slate-800">{test.expected}</div>
                    </div>

                    <div className="p-3 bg-white rounded-lg border border-slate-200">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        Verified Actual Result
                      </div>
                      <div className="font-medium text-emerald-800">{test.actual}</div>
                    </div>
                  </div>

                  {/* Assertion Log Terminal */}
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 mb-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      <span>Assertion Execution Log</span>
                    </div>
                    <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-lg border border-slate-800 space-y-1 overflow-x-auto">
                      {test.logs.map((line, idx) => (
                        <div key={idx} className="leading-relaxed">
                          <span className="text-slate-500 mr-2">›</span>
                          <span className={line.includes('Verified') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                            {line}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
