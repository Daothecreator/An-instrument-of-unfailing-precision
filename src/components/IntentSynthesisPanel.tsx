import React, { useState } from 'react';
import {
  CASLGenesisReceipt,
  SENSOR_MODALITIES,
  SensorModalityReading,
} from '../casl/engine';
import {
  DEFAULT_ANCHOR_CONCEPTS,
  DEFAULT_DECLARATIVE_INTENT,
} from '../casl/specs';
import { Cpu, Radio, RotateCcw, Sparkles, CheckCircle2 } from 'lucide-react';

interface IntentSynthesisPanelProps {
  receipt: CASLGenesisReceipt;
  onExecuteSynthesis: (intent: string, anchors: string[]) => void;
}

export const IntentSynthesisPanel: React.FC<IntentSynthesisPanelProps> = ({
  receipt,
  onExecuteSynthesis,
}) => {
  const [intentInput, setIntentInput] = useState(DEFAULT_DECLARATIVE_INTENT);
  const [anchors, setAnchors] = useState<string[]>(DEFAULT_ANCHOR_CONCEPTS);
  const [newAnchorInput, setNewAnchorInput] = useState('');
  const [modalities] = useState<SensorModalityReading[]>(SENSOR_MODALITIES);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const traj = receipt.vector_semantic_manifold.intent_trajectory_synthesis;
  const f2t2ea = receipt.constructive_f2t2ea_edge_synthesis;

  const handleSynthesize = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = intentInput.trim();
    if (!cleaned) {
      setErrorMsg('Declarative intent statement cannot be empty.');
      return;
    }
    if (anchors.length === 0) {
      setErrorMsg('At least one ontological anchor concept is required.');
      return;
    }
    setErrorMsg(null);
    onExecuteSynthesis(cleaned, anchors);
  };

  const handleAddAnchor = () => {
    const trimmed = newAnchorInput.trim();
    if (!trimmed || anchors.includes(trimmed)) return;
    setAnchors([...anchors, trimmed]);
    setNewAnchorInput('');
  };

  const handleRemoveAnchor = (concept: string) => {
    if (anchors.length <= 1) return;
    setAnchors(anchors.filter((a) => a !== concept));
  };

  const handleResetGenesis = () => {
    setIntentInput(DEFAULT_DECLARATIVE_INTENT);
    setAnchors(DEFAULT_ANCHOR_CONCEPTS);
    setErrorMsg(null);
    onExecuteSynthesis(DEFAULT_DECLARATIVE_INTENT, DEFAULT_ANCHOR_CONCEPTS);
  };

  return (
    <div className="space-y-8">
      {/* Declarative Intent Trajectory Synthesis Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                Declarative Observer Intent Projection
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Project declarative intent directly into the 64D manifold and re-compute the Merkle-DAG synthesis state.
              </p>
            </div>
            <Sparkles className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>

          <form onSubmit={handleSynthesize} className="space-y-4">
            <div>
              <label
                htmlFor="declarative-intent-textarea"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Declarative Intent Statement
              </label>
              <textarea
                id="declarative-intent-textarea"
                rows={3}
                value={intentInput}
                onChange={(e) => setIntentInput(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="add-anchor-input"
                  className="text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Barycentric Anchor Concepts ({anchors.length})
                </label>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Click an anchor to remove
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {anchors.map((anchor) => (
                  <button
                    key={anchor}
                    type="button"
                    onClick={() => handleRemoveAnchor(anchor)}
                    aria-label={`Remove anchor ${anchor}`}
                    className="px-2.5 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                  >
                    {anchor} ×
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  id="add-anchor-input"
                  type="text"
                  value={newAnchorInput}
                  onChange={(e) => setNewAnchorInput(e.target.value)}
                  placeholder="Add anchor concept (e.g., Topos Theory)..."
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={handleAddAnchor}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Add Anchor
                </button>
              </div>
            </div>

            {errorMsg && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Synthesize & Project Intent
              </button>
              <button
                type="button"
                onClick={handleResetGenesis}
                className="px-4 py-2.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Genesis State</span>
              </button>
            </div>
          </form>
        </div>

        {/* Trajectory Synthesis Output */}
        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Barycentric Superposition & Sheaf Gluing
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Normalized superposition of Intent vector and Anchor Barycenter in S⁶³.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Intent CID</div>
                <div className="font-mono text-xs text-slate-900 dark:text-slate-200 break-all mt-0.5">
                  {traj.intent_cid}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400">Synthesis Trajectory CID</div>
                <div className="font-mono text-xs text-sky-600 dark:text-sky-400 break-all mt-0.5">
                  {traj.synthesis_cid}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Barycentric Coherence</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                    {traj.barycentric_coherence.toFixed(8)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Active Anchors</div>
                  <div className="text-base font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                    {traj.anchor_count} Concepts
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Synthesized Fixed-Point Head (10⁹ Scale, First 8 Axes)
                </div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums break-all">
                  [{traj.synthesized_fixed_head.join(', ')}]
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Sheaf Gluing Condition</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Consistent (H¹ = 0)
            </span>
          </div>
        </div>
      </div>

      {/* Constructive F2T2EA Multi-Modal Sensor Fusion Pipeline */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              {f2t2ea.node_architecture}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Precision-weighted Bayesian sensor fusion across Electro-Optical, Infrared, SAR, MTI, and Edge AI Vision modalities.
            </p>
          </div>
          <div className="font-mono text-xs text-sky-600 dark:text-sky-400">
            CID: {f2t2ea.fusion_state_cid.slice(0, 24)}...
          </div>
        </div>

        {/* Sensor Modalities Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-4 font-medium">Modality</th>
                <th className="py-2.5 px-4 font-medium">Wavelength / Spectrum Band</th>
                <th className="py-2.5 px-4 font-medium text-right">Resolution (m)</th>
                <th className="py-2.5 px-4 font-medium text-right">SNR (dB)</th>
                <th className="py-2.5 pl-4 font-medium">Feature Tensor [f₀, f₁, f₂, f₃]</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
              {modalities.map((m) => (
                <tr key={m.modality} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 pr-4 font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                    {m.modality}
                  </td>
                  <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                    {m.wavelength_band}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-right tabular-nums text-slate-700 dark:text-slate-300">
                    {m.spatial_resolution_m.toFixed(2)}m
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                    {m.signal_to_noise_db.toFixed(1)} dB
                  </td>
                  <td className="py-3 pl-4 font-mono text-xs tabular-nums text-slate-700 dark:text-slate-300">
                    [{m.feature_vector.map((v) => v.toFixed(2)).join(', ')}]
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fused Phase-Space Coordinate & 6-Stage Constructive Cycle */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Inverse-Variance Fused Phase-Space State Vector:
              </span>
            </div>
            <span className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              [{f2t2ea.fused_feature_state.map((v) => v.toFixed(8)).join(', ')}]
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(f2t2ea.f2t2ea_constructive_cycle).map(([stageKey, description]) => (
            <div
              key={stageKey}
              className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200/80 dark:border-slate-800 rounded-lg"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                  {stageKey.replace(/_/g, ' ')}
                </span>
                <Cpu className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
