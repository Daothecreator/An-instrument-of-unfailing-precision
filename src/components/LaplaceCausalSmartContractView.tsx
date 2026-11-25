import React, { useMemo, useState } from 'react';
import { VectorSemanticManifold } from '../casl/engine';
import {
  appendFactualCausalEvent,
  CANONICAL_CAUSAL_ACTORS,
  evaluateDoCalculusCounterfactual,
  FactualCausalEvent,
  FactualDomainCategory,
  findCausalPathsBetweenEvents,
  LAPLACE_HIGHER_ORDER_ARTIFACTS,
  reconstructCausalChain,
  verifyFactualExistence,
} from '../casl/laplace_causal_contract';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  Cpu,
  ExternalLink,
  FileCode2,
  GitBranch,
  GitCommit,
  Layers,
  Lock,
  Network,
  PlusCircle,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface LaplaceCausalSmartContractViewProps {
  manifold: VectorSemanticManifold;
  factualLedger: FactualCausalEvent[];
  onCommitNewFactualEvent: (newEvent: FactualCausalEvent, updatedLedger: FactualCausalEvent[]) => string;
  onCommitCausalProofToDag: (
    payloadType: string,
    summary: string,
    details: Record<string, unknown>
  ) => string;
  onInspectDagNode: (nodeCid: string) => void;
}

type LaplaceSubTab = 'reconstructor' | 'oracle' | 'counterfactual' | 'contracts';

export const LaplaceCausalSmartContractView: React.FC<
  LaplaceCausalSmartContractViewProps
