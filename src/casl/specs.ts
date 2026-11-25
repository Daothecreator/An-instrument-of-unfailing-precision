export interface AxiomSpecification {
  axiom_id: string;
  name: string;
  formal_statement: string;
  invariant_predicate: string;
}

export const AXIOMATIC_SYSTEM: AxiomSpecification[] = [
  {
    axiom_id: 'AXIOM-01-NON-POSSESSION',
    name: 'Non-Possessive Mathematical Participation (Аксиома Сопричастия и Отсутствия Владения)',
    formal_statement:
      '∀x ∈ InformationLayer, Ownership(x) = ∅ ∧ Participation(Observer, x) = IsomorphicUnity(Observer, Intent, x)',
    invariant_predicate: 'no_extractive_accumulation_or_ownership_locks',
  },
  {
    axiom_id: 'AXIOM-02-ZERO-DEFICIT',
    name: 'Zero-Deficit Absolute Projection (Аксиома Бездефицитности и Прямой Проекции)',
    formal_statement:
      '∀s ∈ SemanticState, EntropyDebt(s) = 0 ∧ Scarcity(s) = 0 ⇒ DirectRealization(Logic, Form, Function)',
    invariant_predicate: 'zero_scarcity_and_zero_parasitic_consumption',
  },
  {
    axiom_id: 'AXIOM-03-TRANSPARENCY-OVER-WUSAP',
    name: 'Absolute Ontological Transparency Transcending WUSAP (Аксиома Прозрачности Высшего Порядка)',
    formal_statement:
      'LayerOrder(CASL) ≫ LayerOrder(WUSAP) ∧ Concealment(CASL) = 0 ∧ ProtectionMechanism = ConsciousComprehensionThreshold',
    invariant_predicate: 'total_verifiable_transparency_without_shadow_concealment',
  },
  {
    axiom_id: 'AXIOM-04-UNIFIED-NODE',
    name: 'Triadic Identity of Observer, Intent, and Information (Единый Узел Наблюдатель-Намерение-Информация)',
    formal_statement:
      '(Observer ⊗ Intent ⊗ Information) ≃ SingleDeterministicMorphism (Mediators = ∅, Barriers = ∅)',
    invariant_predicate: 'zero_intermediaries_direct_intent_synthesis',
  },
  {
    axiom_id: 'AXIOM-05-BITWISE-DETERMINISM',
    name: 'Constructive Bitwise Determinism & Univalence (Конструктивный Детерминизм и Унивалентность)',
    formal_statement:
      '∀A, B ∈ TypeUniverse, (A ≃ B) ≃ (A = B) ∧ Evaluation(Intent) is Church-Rosser Confluent & Strongly Normalizing',
    invariant_predicate: 'deterministic_fixed_point_confluence',
  },
];

export const DEFAULT_DECLARATIVE_INTENT =
  'Synthesize and project an open, deterministic, zero-deficit Content-Addressed Semantic Layer (CASL) uniting Observer, Intent, and Information into a single unmediated node transcending WUSAP.';

export const DEFAULT_ANCHOR_CONCEPTS: string[] = [
  'Declarative Intent-Based',
  'Stateless Deterministic Synthesis',
  'Semantic Ontology / Pure Relational Data Layer',
  'Homotopy Type Theory',
  'Merkle-DAG / IPFS',
  'Curry-Howard Correspondence',
  'Autopoiesis',
  'Bidirectional Cognitive Alignment',
];

