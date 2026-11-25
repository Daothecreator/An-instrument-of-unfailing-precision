import React, { useMemo, useState } from 'react';
import { GeometricRelation, SemanticPoint, VectorSemanticManifold } from '../casl/engine';
import { Compass, Calculator, PlusCircle, CheckCircle2, Search, Sparkles, X } from 'lucide-react';

interface ManifoldExplorerProps {
  manifold: VectorSemanticManifold;
  domainDistribution: Record<string, number>;
  initialRelations: GeometricRelation[];
}

const PRESET_CONCEPTS = [
  'Homotopy Type Theory',
  'Univalence Axiom',
  'Merkle-DAG / IPFS',
  'Causal Consistency',
  'Curry-Howard Correspondence',
  'Proofs as Programs',
  'F2T2EA GEOINT Fusion (EO, IR, SAR, MTI)',
  'Computer Vision (CV) Inference',
  'Declarative Intent-Based',
  'Stateless Deterministic Synthesis',
  'Autopoiesis',
  'Bidirectional Cognitive Alignment',
  'Topos Theory',
  'Grothendieck Topoi',
  'Zero-Knowledge Proofs (zk-SNARKs / zk-STARKs)',
  'Lyapunov Stability',
];

function highlightMatchText(text: string, query: string): React.ReactNode {
  const clean = query.trim();
  if (!clean) return text;
  const escaped = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    part.toLowerCase() === clean.toLowerCase() ? (
      <mark
        key={i}
        className="px-1 py-0.5 rounded bg-amber-300/80 dark:bg-amber-400/30 text-slate-950 dark:text-amber-200 font-semibold"
      >
        {part}
      </mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
}

export const ManifoldExplorer: React.FC<ManifoldExplorerProps> = ({
  manifold,
  domainDistribution,
  initialRelations,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceInput, setSourceInput] = useState('Homotopy Type Theory');
  const [targetInput, setTargetInput] = useState('Univalence Axiom');
  const [relations, setRelations] = useState<GeometricRelation[]>(initialRelations);
  const [activeRelation, setActiveRelation] = useState<GeometricRelation>(
    initialRelations[0]
  );
  const [customConceptInput, setCustomConceptInput] = useState('');
  const [embeddedPoint, setEmbeddedPoint] = useState<SemanticPoint>(() =>
    manifold.embedConcept('Homotopy Type Theory')
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const totalConcepts = Object.values(domainDistribution).reduce((a, b) => a + b, 0);
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Build searchable 64D concept pool from presets, evaluated relations, and the manifold catalog
  const allSearchableConceptLabels = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    const addLabel = (lbl: string) => {
      const clean = lbl.trim();
      if (!clean || clean.startsWith('INTENT::') || seen.has(clean)) return;
      seen.add(clean);
      list.push(clean);
    };
    for (const c of PRESET_CONCEPTS) addLabel(c);
    for (const r of relations) {
      addLabel(r.source);
      addLabel(r.target);
    }
    for (const c of manifold.catalogLabels) addLabel(c);
    return list;
  }, [manifold.catalogLabels, relations]);

  // Compute matching 64D semantic points and domain match counts for the active search query
  const { matchingPoints, domainMatchCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!normalizedQuery) {
      const defaultPts = PRESET_CONCEPTS.slice(0, 8).map((lbl) =>
        manifold.embedConcept(lbl)
      );
      return { matchingPoints: defaultPts, domainMatchCounts: counts };
    }

    const matched: SemanticPoint[] = [];
    for (const label of allSearchableConceptLabels) {
      const domain = manifold.classifyDomain(label);
      const labelMatches = label.toLowerCase().includes(normalizedQuery);
      const domainMatches = domain.toLowerCase().includes(normalizedQuery);
      const existingPt = manifold.points.get(label);
      const cidMatches = existingPt
        ? existingPt.cid.toLowerCase().includes(normalizedQuery)
        : false;

      if (labelMatches || domainMatches || cidMatches) {
        counts[domain] = (counts[domain] || 0) + 1;
        if (matched.length < 18) {
          matched.push(manifold.embedConcept(label));
        }
      }
    }
    return { matchingPoints: matched, domainMatchCounts: counts };
  }, [allSearchableConceptLabels, manifold, normalizedQuery]);

  // Determine which evaluated geodesic relations match the query
  const relationMatchFlags = useMemo(() => {
    if (!normalizedQuery) return relations.map(() => false);
    return relations.map((rel) => {
      const sDomain = manifold.classifyDomain(rel.source);
      const tDomain = manifold.classifyDomain(rel.target);
      return (
        rel.source.toLowerCase().includes(normalizedQuery) ||
        rel.target.toLowerCase().includes(normalizedQuery) ||
        rel.source_cid.toLowerCase().includes(normalizedQuery) ||
        rel.target_cid.toLowerCase().includes(normalizedQuery) ||
        sDomain.toLowerCase().includes(normalizedQuery) ||
        tDomain.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [relations, normalizedQuery, manifold]);

  const matchedRelationsCount = relationMatchFlags.filter(Boolean).length;
  const totalDomainMatches = Object.values(domainMatchCounts).reduce(
    (acc, v) => acc + v,
    0
  );

  const handleComputeRelation = (e: React.FormEvent) => {
    e.preventDefault();
    const s = sourceInput.trim();
    const t = targetInput.trim();
    if (!s || !t) {
      setValidationError('Both Source Concept and Target Concept are required.');
      return;
    }
    setValidationError(null);
    const rel = manifold.computeRelation(s, t);
    setActiveRelation(rel);
    setEmbeddedPoint(manifold.embedConcept(s));
    setRelations((prev) => {
      const exists = prev.some((r) => r.source === rel.source && r.target === rel.target);
      return exists ? prev : [rel, ...prev];
    });
  };

  const handleEmbedSingleConcept = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customConceptInput.trim();
    if (!trimmed) return;
    const pt = manifold.embedConcept(trimmed);
    setEmbeddedPoint(pt);
    setSourceInput(pt.label);
    setSearchQuery(pt.label);
    setCustomConceptInput('');
  };

  return (
    <div className="space-y-8">
      {/* 64D Vector Semantic Manifold Concept Search & Real-Time Highlighter */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400 mb-1">
              64D HYPERSPHERE SEMANTIC SEARCH · REAL-TIME CONCEPT & GEODESIC HIGHLIGHTING
            </div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Query & Highlight Concepts in the 64D Vector Semantic Manifold (S⁶³)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search across {allSearchableConceptLabels.length.toLocaleString()} embedded 64D manifold concepts, ontological attractor basins, and evaluated geodesic relations.
            </p>
          </div>

          {normalizedQuery && (
            <div
              data-testid="manifold-search-match-summary"
              className="px-3.5 py-2 bg-sky-500/10 border border-sky-500/30 rounded-lg text-xs font-mono text-sky-700 dark:text-sky-300 flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>
                {totalDomainMatches} Concept Matches · {matchedRelationsCount} Highlighted Relations
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="manifold-concept-search-input"
              type="text"
              aria-label="Search concepts in 64D vector semantic manifold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts, domain basins, or CIDs in the 64D manifold (e.g., Homotopy, Merkle, Causal, F2T2EA, Topos)..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear manifold search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Quick Manifold Queries:
          </span>
          {[
            'Homotopy',
            'Merkle',
            'Causal',
            'GEOINT',
            'Topos',
            'Zero-Knowledge',
            'Lyapunov',
          ].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setSearchQuery(chip)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-colors ${
                normalizedQuery === chip.toLowerCase()
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Highlighted 64D Manifold Concept Cards */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {normalizedQuery
                ? `Highlighted 64D Manifold Concept Entries (${matchingPoints.length} shown of ${totalDomainMatches} matches)`
                : 'Featured 64D Manifold Anchor Concepts (Type above to search & highlight across all 439+ concepts)'}
            </span>
            <span className="font-mono">Click entry to inspect 64D coordinates</span>
          </div>

          {matchingPoints.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {matchingPoints.map((pt) => {
                const isHighlighted = Boolean(normalizedQuery);
                const isSelected = embeddedPoint.label === pt.label;
                return (
                  <div
                    key={pt.cid}
                    data-testid="manifold-concept-card"
                    data-highlighted={isHighlighted ? 'true' : 'false'}
                    onClick={() => {
                      setEmbeddedPoint(pt);
                      setSourceInput(pt.label);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                      isHighlighted
                        ? 'bg-amber-500/5 dark:bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/40'
                        : isSelected
                        ? 'bg-sky-500/5 border-sky-500/40'
                        : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-sky-500/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="font-mono text-[10px] text-sky-600 dark:text-sky-400 truncate">
                          {highlightMatchText(pt.domain_cluster, searchQuery)}
                        </span>
                        {isHighlighted && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded shrink-0">
                            MATCH
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                        {highlightMatchText(pt.label, searchQuery)}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        CID: {highlightMatchText(pt.cid.slice(0, 22) + '...', searchQuery)}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-1 text-[10px] font-mono">
                      <span className="text-slate-500 truncate">
                        d₀..₁: [{pt.fixed_coords[0]}, {pt.fixed_coords[1]}]
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setSourceInput(pt.label);
                            setEmbeddedPoint(pt);
                          }}
                          className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-sky-600 hover:text-white rounded text-slate-700 dark:text-slate-300"
                          title="Set as Source Concept A"
                        >
                          Src A
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setTargetInput(pt.label);
                          }}
                          className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white rounded text-slate-700 dark:text-slate-300"
                          title="Set as Target Concept B"
                        >
                          Tgt B
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span>
                No pre-cataloged concept matched <strong className="font-mono">"{searchQuery}"</strong>. You can deterministically embed it directly into S⁶³:
              </span>
              <button
                type="button"
                onClick={() => {
                  const pt = manifold.embedConcept(searchQuery.trim());
                  setEmbeddedPoint(pt);
                  setSourceInput(pt.label);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg shrink-0"
              >
                Embed "{searchQuery.trim()}" into 64D Manifold
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Domain Attractor Distribution */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              64D Hypersphere Domain Attractor Distribution
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Each concept is coupled 65% to its orthogonal domain attractor and 35% to its SHA3-256 intrinsic specificity vector.
            </p>
          </div>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
            Total Embedded: {totalConcepts.toLocaleString()} Concepts
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(domainDistribution)
            .sort((a, b) => b[1] - a[1])
            .map(([domain, count]) => {
              const pct = totalConcepts > 0 ? ((count / totalConcepts) * 100).toFixed(1) : '0.0';
              const matchCount = domainMatchCounts[domain] || 0;
              const isDomainHighlighted = Boolean(normalizedQuery && matchCount > 0);
              return (
                <div
                  key={domain}
                  onClick={() => setSearchQuery(domain)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isDomainHighlighted
                      ? 'bg-sky-500/10 border-sky-500/50 ring-1 ring-sky-500/40'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200/80 dark:border-slate-800 hover:border-sky-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="font-mono text-xs text-sky-600 dark:text-sky-400 truncate">
                      {highlightMatchText(domain, searchQuery)}
                    </div>
                    {isDomainHighlighted && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-sky-500/20 text-sky-700 dark:text-sky-300 rounded shrink-0">
                        {matchCount} matched
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
                      {count}
                    </span>
                    <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="mt-2 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-600 dark:bg-sky-500"
                      style={{ width: `${Math.min(100, Number(pct) * 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Interactive Geodesic Relation Calculator & 64D Point Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                Geodesic Morphism & Relation Calculator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Compute exact inner product, geodesic angle on S⁶³, and chord distance between any two concepts.
              </p>
            </div>
            <Calculator className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          </div>

          <form onSubmit={handleComputeRelation} className="space-y-4">
            <div>
              <label
                htmlFor="source-concept-input"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Source Concept (A)
              </label>
              <div className="flex gap-2">
                <input
                  id="source-concept-input"
                  type="text"
                  value={sourceInput}
                  onChange={(e) => setSourceInput(e.target.value)}
                  placeholder="Enter or select source concept..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select
                  aria-label="Preset Source Concept"
                  value={PRESET_CONCEPTS.includes(sourceInput) ? sourceInput : ''}
                  onChange={(e) => {
                    if (e.target.value) setSourceInput(e.target.value);
                  }}
                  className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  <option value="">Presets</option>
                  {PRESET_CONCEPTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="target-concept-input"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Target Concept (B)
              </label>
              <div className="flex gap-2">
                <input
                  id="target-concept-input"
                  type="text"
                  value={targetInput}
                  onChange={(e) => setTargetInput(e.target.value)}
                  placeholder="Enter or select target concept..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <select
                  aria-label="Preset Target Concept"
                  value={PRESET_CONCEPTS.includes(targetInput) ? targetInput : ''}
                  onChange={(e) => {
                    if (e.target.value) setTargetInput(e.target.value);
                  }}
                  className="px-2.5 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                >
                  <option value="">Presets</option>
                  {PRESET_CONCEPTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {validationError && (
              <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                {validationError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Compute Geometric Relation
            </button>
          </form>

          {activeRelation && (
            <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {activeRelation.source} → {activeRelation.target}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  {activeRelation.same_ontological_basin ? 'Same Basin' : 'Cross-Basin Morphism'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Cosine Sim</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                    {activeRelation.cosine_similarity.toFixed(6)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Angle (Deg)</div>
                  <div className="text-sm font-mono font-semibold text-sky-600 dark:text-sky-400 tabular-nums mt-0.5">
                    {activeRelation.geodesic_angle_deg.toFixed(4)}°
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Angle (Rad)</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                    {activeRelation.geodesic_angle_rad.toFixed(6)}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Chord Dist</div>
                  <div className="text-sm font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                    {activeRelation.euclidean_distance.toFixed(6)}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                  Directional Morphism Unit Vector (First 8 Axes)
                </div>
                <div className="font-mono text-xs text-slate-800 dark:text-slate-200 tabular-nums break-all">
                  [{activeRelation.direction_norm_preview.join(', ')}]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Single Concept 64D Coordinate Inspector & Embedder */}
        <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
                  Deterministic Concept Embedder (S⁶³)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Embed any new or existing concept into 10⁹-scaled fixed-point coordinates.
                </p>
              </div>
              <Compass className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>

            <form onSubmit={handleEmbedSingleConcept} className="flex gap-2 mb-5">
              <input
                type="text"
                aria-label="New Concept to Embed"
                value={customConceptInput}
                onChange={(e) => setCustomConceptInput(e.target.value)}
                placeholder="Embed custom concept (e.g., Simplicial Sheaf Cohomology)..."
                className="flex-1 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 rounded-lg transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Embed Point</span>
              </button>
            </form>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>Inspecting Concept</span>
                  <span className="font-mono text-sky-600 dark:text-sky-400">
                    {highlightMatchText(embeddedPoint.domain_cluster, searchQuery)}
                  </span>
                </div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {highlightMatchText(embeddedPoint.label, searchQuery)}
                </div>
                <div className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
                  CID: {highlightMatchText(embeddedPoint.cid, searchQuery)}
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                  Fixed-Point Coordinates (Scale 10⁹, First 12 of 64 Dimensions)
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 font-mono text-xs tabular-nums">
                  {embeddedPoint.fixed_coords.slice(0, 12).map((coord, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-slate-800 dark:text-slate-200"
                    >
                      <span className="text-slate-400 mr-1">d{idx}:</span>
                      {coord}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Unit Sphere Norm ‖v‖₂ = 1.00000000</span>
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Bitwise Deterministic
            </span>
          </div>
        </div>
      </div>

      {/* Geometric Relations Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Evaluated Semantic Geodesic Relations
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click any row to load its directional morphism preview and inspect its 64D coordinates. Matching rows are highlighted when querying above.
            </p>
          </div>
          {normalizedQuery && (
            <span className="px-2.5 py-1 text-xs font-mono bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 rounded-lg shrink-0">
              {matchedRelationsCount} of {relations.length} Relations Highlighted
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                <th className="py-3 pr-4 font-medium">Source Concept</th>
                <th className="py-3 px-4 font-medium">Target Concept</th>
                <th className="py-3 px-4 font-medium text-right">Cosine Similarity</th>
                <th className="py-3 px-4 font-medium text-right">Geodesic Angle</th>
                <th className="py-3 px-4 font-medium text-right">Chord Distance</th>
                <th className="py-3 pl-4 font-medium">Ontological Basin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
              {relations.map((rel, idx) => {
                const isRowMatched = relationMatchFlags[idx];
                return (
                  <tr
                    key={`${rel.source}-${rel.target}-${idx}`}
                    data-highlighted={isRowMatched ? 'true' : 'false'}
                    onClick={() => {
                      setActiveRelation(rel);
                      setSourceInput(rel.source);
                      setTargetInput(rel.target);
                      setEmbeddedPoint(manifold.embedConcept(rel.source));
                    }}
                    className={`cursor-pointer transition-colors ${
                      isRowMatched
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 hover:bg-amber-500/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{highlightMatchText(rel.source, searchQuery)}</span>
                        {isRowMatched && (
                          <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 rounded">
                            MATCH
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200">
                      {highlightMatchText(rel.target, searchQuery)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-right tabular-nums text-slate-900 dark:text-slate-100">
                      {rel.cosine_similarity.toFixed(8)}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-right tabular-nums text-sky-600 dark:text-sky-400">
                      {rel.geodesic_angle_deg.toFixed(4)}°
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-right tabular-nums text-slate-700 dark:text-slate-300">
                      {rel.euclidean_distance.toFixed(6)}
                    </td>
                    <td className="py-3 pl-4 text-xs text-slate-500 dark:text-slate-400">
                      {rel.same_ontological_basin ? 'Shared Basin' : 'Distinct Basins'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

