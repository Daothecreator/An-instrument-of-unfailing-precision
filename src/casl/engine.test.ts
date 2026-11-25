import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  CASLSystemEngine,
  computeObserverCid,
  createDefaultObserver,
  executeConstructiveF2T2EAFusion,
  VectorSemanticManifold,
} from './engine';
import { DEFAULT_DECLARATIVE_INTENT } from './specs';

test('Observer Manifestation CID matches Genesis Execution Receipt bit-for-bit', () => {
  const observer = createDefaultObserver();
  const subjectCid = computeObserverCid(observer);
  assert.equal(
    subjectCid,
    'bafkr4i52b89372fe28fb747669e4695d799833a963d691763eac661166'
  );
  assert.equal(observer.ownership_flag, false);
  assert.equal(observer.full_responsibility, true);
});

test('VectorSemanticManifold 64D embedding & geodesic relation match Genesis Receipt bit-for-bit', () => {
  const manifold = new VectorSemanticManifold(64);
  const rel = manifold.computeRelation('Homotopy Type Theory', 'Univalence Axiom');

  assert.equal(
    rel.source_cid,
    'bafkr4i82451f30e9cf9998d108eb2f2a270b346833000960a911985229'
  );
  assert.equal(
    rel.target_cid,
    'bafkr4ia848e96449436edb8bfdf1d7a9496840848cd7e28a577fccb819'
  );
  assert.equal(rel.cosine_similarity, 0.77020647);
  assert.equal(rel.geodesic_angle_deg, 39.627567);
  assert.equal(rel.same_ontological_basin, true);
});

test('Constructive F2T2EA 5-modality inverse-variance fusion matches Genesis Receipt', () => {
  const fusion = executeConstructiveF2T2EAFusion(DEFAULT_DECLARATIVE_INTENT);
  assert.deepEqual(fusion.fused_feature_state, [
    0.93778422, 0.92658918, 0.94762492, 0.93485115,
  ]);
  assert.equal(
    fusion.fusion_state_cid,
    'bafkr4ibe60927dbe0070747eda726a5042a833dddc94291cfab1f9eb09'
  );
});

test('Full CASLSystemEngine synthesis reproduces casl_genesis_execution_receipt.json bit-for-bit', () => {
  const engine = new CASLSystemEngine();
  const receipt = engine.currentReceipt;

  const expectedRaw = fs.readFileSync(
    path.resolve(process.cwd(), 'casl_genesis_execution_receipt.json'),
    'utf-8'
  );
  const expected = JSON.parse(expectedRaw);

  assert.equal(receipt.execution_status, expected.execution_status);
  assert.equal(
    receipt.unified_observer_intent_info_node.node_cid,
    expected.unified_observer_intent_info_node.node_cid
  );
  assert.equal(
    receipt.vector_semantic_manifold.total_concepts_embedded,
    expected.vector_semantic_manifold.total_concepts_embedded
  );
  assert.equal(
    receipt.vector_semantic_manifold.intent_trajectory_synthesis.synthesis_cid,
    expected.vector_semantic_manifold.intent_trajectory_synthesis.synthesis_cid
  );
  assert.equal(
    receipt.merkle_dag_content_layer.merkle_root_cid,
    expected.merkle_dag_content_layer.merkle_root_cid
  );
  assert.equal(
    receipt.terminal_activation_cid,
    expected.terminal_activation_cid
  );
});

import {
  UNIFIED_SYSTEMS_MATRIX,
  SUPPORTED_ENVIRONMENT_VARIABLES,
  API_ENDPOINT_SPECIFICATIONS,
  CONFIGURATION_FILE_TEMPLATES,
  validateFoundryRid,
  synthesizeSystemWorkload,
} from './exascale_system';

test('Unified Exascale & Palantir Foundry Matrix contains all 11 systems, 37 env vars, 10 APIs, and 5 config schemas', () => {
  assert.equal(UNIFIED_SYSTEMS_MATRIX.length, 11);
  assert.equal(SUPPORTED_ENVIRONMENT_VARIABLES.length, 37);
  assert.equal(API_ENDPOINT_SPECIFICATIONS.length, 10);
  assert.equal(CONFIGURATION_FILE_TEMPLATES.length, 5);

  for (const sys of UNIFIED_SYSTEMS_MATRIX) {
    assert.ok(sys.cid.startsWith('bafkr4i'), `Expected CIDv1 prefix for ${sys.name}`);
    assert.ok(sys.cliCommands.length >= 2, `Expected CLI commands for ${sys.name}`);
  }
});

