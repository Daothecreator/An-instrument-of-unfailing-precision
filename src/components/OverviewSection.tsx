import React from 'react';
import { CASLGenesisReceipt } from '../casl/engine';
import { AXIOMATIC_SYSTEM } from '../casl/specs';
import { UNIFIED_SYSTEMS_MATRIX, SUPPORTED_ENVIRONMENT_VARIABLES, API_ENDPOINT_SPECIFICATIONS } from '../casl/exascale_system';
import { CheckCircle2, ShieldCheck, Layers, Cpu, GitBranch, FileCheck2, Server } from 'lucide-react';

interface OverviewSectionProps {
  receipt: CASLGenesisReceipt;
  onNavigate: (tab: string) => void;
  activeDispatchCount?: number;
  laplaceEventCount?: number;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  receipt,
  onNavigate,
  activeDispatchCount = 5,
  laplaceEventCount = 7,
}) => {
  const obs = receipt.observer_manifestation;
  const node = receipt.unified_observer_intent_info_node;
  const manifold = receipt.vector_semantic_manifold;
  const dag = receipt.merkle_dag_content_layer;
  const formal = receipt.formal_verification_and_tla_plus;

  const totalRmaxEf = UNIFIED_SYSTEMS_MATRIX.reduce(
    (sum, s) => sum + (s.rmaxPflops ?? 0),
    0
  ) / 1000;
  const totalRpeakEf = UNIFIED_SYSTEMS_MATRIX.reduce(
    (sum, s) => sum + (s.rpeakPflops ?? 0),
    0
  ) / 1000;

  return (
    <div className="space-y-8">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Embedded Concepts (64D)</span>
            <Layers className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {manifold.total_concepts_embedded.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>{manifold.dimensions} Dimensions</span>
            <span aria-hidden="true"> · </span>
            <span>8 Attractor Basins</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Exascale & Foundry Fleet</span>
            <Server className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {UNIFIED_SYSTEMS_MATRIX.length} Systems ({totalRmaxEf.toFixed(2)} EF)
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{activeDispatchCount} Active Sub-DAG Dispatches</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>IPLD Merkle-DAG Lattice</span>
            <GitBranch className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {dag.total_nodes} Nodes
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Acyclic & CRDT Converged</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Laplace Causal Smart Contract</span>
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {laplaceEventCount} Factual Events
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span>Cauchy J⁻/J⁺ · Pearl do(X) · N[X] Semiring</span>
          </div>
        </div>
      </div>

      {/* Unified Sovereign Exascale HPC & Palantir Rubix / Foundry Active Substrate Banner */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
              ACTIVE SINGLE SYSTEM INTEGRATION · LAPLACE CAUSAL CONTRACT ⊗ BARE-METAL EXASCALE HPC ⊗ PALANTIR FOUNDRY
            </div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Deterministic Laplace Causal Oracle, Sovereign Exascale Supercomputing & Zero-Trust Ontology Control Plane
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mathematical & causal reconstruction engine (Structural Causal Models, Pearl do-Calculus, Bitemporal Vector Clocks, W3C PROV-O Semiring Polynomials) unified with 10 Sovereign Exascale HPC clusters ({totalRmaxEf.toFixed(2)} EF Rmax) and Alphabet 7-Pillar Silicon RoT.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('laplace')}
              className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Laplace Causal Contract
            </button>
            <button
              type="button"
              onClick={() => onNavigate('exascale')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Exascale & Foundry
            </button>
            <button
              type="button"
              onClick={() => onNavigate('acm')}
              className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              7-Pillar Control Manifold
            </button>
            <button
              type="button"
              onClick={() => onNavigate('terminal')}
              className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              CausalIR Terminal (6-Core)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 text-xs">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-slate-500 dark:text-slate-400 mb-1">Laplace Causal Smart Contract</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Cauchy J⁻/J⁺ Cones · Pearl do(X) SCM · Vector Clocks · N[X] Provenance Semiring · Solidity / Lean 4
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-slate-500 dark:text-slate-400 mb-1">Sovereign & Exascale Substrates</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              Sferical AI/One · Gefion · Isambard-AI · LUMI · JUPITER · El Capitan · Frontier · Aurora · BerzeLiUs
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-slate-500 dark:text-slate-400 mb-1">7-Pillar Control Manifold Suite</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100">
              TPM 2.0 Quote · 80B SHA-NI WORM Ledger · ALTS eBPF XDP/LSM · KAJ Sovereign Veto · Frama-C ACSL
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-slate-500 dark:text-slate-400 mb-1">6-Mechanism CausalIR Compiler</div>
            <div className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              PEG + 64D · Byte-Exact · SQLite3 WAL · Datalog Fixpoint · SMT UNSAT_CORE · GraphBLAS N[X]
            </div>
          </div>
        </div>
      </div>

      {/* Observer Manifestation & Cryptographic Root Identifiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Observer Manifestation & Triadic Unity
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Unmediated coupling of Observer, Declarative Intent, and Content-Addressed Information.
            </p>

            <dl className="space-y-3 text-sm">
              <div className="flex items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <dt className="text-slate-500 dark:text-slate-400">Subject Full Name</dt>
                <dd className="font-semibold text-slate-900 dark:text-slate-100">{obs.full_name}</dd>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <dt className="text-slate-500 dark:text-slate-400">Designation</dt>
                <dd className="font-mono text-xs text-sky-600 dark:text-sky-400">{obs.designation}</dd>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <dt className="text-slate-500 dark:text-slate-400">Possessive Ownership</dt>
                <dd className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  {String(obs.possessive_ownership)} (Non-Possessive)
                </dd>
              </div>
              <div className="flex items-baseline justify-between py-2 border-b border-slate-100 dark:border-slate-800/80">
                <dt className="text-slate-500 dark:text-slate-400">Causal Responsibility</dt>
                <dd className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  {String(obs.full_causal_responsibility)} (Full)
                </dd>
              </div>
              <div className="flex items-baseline justify-between py-2">
                <dt className="text-slate-500 dark:text-slate-400">Alignment Checks</dt>
                <dd className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
                  {Object.values(node.checks).filter(Boolean).length} / 6 Passed
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate('exascale')}
              className="px-4 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Exascale & Foundry Matrix
            </button>
            <button
              type="button"
              onClick={() => onNavigate('synthesis')}
              className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Intent Synthesis
            </button>
            <button
              type="button"
              onClick={() => onNavigate('manifold')}
              className="px-4 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Compute Geodesics
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
            Cryptographic Content-Addressed Identifiers (CIDv1 / SHA3-256)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Bitwise deterministic digests verifying zero-deficit execution across all semantic layers.
          </p>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Observer Subject CID
              </div>
              <div className="font-mono text-xs text-slate-900 dark:text-slate-200 break-all">
                {obs.subject_cid}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Unified (Observer ⊗ Intent ⊗ Information) Node CID
              </div>
              <div className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all">
                {node.node_cid}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                CRDT Semilattice Merkle Root CID
              </div>
              <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all">
                {dag.merkle_root_cid}
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
              <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                Terminal Autonomous Contract Activation CID
              </div>
              <div className="font-mono text-xs text-amber-600 dark:text-amber-400 break-all">
                {receipt.terminal_activation_cid}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Foundational Axiomatic System */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Foundational Axiomatic System
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Five invariant axioms committed into the Genesis Observer Manifestation node.
            </p>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span>Protocol: {receipt.contract_protocol}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 pr-4 font-medium">Axiom Identifier</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Formal Mathematical Statement</th>
                <th className="py-3 pl-4 font-medium">Invariant Predicate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
              {AXIOMATIC_SYSTEM.map((axiom) => (
                <tr
                  key={axiom.axiom_id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 pr-4 font-mono text-xs text-sky-600 dark:text-sky-400 whitespace-nowrap">
                    {axiom.axiom_id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                    {axiom.name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                    {axiom.formal_statement}
                  </td>
                  <td className="py-3.5 pl-4 font-mono text-xs text-emerald-600 dark:text-emerald-400">
                    {axiom.invariant_predicate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bound System Modules */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Cryptographically Bound System Artifacts
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All {Object.keys(receipt.bound_system_modules).length} sovereign codebase modules committed to the Merkle-DAG activation root.
            </p>
          </div>
          <FileCheck2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(receipt.bound_system_modules).map(([modulePath, cid]) => (
            <div
              key={modulePath}
              className="flex items-center justify-between gap-4 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg"
            >
              <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-200 shrink-0">
                {modulePath}
              </span>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                {cid}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
