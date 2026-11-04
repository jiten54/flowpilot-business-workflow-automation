import React, { useState } from 'react';
import { 
  GraduationCap, 
  Code2, 
  Check, 
  Copy, 
  BookOpen, 
  Layers, 
  ExternalLink,
  ShieldCheck,
  Building,
  Sparkles
} from 'lucide-react';
import { DELUGE_MAPPINGS, DelugeConceptMapping } from '../../data/delugeMapping';

export const DelugeLearningHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedMapping, setSelectedMapping] = useState<DelugeConceptMapping>(DELUGE_MAPPINGS[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = DELUGE_MAPPINGS.filter(m => {
    if (selectedCategory !== 'ALL' && m.category !== selectedCategory) return false;
    return true;
  });

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-md space-y-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-400" />
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-300">
            Anesight Tech · Zoho Creator Competency Framework
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          Zoho Creator & Deluge Scripting Demonstration Mapping
        </h1>

        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          This comprehensive knowledge hub illustrates how modern full-stack business workflow architectures directly map to Zoho Creator concepts, Deluge business logic, Form events, Criteria-filtered reports, Approval hierarchies, and Zoho Catalyst microservices.
        </p>

        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>6 Core Architecture Modules</span>
          </div>
          <span>·</span>
          <span>Deluge invokeurl integration</span>
          <span>·</span>
          <span>Multi-Tier Threshold Automation</span>
          <span>·</span>
          <span>Role-Based Field Permissions</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Modules' },
          { id: 'FORMS', label: 'Forms & Field Validation' },
          { id: 'APPROVALS', label: 'Multi-Tier Approvals' },
          { id: 'INTEGRATION', label: 'API invokeurl & Webhooks' },
          { id: 'REPORTS', label: 'Reports & Dynamic Views' },
          { id: 'WORKFLOWS', label: 'Schedules & SLA Timers' },
          { id: 'RBAC', label: 'Role-Based Permissions' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === cat.id
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Concept List (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-100">
          {filtered.map(mapping => {
            const isSelected = selectedMapping.id === mapping.id;
            return (
              <div
                key={mapping.id}
                onClick={() => setSelectedMapping(mapping)}
                className={`p-4 cursor-pointer text-xs transition-colors ${
                  isSelected ? 'bg-blue-50/80 border-l-2 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-mono font-bold text-blue-700">{mapping.category}</span>
                  <span className="text-slate-400 font-medium">Concept Mapping</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mb-1">{mapping.zohoCreatorConcept}</h3>
                <div className="text-slate-600 font-medium text-xs">
                  FlowPilot: <strong className="text-slate-800">{mapping.flowpilotEquivalent}</strong>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mapping.description}</p>
              </div>
            );
          })}
        </div>

        {/* Right: Deep Dive & Deluge Code (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {selectedMapping.category}
              </span>
              <span className="text-xs text-slate-400 font-medium">Architecture Comparison</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{selectedMapping.zohoCreatorConcept}</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedMapping.description}</p>
          </div>

          {/* Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Zoho Creator Implementation</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedMapping.zohoImplementationDetails}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>FlowPilot Full-Stack Equivalent</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedMapping.flowpilotImplementationDetails}
              </p>
            </div>
          </div>

          {/* Deluge Script Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{selectedMapping.delugeCodeTitle}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                  Illustrative Zoho Deluge Code
                </span>
              </div>

              <button
                onClick={() => handleCopy(selectedMapping.delugeCodeSnippet, selectedMapping.id)}
                className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
              >
                {copiedId === selectedMapping.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedId === selectedMapping.id ? 'Copied Deluge Script' : 'Copy Script'}</span>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
              <div className="bg-slate-900 px-4 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                <span>Zoho Deluge Script Editor Simulation</span>
                <span className="text-amber-400">Not executable Python/TypeScript code</span>
              </div>
              <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed overflow-x-auto max-h-96">
                {selectedMapping.delugeCodeSnippet}
              </pre>
            </div>
          </div>

          {/* Explanation Callout */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 space-y-1">
            <strong className="font-semibold block">Key Architectural Takeaway:</strong>
            <p className="text-blue-800 leading-relaxed">{selectedMapping.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