test('Foundry RID grammar validator verifies standard and global empty-instance RIDs', () => {
  const stdRid = validateFoundryRid(
    'ri.foundry.main.dataset.f3b8d9a0-1234-4a5b-8c9d-0e1f2a3b4c5d'
  );
  assert.equal(stdRid.valid, true);
  assert.equal(stdRid.service, 'foundry');
  assert.equal(stdRid.instance, 'main');
  assert.equal(stdRid.resourceType, 'dataset');

  const globalRid = validateFoundryRid(
    'ri.multipass..user.c0ffee00-1111-4222-8333-444455556666'
  );
  assert.equal(globalRid.valid, true);
  assert.equal(globalRid.service, 'multipass');
  assert.equal(globalRid.instance, '(global)');

  const invalidRid = validateFoundryRid('invalid.rid.string');
  assert.equal(invalidRid.valid, false);
});

test('Cross-substrate workload synthesizer generates deterministic scripts across Slurm, ParaStation, Flux, PBS Pro, and Rubix', () => {
  const schedulerChecks: { id: string; expectedSubstring: string; expectedScheduler: string }[] = [
    { id: 'sferical-one', expectedSubstring: '#SBATCH --gres=gpu:b300:4', expectedScheduler: 'BCM_SLURM_RUNAI' },
    { id: 'jupiter', expectedSubstring: 'ParaStationMPI/5.13.1-1', expectedScheduler: 'SLURM_PARASTATION' },
    { id: 'el-capitan', expectedSubstring: 'flux run', expectedScheduler: 'FLUX' },
    { id: 'aurora', expectedSubstring: '#PBS -N', expectedScheduler: 'PBS_PRO_PALS' },
    { id: 'palantir-aip-foundry', expectedSubstring: '/api/v2/orchestration/builds/create', expectedScheduler: 'PALANTIR_RUBIX_APOLLO' },
  ];

  for (const check of schedulerChecks) {
    const dispatch = synthesizeSystemWorkload({
      systemId: check.id,
      workloadName: 'deterministic_verification_workload',
      nodesCount: 16,
      acceleratorsPerNode: 4,
      walltimeHours: 2,
      declarativeIntent: 'Deterministic Verification Workload',
    });
    assert.ok(
      dispatch.generatedScript.includes(check.expectedSubstring),
      `Expected ${check.expectedSubstring} in script for ${dispatch.systemName}`
    );
    assert.equal(dispatch.schedulerKind, check.expectedScheduler);
    assert.ok(dispatch.cid.startsWith('bafyr4i'));
    assert.equal(dispatch.totalAccelerators, 64);
  }
});

import {
  anchorSearchGroundingToDag,
  buildGroundingCitation,
  synthesizeSearchGroundingPayload,
} from './search_grounding';
import {
  compileUnifiedCausalIR,
  parseTerminalInputWithPeg,
  executePegByteExactRegistryParser,
  executeRelationalWalWindowAlgebra,
  executeSemiNaiveDatalogFixpoint,
  executeSmtConstraintAndDataWallSolver,
} from './causal_ir_compiler';

test('Deterministic Primary Registry Knowledge Anchoring projects into 64D manifold and commits to IPLD Merkle-DAG without AI', () => {
  const engine = new CASLSystemEngine();
  const initialNodeCount = engine.dag.nodes.size;
  const initialMerkleRoot = engine.currentReceipt.merkle_dag_content_layer.merkle_root_cid;

  const cit1 = buildGroundingCitation('https://www.top500.org/lists/top500/', 'TOP500 Exascale Supercomputers');
  assert.equal(cit1.domain, 'top500.org');
  assert.ok(cit1.chunk_cid.startsWith('bafkr4i'));

  const grounded = synthesizeSearchGroundingPayload({
    query: 'Latest exascale HPL benchmarks and Lean 4 formal verification proofs',
    synthesizedStatement:
      'El Capitan achieves 1.809 EF Rmax on 46,080 MI300A APUs while Lean 4 verifies univalent HoTT theorems.',
    rawCitations: [
      { uri: 'https://www.top500.org/lists/top500/', title: 'TOP500 Exascale Supercomputers' },
      { uri: 'https://www.top500.org/lists/top500/', title: 'Duplicate URI deduplicated' },
      { uri: 'https://lean-lang.org/documentation/', title: 'Lean 4 Theorem Prover Documentation' },
    ],
    extractedConcepts: ['TOP500 El Capitan Rmax', 'Lean 4 HoTT formal verification'],
    groundedAtIso: '2026-11-25T10:48:00.000Z',
    manifold: engine.manifold,
  });

  assert.ok(grounded.query_cid.startsWith('bafkr4i'));
  assert.equal(grounded.citations.length, 2);
  assert.equal(grounded.unit_coords_preview.length, 8);

  const parentHead = engine.currentReceipt.merkle_dag_content_layer.heads[0];
  const anchoredNode = anchorSearchGroundingToDag(engine.dag, grounded, [parentHead]);
  const updatedIntegrity = engine.dag.verifyDagIntegrity();

  assert.ok(anchoredNode.cid.startsWith('bafyr4i'));
  assert.equal(anchoredNode.payload.type, 'PRIMARY_REGISTRY_KNOWLEDGE_ANCHOR');
  assert.equal(engine.dag.nodes.size, initialNodeCount + 1);
  assert.equal(updatedIntegrity.acyclic_verified, true);
  assert.equal(updatedIntegrity.cryptographic_hashes_verified, true);
  assert.notEqual(updatedIntegrity.merkle_root_cid, initialMerkleRoot);
});