> = ({
  manifold,
  factualLedger,
  onCommitNewFactualEvent,
  onCommitCausalProofToDag,
  onInspectDagNode,
}) => {
  const [subTab, setSubTab] = useState<LaplaceSubTab>('reconstructor');
  const [lastAnchoredDagCid, setLastAnchoredDagCid] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tab 1: Cauchy Reconstructor & Path Finder state
  const [selectedTargetEventId, setSelectedTargetEventId] = useState<string>(
    () => factualLedger[factualLedger.length - 1]?.eventId || 'EV-06-LAPLACE-CAUSAL-ORACLE'
  );
  const [pathSourceId, setPathSourceId] = useState<string>('EV-00-GENESIS-OBSERVER');
  const [pathTargetId, setPathTargetId] = useState<string>(
    () => factualLedger[factualLedger.length - 1]?.eventId || 'EV-06-LAPLACE-CAUSAL-ORACLE'
  );

  // Tab 2: Factual Existence Oracle state
  const [oracleQuery, setOracleQuery] = useState<string>(
    'TITAN F2T2EA 5-Modality GEOINT Target Track Lock'
  );

  // Tab 3: Pearl Do-Calculus & New Event Commit form state
  const [intervenedEventId, setIntervenedEventId] = useState<string>(
    'EV-01-SILICON-TPM2-QUOTE'
  );
  const [counterfactualTargetId, setCounterfactualTargetId] = useState<string>(
    () => factualLedger[factualLedger.length - 1]?.eventId || 'EV-06-LAPLACE-CAUSAL-ORACLE'
  );

  const [newTitle, setNewTitle] = useState<string>(
    'TITAN SAR-MTI Orbital Geodesic Target Confirmation & Rubix Action Commit'
  );
  const [newDomain, setNewDomain] = useState<FactualDomainCategory>(
    'F2T2EA_GEOINT_TITAN_CV_FUSION'
  );
  const [newActorId, setNewActorId] = useState<string>('ACTOR-01-TITAN-F2T2EA-NODE');
  const [newParentIds, setNewParentIds] = useState<string[]>([
    'EV-02-F2T2EA-TITAN-FUSION',
    'EV-05-EXASCALE-HPC-DISPATCH',
  ]);
  const [newFormula, setNewFormula] = useState<string>(
    'E_new := f_TITAN_SAR_MTI(E_2 ⊗ E_5, u_Orbital_Telemetry_SHA256)'
  );
  const [newOperator, setNewOperator] = useState<'CONJUNCTIVE_ALL' | 'DISJUNCTIVE_ANY'>(
    'CONJUNCTIVE_ALL'
  );
  const [newSummary, setNewSummary] = useState<string>(
    'Deterministic multi-sensor SAR/MTI phase-coherent target track confirmed and committed to Palantir Foundry Ontology via Sferical One GB300 inference.'
  );
  const [newWhereUri, setNewWhereUri] = useState<string>(
    'casl://titan/f2t2ea_orbital_sar_mti_witness.cbor#track_lock_01'
  );
  const [formError, setFormError] = useState<string | null>(null);

  // Tab 4: Higher-Order Contract Artifact Viewer
  const [selectedArtifactId, setSelectedArtifactId] = useState<string>(
    LAPLACE_HIGHER_ORDER_ARTIFACTS[0].id
  );

  // Computed results
  const reconstruction = useMemo(
    () => reconstructCausalChain(factualLedger, selectedTargetEventId, manifold),
    [factualLedger, selectedTargetEventId, manifold]
  );

  const pathResult = useMemo(
    () =>
      findCausalPathsBetweenEvents(
        factualLedger,
        pathSourceId,
        pathTargetId,
        manifold
      ),
    [factualLedger, pathSourceId, pathTargetId, manifold]
  );

  const existenceReport = useMemo(
    () => verifyFactualExistence(factualLedger, oracleQuery, manifold),
    [factualLedger, oracleQuery, manifold]
  );

  const counterfactualResult = useMemo(
    () =>
      evaluateDoCalculusCounterfactual(
        factualLedger,
        intervenedEventId,
        counterfactualTargetId
      ),
    [factualLedger, intervenedEventId, counterfactualTargetId]
  );

  const selectedArtifact = useMemo(
    () =>
      LAPLACE_HIGHER_ORDER_ARTIFACTS.find((a) => a.id === selectedArtifactId) ||
      LAPLACE_HIGHER_ORDER_ARTIFACTS[0],
    [selectedArtifactId]
  );

  const handleToggleParent = (eventId: string) => {
    setNewParentIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleCommitNewEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newFormula.trim()) {
      setFormError(
        'Title, Factual Witness Summary, and Symbolic Structural Equation are required.'
      );
      return;
    }
    if (newParentIds.length === 0) {
      setFormError(
        'Select at least one immutable parent cause to maintain unbroken Cauchy causal linkage.'
      );
      return;
    }
    setFormError(null);

    const { newEvent, updatedLedger } = appendFactualCausalEvent({
      existingLedger: factualLedger,
      title: newTitle.trim(),
      domain: newDomain,
      factualSummary: newSummary.trim(),
      actorId: newActorId,
      causalParentIds: newParentIds,
      symbolicFormula: newFormula.trim(),
      operatorKind: newOperator,
      whereProvenanceUri: newWhereUri.trim() || 'casl://ledger/worm_event',
      explicitValidTimeNs: BigInt(Date.now()) * 1000000n,
      manifold,
    });

    const dagCid = onCommitNewFactualEvent(newEvent, updatedLedger);
    setSelectedTargetEventId(newEvent.eventId);
    setPathTargetId(newEvent.eventId);
    setCounterfactualTargetId(newEvent.eventId);
    setLastAnchoredDagCid(dagCid);
  };

  const handleAnchorCurrentProof = () => {
    const dagCid = onCommitCausalProofToDag(
      'LAPLACE_CAUSAL_RECONSTRUCTION_PROOF',
      `Laplace Cauchy Causal Reconstruction for ${reconstruction.targetEvent.eventId} (${reconstruction.backwardCausalCone.length} backward states, ${reconstruction.reconstructedLinks.length} verified causal edges)`,
      {
        reconstruction_cid: reconstruction.reconstructionCid,
        target_event_id: reconstruction.targetEvent.eventId,
        target_event_cid: reconstruction.targetEvent.eventCid,
        backward_cone_count: reconstruction.backwardCausalCone.length,
        forward_cone_count: reconstruction.forwardCausalCone.length,
        provenance_polynomial: reconstruction.totalProvenancePolynomial,
        vector_clocks_monotonic: reconstruction.allVectorClocksMonotonic,
        kolmogorov_complexity_bits: reconstruction.kolmogorovChainComplexityBits,
      }
    );
    setLastAnchoredDagCid(dagCid);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6">
      {/* Top 4-Card Telemetry Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Immutable Factual Ledger</span>
            <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {factualLedger.length} Events · {CANONICAL_CAUSAL_ACTORS.length} Actors
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Bitemporal (T_valid × T_tx) WORM Sealed</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Cauchy Domain of Dependence</span>
            <Network className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {reconstruction.backwardCausalCone.length} Past ·{' '}
            {reconstruction.forwardCausalCone.length} Future
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>VC(cause) &lt; VC(effect) Strictly Verified</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Pearl Do-Calculus & SCM</span>
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            PNS = {counterfactualResult.probabilityOfNecessityAndSufficiency.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Zero Mysticism · Structural Equations Only</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Higher-Order Specifications</span>
            <FileCode2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            Solidity · Lean 4 · TLA+ · Datalog
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
            N[X] Semiring: {reconstruction.totalProvenancePolynomial.slice(0, 26)}...
          </div>
        </div>
      </div>

      {/* Sub-navigation & Merkle-DAG Commit Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('reconstructor')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'reconstructor'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            1. Cauchy Causal Chain Reconstructor (J⁻ / J⁺)
          </button>
          <button
            type="button"
            onClick={() => setSubTab('oracle')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'oracle'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            2. Factual Existence & Reality Verifier
          </button>
          <button
            type="button"
            onClick={() => setSubTab('counterfactual')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'counterfactual'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            3. Pearl do(X) Counterfactual & Commit Fact
          </button>
          <button
            type="button"
            onClick={() => setSubTab('contracts')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors ${
              subTab === 'contracts'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            4. Higher-Order Smart Contracts (Solidity / Lean 4 / TLA+)
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lastAnchoredDagCid && (
            <button
              type="button"
              onClick={() => onInspectDagNode(lastAnchoredDagCid)}
              className="px-3 py-2 text-xs font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
            >
              <span>Inspect {lastAnchoredDagCid.slice(0, 14)}...</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={handleAnchorCurrentProof}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Anchor Causal Proof to Merkle-DAG</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: Cauchy Causal Chain Reconstructor (J^-(E) & J^+(E)) */}
      {subTab === 'reconstructor' && (
        <div className="space-y-6">
          {/* Target Event Selector & Provenance Semiring Polynomial */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
                  LAPLACE DETERMINISTIC CAUCHY RECONSTRUCTION · J⁻(E) PAST & J⁺(E) FUTURE CONES
                </div>
                <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  Exact Backward & Forward Causal Chain Reconstruction from Immutable Factual Sources
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="target-causal-event-select"
                  className="text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
                >
                  Target Factual State E:
                </label>
                <select
                  id="target-causal-event-select"
                  aria-label="Target Factual State E"
                  value={selectedTargetEventId}
                  onChange={(e) => setSelectedTargetEventId(e.target.value)}
                  className="px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {factualLedger.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      [L={ev.lamportClock}] {ev.eventId} — {ev.title.slice(0, 48)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Algebraic Provenance Semiring Polynomial N[X] */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How-Provenance Semiring Polynomial P(E) ∈ ℕ[X] (Green-Karvounarakis-Tannen)
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    Why-Root Witnesses: {reconstruction.targetEvent.whyProvenanceRoots.join(', ')}
                  </span>
                </div>
                <div className="font-mono text-xs text-sky-700 dark:text-sky-300 break-all bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800">
                  {reconstruction.totalProvenancePolynomial}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span>
                    Where-Provenance:{' '}
                    <code className="font-mono text-slate-700 dark:text-slate-300">
                      {reconstruction.targetEvent.whereProvenanceUri}
                    </code>
                  </span>
                  <span className="font-mono">
                    80B WORM Leaf: {reconstruction.targetEvent.wormMerkleLeafHex.slice(0, 20)}...
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5 p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg flex flex-col justify-between space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selected State Structural Equation & Vector Clock
                </div>
                <div className="font-mono text-xs text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                  {reconstruction.targetEvent.structuralEquation.symbolicFormula}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">5D Vector Clock: </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      [{reconstruction.targetEvent.vectorClock.join(', ')}]
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Chain Complexity: </span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
                      {reconstruction.kolmogorovChainComplexityBits} bits
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backward Causal Cone J^-(E) Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Reconstructed Past Causal Cone J⁻({reconstruction.targetEvent.eventId}) —{' '}
                {reconstruction.backwardCausalCone.length} Verified Factual States
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reconstruction.backwardCausalCone.map((ev) => {
                  const actor = CANONICAL_CAUSAL_ACTORS.find(
                    (a) => a.actorId === ev.actorId
                  );
                  const isTarget = ev.eventId === reconstruction.targetEvent.eventId;
                  return (
                    <div
                      key={ev.eventId}
                      className={`p-4 rounded-xl border transition-colors ${
                        isTarget
                          ? 'bg-sky-500/5 border-sky-500/40'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                            [L={ev.lamportClock}] {ev.eventId}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {ev.title}
                          </h4>
                        </div>
                        <span className="px-2 py-0.5 text-[11px] font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded shrink-0">
                          VC [{ev.vectorClock.join(',')}]
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-2.5">
                        {ev.factualSummary}
                      </p>
                      <div className="space-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 border-t border-slate-200/70 dark:border-slate-800 pt-2">
                        <div>
                          Executor: <span className="text-slate-800 dark:text-slate-200">{actor?.name || ev.actorId}</span>
                        </div>
                        <div>
                          Equation: <span className="text-emerald-600 dark:text-emerald-400">{ev.structuralEquation.symbolicFormula}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Parents: {ev.causalParentIds.length > 0 ? ev.causalParentIds.join(', ') : '(Cauchy Root S₀)'}</span>
                          <span>CID: {ev.eventCid.slice(0, 16)}...</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Direct Geodesic & All-Paths Causal Chain Finder (E_source ~*> E_target) */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                  EXACT CAUSAL CHAIN & TRANSFER ENTROPY SOLVER · E_SOURCE ⇝ E_TARGET
                </div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  Find & Reconstruct All Causal Chains Between Any Two Factual States
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="path-source-select" className="text-xs text-slate-500">
                  Origin Cause:
                </label>
                <select
                  id="path-source-select"
                  aria-label="Origin Cause"
                  value={pathSourceId}
                  onChange={(e) => setPathSourceId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {factualLedger.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.eventId}
                    </option>
                  ))}
                </select>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                <label htmlFor="path-target-select" className="text-xs text-slate-500">
                  Terminal Effect:
                </label>
                <select
                  id="path-target-select"
                  aria-label="Terminal Effect"
                  value={pathTargetId}
                  onChange={(e) => setPathTargetId(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {factualLedger.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.eventId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {pathResult.pathFound ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/30 rounded-lg text-xs">
                  <div className="font-medium text-emerald-700 dark:text-emerald-300">
                    Reconstructed {pathResult.allCausalPaths.length} Verified Causal Chain(s) ·
                    Shortest Geodesic: {pathResult.shortestCausalPath.length} States (
                    {pathResult.chainLinks.length} Hops)
                  </div>
                  <div className="font-mono text-slate-600 dark:text-slate-300">
                    Joint Transfer Entropy: {pathResult.totalTransferEntropyBits} bits · Proof:{' '}
                    {pathResult.proofCid.slice(0, 18)}...
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                        <th className="py-2.5 pr-3">Hop</th>
                        <th className="py-2.5 px-3">Cause → Effect</th>
                        <th className="py-2.5 px-3">Executor Actor</th>
                        <th className="py-2.5 px-3">Happens-Before (VC)</th>
                        <th className="py-2.5 px-3">64D Cosine / Geodesic</th>
                        <th className="py-2.5 px-3">Transfer Entropy</th>
                        <th className="py-2.5 pl-3">Structural Equation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 font-mono">
                      {pathResult.chainLinks.map((link) => (
                        <tr key={`${link.fromEventId}->${link.toEventId}`}>
                          <td className="py-2.5 pr-3 text-sky-600 dark:text-sky-400">
                            #{link.hopIndex}
                          </td>
                          <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100">
                            {link.fromEventId} → {link.toEventId}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {link.actorId}
                          </td>
                          <td className="py-2.5 px-3 text-emerald-600 dark:text-emerald-400">
                            {link.happensBeforeVerified ? 'VC_CAUSE < VC_EFFECT' : 'VIOLATION'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">
                            {link.semanticCosineSimilarity.toFixed(4)} ({link.geodesicAngleDeg.toFixed(1)}°)
                          </td>
                          <td className="py-2.5 px-3 text-sky-600 dark:text-sky-400">
                            {link.transferEntropyBits.toFixed(4)} bits
                          </td>
                          <td className="py-2.5 pl-3 text-slate-600 dark:text-slate-400">
                            {link.structuralRuleApplied}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* All Convergent Causal Paths List */}
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    All Reconstructed Directed Causal Trajectories ({pathResult.allCausalPaths.length}):
                  </div>
                  {pathResult.allCausalPaths.map((p, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-slate-700 dark:text-slate-300"
                    >
                      Path #{idx + 1}: {p.map((e) => e.eventId).join(' ➔ ')}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-700 dark:text-amber-300 font-mono">
                No directed forward causal path exists from {pathSourceId} to {pathTargetId}. In
                the bitemporal causal partial order, {pathSourceId} is not an ancestor of{' '}
                {pathTargetId}.
              </div>
            )}
          </div>

          {/* Active Default Function of Laplace's Demon: eBPF-Settlement & SIFMU Kernel Forensic Correlator */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 rounded">
                    ACTIVE BY DEFAULT · LAPLACE DEMON KERNEL FUNCTION
                  </span>
                  <span className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    {reconstruction.ebpfSettlementCorrelation.pipelineId} · FRE 902(13)/902(14) WORM
                  </span>
                </div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  eBPF-Settlement Multi-Stream Kernel Telemetry & 8-Layer SIFMU Causal Correlator
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {reconstruction.ebpfSettlementCorrelation.causalSynthesisSummary}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-[11px] space-y-1 shrink-0">
                <div className="text-slate-500 dark:text-slate-400">
                  Incremental Merkle Root (Depth {reconstruction.ebpfSettlementCorrelation.merkleTreeDepth}):
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {reconstruction.ebpfSettlementCorrelation.incrementalMerkleRootHex.slice(0, 26)}...
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  secp256k1 Escrow Key:{' '}
                  <span className="text-slate-700 dark:text-slate-300">
                    {reconstruction.ebpfSettlementCorrelation.secp256k1PublicKeyHex.slice(0, 20)}...
                  </span>
                </div>
              </div>
            </div>

            {/* Key Quantitative eBPF-Settlement Invariants */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 dark:text-slate-400 mb-1">CNS Netting Compression</div>
                <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  γ_netting = {(reconstruction.ebpfSettlementCorrelation.nettingCompressionGamma * 100).toFixed(1)}% (XDP Port 9850)
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 dark:text-slate-400 mb-1">NSCC ECP Gap-Risk Uprobe</div>
                <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  {reconstruction.ebpfSettlementCorrelation.nsccEcpMultiplierShift}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 dark:text-slate-400 mb-1">Fedwire NSS Tail-Call</div>
                <div className="font-mono font-bold text-sky-600 dark:text-sky-400">
                  {reconstruction.ebpfSettlementCorrelation.fedwireNssNetDebitUsd}
                </div>
              </div>
              <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-slate-500 dark:text-slate-400 mb-1">Terminal Debt Annihilation</div>
                <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {reconstruction.ebpfSettlementCorrelation.debtAnnihilationEngineStatus}
                </div>
              </div>
            </div>

            {/* 9 Correlated eBPF Kernel Forensic Telemetry Leaves */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                  Correlated eBPF Kernel Telemetry Leaves ({reconstruction.ebpfSettlementCorrelation.correlatedTelemetryLeaves.length} / 9 Canonical RFC 8785 JCS Streams)
                </h4>
                <span className="text-[11px] font-mono text-slate-500">
                  Click any stream to focus its bitemporal Laplace causal event
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {reconstruction.ebpfSettlementCorrelation.correlatedTelemetryLeaves.map((leaf) => (
                  <button
                    key={leaf.leafIndex}
                    type="button"
                    onClick={() => setSelectedTargetEventId(leaf.mappedEventId)}
                    className={`text-left p-3 rounded-lg border transition-colors ${
                      selectedTargetEventId === leaf.mappedEventId
                        ? 'bg-sky-500/10 border-sky-500/40'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-sky-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        Leaf [{leaf.leafIndex}] · {leaf.streamCode}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {leaf.mappedEventId.slice(0, 5)}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300 mb-1">
                      {leaf.bpfModule} ({leaf.kernelHook})
                    </div>
                    <div className="text-[11px] font-mono text-amber-700 dark:text-amber-300 mb-1">
                      {leaf.pidOrPort}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-1.5">
                      {leaf.forensicObservation}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      JCS SHA-256: {leaf.jcsSha256Hex}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 8-Layer SIFMU Structural Causal Graph & Jacobian Sensitivity Matrix */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-2.5">
                8-Layer SIFMU & Debt-Annihilation Structural Causal Graph G=(V,E) & Jacobian Sensitivity J(X) = ∂F/∂X
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {reconstruction.ebpfSettlementCorrelation.sifmuCausalLayers.map((layer) => (
                  <div
                    key={layer.layerId}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {layer.symbol} · {layer.layerId.slice(0, 18)}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        |J| = {layer.jacobianSensitivityScore.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {layer.name}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 truncate">
                      {layer.structuralEquation}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {layer.parameterInvariant}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Factual Existence & Reality Verification Oracle */}
      {subTab === 'oracle' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
              CLOSED-WORLD FACTUAL REALITY ORACLE · ZERO-MYSTICISM CRYPTOGRAPHIC WITNESS VERIFIER
            </div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Verify What Actually Existed or Exists & Reconstruct Complete Executor Lineage
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Queries are evaluated strictly against immutable CIDv1 SHA3-256 records, 80-byte
              preimage SHA-256 WORM leaves, ZAFLA eBPF-Settlement kernel telemetry digests, and
              Provenance Semiring polynomials. Any unattested claim without a deterministic witness
              is formally refuted.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  aria-label="Factual Existence Oracle Query"
                  value={oracleQuery}
                  onChange={(e) => setOracleQuery(e.target.value)}
                  placeholder="Search event, actor, eBPF-Settlement (NSCC ECP 12200049 / CUSIP 36467W109 / PCO 994012 / Fedwire), CID, or WORM hash..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">Test Presets:</span>
              <button
                type="button"
                onClick={() =>
                  setOracleQuery('Davyd Kochuhur Zero Azimuth Genesis Axiom')
                }
                className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                Genesis Observer (Davyd Kochuhur)
              </button>
              <button
                type="button"
                onClick={() =>
                  setOracleQuery('eBPF NSCC ECP 12200049 15c3-3 PCO 994012 Fedwire AbsoluteDebtAnnihilationEngine')
                }
                className="px-2.5 py-1 text-xs font-mono bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 rounded text-sky-700 dark:text-sky-300"
              >
                eBPF-Settlement & Debt Annihilation
              </button>
              <button
                type="button"
                onClick={() =>
                  setOracleQuery('TITAN F2T2EA 5-Modality GEOINT Target Track Lock')
                }
                className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                TITAN & F2T2EA Sensor Fusion
              </button>
              <button
                type="button"
                onClick={() =>
                  setOracleQuery('El Capitan Sferical One Palantir Rubix Exascale')
                }
                className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"
              >
                Exascale HPC & Palantir Rubix
              </button>
              <button
                type="button"
                onClick={() =>
                  setOracleQuery('Unattested Mystical Esoteric Claim 999999')
                }
                className="px-2.5 py-1 text-xs font-mono bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded text-rose-700 dark:text-rose-300"
              >
                Test Unattested Claim (Zero-Mysticism Rejection)
              </button>
            </div>
          </div>

          {/* Oracle Verdict Banner */}
          <div
            className={`p-5 rounded-xl border ${
              existenceReport.verdict === 'UNATTESTED_NO_FACTUAL_WITNESS'
                ? 'bg-rose-500/5 border-rose-500/30'
                : 'bg-emerald-500/5 border-emerald-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {existenceReport.verdict === 'UNATTESTED_NO_FACTUAL_WITNESS' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                  VERDICT: {existenceReport.verdict}
                </span>
              </div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                Verification CID: {existenceReport.verificationCid.slice(0, 22)}...
              </span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mb-3">
              {existenceReport.formalExplanation}
            </p>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg font-mono text-xs text-sky-700 dark:text-sky-300 break-all">
              Semiring Witness Proof: {existenceReport.provenancePolynomialProof}
            </div>
          </div>

          {/* Reconstructed Ancestry Chain & Responsible Actors */}
          {existenceReport.reconstructedAncestryChain.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Unbroken Causal Ancestry Chain Supporting Factual Existence (
                  {existenceReport.reconstructedAncestryChain.length} States)
                </h3>
                <div className="space-y-2.5">
                  {existenceReport.reconstructedAncestryChain.map((ev, index) => (
                    <div
                      key={ev.eventId}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between text-xs font-mono mb-1">
                        <span className="font-semibold text-sky-600 dark:text-sky-400">
                          Step {index + 1} · {ev.eventId} (Lamport={ev.lamportClock})
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Valid: {ev.bitemporal.validTimeIso}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1">
                        {ev.title}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                        {ev.factualSummary}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
                        <span>WORM Leaf: {ev.wormMerkleLeafHex.slice(0, 24)}...</span>
                        <span>CID: {ev.eventCid.slice(0, 20)}...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Attested Factual Executors & Actors ({existenceReport.matchedActors.length})
                </h3>
                <div className="space-y-2.5">
                  {existenceReport.matchedActors.map((actor) => (
                    <div
                      key={actor.actorId}
                      className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-sky-600 dark:text-sky-400">
                          {actor.actorId}
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-200 dark:bg-slate-800 rounded">
                          VC Axis #{actor.vectorClockIndex}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {actor.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Domain: {actor.jurisdictionDomain}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 break-all">
                        Key: {actor.cryptographicKeyFingerprint}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 break-all">
                        Actor CID: {actor.actorCid}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: Pearl do(X := 0) Counterfactual & Commit New Factual Event */}
      {subTab === 'counterfactual' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: Pearl Structural Counterfactual Simulator */}
          <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div>
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
                PEARL DO-CALCULUS · ABDUCTION → ACTION → PREDICTION
              </div>
              <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                Structural Counterfactual & Causal Necessity Prover
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Surgically intervene on any factual event via{' '}
                <code className="font-mono">do(E_k := 0)</code> to compute which downstream states
                collapse and verify strict necessity & sufficiency (PNS).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="do-intervene-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Surgical Intervention do(E_k := 0):
                </label>
                <select
                  id="do-intervene-select"
                  aria-label="Surgical Intervention Event"
                  value={intervenedEventId}
                  onChange={(e) => setIntervenedEventId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {factualLedger.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      do({ev.eventId} := 0)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="do-target-select"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Evaluated Outcome State E_target:
                </label>
                <select
                  id="do-target-select"
                  aria-label="Evaluated Outcome State"
                  value={counterfactualTargetId}
                  onChange={(e) => setCounterfactualTargetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                >
                  {factualLedger.map((ev) => (
                    <option key={ev.eventId} value={ev.eventId}>
                      {ev.eventId}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border ${
                counterfactualResult.isNecessaryCauseForTarget
                  ? 'bg-emerald-500/5 border-emerald-500/30'
                  : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                  {counterfactualResult.isNecessaryCauseForTarget
                    ? `STRICT NECESSARY & SUFFICIENT CAUSE (PNS = 1.00)`
                    : `INDEPENDENT CAUSAL BRANCH (PNS = 0.00)`}
                </span>
                <span className="text-xs font-mono text-sky-600 dark:text-sky-400">
                  {counterfactualResult.falsifiedDownstreamEvents.length} Falsified ·{' '}
                  {counterfactualResult.invariantEvents.length} Invariant
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {counterfactualResult.isNecessaryCauseForTarget
                  ? `Under intervention ${counterfactualResult.interventionOperation}, target state ${counterfactualResult.evaluatedTargetEvent.eventId} deterministically collapses to FALSE because its structural equation requires an unbroken causal chain from ${counterfactualResult.intervenedEvent.eventId}.`
                  : `Under intervention ${counterfactualResult.interventionOperation}, target state ${counterfactualResult.evaluatedTargetEvent.eventId} remains INVARIANT (TRUE) because its Cauchy causal cone does not depend on ${counterfactualResult.intervenedEvent.eventId}.`}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Structural Equation Evaluation Trace (Abduction → Action → Prediction):
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-xs space-y-1.5 max-h-72 overflow-y-auto">
                {counterfactualResult.counterfactualStructuralTrace.map((line, i) => (
                  <div
                    key={i}
                    className={
                      line.includes('FALSIFIED') || line.includes('ACTION do(')
                        ? 'text-rose-400'
                        : 'text-emerald-400'
                    }
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 6 cols: Commit New Factual Causal Event via Smart Contract */}
          <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <div>
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
                ON-CHAIN SMART CONTRACT TRANSACTION · commitFactualCausalEvent(...)
              </div>
              <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                Anchor New Deterministic Factual Event & Causal Dependencies
              </h2>
            </div>

            <form onSubmit={handleCommitNewEventSubmit} className="space-y-3.5 text-xs">
              <div>
                <label
                  htmlFor="new-fact-title"
                  className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Factual Event Title
                </label>
                <input
                  id="new-fact-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="new-fact-actor"
                    className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Attested Executor / Actor
                  </label>
                  <select
                    id="new-fact-actor"
                    value={newActorId}
                    onChange={(e) => setNewActorId(e.target.value)}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    {CANONICAL_CAUSAL_ACTORS.map((a) => (
                      <option key={a.actorId} value={a.actorId}>
                        {a.actorId} ({a.name.slice(0, 26)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="new-fact-operator"
                    className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Provenance Semiring Operator
                  </label>
                  <select
                    id="new-fact-operator"
                    value={newOperator}
                    onChange={(e) =>
                      setNewOperator(
                        e.target.value as 'CONJUNCTIVE_ALL' | 'DISJUNCTIVE_ANY'
                      )
                    }
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                  >
                    <option value="CONJUNCTIVE_ALL">CONJUNCTIVE_ALL (⊗ Joint Cause)</option>
                    <option value="DISJUNCTIVE_ANY">DISJUNCTIVE_ANY (⊕ Alternative Cause)</option>
                  </select>
                </div>
              </div>

              <div>
                <span className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Direct Causal Parent States pa(E_new) (Happens-Before Vector Clock Predecessors)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                  {factualLedger.map((ev) => (
                    <label
                      key={ev.eventId}
                      className="flex items-center gap-2 font-mono text-[11px] cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newParentIds.includes(ev.eventId)}
                        onChange={() => handleToggleParent(ev.eventId)}
                      />
                      <span className="truncate">{ev.eventId}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="new-fact-formula"
                  className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Symbolic Structural Equation v_i := f_i(pa_i, u_i)
                </label>
                <input
                  id="new-fact-formula"
                  type="text"
                  value={newFormula}
                  onChange={(e) => setNewFormula(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="new-fact-summary"
                  className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Deterministic Factual Witness Summary
                </label>
                <textarea
                  id="new-fact-summary"
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg"
                />
              </div>

              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-rose-600 dark:text-rose-400">
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Execute Smart Contract Commit & Anchor WORM Leaf to Merkle-DAG</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Higher-Order Smart Contract & Formal Proofs */}
      {subTab === 'contracts' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
                HIGHER-ORDER LOGIC & HIGH-ORDER PROGRAMMING LANGUAGES · SOLIDITY · LEAN 4 · TLA+ · DATALOG
              </div>
              <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                Laplace Causal Smart Contract & Constructive Type-Theoretic Source Artifacts
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {LAPLACE_HIGHER_ORDER_ARTIFACTS.map((artifact) => (
                <button
                  key={artifact.id}
                  type="button"
                  onClick={() => setSelectedArtifactId(artifact.id)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors ${
                    selectedArtifact.id === artifact.id
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {artifact.filename.split('/').pop()}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {selectedArtifact.filename}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-mono bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30 rounded">
                  {selectedArtifact.language}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {selectedArtifact.description}
              </p>
              <div className="text-[11px] font-mono text-slate-500">
                Artifact CIDv1: {selectedArtifact.cid}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleCopyText(selectedArtifact.id, selectedArtifact.sourceCode)
              }
              className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>
                {copiedId === selectedArtifact.id ? 'Copied!' : 'Copy Source'}
              </span>
            </button>
          </div>

          <pre className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
            <code>{selectedArtifact.sourceCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
