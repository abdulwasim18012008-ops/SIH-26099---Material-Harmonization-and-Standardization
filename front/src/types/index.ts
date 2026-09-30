export type ScreenType =
  | 'dashboard'
  | 'ingestion'
  | 'verification'
  | 'catalog'
  | 'material-details'
  | 'global-search'
  | 'ai-recommendation'
  | 'mapping'
  | 'migration'
  | 'erp'
  | 'assistant';

export type UserRole = 'admin' | 'reviewer' | 'analyst';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  title?: string;
}

export type CpseEntity =
  | 'NTPC'
  | 'BHEL'
  | 'SAIL'
  | 'IOCL'
  | 'GAIL'
  | 'ONGC'
  | 'CPCL';

export interface CpseNode {
  id: CpseEntity;
  name: string;
  sector: string;
  latencyMs: number;
  active: boolean;
}

export interface IngestionBatch {
  id: string;
  cpse: string;
  sourceName: string;
  volumeSkus: number;
  status:
    | 'vectorizing'
    | 'completed'
    | 'schema_warning'
    | 'in_queue';
  progressPct?: number;
  warningsCount?: number;
}

export interface VectorMetrics {
  highDimVectors: number;
  vectorsTodayDelta: number;
  activeClusters: number;
  latentDimension: number;
  avgCosineDist: number;
  autoMatchedPairs: number;
  currentThreshold: number;
}

export interface VectorCluster {
  id: string;
  canonicalFamily: string;
  mappedSkus: number;
  cosineScore: number;
  sourceCpse: string;
  targetCpse: string;
  routingStatus:
    | 'verification_queue'
    | 'flagged_manual'
    | 'auto_clustered';
}

export interface SpecimenSpec {
  bore: string;
  outerDia: string;
  width: string;
  dynLoad: string;
  clearance: string;
  sealType: string;
}

export interface VerificationCandidate {
  id: string;
  candidateNumber: number;
  totalCandidates: number;
  title: string;
  standardizedTargetClass: string;
  status: 'pending' | 'disputed' | 'approved';
  aiMatchScorePct: number;
  dimensionalParityPct: number;
  interchangeableLabel: string;

  source: {
    cpseName: string;
    plantUnit: string;
    verifiedSpecimen: boolean;
    specimenImage: string;
    localMaterialCode: string;
    legacyErpDescriptor: string;
    specs: SpecimenSpec;
    inspector: string;
    auditStatus: string;
  };

  target: {
    cpseName: string;
    plantUnit: string;
    verifiedSpecimen: boolean;
    specimenImage: string;
    localMaterialCode: string;
    legacyErpDescriptor: string;
    specs: SpecimenSpec;
    inspector: string;
    auditStatus: string;
  };
}

export interface RatifiedMaterial {
  cnmcCode: string;
  specimenImage?: string;
  canonicalName: string;
  specificationSummary: string;
  participatingCpses: string[];
  ratifiedBy: string;
  dscVerified: boolean;
  status: string;

  discipline:
    | 'Mechanical'
    | 'Electrical'
    | 'Piping & Valves'
    | 'Instrumentation';

  ratificationDate: string;
  certificateHash?: string;
}

export interface LineageMapping {
  cpse: string;
  unit: string;
  iconName: string;
  annualSpendCr: number;
  legacyCode: string;
  stockUnits: number;
}

export interface CatalogItem {
  cnmcCode: string;
  disciplineClass: string;

  discipline:
    | 'Mechanical'
    | 'Electrical'
    | 'Instrumentation'
    | 'Piping';

  canonicalDescription: string;
  subDescription: string;
  unspsc: string;
  legacyMappingsCount: number;
  participatingCpses: string[];
  standardizedSpecs: string;
  annualDemandUnits: string;

  status:
    | 'Active Master'
    | 'In Review'
    | 'Archived';

  lineage: LineageMapping[];
}

export interface AuditBlock {
  blockNumber: number;
  timestamp: string;
  hash: string;
  dscSignature: string;
  standard: string;
}

export interface ApiConfiguration {
  baseUrl: string;
  authToken: string;
  autoSync: boolean;

  endpoints: {
    ingestion: string;
    verification: string;
    catalog: string;
    vectorEngine: string;
  };
}

export type MatchType =
  | 'IDENTICAL'
  | 'NEAR DUPLICATE'
  | 'DIFFERENT'
  | 'FUNCTIONALLY EQUIVALENT';

export interface MaterialAttribute {
  label: string;
  value: string;
  confidence: number;
}

export interface MaterialRecommendation {
  groupId: string;

