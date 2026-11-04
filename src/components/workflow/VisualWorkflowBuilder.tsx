import React, { useState } from 'react';
import { 
  GitBranch, 
  Play, 
  Plus, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  ShieldAlert, 
  Check, 
  Sparkles,
  ArrowRight,
  Code2,
  Sliders,
  Power
} from 'lucide-react';
import { WorkflowDefinition, WorkflowNode } from '../../types';
import { toggleWorkflowActive } from '../../services/storage';

interface VisualWorkflowBuilderProps {
  workflows: WorkflowDefinition[];
  onRefresh: () => void;
}

export const VisualWorkflowBuilder: React.FC<VisualWorkflowBuilderProps> = ({
  workflows,
  onRefresh,
}) => {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>(workflows[0]?.id || '');
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [activeSimulationNodeIndex, setActiveSimulationNodeIndex] = useState<number>(-1);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const [showDelugeCode, setShowDelugeCode] = useState(false);

  const activeWf = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  const handleToggleActive = () => {
    if (!activeWf) return;
    toggleWorkflowActive(activeWf.id);
    onRefresh();
  };

  const runSimulation = () => {
    if (!activeWf) return;
    setSimulationRunning(true);
    setActiveSimulationNodeIndex(0);
    setSimulationLogs([`[0.00s] Workflow "${activeWf.name}" triggered by test event.`]);

    const nodes = activeWf.nodes;

    nodes.forEach((node, index) => {
      setTimeout(() => {
        setActiveSimulationNodeIndex(index);
        setSimulationLogs(prev => [
          ...prev,
          `[+${(index * 0.7).toFixed(1)}s] Evaluated Node "${node.title}": Condition matched -> Branch dispatched to next step.`
        ]);

        if (index === nodes.length - 1) {
          setTimeout(() => {
            setSimulationRunning(false);
            setSimulationLogs(prev => [
              ...prev,
              `[SUCCESS] Workflow execution simulated successfully across ${nodes.length} nodes with zero errors.`
            ]);
          }, 800);
        }
      }, (index + 1) * 700);
    });
  };

  const getNodeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'TRIGGER': return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', badge: 'bg-blue-600' };
      case 'CONDITION': return { bg: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', badge: 'bg-amber-600' };
      case 'APPROVAL': return { bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', badge: 'bg-purple-600' };
      case 'ACTION': return { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', badge: 'bg-emerald-600' };
      case 'NOTIFICATION': return { bg: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', badge: 'bg-cyan-600' };
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Visual Workflow Builder
          </h1>
          <p className="text-xs text-slate-500">
            Configure triggers, threshold conditions, multi-tier approvals, and Deluge-equivalent automations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active / Paused Toggle */}
          <button
            onClick={handleToggleActive}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
              activeWf?.isActive 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{activeWf?.isActive ? 'Active (Running)' : 'Paused'}</span>
          </button>

          {/* Test Run Simulation */}
          <button
            onClick={runSimulation}
            disabled={simulationRunning}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className={`w-3.5 h-3.5 fill-white ${simulationRunning ? 'animate-spin' : ''}`} />
            <span>{simulationRunning ? 'Simulating Engine...' : 'Test Run Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Workflow Selector Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px] shrink-0">Selected Workflow:</span>
          {workflows.map(wf => (
            <button
              key={wf.id}
              onClick={() => {
                setSelectedWorkflowId(wf.id);
                setSelectedNode(null);
                setSimulationLogs([]);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                wf.id === activeWf.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {wf.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowDelugeCode(!showDelugeCode)}
          className="text-xs text-blue-600 hover:underline font-semibold flex items-center gap-1.5"
        >
          <Code2 className="w-4 h-4" />
          <span>{showDelugeCode ? 'Hide' : 'View'} Deluge Script</span>
        </button>
      </div>

      {/* Deluge Script Drawer */}
      {showDelugeCode && activeWf && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>Zoho Creator Deluge Script Representation: {activeWf.code}</span>
            <span className="text-amber-400">Illustrative Zoho Deluge Script</span>
          </div>
          <pre className="text-emerald-400 leading-relaxed overflow-x-auto">
            {activeWf.delugeSnippet}
          </pre>
        </div>
      )}

      {/* Simulation Logs Banner if active */}
      {simulationLogs.length > 0 && (
        <div className="p-4 bg-slate-900 text-slate-200 rounded-xl border border-slate-800 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans pb-1 border-b border-slate-800">
            <span>Execution Sandbox Monitor</span>
            {simulationRunning && <span className="text-blue-400 animate-pulse">Running step-by-step evaluation...</span>}
          </div>
          {simulationLogs.map((log, i) => (
            <div key={i} className={log.includes('SUCCESS') ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
              {log}
            </div>
          ))}
        </div>
      )}

      {/* Visual Canvas Area */}
      <div className="bg-slate-50/60 border border-slate-200 rounded-2xl p-6 min-h-[460px] relative overflow-x-auto shadow-xs">
        <div className="text-xs text-slate-400 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{activeWf?.name}</span>
            <span>·</span>
            <span>Trigger: {activeWf?.triggerEvent}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{activeWf?.executionCount} Total Runs</span>
          </div>
          <span className="text-[11px]">Click any node to inspect configuration</span>
        </div>

        {/* Nodes Grid / Flow Representation */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 py-8 relative">
          {activeWf?.nodes.map((node, index) => {
            const isSimActive = index === activeSimulationNodeIndex;
            const colors = getNodeColor(node.type);
            const isSelected = selectedNode?.id === node.id;

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`w-64 p-4 rounded-xl border-2 cursor-pointer transition-all ${colors.bg} ${colors.border} ${
                    isSelected ? 'ring-3 ring-blue-500 shadow-md' : 'hover:shadow-sm'
                  } ${isSimActive ? 'ring-4 ring-amber-400 scale-105 shadow-xl' : ''}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded text-white ${colors.badge}`}>
                      {node.type}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Step {index + 1}</span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 leading-snug">
                    {node.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {node.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <span>Configured</span>
                    <span className="text-blue-700 font-semibold">Inspect →</span>
                  </div>
                </div>

                {/* Arrow Connector between nodes */}
                {index < activeWf.nodes.length - 1 && (
                  <div className="flex items-center justify-center text-slate-400 py-2 lg:py-0">
                    <ArrowRight className="w-5 h-5 text-slate-400 hidden lg:block" />
                    <span className="lg:hidden">↓</span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Node Inspector Drawer */}
      {selectedNode && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 animate-in fade-in duration-100">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedNode.type}
              </span>
              <h3 className="text-sm font-bold text-slate-900">{selectedNode.title}</h3>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-slate-400 font-medium mb-1">Description</div>
              <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedNode.description}
              </p>
            </div>

            <div>
              <div className="text-slate-400 font-medium mb-1">Raw Node Parameters (JSON)</div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg font-mono text-[11px] overflow-x-auto">
                {JSON.stringify(selectedNode.config, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
