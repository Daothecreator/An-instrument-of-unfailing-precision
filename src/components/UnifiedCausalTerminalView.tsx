import React, { useState } from 'react';
import {
  VectorSemanticManifold,
  ContentAddressedSemanticDAG,
  type IPLDMerkleNode,
} from '../casl/engine';
import { type FactualCausalEvent } from '../casl/laplace_causal_contract';
import {
  compileUnifiedCausalIR,
  type CausalIRCompilationResult,
} from '../casl/causal_ir_compiler';
import {
  Terminal,
  Play,
  Download,
  Database,
  GitMerge,
  ShieldAlert,
  Network,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Upload,
  ArrowUpRight,
} from 'lucide-react';

interface UnifiedCausalTerminalViewProps {
  manifold: VectorSemanticManifold;
  dag: ContentAddressedSemanticDAG;
  laplaceLedger: FactualCausalEvent[];
  onCompilationCommitted: (
    result: CausalIRCompilationResult,
    newDagNode: IPLDMerkleNode,
    updatedLedger: FactualCausalEvent[]
  ) => void;
  onNavigateToSection?: (tab: string, focusId?: string) => void;
}

const PRESET_TERMINAL_COMMANDS: {
  id: string;
  label: string;
  command: string;
}[] = [
  {
    id: 'full-6core-forensic',
    label: '1. Full 6-Registry Universal Causal Trace (SEC + GLEIF + DTCC eBPF + FEC + 990)',
    command:
      'TRACE Citadel Securities LLC CIK:0001146184 -> Instinet LLC CIK:0000810627 -> Apex Clearing Corporation CIK:0001543643 -> Palafox Trading LLC LEI:549300PALAFOXTRD9912 -> Cayman Synthetics SPV IV Ltd LEI:549300CAYMANSPV0004 (KY) -> DTCC NSCC Clearing Fund ABA:12200049 CUSIP:36467W109 $3,814,920,000 -> Sovereign Market Structure SuperPAC EIN:84-3910422 -> Unregistered Zürich Lombard Vault Trust (CH) AT 2026-11-25T14:30:00.100Z REHYPOTHECATION SHELL CONDUIT ri.foundry.main.action-type.ebpf-cns-netting-v1 0x24537697fbd9df1471afe31110e94a5a04967defd8ed1885c696fece443c8a74',
  },
  {
    id: 'ebpf-nscc-settlement',
    label: '2. Ring-0 eBPF Settlement & Rehypothecation Audit (CUSIP 36467W109 / ABA 12200049)',
    command:
      'AUDIT EBPF SETTLEMENT REHYPOTHECATION Citadel Securities LLC CIK:0001146184 GameStop Corp CIK:0001326380 CUSIP:36467W109 ABA:12200049 US-DE US-NY $3,814,920,000 2026-11-25T14:30:00.050Z 0x24537697fbd9df1471afe31110e94a5a04967defd8ed1885c696fece443c8a74',
  },
  {
    id: 'offshore-shell-ubo',
    label: '3. Corporate Shell Conduit & Dissolved LEI Status Verification (GLEIF / Cayman / CH)',
    command:
      'VERIFY SHELL CONDUIT OWNERSHIP Nomura Holdings Inc LEI:5493007E7K3B9X2NOM88 JP -> Palafox Trading LLC LEI:549300PALAFOXTRD9912 US-DE -> Cayman Synthetics SPV IV Ltd LEI:549300CAYMANSPV0004 KY -> CH $1,420,000,000 2026-11-25T14:30:00.310Z',
  },
  {
    id: 'procurement-pac-990',
    label: '4. Federal Procurement (USASpending) -> OpenFEC SuperPAC -> IRS 990 Foreign Grant',
    command:
      'RECONSTRUCT PROCUREMENT GRANT US Treasury Sovereign Liquidity Facility EIN:52-0852119 US-DC $625,000,000 -> Sovereign Market Structure SuperPAC EIN:84-3910422 $45,000,000 -> CH 2026-11-25T14:30:00.780Z',
  },
];

type MechanismTabId =
  | 'STAGE_0_PEG_64D'
  | 'MECH_1_BYTE_EXACT'
  | 'MECH_2_SQLITE_WAL'
  | 'MECH_3_DATALOG_FIXPOINT'
  | 'MECH_4_SMT_UNSAT_DATAWALL'
  | 'MECH_5_GRAPHBLAS_SEMIRING'
  | 'MECH_6_BAZEL_WORM_EMITTER';

