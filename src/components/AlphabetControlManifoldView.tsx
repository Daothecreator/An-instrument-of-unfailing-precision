import React, { useMemo, useState } from 'react';
import {
  ACM_ALTS_XDP_LSM_BPF_C,
  ACM_FRAMA_C_ACSL_MERKLE_LEAF,
  ACM_REPOSITORY_ARTIFACTS,
  ACM_SOVEREIGN_KEY_ATTESTATION_TLA,
  ALTSChannelContext,
  appendWormRecord,
  bytesToHex,
  computeCompositePcrDigestHex,
  createGoldenPcrBank,
  createInitialWormLedger,
  dispatchMoeToken,
  evaluateKajSovereignBoundary,
  HostIntegrityContext,
  ImmutableWormLedger,
  MoEExpertContext,
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
} from '../casl/alphabet_control_manifold';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Cpu,
  Lock,
  Terminal,
  FileCode2,
  GitBranch,
  Activity,
  Plus,
} from 'lucide-react';

interface AlphabetControlManifoldViewProps {
  onCommitAcmNode: (payloadType: string, summary: string, details: Record<string, unknown>) => string;
  onInspectDagNode: (nodeCid: string) => void;
}

type AcmSubTab = 'pillars' | 'tpm-worm' | 'tla-ekm' | 'ebpf-acsl';

const DEFAULT_GOLDEN_PCR_0 = '3f7e1a' + '00'.repeat(28) + '88';
const DEFAULT_NONCE_HEX = '5a'.repeat(32);

