import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DETERMINISTIC_PRIMARY_REGISTRY_PAYLOADS,
  executePegByteExactRegistryParser,
  sha256Hex,
} from './src/casl/causal_ir_compiler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '5mb' }));

  /**
   * GET /api/causal-ir/status
   * Returns deterministic status of the Sovereign 6-Mechanism CausalIR Engine & Primary Registries.
   * Zero AI, zero external API keys, zero payment/quota restrictions.
   */
  app.get('/api/causal-ir/status', (_req, res) => {
    return res.json({
      deterministicEngineReady: true,
      engineVersion: 'CASL-CAUSAL-IR-6CORE-v1.0',
      mechanisms: [
        'STAGE_0_PEG_64D_MANIFOLD_ONTOLOGY',
        'MECH_1_PEG_BYTE_EXACT_REGISTRY_PARSER',
        'MECH_2_SQLITE3_WAL_WINDOW_ALGEBRA',
        'MECH_3_SEMI_NAIVE_DATALOG_FIXPOINT',
        'MECH_4_SMT_UNSAT_CORE_DATA_WALL',
        'MECH_5_GRAPHBLAS_SEMIRING_MIN_CUT',
        'MECH_6_BAZEL_80B_WORM_MERKLE_DAG_EMITTER',
      ],
      registries: DETERMINISTIC_PRIMARY_REGISTRY_PAYLOADS.map((r) => ({
        registry: r.registry,
        sourceUrl: r.sourceUrl,
        format: r.format,
        sha256: sha256Hex(r.rawContent),
      })),
    });
  });

  /**
   * POST /api/causal-ir/parse-bytes
   * Server-side byte-exact parsing of primary registries + optional custom raw payload.
   */
  app.post('/api/causal-ir/parse-bytes', (req, res) => {
    const rawText =
      typeof req.body?.rawText === 'string' ? req.body.rawText : '';
    const sourceUrl =
      typeof req.body?.sourceUrl === 'string'
        ? req.body.sourceUrl
        : 'file://local/terminal_ingest_payload.jsonl';

    const report = executePegByteExactRegistryParser(
      rawText.trim().length > 0 ? { sourceUrl, rawText } : undefined
    );
    return res.json(report);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CASL Sovereign CausalIR Terminal running on http://localhost:${PORT}`);
  });
}

startServer();