export const UnifiedCausalTerminalView: React.FC<UnifiedCausalTerminalViewProps> = ({
  manifold,
  dag,
  laplaceLedger,
  onCompilationCommitted,
  onNavigateToSection,
}) => {
  const [terminalInput, setTerminalInput] = useState<string>(
    PRESET_TERMINAL_COMMANDS[0].command
  );
  const [customPayloadText, setCustomPayloadText] = useState<string>('');
  const [customPayloadSourceUrl, setCustomPayloadSourceUrl] = useState<string>(
    'file://local/custom_registry_dump.jsonl'
  );
  const [showCustomPayloadEditor, setShowCustomPayloadEditor] =
    useState<boolean>(false);

  const [compilationResult, setCompilationResult] =
    useState<CausalIRCompilationResult>(() =>
      compileUnifiedCausalIR(
        PRESET_TERMINAL_COMMANDS[0].command,
        manifold,
        dag,
        laplaceLedger
      )
    );

  const [activeMechTab, setActiveMechTab] =
    useState<MechanismTabId>('STAGE_0_PEG_64D');

  const handleRunCompilation = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const queryToCompile =
      terminalInput.trim() || PRESET_TERMINAL_COMMANDS[0].command;
    const customPayload =
      customPayloadText.trim().length > 0
        ? {
            sourceUrl: customPayloadSourceUrl.trim(),
            rawText: customPayloadText,
          }
        : undefined;

    const result = compileUnifiedCausalIR(
      queryToCompile,
      manifold,
      dag,
      laplaceLedger,
      customPayload
    );
    setCompilationResult(result);
    onCompilationCommitted(
      result,
      result.anchoredIpldNode,
      result.updatedLaplaceLedger
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCustomPayloadSourceUrl(`file://local/${file.name}`);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = String(ev.target?.result || '');
      setCustomPayloadText(content);
      setShowCustomPayloadEditor(true);
    };
    reader.readAsText(file);
  };

  const handleDownloadArtifact = (
    filename: string,
    content: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const s0 = compilationResult.stage0PegManifold;
  const m1 = compilationResult.mechanism1ByteExact;
  const m2 = compilationResult.mechanism2RelationalWal;
  const m3 = compilationResult.mechanism3DatalogFixpoint;
  const m4 = compilationResult.mechanism4SmtSolver;
  const m5 = compilationResult.mechanism5GraphBlas;
  const m6 = compilationResult.mechanism6BuildEmitter;

  return (
    <div className="space-y-6">
      {/* Top Sovereign CausalIR Compiler Console Header */}
      <div className="p-6 bg-slate-950 text-slate-100 border border-slate-800 rounded-xl shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
              <Terminal className="w-4 h-4" />
              <span>
                UNIFIED SOVEREIGN CAUSAL-IR COMPILER TERMINAL · ZERO-AI /
                100% DETERMINISTIC ALGEBRAIC ENGINE
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">
              PEG Grammar + 64D Geodesic Manifold + 6-Mechanism CausalIR Execution Core
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Single unified mechanism synchronizing SEC EDGAR, GLEIF, OpenFEC,
              USASpending, IRS 990 & Ring-0 eBPF-Settlement with SQLite3 WAL
              Window Algebra, Semi-Naive Datalog Fixpoint, SMT UNSAT_CORE /
              DATA_WALL Solver, GraphBLAS N[X] & (min,+) Semirings, and 80B WORM
              + IPLD Merkle-DAG Emitter.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() =>
                handleDownloadArtifact(
                  m6.downloadableBundleFilename,
                  m6.downloadableBundleJson,
                  'application/json'
                )
              }
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .casl-ir.json Bundle</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleDownloadArtifact(
                  m6.downloadableSqlFilename,
                  m2.sqliteWalScript,
                  'application/sql'
                )
              }
              className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Download SQLite3 WAL (.sql)</span>
            </button>
          </div>
        </div>

        {/* Preset Command Selectors */}
        <div className="pt-4">
          <div className="text-xs font-mono text-slate-400 mb-2">
            PRESET DETERMINISTIC TERMINAL VECTORS:
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_TERMINAL_COMMANDS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setTerminalInput(preset.command);
                }}
                className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-lg transition-colors text-left"
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Command Line Input Form */}
          <form onSubmit={handleRunCompilation} className="space-y-3">
            <div>
              <label
                htmlFor="causal-ir-terminal-input"
                className="block text-xs font-mono text-slate-300 mb-1.5"
              >
                CAUSAL-IR TERMINAL COMMAND / RAW ENTITY & IDENTIFIER STREAM
                (CIK, LEI, EIN, CUSIP, ABA, RID, SHA-256/CIDv1, ISO DATES,
                JURISDICTIONS, AMOUNTS):
              </label>
              <textarea
                id="causal-ir-terminal-input"
                rows={3}
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="Enter entities, CIK, LEI, EIN, CUSIP, ABA, Foundry RID, SHA-256/CIDv1 hashes, dates, jurisdictions, and amounts..."
                className="w-full p-3 font-mono text-xs bg-slate-900 text-emerald-300 border border-slate-700 rounded-lg focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Optional Local Registry / File Payload Ingestion */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowCustomPayloadEditor(!showCustomPayloadEditor)
                  }
                  className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors"
                >
                  {showCustomPayloadEditor
                    ? 'Hide Local File / Raw Registry Payload Buffer'
                    : '+ Attach Local JSON/JSONL/CSV/Log Payload'}
                </button>
                <label className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-sky-400" />
                  <span>Load Local File (.jsonl/.csv/.json/.log)</span>
                  <input
                    type="file"
                    accept=".json,.jsonl,.csv,.log,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-mono font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                <span>
                  EXECUTE 6-MECHANISM CAUSAL-IR COMPILATION & WORM SEAL
                </span>
              </button>
            </div>

            {showCustomPayloadEditor && (
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-sky-400">
                    LOCAL BYTE-EXACT PAYLOAD BUFFER (JSONL / CSV / LOG):
                  </span>
                  <input
                    type="text"
                    value={customPayloadSourceUrl}
                    onChange={(e) => setCustomPayloadSourceUrl(e.target.value)}
                    className="px-2.5 py-1 text-xs font-mono bg-slate-950 text-slate-200 border border-slate-700 rounded w-80"
                  />
                </div>
                <textarea
                  rows={3}
                  value={customPayloadText}
                  onChange={(e) => setCustomPayloadText(e.target.value)}
                  placeholder='{"registry":"SEC_EDGAR","subjectEntity":"Custom Feeder LP","subjectId":"CIK:0001999888","subjectJurisdiction":"KY","predicate":"TRANSFERS_FUNDS","objectEntity":"Citadel Securities LLC","objectId":"CIK:0001146184","objectJurisdiction":"US-DE","timestampIso":"2026-11-25T14:29:59.000Z","timestampNs":"1795616999000000000","amountUsd":950000000,"entityStatus":"ACTIVE"}'
                  className="w-full p-2.5 font-mono text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded"
                />
              </div>
            )}
          </form>
        </div>

        {/* High-Level Compilation Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-slate-800 text-xs font-mono">
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">0. PEG + 64D Task</div>
            <div className="text-sky-400 font-bold truncate mt-0.5">
              {s0.tokens.length} Tokens · d={s0.manifoldClassification.geodesicDistanceRad.toFixed(3)}r
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {s0.manifoldClassification.taskClass}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">1. Byte-Exact Ingest</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {m1.tuples.length} Tuples ({m1.totalBytesScanned} B)
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              SHA256: {m1.compositePayloadSha256.slice(0, 14)}...
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">2. SQLite3 WAL Window</div>
            <div className="text-sky-400 font-bold mt-0.5">
              {m2.deduplicatedRowCount} Rows · {m2.stitchedChronologicalJoins} Stitches
            </div>
            <div className="text-[11px] text-slate-500">
              LAG / LEAD / Cumulative
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">3. Datalog Fixpoint</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              {m3.derivedChains.length} Facts ({m3.totalIterationsToFixpoint} Iter)
            </div>
            <div className="text-[11px] text-slate-500">
              Max Depth: {m3.maxChainDepth} Hops (ΔR=∅)
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">4. SMT Solver</div>
            <div className="text-amber-400 font-bold mt-0.5">
              {m4.unsatCore.length} UNSAT_CORE · {m4.dataWalls.length} DATA_WALL
            </div>
            <div className="text-[11px] text-slate-500">
              {m4.satisfiedCount}/{m4.totalAssertionsChecked} Assertions SAT
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg">
            <div className="text-slate-400">5&6. GraphBLAS & WORM</div>
            <div className="text-emerald-400 font-bold mt-0.5">
              MaxFlow ${(m5.maxFlowMinCut.maxFlowUsd / 1e9).toFixed(2)}B
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              WORM: 0x{m6.final80ByteWormRootSha256.slice(0, 12)}...
            </div>
          </div>
        </div>
      </div>

      {/* 7-Stage Pipeline Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-xl">
        {[
          {
            id: 'STAGE_0_PEG_64D' as MechanismTabId,
            label: '0. PEG + 64D Manifold & Ontology',
            icon: Layers,
          },
          {
            id: 'MECH_1_BYTE_EXACT' as MechanismTabId,
            label: '1. PEG / Byte-Exact Registry Parser',
            icon: Database,
          },
          {
            id: 'MECH_2_SQLITE_WAL' as MechanismTabId,
            label: '2. SQLite3 WAL + LAG/LEAD Algebra',
            icon: FileCode2,
          },
          {
            id: 'MECH_3_DATALOG_FIXPOINT' as MechanismTabId,
            label: '3. Datalog Fixpoint (Semi-Naive)',
            icon: GitMerge,
          },
          {
            id: 'MECH_4_SMT_UNSAT_DATAWALL' as MechanismTabId,
            label: '4. SMT Solver (UNSAT_CORE & DATA_WALL)',
            icon: ShieldAlert,
          },
          {
            id: 'MECH_5_GRAPHBLAS_SEMIRING' as MechanismTabId,
            label: '5. GraphBLAS N[X] & (min,+) / Min-Cut',
            icon: Network,
          },
          {
            id: 'MECH_6_BAZEL_WORM_EMITTER' as MechanismTabId,
            label: '6. Bazel/GCC 80B WORM & DAG Emitter',
            icon: Cpu,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMechTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMechTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* STAGE 0: PEG GRAMMAR + 64D SEMANTIC MANIFOLD + CASL CONCEPT ONTOLOGY */}
      {activeMechTab === 'STAGE_0_PEG_64D' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
                PEG Grammar Token Extraction (Byte-Offset Exact Lexer)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Input Length: {s0.inputByteLength} bytes · Input SHA-256:{' '}
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {s0.inputSha256}
                </span>
              </p>

              {/* Structured Extracted Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Extracted Identifiers (CIK / LEI / EIN / CUSIP / ABA / RID)
                  </div>
                  <div className="font-mono text-sky-600 dark:text-sky-400 space-y-0.5 break-all">
                    {s0.identifiers.cik.map((v) => (
                      <div key={v}>[CIK] {v}</div>
                    ))}
                    {s0.identifiers.lei.map((v) => (
                      <div key={v}>[LEI] {v}</div>
                    ))}
                    {s0.identifiers.ein.map((v) => (
                      <div key={v}>[EIN] {v}</div>
                    ))}
                    {s0.identifiers.cusip.map((v) => (
                      <div key={v}>[CUSIP] {v}</div>
                    ))}
                    {s0.identifiers.aba.map((v) => (
                      <div key={v}>[ABA] {v}</div>
                    ))}
                    {s0.identifiers.rid.map((v) => (
                      <div key={v}>[RID] {v}</div>
                    ))}
                    {s0.identifiers.hashes.map((v) => (
                      <div key={v}>[HASH] {v.slice(0, 28)}...</div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Entities, Jurisdictions, Dates & Monetary Amounts
                  </div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 space-y-0.5">
                    <div>
                      Entities ({s0.entities.length}):{' '}
                      {s0.entities.join(', ') || 'None'}
                    </div>
                    <div>
                      Jurisdictions: {s0.jurisdictions.join(', ') || 'None'}
                    </div>
                    <div>Dates: {s0.dates.join(', ') || 'None'}</div>
                    <div>
                      Amounts:{' '}
                      {s0.amounts
                        .map(
                          (a) =>
                            `${a.raw} ($${a.numericUsd.toLocaleString()} USD)`
                        )
                        .join(', ') || 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Token Stream Table */}
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2 pr-3">Byte Span</th>
                      <th className="py-2 px-3">Token Kind</th>
                      <th className="py-2 px-3">Normalized Value</th>
                      <th className="py-2 pl-3">PEG Production Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono">
                    {s0.tokens.map((tok, i) => (
                      <tr key={`${tok.byteStart}-${tok.kind}-${i}`}>
                        <td className="py-2 pr-3 text-slate-500">
                          [{tok.byteStart}..{tok.byteEnd}]
                        </td>
                        <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">
                          {tok.kind}
                        </td>
                        <td className="py-2 px-3 text-slate-900 dark:text-slate-100 break-all">
                          {tok.normalizedValue}
                        </td>
                        <td className="py-2 pl-3 text-slate-500">
                          {tok.ruleProduction}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: 64D Geodesic Manifold Classification & Rules */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
                64D Semantic Manifold Geodesic Task & Registry Classifier
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Deterministic projection into S^63 unit hypersphere selects task
                class, primary registries, and inference rules.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400">
                    Deterministic Task Class
                  </div>
                  <div className="font-mono font-bold text-sm text-sky-700 dark:text-sky-300 mt-0.5">
                    {s0.manifoldClassification.taskClass}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 mt-1">
                    {s0.manifoldClassification.taskDescription}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 mb-1">
                    Closest CASL Ontology Concept Attractor (S^63 Geodesic)
                  </div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                    {s0.manifoldClassification.matchedOntologyConceptId} ·{' '}
                    {s0.manifoldClassification.matchedOntologyLabel}
                  </div>
                  <div className="font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    d_geodesic ={' '}
                    {s0.manifoldClassification.geodesicDistanceRad} rad (
                    {s0.manifoldClassification.geodesicAngleDeg}°) · cos(θ) ={' '}
                    {s0.manifoldClassification.cosineSimilarity}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 mb-1.5">
                    Selected Primary Fact Registries
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {s0.manifoldClassification.requiredPrimaryRegistries.map(
                      (reg) => (
                        <span
                          key={reg}
                          className="px-2 py-1 font-mono text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded"
                        >
                          {reg}
                        </span>
                      )
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 mb-1">
                    Bound Inference & Verification Rule Set
                  </div>
                  <div className="space-y-1 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {s0.manifoldClassification.activeInferenceRules.map((r) => (
                      <div key={r} className="break-all">
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 1: PEG / BYTE-EXACT PRIMARY REGISTRY PARSER */}
      {activeMechTab === 'MECH_1_BYTE_EXACT' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  Mechanism 1: PEG / Byte-Exact Primary Registry & Local File Parser
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parses raw primary registry payloads (SEC EDGAR, GLEIF,
                  OpenFEC, USASpending, IRS 990, DTCC eBPF) with exact URL, byte
                  offset range [start..end], and SHA-256 record digest.
                </p>
              </div>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                Composite SHA-256: {m1.compositePayloadSha256.slice(0, 20)}...
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {m1.registrySummaries.map((reg) => (
                <div
                  key={`${reg.registry}-${reg.sourceUrl}`}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs"
                >
                  <div className="flex items-center justify-between font-mono font-bold text-sky-600 dark:text-sky-400">
                    <span>{reg.registry}</span>
                    <span>
                      {reg.tupleCount} Tuples ({reg.byteLength} B)
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-500 truncate mt-1">
                    URI: {reg.sourceUrl}
                  </div>
                  <div className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                    SHA-256: {reg.sha256}
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 pr-3">Tuple</th>
                    <th className="py-2.5 px-3">Registry & Byte Offset</th>
                    <th className="py-2.5 px-3">Subject (ID / Jur)</th>
                    <th className="py-2.5 px-3">Predicate</th>
                    <th className="py-2.5 px-3">Object (ID / Jur)</th>
                    <th className="py-2.5 px-3">Timestamp (UTC)</th>
                    <th className="py-2.5 px-3">Amount (USD)</th>
                    <th className="py-2.5 pl-3">Record SHA-256</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono">
                  {m1.tuples.map((t) => (
                    <tr key={t.tupleId}>
                      <td className="py-2.5 pr-3 font-bold text-sky-600 dark:text-sky-400">
                        {t.tupleId}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {t.registry}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          bytes [{t.byteOffsetStart}..{t.byteOffsetEnd}] ({t.byteLength}B)
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 dark:text-slate-100">
                          {t.subjectEntity}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.subjectId} · {t.subjectJurisdiction} ({t.entityStatus})
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">
                        {t.predicate}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 dark:text-slate-100">
                          {t.objectEntity}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {t.objectId} · {t.objectJurisdiction}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                        {t.timestampIso}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${t.amountUsd.toLocaleString()}
                      </td>
                      <td className="py-2.5 pl-3 text-[11px] text-slate-500">
                        {t.recordSha256.slice(0, 16)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 2: RELATIONAL ALGEBRA (SQLITE3 WAL + WINDOW FUNCTIONS LAG/LEAD) */}
      {activeMechTab === 'MECH_2_SQLITE_WAL' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Mechanism 2: Relational Algebra (SQLite3 WAL + Window Functions LAG / LEAD)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Normalizes, deduplicates ({m2.duplicatesEliminated} duplicates
              eliminated), and stitches records chronologically with window
              functions LAG(timestamp_ns), LEAD(timestamp_ns), Δt_ns, and running
              cumulative balance.
            </p>

            <div className="overflow-x-auto mb-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 pr-3">#</th>
                    <th className="py-2 px-3">Tuple</th>
                    <th className="py-2 px-3">Subject Key → Object Key</th>
                    <th className="py-2 px-3">Timestamp (ns)</th>
                    <th className="py-2 px-3">LAG(t_ns) / Δt_ns</th>
                    <th className="py-2 px-3">LEAD(t_ns)</th>
                    <th className="py-2 px-3">Amount / Cumulative USD</th>
                    <th className="py-2 pl-3">Key Stitch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono">
                  {m2.windowRows.map((row) => (
                    <tr key={row.tupleId}>
                      <td className="py-2 pr-3 text-slate-500">{row.rowNum}</td>
                      <td className="py-2 px-3 font-bold text-sky-600 dark:text-sky-400">
                        {row.tupleId}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-slate-900 dark:text-slate-100">
                          {row.subjectId}
                        </span>{' '}
                        →{' '}
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {row.objectId}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-700 dark:text-slate-300">
                        {row.timestampNs}
                      </td>
                      <td className="py-2 px-3">
                        <div>{row.lagTimestampNs || 'NULL'}</div>
                        {row.deltaFromPrevNs && (
                          <div className="text-[11px] text-sky-600 dark:text-sky-400">
                            Δt = +{row.deltaFromPrevNs} ns
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {row.leadTimestampNs || 'NULL'}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          ${row.amountUsd.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Σ = ${row.cumulativePartitionUsd.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2 pl-3 text-[11px]">
                        {row.stitchedPrevTupleId && (
                          <span className="text-sky-600 dark:text-sky-400 mr-2">
                            ← {row.stitchedPrevTupleId}
                          </span>
                        )}
                        {row.stitchedNextTupleId && (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            → {row.stitchedNextTupleId}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                GENERATED EXECUTABLE SQLITE3 WAL DDL / DML & WINDOW QUERY SCRIPT:
              </div>
              <pre className="p-4 bg-slate-950 text-emerald-300 font-mono text-xs rounded-lg overflow-x-auto max-h-80 border border-slate-800">
                {m2.sqliteWalScript}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 3: DATALOG FIXPOINT (SEMI-NAIVE RECURSION) */}
      {activeMechTab === 'MECH_3_DATALOG_FIXPOINT' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Mechanism 3: Datalog Fixpoint Engine (Semi-Naive Evaluation to Least Fixed Point ΔR = ∅)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Automatically pulls all multi-hop ownership chains, intermediary
              shells (&quot;прокладки&quot;), and payment flows up to depth{' '}
              {m3.maxChainDepth} across {m3.totalIterationsToFixpoint} strata.
            </p>

            {/* Iteration Trace Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {m3.iterationTraces.map((tr) => (
                <div
                  key={tr.iteration}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs font-mono"
                >
                  <div className="text-slate-500">
                    Stratum Iteration k = {tr.iteration}
                  </div>
                  <div className="text-sm font-bold text-sky-600 dark:text-sky-400 mt-0.5">
                    |ΔR^({tr.iteration})| = {tr.deltaFactCount} new facts
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Total IDB: {tr.cumulativeFactCount}{' '}
                    {tr.fixpointReached ? '· LFP (ΔR=∅)' : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 pr-3">Fact ID</th>
                    <th className="py-2 px-3">Datalog Predicate</th>
                    <th className="py-2 px-3">Depth</th>
                    <th className="py-2 px-3">Origin Source Entity</th>
                    <th className="py-2 px-3">Intermediary Shells (Прокладки)</th>
                    <th className="py-2 px-3">Terminal Target Entity</th>
                    <th className="py-2 px-3">Effective Flow</th>
                    <th className="py-2 pl-3">Provenance Monomial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 font-mono">
                  {m3.derivedChains.map((f) => (
                    <tr key={f.factId}>
                      <td className="py-2.5 pr-3 font-bold text-sky-600 dark:text-sky-400">
                        {f.factId}
                      </td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400">
                        {f.predicate}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {f.hopDepth} {f.hopDepth === 1 ? 'hop' : 'hops'}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 dark:text-slate-100">
                          {f.sourceEntity}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {f.sourceId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400">
                        {f.viaIntermediaries.length > 0
                          ? f.viaIntermediaries.join(' → ')
                          : 'Direct (0 intermediaries)'}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-900 dark:text-slate-100">
                          {f.targetEntity}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {f.targetId}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                        ${f.effectiveAmountUsd.toLocaleString()}
                      </td>
                      <td className="py-2.5 pl-3 text-slate-500">
                        {f.provenanceMonomial}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 4: SMT / CONSTRAINT SOLVER (UNSAT_CORE & DATA_WALL) */}
      {activeMechTab === 'MECH_4_SMT_UNSAT_DATAWALL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* UNSAT_CORE Conflicts */}
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold font-display text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>
                    Isolated Minimal UNSAT_CORE Contradictions ({m4.unsatCore.length})
                  </span>
                </h3>
                <span className="px-2.5 py-1 text-xs font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded">
                  {m4.solverStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Exact mathematical contradictions in temporal ordering (t_cause
                &gt; t_effect), entity legal registration status, or uncovered
                synthetic liquidity deficits.
              </p>

              <div className="space-y-3">
                {m4.unsatCore.map((conflict) => (
                  <div
                    key={conflict.conflictId}
                    className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/80 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-rose-700 dark:text-rose-300">
                      <span>
                        {conflict.conflictId} · {conflict.category}
                      </span>
                      <span>
                        Tuples: {conflict.conflictingTupleIds.join(', ')}
                      </span>
                    </div>
                    <div className="font-mono text-[11px] text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-slate-950 p-2 rounded border border-rose-200/60 dark:border-rose-900">
                      {conflict.formalProofObligation}
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {conflict.explanation}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 pt-1">
                      Byte Offsets: {conflict.byteOffsets.join(' | ')} ·
                      SHA-256:{' '}
                      {conflict.recordSha256s
                        .map((h) => h.slice(0, 12))
                        .join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* DATA_WALL Boundaries */}
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <h3 className="text-base font-semibold font-display text-amber-600 dark:text-amber-400 mb-1">
                Exact DATA_WALL Jurisdictional & Identifier Boundaries ({m4.dataWalls.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Terminal nodes where public primary registry visibility
                terminates and statutory/MLAT disclosure is required.
              </p>

              <div className="space-y-3 mb-6">
                {m4.dataWalls.map((wall) => (
                  <div
                    key={wall.wallId}
                    className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/80 rounded-lg text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono font-bold text-amber-700 dark:text-amber-300">
                      <span>
                        {wall.wallId} · {wall.frontierEntityName} (
                        {wall.jurisdiction})
                      </span>
                      <span>${wall.unaccountedFlowUsd.toLocaleString()}</span>
                    </div>
                    <div className="font-mono text-slate-700 dark:text-slate-300">
                      Frontier ID: {wall.frontierEntityId} · Last Tuple:{' '}
                      {wall.lastKnownTupleId} ({wall.lastKnownTimestampIso})
                    </div>
                    <div className="text-slate-600 dark:text-slate-400">
                      <span className="font-semibold">
                        Required Resolution Endpoint:
                      </span>{' '}
                      {wall.requiredSubpoenaOrRegistryEndpoint}
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-2">
                SMT-LIBv2 QF_LIRA CONSTRAINT SCRIPT:
              </div>
              <pre className="p-3.5 bg-slate-950 text-sky-300 font-mono text-xs rounded-lg overflow-x-auto max-h-60 border border-slate-800">
                {m4.smtLib2Script}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 5: GRAPHBLAS SPARSE MATRICES (N[X] & (min,+) SEMIRINGS + MIN-CUT) */}
      {activeMechTab === 'MECH_5_GRAPHBLAS_SEMIRING' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                GraphBLAS CSR Sparse Matrix & Edmonds-Karp Max-Flow / Min-Cut
              </h3>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg font-mono text-xs space-y-1">
                <div>
                  Dimension: {m5.csrMatrix.dimension}×{m5.csrMatrix.dimension} ·
                  NNZ = {m5.csrMatrix.nnz}
                </div>
                <div className="text-sky-600 dark:text-sky-400 break-all">
                  rowPtr = [{m5.csrMatrix.rowPtr.join(', ')}]
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 break-all">
                  colInd = [{m5.csrMatrix.colInd.join(', ')}]
                </div>
                <div className="text-amber-600 dark:text-amber-400 break-all">
                  vars = [{m5.csrMatrix.provenanceVariables.join(', ')}]
                </div>
              </div>

              <div className="p-4 bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800 rounded-lg text-xs space-y-2">
                <div className="font-mono font-bold text-sky-700 dark:text-sky-300">
                  MAX-FLOW / MIN-CUT BOTTLENECK ANALYSIS ({m5.maxFlowMinCut.sourceNode} →{' '}
                  {m5.maxFlowMinCut.sinkNode})
                </div>
                <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
                  Max-Flow Capacity: $
                  {m5.maxFlowMinCut.maxFlowUsd.toLocaleString()} USD
                </div>
                <div className="space-y-1 font-mono">
                  {m5.maxFlowMinCut.bottleneckMinCutEdges.map((edge) => (
                    <div
                      key={`${edge.fromNode}-${edge.toNode}-${edge.tupleId}`}
                      className="text-rose-600 dark:text-rose-400"
                    >
                      Min-Cut Edge [{edge.tupleId}]: {edge.fromNode} →{' '}
                      {edge.toNode} ($
                      {edge.capacityUsd.toLocaleString()} USD)
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Tropical Semiring (min, +) Shortest Temporal Chains:
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {m5.shortestTemporalChains.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded text-xs font-mono"
                    >
                      <div className="text-sky-600 dark:text-sky-400 font-semibold">
                        {ch.tropicalSemiringExpression}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {ch.hopCount} Hops · {ch.sourceNode} → {ch.targetNode}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                Algebraic Provenance Semiring N[X] & eBPF-Settlement Synchronization
              </h3>

              <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-mono space-y-1">
                <div className="font-bold text-emerald-700 dark:text-emerald-300">
                  SYNCHRONIZED WITH LAPLACE CAUSAL CONTRACT & eBPF-SETTLEMENT
                </div>
                <div>
                  eBPF Merkle Root: {m5.ebpfSyncStatus.linkedContractRoot}
                </div>
                <div>
                  NSCC Member ABA: {m5.ebpfSyncStatus.nsccMemberAba} · Target
                  CUSIP: {m5.ebpfSyncStatus.targetCusip} · γ_netting ={' '}
                  {m5.ebpfSyncStatus.nettingCompressionGamma}
                </div>
                <div>
                  FRE 902(13)/902(14) Atomic Parity:{' '}
                  {String(m5.ebpfSyncStatus.atomicParityMatch)} (
                  {m5.ebpfSyncStatus.correlatedKernelLeaves} Ring-0 Streams)
                </div>
              </div>

              <div className="space-y-2.5 max-h-96 overflow-y-auto">
                {m5.provenancePolynomials.map((poly, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs font-mono"
                  >
                    <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                      <span className="font-bold">
                        {poly.sourceNode} → {poly.targetNode}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        N[X] Provenance
                      </span>
                    </div>
                    <div className="text-sky-600 dark:text-sky-400 text-sm font-bold mt-1">
                      P(X) = {poly.polynomialNx}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Witness Tuples: {poly.supportingTupleIds.join(', ')} ·
                      Laplace WORM Root: 0x{poly.laplaceRootChecksum}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MECHANISM 6: BAZEL/GCC BUILD EMITTER (80B WORM + IPLD MERKLE-DAG) */}
      {activeMechTab === 'MECH_6_BAZEL_WORM_EMITTER' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
              <div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  Mechanism 6: Bazel/GCC Deterministic Build Emitter (80B WORM + IPLD Merkle-DAG)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Target: {m6.compilerTargetLabel} · Build ID: {m6.buildId} ·
                  Every compiler pass is sealed into an 80-byte preimage
                  hardware-verified SHA-256 WORM Merkle chain and anchored into
                  the IPLD Merkle-DAG and Laplace Causal Contract.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {onNavigateToSection && (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        onNavigateToSection(
                          'dag',
                          compilationResult.anchoredIpldNode.cid
                        )
                      }
                      className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg flex items-center gap-1"
                    >
                      <span>Inspect in Merkle-DAG</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigateToSection('laplace')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1"
                    >
                      <span>Inspect in Laplace Contract</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs font-mono">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 mb-1">
                  Final 80-Byte WORM Root (SHA-256)
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 break-all font-bold">
                  0x{m6.final80ByteWormRootSha256}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 mb-1">
                  Committed IPLD Merkle-DAG CIDv1 (SHA3-256)
                </div>
                <div className="text-sky-600 dark:text-sky-400 break-all font-bold">
                  {m6.ipldCidV1}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 mb-1">
                  Synchronized Laplace Event ID & CID
                </div>
                <div className="text-amber-600 dark:text-amber-400 break-all font-bold">
                  {compilationResult.anchoredLaplaceEvent.eventId} (
                  {compilationResult.anchoredLaplaceEvent.eventCid.slice(0, 20)}
                  ...)
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {m6.passWormChain.map((seal) => (
                <div
                  key={seal.passIndex}
                  className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs font-mono space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      [PASS {seal.passIndex}] {seal.passName}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>80B WORM Verified</span>
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-400 break-all">
                    WORM Merkle Leaf SHA-256: 0x{seal.wormMerkleLeafSha256}
                  </div>
                  <div className="text-[11px] text-slate-500 break-all">
                    80-Byte Preimage (160 hex): 0x{seal.preimage80ByteHex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
