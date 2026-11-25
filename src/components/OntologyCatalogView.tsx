import React, { useMemo, useState } from 'react';
import { DOMAIN_TAXONOMY, SemanticPoint, VectorSemanticManifold } from '../casl/engine';
import { Search, RotateCcw } from 'lucide-react';

interface OntologyCatalogViewProps {
  manifold: VectorSemanticManifold;
}

export const OntologyCatalogView: React.FC<OntologyCatalogViewProps> = ({ manifold }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const catalogEntries = useMemo(() => {
    return manifold.catalogLabels.map((label) => ({
      label,
      domain: manifold.classifyDomain(label),
    }));
  }, [manifold, manifold.catalogLabels.length]);

  const domains = useMemo(() => ['ALL', ...Object.keys(DOMAIN_TAXONOMY).sort()], []);

  const filteredEntries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return catalogEntries.filter((entry) => {
      const domainMatch = selectedDomain === 'ALL' || entry.domain === selectedDomain;
      if (!domainMatch) return false;
      if (!q) return true;
      return (
        entry.label.toLowerCase().includes(q) ||
        entry.domain.toLowerCase().includes(q)
      );
    });
  }, [catalogEntries, searchQuery, selectedDomain]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  // Lazy-embed only the 25 items on the current visible page (< 5ms)
  const pageItems: SemanticPoint[] = useMemo(() => {
    const slice = filteredEntries.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
    return slice.map((entry) => manifold.embedConcept(entry.label));
  }, [filteredEntries, currentPage, pageSize, manifold]);

  const [inspectedPoint, setInspectedPoint] = useState<SemanticPoint>(() =>
    manifold.embedConcept(manifold.catalogLabels[0])
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDomain('ALL');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold font-display text-slate-900 dark:text-slate-100">
              Sovereign Semantic Ontology Catalog ({catalogEntries.length.toLocaleString()} Concepts)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter by ontological attractor basin or search by concept label across all 64D embeddings.
            </p>
          </div>

          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              aria-label="Search Ontology Concepts"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search concepts or domains..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Interactive Domain Filter Controls */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {domains.map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => {
                setSelectedDomain(dom);
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedDomain === dom
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {dom === 'ALL' ? 'All Basins' : dom}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Concept Detail Banner */}
      {inspectedPoint && (
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
            <div>
              <span className="font-mono text-xs text-sky-600 dark:text-sky-400">
                {inspectedPoint.concept_id} · {inspectedPoint.domain_cluster}
              </span>
              <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                {inspectedPoint.label}
              </h3>
            </div>
            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 break-all">
              CID: {inspectedPoint.cid}
            </div>
          </div>
          <div className="font-mono text-xs text-slate-600 dark:text-slate-300 tabular-nums break-all">
            64D Fixed-Point Vector Head (10⁹ Scale): [{inspectedPoint.fixed_coords.slice(0, 10).join(', ')}, ...]
          </div>
        </div>
      )}

      {/* High-Density Data Table */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        {filteredEntries.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              No ontological concepts matched "{searchQuery}" in {selectedDomain}.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset the active search query or domain filter to view all {catalogEntries.length.toLocaleString()} concepts.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
              <span className="tabular-nums">
                Showing {(currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredEntries.length)} of{' '}
                {filteredEntries.length.toLocaleString()} Concepts
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded text-slate-800 dark:text-slate-200 font-medium"
                >
                  Previous
                </button>
                <span className="font-mono tabular-nums">
                  Page {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 disabled:opacity-40 rounded text-slate-800 dark:text-slate-200 font-medium"
                >
                  Next
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <th className="py-2.5 pr-4 font-medium">Concept ID</th>
                    <th className="py-2.5 px-4 font-medium">Concept Label</th>
                    <th className="py-2.5 px-4 font-medium">Ontological Attractor Basin</th>
                    <th className="py-2.5 px-4 font-medium text-right">Axis d₀ (10⁹)</th>
                    <th className="py-2.5 pl-4 font-medium">Deterministic CIDv1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 text-sm">
                  {pageItems.map((pt) => (
                    <tr
                      key={pt.label}
                      onClick={() => setInspectedPoint(pt)}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 pr-4 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {pt.concept_id}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {pt.label}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-sky-600 dark:text-sky-400">
                        {pt.domain_cluster}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-xs text-right tabular-nums text-slate-700 dark:text-slate-300">
                        {pt.fixed_coords[0]}
                      </td>
                      <td className="py-2.5 pl-4 font-mono text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                        {pt.cid}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