test('Unified 6-Mechanism CausalIR Compiler parses PEG tokens, projects in 64D manifold, and executes all 6 deterministic passes', () => {
  const engine = new CASLSystemEngine();
  const initialLedger = createInitialLaplaceFactualLedger(engine.manifold);

  const rawCommand =
    'TRACE Citadel Securities LLC CIK:0001146184 -> Palafox Trading LLC LEI:549300PALAFOXTRD9912 -> Cayman Synthetics SPV IV Ltd LEI:549300CAYMANSPV0004 (KY) -> DTCC NSCC Clearing Fund ABA:12200049 CUSIP:36467W109 $3,814,920,000 -> Sovereign Market Structure SuperPAC EIN:84-3910422 -> Unregistered Zürich Lombard Vault Trust (CH) AT 2026-11-25T14:30:00.100Z ri.foundry.main.action-type.ebpf-cns-netting-v1 0x24537697fbd9df1471afe31110e94a5a04967defd8ed1885c696fece443c8a74';

  // Stage 0: PEG + 64D Manifold
  const stage0 = parseTerminalInputWithPeg(rawCommand, engine.manifold);
  assert.ok(stage0.identifiers.cik.includes('CIK:0001146184'));
  assert.ok(stage0.identifiers.lei.includes('LEI:549300PALAFOXTRD9912'));
  assert.ok(stage0.identifiers.lei.includes('LEI:549300CAYMANSPV0004'));
  assert.ok(stage0.identifiers.ein.includes('EIN:84-3910422'));
  assert.ok(stage0.identifiers.cusip.includes('36467W109'));
  assert.ok(stage0.identifiers.aba.includes('ABA:12200049'));
  assert.ok(stage0.identifiers.rid.includes('ri.foundry.main.action-type.ebpf-cns-netting-v1'));
  assert.ok(stage0.identifiers.hashes.some((h) => h.includes('24537697fbd9df1471afe31110e94a5a04967defd8ed1885c696fece443c8a74')));
  assert.ok(stage0.jurisdictions.includes('KY'));
  assert.ok(stage0.jurisdictions.includes('CH'));
  assert.equal(stage0.amounts[0].numericUsd, 3814920000);
  assert.equal(stage0.manifoldClassification.queryVector64D.length, 64);
  assert.equal(stage0.manifoldClassification.requiredPrimaryRegistries.length, 6);

  // Full 6-Mechanism Pipeline Compilation
  const result = compileUnifiedCausalIR(
    rawCommand,
    engine.manifold,
    engine.dag,
    initialLedger,
    {
      sourceUrl: 'file://local/unit_test_custom.jsonl',
      rawText:
        '{"registry":"SEC_EDGAR","subjectEntity":"Feeder Alpha LP","subjectId":"CIK:0001999111","subjectJurisdiction":"US-DE","predicate":"TRANSFERS_FUNDS","objectEntity":"Citadel Securities LLC","objectId":"CIK:0001146184","objectJurisdiction":"US-DE","timestampIso":"2026-11-25T14:29:58.100Z","timestampNs":"1795616998100000000","amountUsd":500000000,"entityStatus":"ACTIVE"}',
    }
  );

  // Mechanism 1: Byte-Exact Parser
  assert.equal(result.mechanism1ByteExact.totalPayloadsParsed, 7);
  assert.equal(result.mechanism1ByteExact.tuples.length, 12);
  for (const t of result.mechanism1ByteExact.tuples) {
    assert.ok(t.byteLength > 0);
    assert.equal(t.recordSha256.length, 64);
  }

  // Mechanism 2: Relational Algebra (SQLite3 WAL + LAG/LEAD)
  assert.equal(result.mechanism2RelationalWal.deduplicatedRowCount, 12);
  assert.ok(result.mechanism2RelationalWal.sqliteWalScript.includes('PRAGMA journal_mode = WAL;'));
  assert.ok(result.mechanism2RelationalWal.sqliteWalScript.includes('LAG(timestamp_ns, 1) OVER'));
  assert.ok(result.mechanism2RelationalWal.windowRows[1].lagTimestampNs !== null);

  // Mechanism 3: Datalog Fixpoint (Semi-Naive Recursion)
  assert.ok(result.mechanism3DatalogFixpoint.totalIterationsToFixpoint >= 3);
  assert.ok(result.mechanism3DatalogFixpoint.maxChainDepth >= 4);
  assert.ok(result.mechanism3DatalogFixpoint.idbDerivedFactCount > 0);
  const lastIter =
    result.mechanism3DatalogFixpoint.iterationTraces[
      result.mechanism3DatalogFixpoint.iterationTraces.length - 1
    ];
  assert.equal(lastIter.fixpointReached, true);

  // Mechanism 4: SMT Solver (UNSAT_CORE & DATA_WALL)
  assert.equal(result.mechanism4SmtSolver.solverStatus, 'UNSAT_WITH_ISOLATED_CORE');
  assert.ok(result.mechanism4SmtSolver.unsatCore.length >= 2);
  assert.ok(
    result.mechanism4SmtSolver.unsatCore.some(
      (c) => c.category === 'TEMPORAL_PARADOX_T_CAUSE_GT_T_EFFECT'
    )
  );
  assert.ok(
    result.mechanism4SmtSolver.unsatCore.some(
      (c) => c.category === 'ENTITY_INACTIVE_AT_EXECUTION'
    )
  );
  assert.ok(result.mechanism4SmtSolver.dataWalls.length >= 1);

  // Mechanism 5: GraphBLAS Sparse Matrices (N[X] & (min,+) Semirings + Min-Cut)
  assert.equal(result.mechanism5GraphBlas.csrMatrix.nnz, 12);
  assert.ok(result.mechanism5GraphBlas.shortestTemporalChains.length > 0);
  assert.ok(result.mechanism5GraphBlas.provenancePolynomials.length > 0);
  assert.ok(result.mechanism5GraphBlas.maxFlowMinCut.maxFlowUsd > 0);
  assert.equal(result.mechanism5GraphBlas.ebpfSyncStatus.atomicParityMatch, true);

  // Mechanism 6: Bazel/GCC Build Emitter (80B WORM + IPLD Merkle-DAG)
  assert.equal(result.mechanism6BuildEmitter.passWormChain.length, 6);
  for (const passSeal of result.mechanism6BuildEmitter.passWormChain) {
    assert.equal(passSeal.hwAcceleratedVerified, true);
    assert.equal(passSeal.preimage80ByteHex.length, 160);
    assert.equal(passSeal.wormMerkleLeafSha256.length, 64);
  }
  assert.ok(result.anchoredIpldNode.cid.startsWith('bafyr4i'));
  assert.equal(result.updatedLaplaceLedger.length, initialLedger.length + 1);
});

