import React, { useMemo, useState } from 'react';
import { CASLSystemEngine, IPLDMerkleNode } from './casl/engine';
import {
  DEFAULT_ANCHOR_CONCEPTS,
  DEFAULT_DECLARATIVE_INTENT,
} from './casl/specs';
import {
  ApiEndpointSpecification,
  synthesizeSystemWorkload,
  WorkloadDispatchExecution,
} from './casl/exascale_system';
import {
  createInitialLaplaceFactualLedger,
  FactualCausalEvent,
} from './casl/laplace_causal_contract';
import { OverviewSection } from './components/OverviewSection';
import { UnifiedCausalTerminalView } from './components/UnifiedCausalTerminalView';
import { UnifiedExascaleFoundrySystem } from './components/UnifiedExascaleFoundrySystem';
import { AlphabetControlManifoldView } from './components/AlphabetControlManifoldView';
import { LaplaceCausalSmartContractView } from './components/LaplaceCausalSmartContractView';
import { ManifoldExplorer } from './components/ManifoldExplorer';
import { IntentSynthesisPanel } from './components/IntentSynthesisPanel';
import { MerkleDagLattice } from './components/MerkleDagLattice';
import { FormalVerificationView } from './components/FormalVerificationView';
import { OntologyCatalogView } from './components/OntologyCatalogView';
import { HighPrecisionUtcClock } from './components/HighPrecisionUtcClock';
import {
  Layers,
  Cpu,
  GitBranch,
  Scale,
  Compass,
  Sun,
  Moon,
  Download,
  Server,
  Terminal,
  ShieldAlert,
  Sparkles,
  BookOpen,
} from 'lucide-react';

type TabKey =
  | 'terminal'
  | 'overview'
  | 'laplace'
  | 'exascale'
  | 'acm'
  | 'manifold'
  | 'synthesis'
  | 'dag'
  | 'proofs'
  | 'catalog';