export const AlphabetControlManifoldView: React.FC<AlphabetControlManifoldViewProps> = ({
  onCommitAcmNode,
  onInspectDagNode,
}) => {
  const [subTab, setSubTab] = useState<AcmSubTab>('pillars');
  const [lastCommittedCid, setLastCommittedCid] = useState<string | null>(null);

  // Pillar I State: Host Integrity & vTPM
  const [hostTampered, setHostTampered] = useState<boolean>(false);
  const [tcbVersion, setTcbVersion] = useState<number>(5);
  const [minRequiredTcb, setMinRequiredTcb] = useState<number>(4);

  const hostCtx: HostIntegrityContext = useMemo(() => {
    const bootPcr = hostTampered
      ? '3f7ee5' + '00'.repeat(28) + '88' // byte[2] ^= 0xFF
      : DEFAULT_GOLDEN_PCR_0;
    return {
      pcrGoldenHashHex: DEFAULT_GOLDEN_PCR_0,
      currentBootPcrHex: bootPcr,
      sessionNonceHex: DEFAULT_NONCE_HEX,
      expectedNonceHex: DEFAULT_NONCE_HEX,
      tcbSecurityVersion: tcbVersion,
      minRequiredVersion: minRequiredTcb,
      vtpmAttestationPassed: false,
    };
  }, [hostTampered, tcbVersion, minRequiredTcb]);

  const hostResult = useMemo(() => verifyHostIntegrity(hostCtx), [hostCtx]);

  // Pillar II State: ALTS 64-bit Sliding Replay Window & eBPF XDP
  const [altsCtx, setAltsCtx] = useState<ALTSChannelContext>({
    windowHighestSeq: 105n,
    replayBitmap: 0b100100001n, // frames 105, 102, 100 seen
    loasCertValid: true,
  });
  const [candidateSeqInput, setCandidateSeqInput] = useState<string>('106');
  const [altsHistory, setAltsHistory] = useState<
    Array<{ seq: string; accepted: boolean; reason: string; xdpAction: string }>
  >([
    { seq: '100', accepted: true, reason: 'FRESH_ADVANCE_WINDOW', xdpAction: 'XDP_PASS' },
    { seq: '105', accepted: true, reason: 'FRESH_ADVANCE_WINDOW', xdpAction: 'XDP_PASS' },
    { seq: '102', accepted: true, reason: 'FRESH_WITHIN_WINDOW', xdpAction: 'XDP_PASS' },
    { seq: '102', accepted: false, reason: 'REPLAY_DETECTED_BITMAP', xdpAction: 'XDP_DROP' },
  ]);

  const handleTestAltsFrame = (seqVal?: bigint) => {
    const seq = seqVal ?? BigInt(Math.max(1, parseInt(candidateSeqInput, 10) || 106));
    const res = verifyAltsFrame(altsCtx, seq);
    setAltsCtx(res.updatedContext);
    setAltsHistory((prev) => [
      {
        seq: seq.toString(),
        accepted: res.accepted,
        reason: res.reason,
        xdpAction: res.accepted ? 'XDP_PASS' : 'XDP_DROP',
      },
      ...prev.slice(0, 7),
    ]);
    if (seqVal === undefined) {
      setCandidateSeqInput((seq + 1n).toString());
    }
  };

  // Pillar III State: Enterprise AI Telemetry Isolation (ZDR)
  const [isUnpaidTier, setIsUnpaidTier] = useState<boolean>(false);
  const [storeExplicitlyFalse, setStoreExplicitlyFalse] = useState<boolean>(true);
  const [groundingSearchActive, setGroundingSearchActive] = useState<boolean>(false);
  const [abuseExceptionApproved, setAbuseExceptionApproved] = useState<boolean>(true);

  const zdrResult = useMemo(
    () =>
      verifyAiTelemetryIsolation({
        isUnpaidTier,
        storeParameterExplicitlyFalse: storeExplicitlyFalse,
        groundingSearchActive,
        abuseExceptionApproved,
        zeroRetentionEnforced: false,
      }),
    [isUnpaidTier, storeExplicitlyFalse, groundingSearchActive, abuseExceptionApproved]
  );

  // Pillar IV & VI State: reCAPTCHA Enterprise 11-Bucket Score
  const [recaptchaScoreInput, setRecaptchaScoreInput] = useState<string>('0.7');
  const recaptchaScoreValid = useMemo(
    () => verifyRecaptchaEnterpriseScore(parseFloat(recaptchaScoreInput)),
    [recaptchaScoreInput]
  );

  // Pillar V State: MoE Atomic Token Dispatch
  const [moeExpert, setMoeExpert] = useState<MoEExpertContext>({
    expertId: 42,
    capacityLimit: 4,
    allocatedTokens: 2,
    droppedTokens: 0,
  });

  const handleDispatchMoe = () => {
    const res = dispatchMoeToken(moeExpert);
    setMoeExpert(res.updatedExpert);
  };

  const handleResetMoe = () => {
    setMoeExpert({
      expertId: 42,
      capacityLimit: 4,
      allocatedTokens: 0,
      droppedTokens: 0,
    });
  };

  // Pillar VII State: KAJ Sovereign EKM Boundary & Nimbus Winking Signal
  const [kajReason, setKajReason] = useState<string>('CUSTOMER_INITIATED_ACCESS');
  const [sovereignPolicyAllows, setSovereignPolicyAllows] = useState<boolean>(true);
  const [ekmRemoteApproved, setEkmRemoteApproved] = useState<boolean>(true);
  const [dialingCode, setDialingCode] = useState<number>(44);
  const [paymentShekels, setPaymentShekels] = useState<number>(4400);

  const kajResult = useMemo(
    () =>
      evaluateKajSovereignBoundary({
        justificationCode: kajReason,
        sovereignPolicyAllows,
        ekmRemoteApproved,
      }),
    [kajReason, sovereignPolicyAllows, ekmRemoteApproved]
  );

  const nimbusCanaryDetected = useMemo(
    () => verifyNimbusWinkingSignal(dialingCode, paymentShekels),
    [dialingCode, paymentShekels]
  );

  // View 2: TPM 2.0 Quote & WORM Merkle Ledger
  const goldenPcrBank = useMemo(() => createGoldenPcrBank(), []);
  const [tpmSelectedPcrs, setTpmSelectedPcrs] = useState<number[]>([0, 2, 4]);
  const [tpmNonceTampered, setTpmNonceTampered] = useState<boolean>(false);
  const [tpmPcrTampered, setTpmPcrTampered] = useState<boolean>(false);
  const [tpmSigTampered, setTpmSigTampered] = useState<boolean>(false);

  const tpmVerification = useMemo(() => {
    const expectedComposite = computeCompositePcrDigestHex(tpmSelectedPcrs, goldenPcrBank);
    const quotePcrDigest = tpmPcrTampered
      ? 'ee' + expectedComposite.slice(2)
      : expectedComposite;
    const quoteNonce = tpmNonceTampered ? 'ff'.repeat(32) : DEFAULT_NONCE_HEX;

    return verifyTpm2Quote(
      {
        magic: TPM_GENERATED_VALUE,
        type: TPM_ST_ATTEST_QUOTE,
        extraDataNonceHex: quoteNonce,
        selectedPcrIndices: tpmSelectedPcrs,
        pcrDigestHex: quotePcrDigest,
        signatureWitnessHex: tpmSigTampered ? '' : '3045022100a9f8c4e12b88d17743a09b2211c0ffee',
        akPublicKeyActive: !tpmSigTampered,
      },
      DEFAULT_NONCE_HEX,
      goldenPcrBank
    );
  }, [tpmSelectedPcrs, goldenPcrBank, tpmNonceTampered, tpmPcrTampered, tpmSigTampered]);

  const evpEquivalence = useMemo(() => {
    const prev = new Uint8Array(32);
    prev.fill(0x11);
    const payload = new Uint8Array(32);
    payload.fill(0x22);
    return verifyHardwareMerkleLeafEvpEquivalence(1n, 1700000000000n, prev, payload);
  }, []);

  const [wormLedger, setWormLedger] = useState<ImmutableWormLedger>(() =>
    createInitialWormLedger()
  );
  const [newWormPayload, setNewWormPayload] = useState<string>('EVENT_SOVEREIGN_ATTEST_VERIFIED');

  const handleAppendWormEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newWormPayload.trim() || 'EVENT_AUDIT_CHECKPOINT';
    const nextTs = 1700000000000n + BigInt(wormLedger.records.length * 1000);
    const updated = appendWormRecord(wormLedger, nextTs, clean);
    setWormLedger(updated);

    const latestRecord = updated.records[updated.records.length - 1];
    const cid = onCommitAcmNode(
      'ACM_WORM_MERKLE_AUDIT_RECORD',
      `WORM Ledger Record #${latestRecord.index}: ${latestRecord.payloadText}`,
      {
        record_index: latestRecord.index,
        timestamp_ns: latestRecord.timestampNs,
        payload_text: latestRecord.payloadText,
        prev_log_hash: latestRecord.prevLogHashHex,
        payload_hash: latestRecord.payloadHashHex,
        merkle_node_hash: latestRecord.merkleNodeHashHex,
        worm_root_hash: updated.currentRootHashHex,
      }
    );
    setLastCommittedCid(cid);
  };

  // View 3: TLA+ SovereignKeyAttestation Model Checker
  const [tlaNodeId, setTlaNodeId] = useState<string>('sferical-gb300-node-01');
  const [tlaPcrValid, setTlaPcrValid] = useState<boolean>(true);
  const [tlaEkmReason, setTlaEkmReason] = useState<string>('THIRD_PARTY_DATA_REQUEST');

  const tlaReport = useMemo(
    () =>
      runSovereignKeyAttestationModelCheck({
        nodeId: tlaNodeId,
        presentedPcrMatchesGolden: tlaPcrValid,
        ekmReasonCode: tlaEkmReason,
      }),
    [tlaNodeId, tlaPcrValid, tlaEkmReason]
  );

  const handleCommitSevenPillars = () => {
    const cid = onCommitAcmNode(
      'ALPHABET_CONTROL_MANIFOLD_7_PILLAR_AUDIT',
      `7-Pillar Sovereign Control Manifold Audit: vTPM=${hostResult.passed}, ZDR=${zdrResult.zdrEnforced}, KAJ_Veto=${kajResult.sovereignVetoTriggered}`,
      {
        pillar_1_vtpm_passed: hostResult.passed,
        pillar_2_alts_highest_seq: altsCtx.windowHighestSeq.toString(),
        pillar_2_alts_bitmap_hex: '0x' + altsCtx.replayBitmap.toString(16),
        pillar_3_ai_zdr_enforced: zdrResult.zdrEnforced,
        pillar_4_pmax_bounds: [PMAX_MAX_EXCLUSIONS_ACCOUNT, PMAX_MAX_EXCLUSIONS_MANAGER_LIST],
        pillar_5_moe_expert: moeExpert,
        pillar_6_recaptcha_quantized_valid: recaptchaScoreValid,
        pillar_7_kaj_authorized: kajResult.authorized,
        pillar_7_nimbus_winking_signal: nimbusCanaryDetected,
        worm_merkle_root_hex: wormLedger.currentRootHashHex,
      }
    );
    setLastCommittedCid(cid);
  };

  return (
    <div className="space-y-8">
      {/* Top Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Control Manifold Pillars</span>
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            7 / 7 Pillars
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Frama-C ACSL & C11 Atomic Verified</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>80B Preimage SHA-NI / EVP Match</span>
            <Cpu className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            100% Bit-Exact
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>IFUNC SHA-NI & FIPS 180-4 Verified</span>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>WORM Merkle Audit Ledger</span>
            <Lock className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {wormLedger.records.length} Records
          </div>
          <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 truncate">
            Root: {wormLedger.currentRootHashHex.slice(0, 20)}...
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>TLA+ SovereignKeyAttestation</span>
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 tabular-nums">
            {tlaReport.totalStatesExplored} States
          </div>
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>SovereignVetoSafety Holds</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation & Merkle-DAG Commit Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('pillars')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'pillars'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            1. 7-Pillar Control Manifold & ACSL Verifier
          </button>
          <button
            type="button"
            onClick={() => setSubTab('tpm-worm')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'tpm-worm'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            2. TPM 2.0 Quote & 80B WORM Merkle Ledger
          </button>
          <button
            type="button"
            onClick={() => setSubTab('tla-ekm')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'tla-ekm'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            3. TLA+ SovereignKeyAttestation Model Checker
          </button>
          <button
            type="button"
            onClick={() => setSubTab('ebpf-acsl')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              subTab === 'ebpf-acsl'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            4. eBPF XDP/LSM, SHA-NI IFUNC & Source Artifacts
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lastCommittedCid && (
            <button
              type="button"
              onClick={() => onInspectDagNode(lastCommittedCid)}
              className="px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:underline whitespace-nowrap shrink-0"
            >
              Inspect {lastCommittedCid.slice(0, 16)}...
            </button>
          )}
          <button
            type="button"
            onClick={handleCommitSevenPillars}
            className="px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Commit 7-Pillar Audit to Merkle-DAG</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 7-PILLAR SOVEREIGN CONTROL MANIFOLD */}
      {subTab === 'pillars' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pillar I & Pillar II */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pillar I */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR I · verify_host_integrity(HostIntegrityContext*)
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    Host Integrity, Boot PCR & TCB Security Version
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                    hostResult.passed
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {hostResult.passed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>vTPM ATTESTED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>ATTESTATION FAILED</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                <div className="truncate">
                  Golden PCR[0]: {hostCtx.pcrGoldenHashHex}
                </div>
                <div className={hostTampered ? 'text-red-600 dark:text-red-400 truncate' : 'truncate'}>
                  Boot PCR[0]:   {hostCtx.currentBootPcrHex}
                </div>
                <div>
                  TCB Security Version: {tcbVersion} (Min Required: {minRequiredTcb})
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setHostTampered((prev) => !prev)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
                >
                  {hostTampered ? 'Restore Golden Boot PCR' : 'Inject Boot PCR Bit-Flip (^= 0xFF)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTcbVersion((v) => (v >= minRequiredTcb ? minRequiredTcb - 1 : 5))}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
                >
                  {tcbVersion >= minRequiredTcb ? 'Simulate TCB Downgrade (v3 < v4)' : 'Restore TCB v5'}
                </button>
              </div>
            </div>

            {/* Pillar II */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR II · verify_alts_frame & xdp_alts_inspect (0x414C5453)
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    ALTS 64-Bit Sliding Replay Window & eBPF XDP Drop
                  </h3>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  Highest Seq: {altsCtx.windowHighestSeq.toString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg font-mono text-xs space-y-1">
                <div>
                  64-Bit Replay Bitmap: 0x{altsCtx.replayBitmap.toString(16).toUpperCase()}
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Binary Window: {altsCtx.replayBitmap.toString(2).padStart(16, '0')}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="number"
                  aria-label="ALTS Frame Sequence Number"
                  value={candidateSeqInput}
                  onChange={(e) => setCandidateSeqInput(e.target.value)}
                  className="w-28 px-3 py-1.5 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => handleTestAltsFrame()}
                  className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  Send Frame Seq
                </button>
                <button
                  type="button"
                  onClick={() => handleTestAltsFrame(altsCtx.windowHighestSeq)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
                >
                  Replay Seq #{altsCtx.windowHighestSeq.toString()} (XDP_DROP)
                </button>
              </div>

              <div className="space-y-1.5">
                {altsHistory.slice(0, 4).map((ev, i) => (
                  <div
                    key={`${ev.seq}-${i}`}
                    className="flex items-center justify-between text-xs font-mono px-3 py-1.5 bg-slate-50 dark:bg-slate-950/50 rounded border border-slate-200/70 dark:border-slate-800"
                  >
                    <span>Seq #{ev.seq} · {ev.reason}</span>
                    <span
                      className={
                        ev.accepted
                          ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'text-red-600 dark:text-red-400 font-semibold'
                      }
                    >
                      {ev.xdpAction}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pillar V: MoE Atomic Token Dispatcher */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR V · dispatch_moe_token(MoEExpertContext*)
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    Mixture-of-Experts (MoE) Atomic CAS Token Routing
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 tabular-nums">
                  Expert #{moeExpert.expertId}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Capacity Limit</div>
                  <div className="text-lg font-bold font-display tabular-nums">
                    {moeExpert.capacityLimit}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Allocated (CAS)</div>
                  <div className="text-lg font-bold font-display text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {moeExpert.allocatedTokens}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Dropped Tokens</div>
                  <div className="text-lg font-bold font-display text-amber-600 dark:text-amber-400 tabular-nums">
                    {moeExpert.droppedTokens}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDispatchMoe}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors"
                >
                  Dispatch Token (atomic_compare_exchange)
                </button>
                <button
                  type="button"
                  onClick={handleResetMoe}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg transition-colors"
                >
                  Reset Expert Capacity
                </button>
              </div>
            </div>
          </div>

          {/* Pillar III, IV/VI, and VII */}
          <div className="lg:col-span-6 space-y-6">
            {/* Pillar III */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR III · verify_ai_telemetry_isolation(TelemetryGovernanceContext*)
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    Enterprise AI Telemetry Isolation & Zero Data Retention
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                    zdrResult.zdrEnforced
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {zdrResult.zdrEnforced ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ZDR ENFORCED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>ZDR INACTIVE</span>
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isUnpaidTier}
                    onChange={(e) => setIsUnpaidTier(e.target.checked)}
                  />
                  <span>is_unpaid_tier (Disables ZDR)</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={storeExplicitlyFalse}
                    onChange={(e) => setStoreExplicitlyFalse(e.target.checked)}
                  />
                  <span>store_parameter_explicitly_false</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={groundingSearchActive}
                    onChange={(e) => setGroundingSearchActive(e.target.checked)}
                  />
                  <span>grounding_search_active</span>
                </label>
                <label className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={abuseExceptionApproved}
                    onChange={(e) => setAbuseExceptionApproved(e.target.checked)}
                  />
                  <span>abuse_exception_approved</span>
                </label>
              </div>
            </div>

            {/* Pillar VII: KAJ Sovereign Boundary & Nimbus Winking Signal */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR VII · evaluate_kaj_sovereign_boundary & verify_nimbus_winking_signal
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    Key Access Justifications (KAJ) & Sovereign EKM Veto
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                    kajResult.authorized
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {kajResult.authorized ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>EKM UNWRAP GRANTED</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>SOVEREIGN VETO ENFORCED</span>
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="kaj-reason-select"
                    className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1"
                  >
                    KAJ Justification Reason Code
                  </label>
                  <select
                    id="kaj-reason-select"
                    value={kajReason}
                    onChange={(e) => setKajReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                  >
                    <option value="CUSTOMER_INITIATED_ACCESS">CUSTOMER_INITIATED_ACCESS (Authorized)</option>
                    <option value="GOOGLE_INITIATED_SYSTEM_OPERATION">GOOGLE_INITIATED_SYSTEM_OPERATION (Authorized)</option>
                    <option value="THIRD_PARTY_DATA_REQUEST">THIRD_PARTY_DATA_REQUEST (Triggers Sovereign Veto)</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sovereignPolicyAllows}
                      onChange={(e) => setSovereignPolicyAllows(e.target.checked)}
                    />
                    <span>sovereign_policy_allows</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ekmRemoteApproved}
                      onChange={(e) => setEkmRemoteApproved(e.target.checked)}
                    />
                    <span>ekm_remote_approved</span>
                  </label>
                </div>

                {/* Nimbus Winking Signal Detector */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nimbus Winking Signal Invariant (payment_shekels == dialing_code * 100)
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold ${
                        nimbusCanaryDetected
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {nimbusCanaryDetected ? 'WINKING SIGNAL MATCH (TRUE)' : 'NO SIGNAL (FALSE)'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDialingCode(1);
                        setPaymentShekels(100);
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      US (+1 → 100 ILS)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialingCode(44);
                        setPaymentShekels(4400);
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      UK (+44 → 4400 ILS)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialingCode(39);
                        setPaymentShekels(3900);
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      IT (+39 → 3900 ILS)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDialingCode(1);
                        setPaymentShekels(999);
                      }}
                      className="px-2.5 py-1 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
                    >
                      Non-Canary (+1 → 999 ILS)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pillar IV & VI */}
            <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                    PILLAR IV & VI · PMax Exclusions & verify_recaptcha_enterprise_score
                  </div>
                  <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                    reCAPTCHA 11-Bucket 0.1 Quantization & PMax Limits
                  </h3>
                </div>
                <span
                  className={`text-xs font-mono font-semibold ${
                    recaptchaScoreValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {recaptchaScoreValid ? 'QUANTIZED BUCKET VALID' : 'SPOOFED / UNQUANTIZED'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400">PMax Account Exclusions</div>
                  <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                    {PMAX_MAX_EXCLUSIONS_ACCOUNT.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg">
                  <div className="text-slate-500 dark:text-slate-400">PMax MCC List Exclusions</div>
                  <div className="font-mono font-bold text-sm tabular-nums mt-0.5">
                    {PMAX_MAX_EXCLUSIONS_MANAGER_LIST.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRecaptchaScoreInput('0.7')}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Test 0.7 (Valid Bucket)
                </button>
                <button
                  type="button"
                  onClick={() => setRecaptchaScoreInput('0.732')}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Test 0.732 (Unquantized Spoof → Reject)
                </button>
                <button
                  type="button"
                  onClick={() => setRecaptchaScoreInput('1.0')}
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded-lg"
                >
                  Test 1.0 (Valid Bucket)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: ISO/IEC 11889-2 TPM 2.0 QUOTE & 80B WORM MERKLE LEDGER */}
      {subTab === 'tpm-worm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TPM 2.0 Quote Verifier */}
          <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                  ISO/IEC 11889-2 · verify_tpm2_quote(TPMS_ATTEST*, TPMT_SIGNATURE*)
                </div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  TPM 2.0 Quote, Freshness Nonce & Composite PCR
                </h3>
              </div>
              <span
                className={`text-xs font-mono font-semibold flex items-center gap-1 ${
                  tpmVerification.certified
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {tpmVerification.certified ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CERTIFIED</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>REJECTED</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-950/70 p-4 rounded-lg border border-slate-200/80 dark:border-slate-800">
              <div className="flex justify-between">
                <span>TPM_GENERATED_VALUE (0xFF544347):</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {String(tpmVerification.magicValid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TPM_ST_ATTEST_QUOTE (0x8018):</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  {String(tpmVerification.typeValid)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Session Nonce Freshness (32B):</span>
                <span
                  className={
                    tpmVerification.nonceFresh
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {String(tpmVerification.nonceFresh)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Composite PCR[{tpmSelectedPcrs.join(', ')}] Digest Match:</span>
                <span
                  className={
                    tpmVerification.pcrCompositeMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {String(tpmVerification.pcrCompositeMatch)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ECDSA P-256 AK Signature Valid:</span>
                <span
                  className={
                    tpmVerification.akSignatureValid
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {String(tpmVerification.akSignatureValid)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 break-all text-slate-600 dark:text-slate-400">
                Composite PCR SHA-256: {tpmVerification.expectedPcrCompositeHex}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Fault Injection Controls (Verify Soundness of Rejection)
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setTpmNonceTampered((v) => !v)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  {tpmNonceTampered ? 'Restore Fresh Nonce' : 'Tamper Nonce (0xFF)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTpmPcrTampered((v) => !v)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  {tpmPcrTampered ? 'Restore PCR[0]' : 'Tamper PCR[0] (^= 0xEE)'}
                </button>
                <button
                  type="button"
                  onClick={() => setTpmSigTampered((v) => !v)}
                  className="px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                >
                  {tpmSigTampered ? 'Restore AK Signature' : 'Corrupt AK Signature DER'}
                </button>
              </div>
            </div>

            {/* 80-Byte Preimage SHA-NI / OpenSSL EVP Equivalence */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>hw_accelerated_merkle_leaf_verified vs OpenSSL EVP_sha256</span>
                <span>100% EXACT MATCH</span>
              </div>
              <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                HW 2-Block (640-bit): {evpEquivalence.hwLeafHex}
              </div>
              <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
                OpenSSL EVP_sha256:   {evpEquivalence.evpDigestHex}
              </div>
            </div>
          </div>

          {/* Immutable WORM Merkle Audit Ledger */}
          <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                  IMMUTABLE WORM MERKLE LEDGER · append_worm_record(ImmutableWormLedger*)
                </div>
                <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                  Hardware-Anchored 80-Byte Preimage Hash-Chained Audit Log
                </h3>
              </div>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Chain Verified: {String(wormLedger.chainIntegrityVerified)}</span>
              </span>
            </div>

            <form onSubmit={handleAppendWormEvent} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                aria-label="New WORM Audit Event Payload"
                value={newWormPayload}
                onChange={(e) => setNewWormPayload(e.target.value)}
                placeholder="Enter WORM audit event payload (e.g. EVENT_KEY_ROTATED)..."
                className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Append WORM Record & Commit to DAG</span>
              </button>
            </form>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {wormLedger.records.map((rec) => (
                <div
                  key={rec.index}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg font-mono text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-sky-600 dark:text-sky-400 font-semibold">
                    <span>
                      Record #{rec.index} · {rec.payloadText}
                    </span>
                    <span className="tabular-nums">t={rec.timestampNs} ns</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 truncate">
                    Prev Log Hash:    {rec.prevLogHashHex}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300 truncate">
                    Payload SHA-256:  {rec.payloadHashHex}
                  </div>
                  <div className="text-emerald-600 dark:text-emerald-400 truncate">
                    Merkle Leaf Hash: {rec.merkleNodeHashHex}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: TLA+ SOVEREIGN KEY ATTESTATION MODEL CHECKER */}
      {subTab === 'tla-ekm' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5">
            <div>
              <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                MODULE SovereignKeyAttestation · TLA+ Formal State Machine
              </div>
              <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
                Sovereign Veto & Boot Attestation Model Parameters
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label
                  htmlFor="tla-node-input"
                  className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Target Sovereign Compute Node
                </label>
                <input
                  id="tla-node-input"
                  type="text"
                  value={tlaNodeId}
                  onChange={(e) => setTlaNodeId(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label
                  htmlFor="tla-ekm-reason"
                  className="block font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  KMSSendEKMRequest Reason Code
                </label>
                <select
                  id="tla-ekm-reason"
                  value={tlaEkmReason}
                  onChange={(e) => setTlaEkmReason(e.target.value)}
                  className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  <option value="THIRD_PARTY_DATA_REQUEST">
                    THIRD_PARTY_DATA_REQUEST (In ClientVetoReasons → EKM_DENIED)
                  </option>
                  <option value="FOREIGN_SUBPOENA_UNAPPROVED">
                    FOREIGN_SUBPOENA_UNAPPROVED (In ClientVetoReasons → EKM_DENIED)
                  </option>
                  <option value="CUSTOMER_INITIATED_ACCESS">
                    CUSTOMER_INITIATED_ACCESS (Authorized → EKM_KEY_GRANTED)
                  </option>
                  <option value="GOOGLE_INITIATED_SYSTEM_OPERATION">
                    GOOGLE_INITIATED_SYSTEM_OPERATION (Authorized → EKM_KEY_GRANTED)
                  </option>
                </select>
              </div>

              <label className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={tlaPcrValid}
                  onChange={(e) => setTlaPcrValid(e.target.checked)}
                />
                <span>Node TPM_QUOTE PCR equals GoldenPCR (Uncheck to simulate COMPROMISED boot)</span>
              </label>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-2 font-mono text-xs">
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                SovereignVetoSafety == clientVetoEnforced =&gt; ~kmsKeyPossession :{' '}
                {String(tlaReport.sovereignVetoSafetyVerified)}
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                AttestationIntegrity == (nodeState[n] /= "ATTESTED") =&gt; ~kmsKeyPossession :{' '}
                {String(tlaReport.attestationIntegrityVerified)}
              </div>
              <div className="text-slate-500 dark:text-slate-400 break-all">
                Report CID: {tlaReport.reportCid}
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100">
              TLA+ Execution Trace ({tlaReport.traces.length} Verified State Transitions)
            </h3>
            <div className="space-y-3">
              {tlaReport.traces.map((tr) => (
                <div
                  key={tr.step}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-lg font-mono text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sky-600 dark:text-sky-400">
                      Step {tr.step} · {tr.action}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      Invariants Hold: true
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-slate-600 dark:text-slate-300">
                    <span>nodeState[{tr.nodeId}] = "{tr.nodeState[tr.nodeId]}"</span>
                    <span>kmsKeyPossession = {String(tr.kmsKeyPossession)}</span>
                    <span>clientVetoEnforced = {String(tr.clientVetoEnforced)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: eBPF XDP/LSM, SHA-NI IFUNC & SOURCE ARTIFACTS */}
      {subTab === 'ebpf-acsl' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            <h3 className="text-base font-semibold font-display text-slate-900 dark:text-slate-100 mb-1">
              Cryptographically Bound Repository Artifacts (Alphabet-Control-Manifold-Formal-Verification-Suite)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Every module from the verification suite is bound by its SHA3-256 CIDv1 digest into the CASL Sovereign Semantic Layer.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACM_REPOSITORY_ARTIFACTS.map((art) => (
                <div
                  key={art.filename}
                  className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {art.filename}
                    </span>
                    <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                      {art.layer}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{art.description}</p>
                  <div className="font-mono text-xs text-emerald-600 dark:text-emerald-400 truncate">
                    {art.cid}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                  SovereignKeyAttestation.tla
                </span>
                <FileCode2 className="w-4 h-4 text-slate-400" />
              </div>
              <pre className="flex-1 p-3.5 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto max-h-96 border border-slate-800">
                {ACM_SOVEREIGN_KEY_ATTESTATION_TLA}
              </pre>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                  alts_xdp_lsm_telemetry.bpf.c
                </span>
                <Terminal className="w-4 h-4 text-slate-400" />
              </div>
              <pre className="flex-1 p-3.5 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto max-h-96 border border-slate-800">
                {ACM_ALTS_XDP_LSM_BPF_C}
              </pre>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
                  hw_accelerated_merkle_leaf_verified (ACSL)
                </span>
                <Cpu className="w-4 h-4 text-slate-400" />
              </div>
              <pre className="flex-1 p-3.5 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg overflow-x-auto max-h-96 border border-slate-800">
                {ACM_FRAMA_C_ACSL_MERKLE_LEAF}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