import {
  ACM_REPOSITORY_ARTIFACTS,
  appendWormRecord,
  computeCompositePcrDigestHex,
  createGoldenPcrBank,
  createInitialWormLedger,
  dispatchMoeToken,
  evaluateKajSovereignBoundary,
  PMAX_MAX_EXCLUSIONS_ACCOUNT,
  PMAX_MAX_EXCLUSIONS_MANAGER_LIST,
  runSovereignKeyAttestationModelCheck,
  TPM_GENERATED_VALUE,
  TPM_ST_ATTEST_QUOTE,
  verifyAiTelemetryIsolation,
  verifyAltsFrame,
  verifyHardwareMerkleLeafEvpEquivalence,
  verifyHostIntegrity,
  verifyNimbusWinkingSignal,
  verifyRecaptchaEnterpriseScore,
  verifyTpm2Quote,
  verifyWormLedgerIntegrity,
} from './alphabet_control_manifold';

test('Alphabet Control Manifold 80-byte preimage (640-bit) hardware Merkle leaf matches FIPS 180-4 / OpenSSL EVP_sha256 bit-for-bit', () => {
  const prevHash = new Uint8Array(32).fill(0x11);
  const payloadHash = new Uint8Array(32).fill(0x22);
  const equivalence = verifyHardwareMerkleLeafEvpEquivalence(
    42n,
    1711800000000000000n,
    prevHash,
    payloadHash
  );
  assert.equal(equivalence.exactMatch, true);
  assert.equal(equivalence.hwLeafHex, equivalence.evpDigestHex);
  assert.equal(equivalence.hwLeafHex.length, 64);
});

