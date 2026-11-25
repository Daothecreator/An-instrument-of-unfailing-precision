import React, { useEffect, useState } from 'react';
import { ContentAddressedSemanticDAG, DAGIntegrityReport, IPLDMerkleNode } from '../casl/engine';
import { GitBranch, CheckCircle2, Plus, FileJson, Globe, ExternalLink } from 'lucide-react';

interface MerkleDagLatticeProps {
  dag: ContentAddressedSemanticDAG;
  integrityReport: DAGIntegrityReport;
  onAppendNode: (payloadType: string, customSummary: string) => void;
  focusedNodeCid?: string | null;
  onOpenCausalTerminal?: () => void;
}

export const MerkleDagLattice: React.FC<MerkleDagLatticeProps> = ({
  dag,
  integrityReport,
  onAppendNode,
  focusedNodeCid,
  onOpenCausalTerminal,
}) => {
  const nodesList: IPLDMerkleNode[] = Array.from(dag.nodes.values()).sort(
    (a, b) => a.causal_clock.lamport_time - b.causal_clock.lamport_time
  );

  const [selectedNode, setSelectedNode] = useState<IPLDMerkleNode>(() => {
    if (focusedNodeCid) {
      const matched = dag.nodes.get(focusedNodeCid);
      if (matched) return matched;
    }
    return nodesList[nodesList.length - 1] || nodesList[0];
  });
  const [payloadType, setPayloadType] = useState('CUSTOM_SEMANTIC_ASSERTION');
  const [customSummary, setCustomSummary] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (focusedNodeCid) {
      const matched = dag.nodes.get(focusedNodeCid);
      if (matched) {
        setSelectedNode(matched);
      }
    }
  }, [focusedNodeCid, dag]);

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSummary.trim()) {
      setFormError('Semantic assertion payload statement is required.');
      return;
    }
    setFormError(null);
    onAppendNode(payloadType, customSummary.trim());
    setCustomSummary('');
    const updatedList = Array.from(dag.nodes.values());
    if (updatedList.length > 0) {
      setSelectedNode(updatedList[updatedList.length - 1]);
    }
  };

  const selectedCitations = Array.isArray(selectedNode?.payload?.citations)
    ? (selectedNode.payload.citations as Array<{
        title?: string;
        uri?: string;
        domain?: string;
        chunk_cid?: string;
      }>)
    : [];

  return (
    <div className="space-y-8">
      {/* Integrity & Semilattice Summary Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Content-Addressed IPLD Merkle-DAG & CRDT Join-Semilattice
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every state transition and CausalIR 6-Mechanism build artifact is content-addressed via SHA3-256 (`dag-json-sha3-256`) and causally ordered via Lamport & Vector Clocks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Acyclic Verified: {String(integrityReport.acyclic_verified)}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              SHA3-256 Verified: {String(integrityReport.cryptographic_hashes_verified)}
            </span>
            {onOpenCausalTerminal && (
              <button
                type="button"
                onClick={onOpenCausalTerminal}
                className="px-3.5 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Open CausalIR Terminal</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Merkle Root CID (CRDT G-Set Least Upper Bound)
            </div>
            <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 break-all">
              {integrityReport.merkle_root_cid}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              Current DAG Frontier Head CID
            </div>
            <div className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all">
              {integrityReport.heads[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Causal Chain & Node Payload Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Causal Merkle-DAG Chain ({nodesList.length} Nodes)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Select any node to inspect its canonical IPLD envelope and parent references.
            </p>

            <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {nodesList.map((node) => {
                const isSelected = selectedNode?.cid === node.cid;
                const nodeType = String(node.payload.type || 'SEMANTIC_NODE');
                return (
                  <button
                    key={node.cid}
                    type="button"
                    onClick={() => setSelectedNode(node)}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-500'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                        Lamport T={node.causal_clock.lamport_time} · {nodeType}
                      </span>
                      <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all">
                      {node.cid}
                    </div>
                    {node.parent_cids.length > 0 && (
                      <div className="mt-1.5 font-mono text-xs text-slate-500 dark:text-slate-400 truncate">
                        Parent ← {node.parent_cids[0]}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Append Custom Semantic Node to DAG */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Append Immutable Semantic Node to DAG
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ticks the Lamport causal clock, links to current head CID, and recomputes the CRDT G-Set Merkle Root.
            </p>

            <form onSubmit={handleCreateNode} className="space-y-3">
              <div>
                <label
                  htmlFor="dag-node-type"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Node Payload Classification
                </label>
                <select
                  id="dag-node-type"
                  value={payloadType}
                  onChange={(e) => setPayloadType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="CUSTOM_SEMANTIC_ASSERTION">CUSTOM_SEMANTIC_ASSERTION</option>
                  <option value="SHEAF_COHOMOLOGY_WITNESS">SHEAF_COHOMOLOGY_WITNESS</option>
                  <option value="F2T2EA_PHASE_SPACE_LOCK">F2T2EA_PHASE_SPACE_LOCK</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="dag-payload-statement"
                  className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Semantic Assertion / Invariant Statement
                </label>
                <input
                  id="dag-payload-statement"
                  type="text"
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                  placeholder="Enter invariant or semantic proposition to commit..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Commit Content-Addressed Node</span>
              </button>
            </form>
          </div>
        </div>

        {/* Selected Node Canonical Envelope Viewer */}
        <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                IPLD Canonical DAG-JSON Envelope
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Codec: {selectedNode?.codec} · Lamport Clock: {selectedNode?.causal_clock.lamport_time}
              </p>
            </div>
            <FileJson className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>

          {selectedCitations.length > 0 && (
            <div className="mb-4 p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Anchored Search Grounding Citations ({selectedCitations.length})
              </div>
              <div className="space-y-1.5">
                {selectedCitations.map((cit, idx) => (
                  <a
                    key={cit.chunk_cid || idx}
                    href={cit.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 text-xs text-sky-600 dark:text-sky-400 hover:underline"
                  >
                    <span className="truncate font-medium">
                      {cit.title || cit.domain || cit.uri}
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <pre className="flex-1 p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto max-h-[540px] border border-slate-800 leading-relaxed">
            {JSON.stringify(selectedNode, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
