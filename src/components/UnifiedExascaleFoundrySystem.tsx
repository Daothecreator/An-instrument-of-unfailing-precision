import React, { useMemo, useState } from 'react';
import {
  API_ENDPOINT_SPECIFICATIONS,
  ApiEndpointSpecification,
  CONFIGURATION_FILE_TEMPLATES,
  DATAFLOW_SCHEMA_HPC,
  DATAFLOW_SCHEMA_PALANTIR,
  SUPPORTED_ENVIRONMENT_VARIABLES,
  SystemArchitectureSpec,
  UNIFIED_SYSTEMS_MATRIX,
  validateFoundryRid,
  WorkloadDispatchExecution,
  synthesizeSystemWorkload,
} from '../casl/exascale_system';
import { VectorSemanticManifold } from '../casl/engine';
import {
  Server,
  Cpu,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Play,
  HardDrive,
  Network,
  FileCode2,
  Search,
  Activity,
} from 'lucide-react';

interface UnifiedExascaleFoundrySystemProps {
  manifold: VectorSemanticManifold;
  activeDispatches: WorkloadDispatchExecution[];
  onDispatchWorkload: (execution: WorkloadDispatchExecution) => void;
  onExecuteApiTransaction: (endpoint: ApiEndpointSpecification, payloadObj: Record<string, unknown>) => void;
}

type SubView = 'matrix' | 'dispatcher' | 'api-ipc' | 'configs-env';