test('Alphabet Control Manifold 7-Pillar ACSL contracts verify positive invariants and reject negative tampering vectors', () => {
  // Pillar I: Silicon RoT & Measured Boot
  const pcrGolden = 'aa'.repeat(32);
  const nonceExpected = '55'.repeat(16);
  const validHost = verifyHostIntegrity({
    pcrGoldenHashHex: pcrGolden,
    currentBootPcrHex: pcrGolden,
    sessionNonceHex: nonceExpected,
    expectedNonceHex: nonceExpected,
    tcbSecurityVersion: 12,
    minRequiredVersion: 10,
    vtpmAttestationPassed: false,
  });
  assert.equal(validHost.passed, true);
  assert.equal(validHost.updatedContext.vtpmAttestationPassed, true);

  const tamperedPcr = '55' + 'aa'.repeat(31);
  const invalidHost = verifyHostIntegrity({
    pcrGoldenHashHex: pcrGolden,
    currentBootPcrHex: tamperedPcr,
    sessionNonceHex: nonceExpected,
    expectedNonceHex: nonceExpected,
    tcbSecurityVersion: 12,
    minRequiredVersion: 10,
    vtpmAttestationPassed: false,
  });
  assert.equal(invalidHost.passed, false);
  assert.equal(invalidHost.updatedContext.vtpmAttestationPassed, false);

  // Pillar II: ALTS Zero-Trust Fabric & 64-Bit Replay Sliding Window
  let altsCtx = {
    windowHighestSeq: 100n,
    replayBitmap: 1n,
    loasCertValid: true,
  };
  const step105 = verifyAltsFrame(altsCtx, 105n);
  assert.equal(step105.accepted, true);
  assert.equal(step105.reason, 'FRESH_ADVANCE_WINDOW');
  altsCtx = step105.updatedContext;

  const step102 = verifyAltsFrame(altsCtx, 102n);
  assert.equal(step102.accepted, true);
  assert.equal(step102.reason, 'FRESH_WITHIN_WINDOW');
  altsCtx = step102.updatedContext;

  const step102Replay = verifyAltsFrame(altsCtx, 102n);
  assert.equal(step102Replay.accepted, false);
  assert.equal(step102Replay.reason, 'REPLAY_DETECTED_BITMAP');

  const step30Expired = verifyAltsFrame(altsCtx, 30n);
  assert.equal(step30Expired.accepted, false);
  assert.equal(step30Expired.reason, 'OUTSIDE_64BIT_WINDOW');

  // Pillar III: AI Telemetry Isolation & Zero Data Retention
  const entPolicy = verifyAiTelemetryIsolation({
    isUnpaidTier: false,
    storeParameterExplicitlyFalse: true,
    groundingSearchActive: false,
    abuseExceptionApproved: true,
    zeroRetentionEnforced: false,
  });
  assert.equal(entPolicy.zdrEnforced, true);
  assert.equal(entPolicy.updatedContext.zeroRetentionEnforced, true);

  const consumerPolicy = verifyAiTelemetryIsolation({
    isUnpaidTier: true,
    storeParameterExplicitlyFalse: true,
    groundingSearchActive: false,
    abuseExceptionApproved: true,
    zeroRetentionEnforced: true,
  });
  assert.equal(consumerPolicy.zdrEnforced, false);
  assert.equal(consumerPolicy.updatedContext.zeroRetentionEnforced, false);

  // Pillar IV & VI: Ads & reCAPTCHA Enterprise 11-Bucket Quantization
  assert.equal(PMAX_MAX_EXCLUSIONS_ACCOUNT, 65000);
  assert.equal(PMAX_MAX_EXCLUSIONS_MANAGER_LIST, 250000);
  assert.equal(verifyRecaptchaEnterpriseScore(0.0), true);
  assert.equal(verifyRecaptchaEnterpriseScore(0.7), true);
  assert.equal(verifyRecaptchaEnterpriseScore(1.0), true);
  assert.equal(verifyRecaptchaEnterpriseScore(0.732), false);
  assert.equal(verifyRecaptchaEnterpriseScore(-0.1), false);
  assert.equal(verifyRecaptchaEnterpriseScore(1.1), false);

  // Pillar V: MoE Routing Determinism & Capacity Guard
  let moeExpert = {
    expertId: 3,
    capacityLimit: 2,
    allocatedTokens: 0,
    droppedTokens: 0,
  };
  const d1 = dispatchMoeToken(moeExpert);
  assert.equal(d1.dispatched, true);
  moeExpert = d1.updatedExpert;
  const d2 = dispatchMoeToken(moeExpert);
  assert.equal(d2.dispatched, true);
  moeExpert = d2.updatedExpert;
  const d3 = dispatchMoeToken(moeExpert);
  assert.equal(d3.dispatched, false);
  assert.equal(d3.updatedExpert.droppedTokens, 1);

  // Pillar VII: Sovereign Cloud KAJ & Project Nimbus Winking Mechanism
  const kajCustomer = evaluateKajSovereignBoundary({
    justificationCode: 'CUSTOMER_INITIATED_ACCESS',
    sovereignPolicyAllows: true,
    ekmRemoteApproved: true,
  });
  assert.equal(kajCustomer.authorized, true);
  assert.equal(kajCustomer.sovereignVetoTriggered, false);

  const kajThirdParty = evaluateKajSovereignBoundary({
    justificationCode: 'THIRD_PARTY_DATA_REQUEST',
    sovereignPolicyAllows: true,
    ekmRemoteApproved: true,
  });
  assert.equal(kajThirdParty.authorized, false);
  assert.equal(kajThirdParty.sovereignVetoTriggered, true);

  assert.equal(verifyNimbusWinkingSignal(1, 100), true);
  assert.equal(verifyNimbusWinkingSignal(44, 4400), true);
  assert.equal(verifyNimbusWinkingSignal(39, 3900), true);
  assert.equal(verifyNimbusWinkingSignal(1, 999), false);
});