export function App() {
  const engine = useMemo(() => new CASLSystemEngine(), []);
  const [receipt, setReceipt] = useState(() => engine.currentReceipt);
  const [activeTab, setActiveTab] = useState<TabKey>('terminal');
  const [darkMode, setDarkMode] = useState(true);
  const [focusedDagNodeCid, setFocusedDagNodeCid] = useState<string | null>(
    null
  );

  const [activeDispatches, setActiveDispatches] = useState<
    WorkloadDispatchExecution[]
  >(() => [
    synthesizeSystemWorkload({
      systemId: 'sferical-one',
      workloadName: 'casl_gb300_geodesic_projection',
      nodesCount: 16,
      acceleratorsPerNode: 4,
      walltimeHours: 2,
      declarativeIntent: DEFAULT_DECLARATIVE_INTENT,
    }),
    synthesizeSystemWorkload({
      systemId: 'el-capitan',
      workloadName: 'casl_mi300a_merkle_sheaf_solver',
      nodesCount: 32,
      acceleratorsPerNode: 4,
      walltimeHours: 4,
      declarativeIntent: DEFAULT_DECLARATIVE_INTENT,
    }),
    synthesizeSystemWorkload({
      systemId: 'palantir-aip-foundry',
      workloadName: 'casl_rubix_zero_trust_ontology_sync',
      nodesCount: 8,
      acceleratorsPerNode: 2,
      walltimeHours: 6,
      declarativeIntent: DEFAULT_DECLARATIVE_INTENT,
    }),
  ]);

  const [laplaceLedger, setLaplaceLedger] = useState<FactualCausalEvent[]>(() =>
    createInitialLaplaceFactualLedger(engine.manifold)
  );

  const [, setTick] = useState(0);

  const highestLamportClock = useMemo(() => {
    return laplaceLedger.reduce(
      (max, ev) => Math.max(max, ev.lamportClock),
      engine.dag.lamportTime
    );
  }, [laplaceLedger, engine.dag.lamportTime]);

  const handleSynthesizeIntent = (intentText: string, anchors: string[]) => {
    const updatedReceipt = engine.executeSynthesisCycle(
      intentText,
      anchors,
      false
    );
    setReceipt(updatedReceipt);
    setTick((t) => t + 1);
  };

  const handleAppendDagNode = (payloadType: string, customSummary: string) => {
    const newNode = engine.dag.putNode({
      type: payloadType,
      observer_subject: receipt.observer_manifestation.full_name,
      statement: customSummary,
      committed_at_lamport: engine.dag.lamportTime + 1,
    });
    const updatedIntegrity = engine.dag.verifyDagIntegrity();
    setFocusedDagNodeCid(newNode.cid);
    setReceipt((prev) => ({
      ...prev,
      merkle_dag_content_layer: updatedIntegrity,
    }));
    setTick((t) => t + 1);
  };

  const handleCommitTypedDagNode = (
    payloadType: string,
    summary: string,
    details: Record<string, unknown>
  ): string => {
    const newNode = engine.dag.putNode({
      type: payloadType,
      observer_subject: receipt.observer_manifestation.full_name,
      summary,
      ...details,
    });
    const updatedIntegrity = engine.dag.verifyDagIntegrity();
    setFocusedDagNodeCid(newNode.cid);
    setReceipt((prev) => ({
      ...prev,
      merkle_dag_content_layer: updatedIntegrity,
    }));
    setTick((t) => t + 1);
    return newNode.cid;
  };

  const handleAnchorExternalNode = (node: IPLDMerkleNode) => {
    const updatedIntegrity = engine.dag.verifyDagIntegrity();
    setFocusedDagNodeCid(node.cid);
    setReceipt((prev) => ({
      ...prev,
      merkle_dag_content_layer: updatedIntegrity,
      vector_semantic_manifold: {
        ...prev.vector_semantic_manifold,
        total_concepts_embedded: Math.max(
          prev.vector_semantic_manifold.total_concepts_embedded,
          engine.manifold.points.size
        ),
      },
    }));
    setTick((t) => t + 1);
  };

  const handleDispatchWorkload = (execution: WorkloadDispatchExecution) => {
    setActiveDispatches((prev) => [execution, ...prev]);
    handleCommitTypedDagNode(
      'EXASCALE_HPC_WORKLOAD_DISPATCH',
      `Dispatched ${execution.workloadName} on ${execution.systemName}`,
      {
        dispatch_id: execution.dispatchId,
        system_id: execution.systemId,
        scheduler: execution.schedulerKind,
        total_accelerators: execution.totalAccelerators,
      }
    );
  };

  const handleExecuteApiTransaction = (
    endpoint: ApiEndpointSpecification,
    payloadObj: Record<string, unknown>
  ) => {
    handleCommitTypedDagNode(
      'FOUNDRY_EXASCALE_API_TRANSACTION',
      `${endpoint.systemApi} :: ${endpoint.methodAndEndpoint}`,
      {
        endpoint_id: endpoint.id,
        system_api: endpoint.systemApi,
        auth_scope: endpoint.authScope,
        request_payload: payloadObj,
      }
    );
  };

  const handleExportReceipt = () => {
    const jsonString = JSON.stringify(receipt, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'casl_genesis_execution_receipt.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navItems: {
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: 'terminal', label: 'CausalIR Terminal (6-Core)', icon: Terminal },
    { key: 'overview', label: 'Genesis Overview', icon: Compass },
    { key: 'laplace', label: 'Laplace Causal Contract', icon: Sparkles },
    { key: 'exascale', label: 'Exascale & Foundry', icon: Server },
    { key: 'acm', label: 'Control Manifold (ACM)', icon: ShieldAlert },
    { key: 'manifold', label: '64D Semantic Manifold', icon: Layers },
    { key: 'synthesis', label: 'Intent & F2T2EA Synthesis', icon: Cpu },
    { key: 'dag', label: 'IPLD Merkle-DAG', icon: GitBranch },
    { key: 'proofs', label: 'HoTT & TLA+ Proofs', icon: Scale },
    { key: 'catalog', label: 'Ontology Catalog', icon: BookOpen },
  ];

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Top Sovereign Header */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between py-3.5 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white font-mono font-bold text-sm shrink-0">
                  C⊗I
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                      CASL Sovereign CausalIR Terminal &amp; Laplace Ledger
                    </h1>
                    <span className="px-2 py-0.5 text-xs font-mono font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded">
                      ZERO_DEFICIT_ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Subject: {receipt.observer_manifestation.full_name} (
                    {receipt.observer_manifestation.designation}) · PEG + 64D
                    Manifold + 6-Core CausalIR Compiler
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
                <HighPrecisionUtcClock
                  laplaceEventCount={laplaceLedger.length}
                  highestLamportClock={highestLamportClock}
                />
                <button
                  type="button"
                  onClick={handleExportReceipt}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Receipt JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDarkMode((d) => !d)}
                  aria-label="Toggle color theme"
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Section Navigation Bar */}
            <nav
              aria-label="CASL system sections"
              className="flex items-center gap-1 overflow-x-auto pb-2 -mb-px"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveTab(item.key)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Main Workspace Container */}
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'terminal' && (
            <UnifiedCausalTerminalView
              manifold={engine.manifold}
              dag={engine.dag}
              laplaceLedger={laplaceLedger}
              onCompilationCommitted={(_result, newDagNode, updatedLedger) => {
                setLaplaceLedger(updatedLedger);
                handleAnchorExternalNode(newDagNode);
              }}
              onNavigateToSection={(tab, focusCid) => {
                if (focusCid) setFocusedDagNodeCid(focusCid);
                setActiveTab(tab as TabKey);
              }}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewSection
              receipt={receipt}
              onNavigate={(tab) => setActiveTab(tab as TabKey)}
              activeDispatchCount={activeDispatches.length}
              laplaceEventCount={laplaceLedger.length}
            />
          )}

          {activeTab === 'laplace' && (
            <LaplaceCausalSmartContractView
              manifold={engine.manifold}
              factualLedger={laplaceLedger}
              onCommitNewFactualEvent={(newEvent, updatedLedger) => {
                setLaplaceLedger(updatedLedger);
                return handleCommitTypedDagNode(
                  'LAPLACE_FACTUAL_CAUSAL_EVENT',
                  `${newEvent.eventId}: ${newEvent.title}`,
                  {
                    event_id: newEvent.eventId,
                    event_cid: newEvent.eventCid,
                    worm_merkle_leaf: newEvent.wormMerkleLeafHex,
                    provenance_polynomial: newEvent.provenancePolynomial,
                  }
                );
              }}
              onCommitCausalProofToDag={handleCommitTypedDagNode}
              onInspectDagNode={(cid) => {
                setFocusedDagNodeCid(cid);
                setActiveTab('dag');
              }}
            />
          )}

          {activeTab === 'exascale' && (
            <UnifiedExascaleFoundrySystem
              manifold={engine.manifold}
              activeDispatches={activeDispatches}
              onDispatchWorkload={handleDispatchWorkload}
              onExecuteApiTransaction={handleExecuteApiTransaction}
            />
          )}

          {activeTab === 'acm' && (
            <AlphabetControlManifoldView
              onCommitAcmNode={handleCommitTypedDagNode}
              onInspectDagNode={(cid) => {
                setFocusedDagNodeCid(cid);
                setActiveTab('dag');
              }}
            />
          )}

          {activeTab === 'manifold' && (
            <ManifoldExplorer
              manifold={engine.manifold}
              domainDistribution={
                receipt.vector_semantic_manifold.domain_attractor_distribution
              }
              initialRelations={
                receipt.vector_semantic_manifold.sample_geometric_relations
              }
            />
          )}

          {activeTab === 'synthesis' && (
            <IntentSynthesisPanel
              receipt={receipt}
              onExecuteSynthesis={handleSynthesizeIntent}
            />
          )}

          {activeTab === 'dag' && (
            <MerkleDagLattice
              dag={engine.dag}
              integrityReport={receipt.merkle_dag_content_layer}
              onAppendNode={handleAppendDagNode}
              focusedNodeCid={focusedDagNodeCid}
              onOpenCausalTerminal={() => setActiveTab('terminal')}
            />
          )}

          {activeTab === 'proofs' && (
            <FormalVerificationView
              proofReport={receipt.formal_verification_and_tla_plus}
            />
          )}

          {activeTab === 'catalog' && (
            <OntologyCatalogView manifold={engine.manifold} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