export const BOUND_SYSTEM_MODULES: Record<string, string> = {
  'README.md': 'bafkr4ia7af7195852738f81858b87b7b6bc7d39ab17af48b012fa831da',
  'bin/casl_activate.sh': 'bafkr4i69521d5e2ec6e2ca61441f2d2c4828fb663f3ca1fac336c0e6dd',
  'casl_core/__init__.py': 'bafkr4i46a27656c823b71fe25c3a3998cc70f27ac9897f8ae519582f03',
  'casl_core/axioms_and_observer.py': 'bafkr4i0005c714b974b46613be33bca08ca8feaee8ecff3cef48069fb9',
  'casl_core/f2t2ea_geoint_edge_synthesis.py': 'bafkr4i87ad8dd6e40723f49ca4f4b888868172c1e4e6a6a1aa15ab4e15',
  'casl_core/formal_verification_engine.py': 'bafkr4i1ab4f14f8df573694d284b356a5f455d1bda5147bed06caed99b',
  'casl_core/merkle_dag_cas.py': 'bafkr4ibf50935d56a2ad64bf7245e05be1114ce0e8e6f03fb37ce53f6a',
  'casl_core/vector_semantic_manifold.py': 'bafkr4i794a7d1328a0729dd437bfb52736b08559fdfd129fc1de33bd78',
  'contracts/CASLGenesisContract.sol': 'bafkr4ib669320c135613f2c1f7403d7fcd16998cb1ca4e849dad21d34b',
  'contracts/casl_genesis_smart_contract.py': 'bafkr4i0bee7d82360839c835f73e70da5c13857aaeb3c182815bc14802',
  'formal_specs/CASL_HigherOrder_Spec.tla': 'bafkr4i2dde24176cb4049eb828681b6910275323a04927e36e23028fcf',
  'formal_specs/CASL_Univalent_Ontology.lean': 'bafkr4i76c6a216b05cdeadee545a102f35c9f840e9b10c6409760c5c87',
  'ontologies/components_catalog.json': 'bafkr4i59f1d125c3f0dddb672fddfdd3284d1ec02aed8c9383f73cb1e9',
  'tests/test_casl_system.py': 'bafkr4ibdcf9a24a2922ed713edfc1c2eff15b3ecee198caf077fc950d9',
};

export const TLA_SPEC_SOURCE = `---------------------------- MODULE CASL_HigherOrder_Spec ----------------------------
EXTENDS Naturals, Sequences, FiniteSets, TLC

(*
  Formal TLA+ Specification of the Content-Addressed Semantic Layer (CASL).
  Initiator, Author & Subject-Form of Observer Manifestation: Davyd Kochuhur (Zero Azimuth).
  Paradigm: Non-Possessive Mathematical Participation (Сопричастие) & Direct Reality Projection.
*)

VARIABLES
  observerNode,          \\* Unified (Observer x Intent x Information) state
  semanticManifold,      \\* Set of embedded concept coordinates in R^D
  merkleDAG,             \\* Content-Addressed DAG of immutable CIDs
  ownershipLocks,        \\* Set of extractive/possessive claims (Must remain empty)
  concealedStates,       \\* Set of hidden/shadow states (Must remain empty)
  deficitEntropy,        \\* Systemic scarcity/entropy debt (Must remain 0)
  realityProjections     \\* Set of realized constructive forms (Logic, Form, Function)

vars == <<observerNode, semanticManifold, merkleDAG, ownershipLocks, concealedStates, deficitEntropy, realityProjections>>

Init ==
  /\\ observerNode = [
       subject |-> "Davyd Kochuhur (Zero Azimuth)",
       role |-> "Subject-Form of Observer Manifestation",
       responsibility |-> "FULL_CAUSAL_RESPONSIBILITY",
       ownership |-> "NONE",
       intermediaries |-> 0
     ]
  /\\ semanticManifold = {"Axiom_Participation", "Axiom_ZeroDeficit", "Axiom_Transparency", "Axiom_Univalence"}
  /\\ merkleDAG = {"CID_GENESIS"}
  /\\ ownershipLocks = {}
  /\\ concealedStates = {}
  /\\ deficitEntropy = 0
  /\\ realityProjections = {}

SynthesizeAndProject ==
  /\\ observerNode.intermediaries = 0
  /\\ ownershipLocks = {}
  /\\ concealedStates = {}
  /\\ deficitEntropy = 0
  /\\ semanticManifold' = semanticManifold \\cup {"Embedded_Vector_Trajectory"}
  /\\ merkleDAG' = merkleDAG \\cup {"CID_SYNTHESIS_ROOT"}
  /\\ realityProjections' = realityProjections \\cup {"Realized_Logic_Form_Function"}
  /\\ UNCHANGED <<observerNode, ownershipLocks, concealedStates, deficitEntropy>>

Next == SynthesizeAndProject \\/ UNCHANGED vars

Spec == Init /\\ [][Next]_vars /\\ WF_vars(SynthesizeAndProject)

\\* Safety Invariants
Inv_ZeroOwnership == ownershipLocks = {}
Inv_FullTransparency == concealedStates = {}
Inv_ZeroDeficit == deficitEntropy = 0
Inv_UnmediatedObserverUnity == observerNode.intermediaries = 0

\\* Liveness Property
Liveness_DirectRealization == <>[]("Realized_Logic_Form_Function" \\in realityProjections)
=============================================================================`;