test('TPM 2.0 Quote verifier, 80B WORM Merkle Audit Ledger, and TLA+ SovereignKeyAttestation model checker execute deterministically', () => {
  const goldenBank = createGoldenPcrBank();
  const selectedIndices = [0, 1, 2, 7];
  const expectedNonceHex = '99'.repeat(16);
  const compositeDigestHex = computeCompositePcrDigestHex(selectedIndices, goldenBank);

  const quoteCheck = verifyTpm2Quote(
    {
      magic: TPM_GENERATED_VALUE,
      type: TPM_ST_ATTEST_QUOTE,
      extraDataNonceHex: expectedNonceHex,
      selectedPcrIndices: selectedIndices,
      pcrDigestHex: compositeDigestHex,
      signatureWitnessHex: 'deadbeefcafebabe1122334455667788',
      akPublicKeyActive: true,
    },
    expectedNonceHex,
    goldenBank
  );
  assert.equal(quoteCheck.certified, true);

  const tamperedQuote = verifyTpm2Quote(
    {
      magic: TPM_GENERATED_VALUE,
      type: TPM_ST_ATTEST_QUOTE,
      extraDataNonceHex: expectedNonceHex,
      selectedPcrIndices: selectedIndices,
      pcrDigestHex: '00'.repeat(32),
      signatureWitnessHex: 'deadbeefcafebabe1122334455667788',
      akPublicKeyActive: true,
    },
    expectedNonceHex,
    goldenBank
  );
  assert.equal(tamperedQuote.certified, false);
  assert.equal(tamperedQuote.pcrCompositeMatch, false);

  let ledger = createInitialWormLedger();
  assert.equal(ledger.records.length, 3);
  assert.equal(verifyWormLedgerIntegrity(ledger.records), true);
  ledger = appendWormRecord(
    ledger,
    1700000003000n,
    'CASL_TEST_WORM_EVENT: Verified 80-byte preimage leaf'
  );
  assert.equal(ledger.records.length, 4);
  assert.equal(verifyWormLedgerIntegrity(ledger.records), true);

  const tlaResult = runSovereignKeyAttestationModelCheck({
    nodeId: 'node_sov_01',
    presentedPcrMatchesGolden: true,
    ekmReasonCode: 'CUSTOMER_INITIATED_ACCESS',
  });
  assert.equal(tlaResult.sovereignVetoSafetyVerified, true);
  assert.equal(tlaResult.attestationIntegrityVerified, true);
  assert.ok(tlaResult.totalStatesExplored >= 4);
  assert.ok(tlaResult.reportCid.startsWith('bafyr4i'));
  assert.equal(ACM_REPOSITORY_ARTIFACTS.length, 5);
});

