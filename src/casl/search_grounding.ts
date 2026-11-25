import {
  ContentAddressedSemanticDAG,
  IPLDMerkleNode,
  VectorSemanticManifold,
  canonicalJson,
} from './engine';
import { sha3_256Hex } from './sha3';

export interface GroundingCitation {
  title: string;
  uri: string;
  domain: string;
  chunk_cid: string;
}

export interface SearchGroundingSynthesisResult {
  query: string;
  query_cid: string;
  synthesized_statement: string;
  citations: GroundingCitation[];
  extracted_concepts: string[];
  manifold_domain_cluster: string;
  semantic_point_cid: string;
  unit_coords_preview: number[];
  barycentric_coherence: number;
  grounded_at_iso: string;
  verification_proof_hash: string;
}

function extractDomainFromUri(uri: string, fallbackTitle: string): string {
  try {
    const parsed = new URL(uri);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return fallbackTitle || 'deterministic.registry.local';
  }
}

export function buildGroundingCitation(
  uri: string,
  title?: string
): GroundingCitation {
  const cleanUri = uri.trim();
  const cleanTitle = (title || cleanUri).trim();
  const domain = extractDomainFromUri(cleanUri, cleanTitle);
  const chunkPayload = canonicalJson(
    {
      domain,
      title: cleanTitle,
      uri: cleanUri,
    },
    false,
    true
  );
  const chunkCid = `bafkr4i${sha3_256Hex(chunkPayload).slice(0, 52)}`;

  return {
    title: cleanTitle,
    uri: cleanUri,
    domain,
    chunk_cid: chunkCid,
  };
}

/**
 * Pure deterministic primary-registry & ontological anchoring synthesis.
 * Zero AI/LLM calls, zero external API dependencies.
 */
export function synthesizeSearchGroundingPayload(params: {
  query: string;
  synthesizedStatement: string;
  rawCitations: Array<{ uri: string; title?: string }>;
  extractedConcepts: string[];
  groundedAtIso: string;
  manifold: VectorSemanticManifold;
}): SearchGroundingSynthesisResult {
  const {
    query,
    synthesizedStatement,
    rawCitations,
    extractedConcepts,
    groundedAtIso,
    manifold,
  } = params;

  const cleanQuery = query.trim();
  const queryCid = `bafkr4i${sha3_256Hex(`REGISTRY_QUERY::${cleanQuery}`).slice(0, 52)}`;

  const seenUris = new Set<string>();
  const citations: GroundingCitation[] = [];
  for (const item of rawCitations) {
    if (!item.uri || seenUris.has(item.uri)) continue;
    seenUris.add(item.uri);
    citations.push(buildGroundingCitation(item.uri, item.title));
  }

  const normalizedConcepts =
    extractedConcepts.filter((c) => c.trim().length > 0).length > 0
      ? extractedConcepts.map((c) => c.trim()).slice(0, 6)
      : [cleanQuery];

  const primaryConceptPoint = manifold.embedConcept(
    `PRIMARY_REGISTRY::${cleanQuery}`
  );
  for (const concept of normalizedConcepts) {
    manifold.embedConcept(concept);
  }

  const trajectory = manifold.synthesizeIntentTrajectory(
    `${cleanQuery} :: ${synthesizedStatement.slice(0, 240)}`,
    normalizedConcepts
  );

  const proofPayload = canonicalJson(
    {
      citation_cids: citations.map((c) => c.chunk_cid),
      concepts: normalizedConcepts,
      query_cid: queryCid,
      semantic_point_cid: primaryConceptPoint.cid,
      statement_sha3: sha3_256Hex(synthesizedStatement),
    },
    false,
    true
  );
  const verificationProofHash = sha3_256Hex(proofPayload);

  return {
    query: cleanQuery,
    query_cid: queryCid,
    synthesized_statement: synthesizedStatement,
    citations,
    extracted_concepts: normalizedConcepts,
    manifold_domain_cluster: primaryConceptPoint.domain_cluster,
    semantic_point_cid: primaryConceptPoint.cid,
    unit_coords_preview: primaryConceptPoint.unit_coords
      .slice(0, 8)
      .map((x) => Math.round(x * 1e6) / 1e6),
    barycentric_coherence: trajectory.barycentric_coherence,
    grounded_at_iso: groundedAtIso,
    verification_proof_hash: verificationProofHash,
  };
}

export function anchorSearchGroundingToDag(
  dag: ContentAddressedSemanticDAG,
  groundingResult: SearchGroundingSynthesisResult,
  parentCids?: string[]
): IPLDMerkleNode {
  return dag.putNode(
    {
      type: 'PRIMARY_REGISTRY_KNOWLEDGE_ANCHOR',
      grounding_protocol: 'CASL-DETERMINISTIC-REGISTRY-V1',
      query: groundingResult.query,
      query_cid: groundingResult.query_cid,
      synthesized_statement: groundingResult.synthesized_statement,
      citations: groundingResult.citations,
      citation_count: groundingResult.citations.length,
      extracted_concepts: groundingResult.extracted_concepts,
      manifold_domain_cluster: groundingResult.manifold_domain_cluster,
      semantic_point_cid: groundingResult.semantic_point_cid,
      barycentric_coherence: groundingResult.barycentric_coherence,
      verification_proof_hash: groundingResult.verification_proof_hash,
      grounded_at_iso: groundingResult.grounded_at_iso,
    },
    parentCids
  );
}