  sourceDescriptions: {
    cpse: string;
    code: string;
    description: string;
  }[];

  standardizedDescription: string;
  proposedNationalCode: string;
  category: string;
  subcategory: string;
  confidence: number;
  matchType: MatchType;
  attributes: MaterialAttribute[];
  missingAttributes: string[];

  explanation: {
    label: string;
    detail: string;
    positive: boolean;
  }[];
}

/* ---------------------------------------------
   AI RECOMMENDATION
--------------------------------------------- */

export interface AIRecommendation {
  id: string;
  materialGroupId: string;
  standardizedDescription: string;
  proposedNationalCode: string;
  category: string;
  subcategory: string;
  confidence: number;
  matchType: MatchType;

  sourceMaterials: {
    cpse: string;
    materialCode: string;
    description: string;
  }[];

  attributes: MaterialAttribute[];
  missingAttributes: string[];

  explanation: {
    factor: string;
    detail: string;
    score: number;
    positive: boolean;
  }[];

  recommendationStatus:
    | 'pending'
    | 'approved'
    | 'modified'
    | 'rejected';
}

/* ---------------------------------------------
   CPSE MAPPING
--------------------------------------------- */

export interface CPSEMapping {
  id: string;
  nationalCode: string;
  nationalDescription: string;
  cpse: string;
  plant: string;
  legacyCode: string;
  legacyDescription: string;
  unitOfMeasure: string;

  mappingStatus:
    | 'mapped'
    | 'pending'
    | 'review'
    | 'rejected';

  confidence: number;
  lastUpdated: string;
}

/* ---------------------------------------------
   MIGRATION
--------------------------------------------- */

export interface MigrationRecord {
  id: string;
  cpse: string;
  plant: string;
  legacyCode: string;
  legacyDescription: string;
  proposedNationalCode: string;
  standardizedDescription: string;

  migrationStatus:
    | 'ready'
    | 'in-progress'
    | 'completed'
    | 'blocked'
    | 'review';

  mappingConfidence: number;
  estimatedSavingsCr: number;
  lastUpdated: string;
}

/* ---------------------------------------------
   ERP / SAP
--------------------------------------------- */

export interface ERPConnection {
  id: string;
  systemName: string;
  systemType: 'SAP' | 'ERP' | 'REST API';
  cpse: string;
  environment: 'DEV' | 'TEST' | 'PROD';

  status:
    | 'connected'
    | 'disconnected'
    | 'syncing'
    | 'error';

  lastSync: string;
  recordsSynced: number;
}

/* ---------------------------------------------
   MATERIAL ASSISTANT
--------------------------------------------- */

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;

  relatedMaterials?: {
    nationalCode: string;
    description: string;
    confidence?: number;
  }[];
}

/* ---------------------------------------------
   ANALYTICS
--------------------------------------------- */

export interface AnalyticsSummary {
  totalMaterials: number;
  totalCPSEs: number;
  standardizedMaterials: number;
  duplicateGroups: number;
  nearDuplicateGroups: number;
  functionalEquivalentGroups: number;
  approvedMappings: number;
  pendingReviews: number;
  rejectedMappings: number;
  consolidationPercentage: number;
}

/* ---------------------------------------------
   VERSION HISTORY
--------------------------------------------- */

export interface MaterialVersion {
  version: string;
  description: string;
  nationalCode: string;

  status:
    | 'Draft'
    | 'In Review'
    | 'Approved'
    | 'Archived';

  reviewer: string;
  comment: string;
  timestamp: string;
}

/* ---------------------------------------------
   MATERIAL AUDIT
--------------------------------------------- */

export interface MaterialAuditEvent {
  id: string;
  entityId: string;

  action:
    | 'AI_RECOMMENDATION'
    | 'HUMAN_APPROVAL'
    | 'HUMAN_REJECTION'
    | 'MODIFICATION'
    | 'NATIONAL_CODE_CHANGE'
    | 'VERSION_CREATION'
    | 'MAPPING_CHANGE';

  oldValue?: string;
  newValue?: string;
  user: string;
  timestamp: string;
  reason: string;
}

/* ---------------------------------------------
   SEARCH
--------------------------------------------- */

export type MaterialSearchField =
  | 'all'
  | 'national-code'
  | 'cpse-code'
  | 'description'
  | 'unspsc';

export interface MaterialSearchResult {
  nationalCode: string;
  description: string;
  category: string;
  subcategory: string;
  cpseMappings: CPSEMapping[];
  matchType?: MatchType;
  confidence?: number;
}