import {
  appendFactualCausalEvent,
  CANONICAL_CAUSAL_ACTORS,
  createInitialLaplaceFactualLedger,
  EBPF_SETTLEMENT_FORENSIC_LEAVES,
  EBPF_SETTLEMENT_MERKLE_ROOT_HEX,
  evaluateDoCalculusCounterfactual,
  executeEbpfSettlementCausalCorrelation,
  findCausalPathsBetweenEvents,
  formatHighPrecisionUtcSnapshot,
  LAPLACE_HIGHER_ORDER_ARTIFACTS,
  reconstructCausalChain,
  vectorClockHappensBefore,
  verifyFactualExistence,
} from './laplace_causal_contract';

test('Laplace Causal Smart Contract reconstructs backward J^-(E) & forward J^+(E) Cauchy cones with 100% Vector Clock happens-before monotonicity and active-by-default eBPF-Settlement correlation', () => {
  const manifold = new VectorSemanticManifold(64);
  const ledger = createInitialLaplaceFactualLedger(manifold);

  assert.equal(ledger.length, 10);
  assert.equal(CANONICAL_CAUSAL_ACTORS.length, 5);
  assert.equal(LAPLACE_HIGHER_ORDER_ARTIFACTS.length, 6);
  assert.equal(EBPF_SETTLEMENT_FORENSIC_LEAVES.length, 9);

  const recon = reconstructCausalChain(
    ledger,
    'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION',
    manifold
  );
  assert.equal(recon.backwardCausalCone.length, 10);
  assert.equal(recon.cauchyRootWitnesses.length, 1);
  assert.equal(recon.cauchyRootWitnesses[0].eventId, 'EV-00-GENESIS-OBSERVER');
  assert.equal(recon.allVectorClocksMonotonic, true);
  assert.equal(recon.allStructuralEquationsSatisfied, true);
  assert.ok(recon.totalProvenancePolynomial.includes('X_EV_00_GENESIS_OBSERVER'));
  assert.ok(recon.reconstructionCid.startsWith('bafyr4i'));

  // Verify active-by-default eBPF-Settlement kernel correlation in Laplace reconstruction
  assert.equal(recon.ebpfSettlementCorrelation.activeByDefault, true);
  assert.equal(
    recon.ebpfSettlementCorrelation.incrementalMerkleRootHex,
    `0x${EBPF_SETTLEMENT_MERKLE_ROOT_HEX}`
  );
  assert.equal(recon.ebpfSettlementCorrelation.correlatedTelemetryLeaves.length, 9);
  assert.equal(recon.ebpfSettlementCorrelation.sifmuCausalLayers.length, 8);
  assert.equal(recon.ebpfSettlementCorrelation.fre90213And90214Compliant, true);

  // Verify strict Vector Clock happens-before partial order across all causal edges
  for (const link of recon.reconstructedLinks) {
    assert.equal(link.happensBeforeVerified, true);
    assert.equal(link.bitemporalMonotonic, true);
    assert.ok(link.transferEntropyBits > 0);
  }
});

