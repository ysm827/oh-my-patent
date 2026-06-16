export enum JurisdictionCode {
  CN = 'CN',
  US = 'US',
  PCT = 'PCT',
}

export interface JurisdictionRules {
  code: JurisdictionCode;
  country: string;
  examinationType: string;
  defaultTimeline: number;
  fees: {
    filing: number;
    examination: number;
    grant: number;
    maintenance: number;
  };
  specialRequirements?: string[];
}

export interface ClaimFormat {
  independentClaimTemplate: string;
  dependentClaimPrefix: string;
  multipleDependentClaims: boolean;
  maxClaims: number;
}

export interface ExaminationTimeline {
  minMonths: number;
  maxMonths: number;
  typical: number;
}

const CN_RULES: JurisdictionRules = {
  code: JurisdictionCode.CN,
  country: '中国',
  examinationType: '实质审查',
  defaultTimeline: 24,
  fees: {
    filing: 950,
    examination: 2500,
    grant: 200,
    maintenance: 900,
  },
  specialRequirements: [
    'Chinese language required',
    'National phase entry required for PCT',
    'Grace period: 6 months for disclosure',
  ],
};

const US_RULES: JurisdictionRules = {
  code: JurisdictionCode.US,
  country: 'United States',
  examinationType: 'Substantive Examination',
  defaultTimeline: 36,
  fees: {
    filing: 300,
    examination: 700,
    grant: 1000,
    maintenance: 12000,
  },
  specialRequirements: [
    'First to file system',
    '12-month grace period',
    'Provisional applications available',
  ],
};

const PCT_RULES: JurisdictionRules = {
  code: JurisdictionCode.PCT,
  country: 'PCT International',
  examinationType: 'International Search and Examination',
  defaultTimeline: 30,
  fees: {
    filing: 2500,
    examination: 2200,
    grant: 0,
    maintenance: 0,
  },
  specialRequirements: [
    '30-month national phase entry',
    'International Search Report included',
    'International Preliminary Examination optional',
  ],
};

const CN_CLAIM_FORMAT: ClaimFormat = {
  independentClaimTemplate: '一种[产品/方法]，其特征在于，包括：[技术特征]',
  dependentClaimPrefix: '根据权利要求[N]所述的[产品/方法]，其特征在于',
  multipleDependentClaims: false,
  maxClaims: 10,
};

const US_CLAIM_FORMAT: ClaimFormat = {
  independentClaimTemplate: 'A [product/method] comprising: [technical features]',
  dependentClaimPrefix: 'The [product/method] of claim [N], wherein',
  multipleDependentClaims: true,
  maxClaims: 20,
};

const PCT_CLAIM_FORMAT: ClaimFormat = {
  independentClaimTemplate: 'A [product/method] comprising: [technical features]',
  dependentClaimPrefix: 'The [product/method] of claim [N], wherein',
  multipleDependentClaims: true,
  maxClaims: 10,
};

const CN_TIMELINE: ExaminationTimeline = {
  minMonths: 18,
  maxMonths: 36,
  typical: 24,
};

const US_TIMELINE: ExaminationTimeline = {
  minMonths: 24,
  maxMonths: 48,
  typical: 36,
};

const PCT_TIMELINE: ExaminationTimeline = {
  minMonths: 12,
  maxMonths: 30,
  typical: 18,
};

const JURISDICTION_RULES: Record<JurisdictionCode, JurisdictionRules> = {
  [JurisdictionCode.CN]: CN_RULES,
  [JurisdictionCode.US]: US_RULES,
  [JurisdictionCode.PCT]: PCT_RULES,
};

const CLAIM_FORMATS: Record<JurisdictionCode, ClaimFormat> = {
  [JurisdictionCode.CN]: CN_CLAIM_FORMAT,
  [JurisdictionCode.US]: US_CLAIM_FORMAT,
  [JurisdictionCode.PCT]: PCT_CLAIM_FORMAT,
};

const EXAMINATION_TIMELINES: Record<JurisdictionCode, ExaminationTimeline> = {
  [JurisdictionCode.CN]: CN_TIMELINE,
  [JurisdictionCode.US]: US_TIMELINE,
  [JurisdictionCode.PCT]: PCT_TIMELINE,
};

export function getJurisdictionRules(code: JurisdictionCode): JurisdictionRules {
  const rules = JURISDICTION_RULES[code];
  if (!rules) {
    throw new Error(`Unsupported jurisdiction: ${code}`);
  }
  return rules;
}

export function getClaimFormat(code: JurisdictionCode): ClaimFormat {
  const format = CLAIM_FORMATS[code];
  if (!format) {
    throw new Error(`Unsupported jurisdiction: ${code}`);
  }
  return format;
}

export function getExaminationTimeline(code: JurisdictionCode): ExaminationTimeline {
  const timeline = EXAMINATION_TIMELINES[code];
  if (!timeline) {
    throw new Error(`Unsupported jurisdiction: ${code}`);
  }
  return timeline;
}