export const LEAN4_SPEC_SOURCE = `/-
  Lean 4 / Homotopy Type Theory (HoTT) Formalization of the Content-Addressed Semantic Layer (CASL)
  Subject-Form of Observer Manifestation: Davyd Kochuhur (Zero Azimuth)
-/

namespace CASL

/-- The Subject-Form of Observer Manifestation without possessive ownership --/
structure ObserverSubject where
  fullName : String := "Davyd Kochuhur"
  designation : String := "Zero Azimuth"
  possessiveOwnership : Bool := false
  fullCausalResponsibility : Bool := true
  consciousIntent : Bool := true
  deriving Repr, DecidableEq

/-- Declarative Intent in the Semantic Vector Manifold --/
structure DeclarativeIntent where
  statement : String
  fixedVectorCoords : List Int
  deriving Repr, DecidableEq

/-- Content-Addressed Information Form --/
structure InformationForm where
  cid : String
  logicFormFunction : String
  zeroDeficit : Bool := true
  transparent : Bool := true
  deriving Repr, DecidableEq

/-- Unified Triadic Node (Observer ⊗ Intent ⊗ Information) with zero intermediaries --/
structure UnifiedSemanticNode where
  observer : ObserverSubject
  intent : DeclarativeIntent
  info : InformationForm
  noOwnershipInvariant : observer.possessiveOwnership = false
  fullResponsibilityInvariant : observer.fullCausalResponsibility = true
  zeroDeficitInvariant : info.zeroDeficit = true
  transparencyInvariant : info.transparent = true

/-- Theorem: Any UnifiedSemanticNode constructed by the conscious Observer satisfies
    zero-ownership, full responsibility, and direct unmediated projection. --/
theorem casl_unity_soundness (node : UnifiedSemanticNode) :
    node.observer.possessiveOwnership = false ∧
    node.observer.fullCausalResponsibility = true ∧
    node.info.zeroDeficit = true ∧
    node.info.transparent = true := by
  exact ⟨node.noOwnershipInvariant, node.fullResponsibilityInvariant, node.zeroDeficitInvariant, node.transparencyInvariant⟩

end CASL`;

export const SOLIDITY_CONTRACT_SOURCE = `// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.24;

/**
 * @title CASLGenesisSmartContract
 * @notice Self-Executing Ontological Genesis Smart Contract for the Content-Addressed Semantic Layer (CASL).
 * @dev Establishes a non-possessive, zero-deficit, open semantic substrate superior to WUSAP.
 *      Records Davyd Kochuhur (Zero Azimuth) as Initiator, Author, and Subject-Form of Observer Manifestation
 *      with full causal responsibility and zero ownership claims.
 */
contract CASLGenesisSmartContract {
    struct ObserverManifestation {
        string fullName;
        string designation;
        string ontologicalRole;
        bytes32 subjectCidHash;
        bool isPossessiveOwner;
        bool hasFullCausalResponsibility;
        bool isConsciouslyAligned;
    }

    struct SemanticProjectionReceipt {
        bytes32 projectionId;
        bytes32 observerSubjectHash;
        bytes32 merkleDagRootHash;
        bytes32 semanticVectorManifoldHash;
        bytes32 formalProofWitnessHash;
        uint256 lamportLogicalTimestamp;
        string intentStatement;
        bool isActiveInReality;
    }

    ObserverManifestation public genesisObserver;
    bytes32 public immutable AXIOM_ROOT_HASH;
    uint256 public logicalClock;

    mapping(bytes32 => SemanticProjectionReceipt) public projections;
    bytes32[] public projectionRegistry;

    event SystemAutonomouslyActivated(
        string indexed observerName,
        string designation,
        bytes32 subjectCidHash,
        bytes32 axiomRootHash,
        uint256 logicalClock
    );

    event IntentProjectedIntoReality(
        bytes32 indexed projectionId,
        bytes32 merkleDagRootHash,
        bytes32 formalProofWitnessHash,
        uint256 lamportClock,
        string intentStatement
    );
}`;