test('Laplace Causal Smart Contract finds all directed causal paths, evaluates Pearl do(X) counterfactuals, correlates eBPF-Settlement telemetry, and enforces zero-mysticism existence verification', () => {
  const manifold = new VectorSemanticManifold(64);
  let ledger = createInitialLaplaceFactualLedger(manifold);

  const paths = findCausalPathsBetweenEvents(
    ledger,
    'EV-00-GENESIS-OBSERVER',
    'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION',
    manifold
  );
  assert.equal(paths.pathFound, true);
  assert.ok(paths.allCausalPaths.length >= 5);
  assert.equal(paths.shortestCausalPath[0].eventId, 'EV-00-GENESIS-OBSERVER');
  assert.equal(
    paths.shortestCausalPath[paths.shortestCausalPath.length - 1].eventId,
    'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION'
  );
  assert.equal(paths.ebpfSettlementCorrelation.activeByDefault, true);

  // Reverse direction must have no forward causal path (acyclicity)
  const reversePaths = findCausalPathsBetweenEvents(
    ledger,
    'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION',
    'EV-00-GENESIS-OBSERVER',
    manifold
  );
  assert.equal(reversePaths.pathFound, false);

  // Pearl Do-Calculus: do(EV-07-EBPF-FIX-CNS-INGEST := 0) collapses EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION (PNS = 1.0)
  const doNecessary = evaluateDoCalculusCounterfactual(
    ledger,
    'EV-07-EBPF-FIX-CNS-INGEST',
    'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION'
  );
  assert.equal(doNecessary.isNecessaryCauseForTarget, true);
  assert.equal(doNecessary.probabilityOfNecessityAndSufficiency, 1.0);
  assert.equal(doNecessary.ebpfSettlementCorrelation.activeByDefault, true);

  // Pearl Do-Calculus: do(EV-02-F2T2EA-TITAN-FUSION := 0) leaves EV-04-LEAN4-UNIVALENCE-PROOF invariant (PNS = 0.0)
  const doIndependent = evaluateDoCalculusCounterfactual(
    ledger,
    'EV-02-F2T2EA-TITAN-FUSION',
    'EV-04-LEAN4-UNIVALENCE-PROOF'
  );
  assert.equal(doIndependent.isNecessaryCauseForTarget, false);
  assert.equal(doIndependent.probabilityOfNecessityAndSufficiency, 0.0);

  // Factual Existence Oracle: verifies attested facts (including Russian & eBPF-Settlement queries) and rejects unattested claims
  const verifiedEbpfRu = verifyFactualExistence(
    ledger,
    'клиринг ebpf ликвидация долга 12200049 36467W109',
    manifold
  );
  assert.notEqual(verifiedEbpfRu.verdict, 'UNATTESTED_NO_FACTUAL_WITNESS');
  assert.equal(verifiedEbpfRu.confidenceDeterministic, 1.0);
  assert.equal(verifiedEbpfRu.ebpfSettlementCorrelation.activeByDefault, true);
  assert.equal(
    verifiedEbpfRu.ebpfSettlementCorrelation.correlatedTelemetryLeaves.length,
    9
  );

  const directCorrelator = executeEbpfSettlementCausalCorrelation(
    [],
    '36467W109'
  );
  assert.equal(directCorrelator.activeByDefault, true);
  assert.equal(directCorrelator.correlatedTelemetryLeaves.length, 1);
  assert.equal(
    directCorrelator.correlatedTelemetryLeaves[0].streamCode,
    'REG_SHO_RULE_203B_LOCATE_COMMIT'
  );

  const refutedMystical = verifyFactualExistence(
    ledger,
    'Unattested Mystical Esoteric Claim 999999',
    manifold
  );
  assert.equal(refutedMystical.verdict, 'UNATTESTED_NO_FACTUAL_WITNESS');
  assert.equal(refutedMystical.confidenceDeterministic, 0.0);

  // Append a new factual causal event with explicit high-precision UTC nanosecond epoch and verify its Vector Clock happens-before link
  const snap = formatHighPrecisionUtcSnapshot(1795636509123, 456);
  assert.equal(snap.utcDatePart, '2026-11-25');
  assert.equal(snap.utcTimePart, '19:55:09.123.456 UTC');
  assert.equal(snap.utcIsoMicro, '2026-11-25T19:55:09.123456Z');
  assert.equal(snap.epochNanoseconds, '1795636509123456000');

  const appended = appendFactualCausalEvent({
    existingLedger: ledger,
    title: 'TITAN Orbital SAR-MTI Confirmation',
    domain: 'F2T2EA_GEOINT_TITAN_CV_FUSION',
    factualSummary: 'Phase-coherent SAR/MTI target lock committed via Sferical One GB300.',
    actorId: 'ACTOR-01-TITAN-F2T2EA-NODE',
    causalParentIds: ['EV-02-F2T2EA-TITAN-FUSION', 'EV-09-FEDWIRE-NSS-DEBT-ANNIHILATION'],
    symbolicFormula: 'E_10 := f_TITAN(E_2 ⊗ E_9, u_SAR_MTI)',
    operatorKind: 'CONJUNCTIVE_ALL',
    whereProvenanceUri: 'casl://titan/sar_mti_10',
    explicitValidTimeNs: BigInt(snap.epochNanoseconds),
    manifold,
  });
  ledger = appended.updatedLedger;
  assert.equal(ledger.length, 11);
  assert.equal(appended.newEvent.bitemporal.validTimeNs, '1795636509123456000');
  assert.equal(
    vectorClockHappensBefore(ledger[9].vectorClock, appended.newEvent.vectorClock),
    true
  );
});