export const UnifiedExascaleFoundrySystem: React.FC<UnifiedExascaleFoundrySystemProps> = ({
  manifold,
  activeDispatches,
  onDispatchWorkload,
  onExecuteApiTransaction,
}) => {
  const [subView, setSubView] = useState<SubView>('matrix');
  const [schedulerFilter, setSchedulerFilter] = useState<string>('ALL');
  const [selectedSystem, setSelectedSystem] = useState<SystemArchitectureSpec>(
    UNIFIED_SYSTEMS_MATRIX[1] // Sferical One
  );

  // Workload Dispatcher State
  const [targetSystemId, setTargetSystemId] = useState<string>('sferical-one');
  const [workloadName, setWorkloadName] = useState<string>('casl_exascale_sheaf_projection');
  const [nodesCount, setNodesCount] = useState<number>(16);
  const [acceleratorsPerNode, setAcceleratorsPerNode] = useState<number>(4);
  const [walltimeHours, setWalltimeHours] = useState<number>(4);
  const [declarativeIntent, setDeclarativeIntent] = useState<string>(
    'Unite Sferical One GB300 NVL72, El Capitan MI300A, JUPITER GH200, Aurora PVC, and Palantir Rubix into a single zero-deficit CASL execution fabric.'
  );
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  // API & RID Console State
  const [selectedApi, setSelectedApi] = useState<ApiEndpointSpecification>(
    API_ENDPOINT_SPECIFICATIONS[0]
  );
  const [ridInput, setRidInput] = useState<string>(
    'ri.foundry.main.dataset.77d9e123-4b88-4c19-9a01-33c8e71a9044'
  );
  const [lastApiResponse, setLastApiResponse] = useState<Record<string, unknown> | null>(null);

  // Env Vars & Config State
  const [envSearch, setEnvSearch] = useState<string>('');
  const [activeConfigId, setActiveConfigId] = useState<string>(
    CONFIGURATION_FILE_TEMPLATES[0].id
  );
  const [activeSchemaDiagram, setActiveSchemaDiagram] = useState<'hpc' | 'palantir'>('hpc');

  const totalRmaxPflops = useMemo(
    () => UNIFIED_SYSTEMS_MATRIX.reduce((acc, s) => acc + s.rmaxPflops, 0),
    []
  );
  const totalRpeakPflops = useMemo(
    () => UNIFIED_SYSTEMS_MATRIX.reduce((acc, s) => acc + s.rpeakPflops, 0),
    []
  );

  const filteredSystems = useMemo(() => {
    if (schedulerFilter === 'ALL') return UNIFIED_SYSTEMS_MATRIX;
    return UNIFIED_SYSTEMS_MATRIX.filter((s) => s.schedulerKind === schedulerFilter);
  }, [schedulerFilter]);

  const selectedSystemPoint = useMemo(
    () => manifold.embedConcept(`${selectedSystem.name} :: ${selectedSystem.platformTopology}`),
    [manifold, selectedSystem]
  );

  const filteredEnvVars = useMemo(() => {
    const q = envSearch.trim().toLowerCase();
    if (!q) return SUPPORTED_ENVIRONMENT_VARIABLES;
    return SUPPORTED_ENVIRONMENT_VARIABLES.filter(
      (ev) =>
        ev.variable.toLowerCase().includes(q) ||
        ev.scope.toLowerCase().includes(q) ||
        ev.functionalEffect.toLowerCase().includes(q)
    );
  }, [envSearch]);

  const ridValidation = useMemo(() => validateFoundryRid(ridInput), [ridInput]);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workloadName.trim()) {
      setDispatchError('Workload identifier is required.');
      return;
    }
    if (!declarativeIntent.trim()) {
      setDispatchError('Declarative intent statement is required.');
      return;
    }
    setDispatchError(null);
    const execution = synthesizeSystemWorkload({
      systemId: targetSystemId,
      workloadName,
      nodesCount,
      acceleratorsPerNode,
      walltimeHours,
      declarativeIntent,
    });
    onDispatchWorkload(execution);
  };

  const handleInvokeApi = () => {
    onExecuteApiTransaction(selectedApi, selectedApi.samplePayload);
    setLastApiResponse({
      status: 200,
      endpoint: selectedApi.methodAndEndpoint,
      authScopeVerified: selectedApi.authScope,
      zeroDataRetention: true,
      caslDagCommitted: true,
      result: {
        operationStatus: 'EXECUTED_DETERMINISTICALLY',
        requestEcho: selectedApi.samplePayload,
        matchedSystemsCount: UNIFIED_SYSTEMS_MATRIX.length,
      },
    });
  };

  const activeConfig =
    CONFIGURATION_FILE_TEMPLATES.find((c) => c.id === activeConfigId) ||
    CONFIGURATION_FILE_TEMPLATES[0];

  const currentExecution = activeDispatches[0];

  return (
    <div className="space-y-8">
      {/* Top Aggregate Exascale + Zero-Trust Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Unified Active Substrates</span>
            <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            11 Systems
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>10 Exascale/Sovereign HPC</span>
            <span aria-hidden="true"> · </span>
            <span>Palantir Rubix</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Aggregate Fleet Rmax / Rpeak</span>
            <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {(totalRmaxPflops / 1000).toFixed(2)} EF / {(totalRpeakPflops / 1000).toFixed(2)} EF
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>NVLink 5 · Quantum-X800 · Slingshot-11</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Parallel POSIX, NVMe & Iceberg</span>
            <HardDrive className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            &gt;1.45 ExaBytes
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Lustre · GPFS · DAOS · WEKA · VAST · OSv2</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Active Dispatched Workloads</span>
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {activeDispatches.length} Active
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Bound to CASL Merkle-DAG</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubView('matrix')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subView === 'matrix'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            1. Hardware, Software & Quotas Matrix (11 Systems)
          </button>
          <button
            type="button"
            onClick={() => setSubView('dispatcher')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subView === 'dispatcher'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            2. Cross-Substrate Workload Synthesizer ({activeDispatches.length})
          </button>
          <button
            type="button"
            onClick={() => setSubView('api-ipc')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subView === 'api-ipc'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            3. Palantir Foundry & HPC API / IPC Console (10 Endpoints)
          </button>
          <button
            type="button"
            onClick={() => setSubView('configs-env')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subView === 'configs-env'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            4. Config Schemas, 37 Env Vars & Dataflow
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Selected: <span className="text-sky-600 dark:text-sky-400 font-semibold">{selectedSystem.name}</span>
        </div>
      </div>

      {/* VIEW 1: MASTER ARCHITECTURAL, SOFTWARE & QUOTA MATRIX */}
      {subView === 'matrix' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  Master Architectural & Hardware Matrix (01_systems_hardware_architecture.csv)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click any system row to inspect its full software stack, filesystem quotas, security model, CLI playbook, and 64D CASL coordinate.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { id: 'ALL', label: 'All (11)' },
                  { id: 'BCM_SLURM_RUNAI', label: 'DGX SuperPOD / BCM' },
                  { id: 'SLURM', label: 'Cray Slurm' },
                  { id: 'SLURM_PARASTATION', label: 'ParaStation (JUPITER)' },
                  { id: 'FLUX', label: 'Flux (El Capitan)' },
                  { id: 'PBS_PRO_PALS', label: 'PBS Pro (Aurora)' },
                  { id: 'PALANTIR_RUBIX_APOLLO', label: 'Palantir Rubix' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSchedulerFilter(f.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      schedulerFilter === f.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">System</th>
                    <th className="py-2.5 px-3 font-medium">Platform & Topology</th>
                    <th className="py-2.5 px-3 font-medium">Compute Silicon</th>
                    <th className="py-2.5 px-3 font-medium">Interconnect Fabric</th>
                    <th className="py-2.5 px-3 font-medium text-right">Rmax (PF)</th>
                    <th className="py-2.5 pl-3 font-medium">OS & Scheduler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs">
                  {filteredSystems.map((sys) => {
                    const isSelected = selectedSystem.id === sys.id;
                    return (
                      <tr
                        key={sys.id}
                        onClick={() => {
                          setSelectedSystem(sys);
                          setTargetSystemId(sys.id);
                        }}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50/80 dark:bg-sky-950/40'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <td className="py-3 pr-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                          <div>{sys.name}</div>
                          <div className="font-mono text-[11px] text-sky-600 dark:text-sky-400">
                            {sys.cid.slice(0, 18)}...
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {sys.platformTopology}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {sys.computeSilicon}
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                          {sys.interconnectFabric}
                        </td>
                        <td className="py-3 px-3 font-mono text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          {sys.rmaxPflops.toLocaleString()} PF
                        </td>
                        <td className="py-3 pl-3 font-mono text-slate-600 dark:text-slate-400">
                          {sys.osAndScheduler}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Deep-Dive Inspector for Selected System */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    {selectedSystem.category} · {selectedSystem.schedulerKind}
                  </div>
                  <h3 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
                    {selectedSystem.name} — Full System Specification
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedSystem.operator}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTargetSystemId(selectedSystem.id);
                    setSubView('dispatcher');
                  }}
                  className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Synthesize Workload on {selectedSystem.name}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Memory & HBM / Node
                  </div>
                  <div className="text-slate-900 dark:text-slate-100">
                    {selectedSystem.memoryHbmPerNode}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Published Performance & Power
                  </div>
                  <div className="text-slate-900 dark:text-slate-100">
                    {selectedSystem.performanceAndPower}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Compilers & Programming Environments (Sec 1.2)
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.compilersAndEnv}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    GPU / Accelerator Runtimes (Sec 1.2)
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.gpuAcceleratorRuntimes}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    MPI / Collective / Fabric Libraries (Sec 1.2)
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.mpiCollectiveFabricLibs}
                  </div>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 font-medium mb-1">
                    Container & Package Tooling (Sec 1.2)
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.containerAndPackageTooling}
                  </div>
                </div>
              </div>
            </div>

            {/* Filesystem Quotas, Auth & CLI Playbook */}
            <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  Filesystem Quotas, Auth & Native CLI (Sec 2.2, 3.3, 4.3)
                </h3>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">
                    Persistent Home & Project Quotas
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.persistentHomeProjectStorage}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">
                    High-Speed Scratch, Local NVMe & Object Storage
                  </div>
                  <div className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedSystem.highSpeedScratchObjectStorage}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400 mb-0.5">
                    Authentication, MFA & Cryptographic Signing
                  </div>
                  <div className="text-slate-800 dark:text-slate-200">
                    {selectedSystem.authAndCryptoModel}
                  </div>
                </div>

                <div>
                  <div className="text-slate-500 dark:text-slate-400 mb-1.5">
                    Native CLI Command Playbook (05_cli_flags_commands.csv)
                  </div>
                  <pre className="p-3 bg-slate-950 text-sky-300 font-mono text-[11px] rounded-lg overflow-x-auto border border-slate-800 leading-relaxed">
                    {selectedSystem.cliCommands.join('\n')}
                  </pre>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400">
                <div>64D Manifold Basin: {selectedSystemPoint.domain_cluster}</div>
                <div className="truncate">CASL CID: {selectedSystem.cid}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE CROSS-SUBSTRATE WORKLOAD SYNTHESIZER & DISPATCHER */}
      {subView === 'dispatcher' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                    Cross-Substrate Workload Synthesizer
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compile declarative intent into native Slurm, Flux, PBS Pro, or Palantir Rubix/Foundry execution artifacts and commit to the Merkle-DAG.
                  </p>
                </div>
                <Terminal className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>

              <form onSubmit={handleDispatchSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="target-substrate-select"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Target Exascale or Zero-Trust System
                  </label>
                  <select
                    id="target-substrate-select"
                    value={targetSystemId}
                    onChange={(e) => setTargetSystemId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    {UNIFIED_SYSTEMS_MATRIX.map((sys) => (
                      <option key={sys.id} value={sys.id}>
                        {sys.name} ({sys.osAndScheduler})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="workload-name-input"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Workload / Foundry Build Identifier
                  </label>
                  <input
                    id="workload-name-input"
                    type="text"
                    value={workloadName}
                    onChange={(e) => setWorkloadName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label
                      htmlFor="nodes-count-input"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Nodes / Pods
                    </label>
                    <input
                      id="nodes-count-input"
                      type="number"
                      min={1}
                      max={11424}
                      value={nodesCount}
                      onChange={(e) => setNodesCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="acc-per-node-input"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      GPUs / Node
                    </label>
                    <input
                      id="acc-per-node-input"
                      type="number"
                      min={1}
                      max={72}
                      value={acceleratorsPerNode}
                      onChange={(e) => setAcceleratorsPerNode(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="walltime-hours-input"
                      className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                    >
                      Walltime (h)
                    </label>
                    <input
                      id="walltime-hours-input"
                      type="number"
                      min={1}
                      max={168}
                      value={walltimeHours}
                      onChange={(e) => setWalltimeHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="workload-intent-input"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    CASL Declarative Intent Payload
                  </label>
                  <textarea
                    id="workload-intent-input"
                    rows={2}
                    value={declarativeIntent}
                    onChange={(e) => setDeclarativeIntent(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  />
                </div>

                {dispatchError && (
                  <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                    {dispatchError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Synthesize & Dispatch Workload</span>
                </button>
              </form>
            </div>

            {/* Synthesized Batch Script / Rubix Manifest & Verified Invariants */}
            <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
              {currentExecution && (
                <>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <span className="font-mono text-xs text-sky-600 dark:text-sky-400">
                          {currentExecution.dispatchId} · {currentExecution.systemName} ({currentExecution.schedulerKind})
                        </span>
                        <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                          Synthesized Native Execution Artifact ({currentExecution.nodesCount} Nodes · {currentExecution.totalAccelerators} Accelerators)
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                        {currentExecution.status}
                      </span>
                    </div>

                    <div className="mb-3 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
                      Merkle-DAG Execution CID: {currentExecution.cid}
                    </div>

                    <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed">
                      {currentExecution.generatedScript}
                    </pre>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Hardware & Zero-Trust Invariants Verified:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {currentExecution.invariantsVerified.map((inv, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>{inv}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dispatched Workloads Ledger */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-3">
              Active Unified System Execution Ledger ({activeDispatches.length} Dispatches Committed to Merkle-DAG)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Dispatch ID</th>
                    <th className="py-2.5 px-3 font-medium">Target System</th>
                    <th className="py-2.5 px-3 font-medium">Workload Name</th>
                    <th className="py-2.5 px-3 font-medium text-right">Nodes</th>
                    <th className="py-2.5 px-3 font-medium text-right">Total GPUs/APUs</th>
                    <th className="py-2.5 pl-3 font-medium">Content-Addressed CIDv1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs">
                  {activeDispatches.map((d) => (
                    <tr key={d.cid + d.dispatchId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 pr-4 font-mono text-sky-600 dark:text-sky-400 font-semibold">
                        {d.dispatchId}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                        {d.systemName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-800 dark:text-slate-200">
                        {d.workloadName}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums">
                        {d.nodesCount}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                        {d.totalAccelerators}
                      </td>
                      <td className="py-2.5 pl-3 font-mono text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {d.cid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: PALANTIR FOUNDRY / AIP & HPC REST / IPC CONSOLE & RID VALIDATOR */}
      {subView === 'api-ipc' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                    API / SDK / IPC Endpoint Specifications (Sec 4.2)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select any Palantir Foundry REST v2/v3, Compute Module :8945 IPC, NVIDIA BCM :8081, or Slurm :6820 endpoint to execute.
                  </p>
                </div>
                <Network className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {API_ENDPOINT_SPECIFICATIONS.map((ep) => {
                  const isSelected = selectedApi.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      type="button"
                      onClick={() => setSelectedApi(ep)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-colors ${
                        isSelected
                          ? 'bg-sky-50/80 dark:bg-sky-950/40 border-sky-500'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {ep.systemApi}
                        </span>
                        <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                          {ep.authScope}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all">
                        {ep.methodAndEndpoint}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    {selectedApi.systemApi} — Execution Inspector
                  </h3>
                  <p className="font-mono text-xs text-sky-600 dark:text-sky-400 mt-0.5 break-all">
                    {selectedApi.methodAndEndpoint}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                    <div className="text-slate-500 dark:text-slate-400 mb-0.5">Request Schema</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedApi.requestPayloadSchema}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                    <div className="text-slate-500 dark:text-slate-400 mb-0.5">Response Schema</div>
                    <div className="font-mono text-slate-800 dark:text-slate-200">
                      {selectedApi.responseSchema}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Canonical Request Payload
                  </div>
                  <pre className="p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800">
                    {JSON.stringify(selectedApi.samplePayload, null, 2)}
                  </pre>
                </div>

                <button
                  type="button"
                  onClick={handleInvokeApi}
                  className="w-full py-2.5 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute API Call & Commit to CASL Merkle-DAG</span>
                </button>

                {lastApiResponse && (
                  <div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
                      200 OK — Deterministic Execution Receipt
                    </div>
                    <pre className="p-3 bg-slate-950 text-emerald-300 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 max-h-48">
                      {JSON.stringify(lastApiResponse, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Foundry Resource Identifier (RID) Grammar Validator */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <label
                  htmlFor="foundry-rid-validator"
                  className="block text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  Foundry RID Grammar Validator (ri.&lt;service&gt;.&lt;instance&gt;.&lt;type&gt;.&lt;uuid&gt;)
                </label>
                <input
                  id="foundry-rid-validator"
                  type="text"
                  value={ridInput}
                  onChange={(e) => setRidInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
                {ridValidation.valid ? (
                  <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex flex-wrap gap-3">
                    <span>Valid RID</span>
                    <span>service={ridValidation.service}</span>
                    <span>instance={ridValidation.instance}</span>
                    <span>type={ridValidation.resourceType}</span>
                  </div>
                ) : (
                  <div className="text-xs text-red-600 dark:text-red-400">
                    {ridValidation.error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: CONFIGURATION FILES, 37 ENVIRONMENT VARIABLES & DATAFLOW SCHEMAS */}
      {subView === 'configs-env' && (
        <div className="space-y-8">
          {/* Configuration File Reference (Section 3.1) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                <div>
                  <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                    Configuration File Reference (03_configuration_files_schemas.csv)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Production configuration files for Slurm, Flux + Rabbit DWS, DAOS + PBS Pro, JUPITER JuDoor, and Palantir Foundry/Rubix.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {CONFIGURATION_FILE_TEMPLATES.map((cfg) => (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setActiveConfigId(cfg.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      activeConfig.id === cfg.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cfg.title.split('(')[0].trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Scope: {activeConfig.systemScope} · Path: {activeConfig.filePath}
            </div>

            <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-relaxed">
              {activeConfig.content}
            </pre>
          </div>

          {/* 37 Environment Variables Registry (Section 3.2) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  Supported Environment Variables ({SUPPORTED_ENVIRONMENT_VARIABLES.length} Variables · 04_environment_variables.csv)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Filter across CUDA, NCCL, Slingshot-11 CXI, Cray MPICH, ROCm/HSA, Flux, ParaStation, Intel Level Zero/DAOS, Apptainer, and Palantir Rubix.
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Filter Environment Variables"
                  value={envSearch}
                  onChange={(e) => setEnvSearch(e.target.value)}
                  placeholder="Search variable or system scope..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">System Scope</th>
                    <th className="py-2.5 px-3 font-medium">Variable</th>
                    <th className="py-2.5 px-3 font-medium">Default / Example Value</th>
                    <th className="py-2.5 pl-3 font-medium">Functional Effect & Constraints</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-xs">
                  {filteredEnvVars.map((ev, idx) => (
                    <tr key={`${ev.variable}-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 pr-4 font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        {ev.scope}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-semibold text-sky-600 dark:text-sky-400">
                        {ev.variable}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300">
                        {ev.defaultValue}
                      </td>
                      <td className="py-2.5 pl-3 text-slate-700 dark:text-slate-300">
                        {ev.functionalEffect}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Component Interaction Schemas (Section 1.3A & 1.3B) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  Component Interaction & Control-Plane Dataflow Schemas (Section 1.3)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  End-to-end architectural topology across Bare-Metal Sovereign/Exascale HPC and Palantir Rubix/Foundry.
                </p>
              </div>

              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveSchemaDiagram('hpc')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeSchemaDiagram === 'hpc'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  A. Sovereign & Exascale HPC Dataflow
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSchemaDiagram('palantir')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    activeSchemaDiagram === 'palantir'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  B. Palantir Foundry & Rubix Zero-Trust
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 text-sky-200 font-mono text-xs rounded-lg overflow-x-auto border border-slate-800 leading-snug">
              {activeSchemaDiagram === 'hpc' ? DATAFLOW_SCHEMA_HPC : DATAFLOW_SCHEMA_PALANTIR}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
