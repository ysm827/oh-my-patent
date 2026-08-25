---
name: jurisdiction
description: Use when applying CN, US, or PCT patent jurisdiction rules, claim formats, procedures, or timelines.
---

# Jurisdiction Rules Skill

Provides patent jurisdiction rules for CN, US, and PCT, including examination procedures, timelines, claim formats, and filing requirements.

## Usage

Import from `../skills/jurisdiction.ts`:

```typescript
import { getJurisdictionRules, JurisdictionCode } from '../skills/jurisdiction';

const rules = getJurisdictionRules(JurisdictionCode.CN);
```

## Supported Jurisdictions

### CN (中国)
- **Examination Type**: 实质审查 (Substantive Examination)
- **Timeline**: 18-36 months
- **Claim Format**: Uses "其特征在于" separator between preamble and characterizing portion
- **Language**: Chinese (simplified)
- **Filing System**: CNIPA (China National Intellectual Property Administration)

### US (United States)
- **Examination Type**: Substantive Examination
- **Timeline**: 18-48 months
- **Claim Format**: Independent and dependent claims, no specific separator required
- **Language**: English
- **Filing System**: USPTO (United States Patent and Trademark Office)

### PCT (Patent Cooperation Treaty)
- **Examination Type**: International Search & Preliminary Examination
- **Timeline**: 16-30 months to national phase
- **Claim Format**: Follows WIPO standards
- **Language**: Multiple (English, French, Chinese, etc.)
- **Filing System**: WIPO (World Intellectual Property Organization)

## Examples

### Example 1: Get CN Jurisdiction Rules

```typescript
import { getJurisdictionRules, JurisdictionCode } from '../skills/jurisdiction';

// Get Chinese jurisdiction rules
const cnRules = getJurisdictionRules(JurisdictionCode.CN);

console.log(cnRules.country); // "CN"
console.log(cnRules.examinationType); // "实质审查"
console.log(cnRules.timeline.minMonths); // 18
console.log(cnRules.timeline.maxMonths); // 36
console.log(cnRules.claimFormat.separator); // "其特征在于"
```

### Example 2: Validate Jurisdiction Code

```typescript
import { isValidJurisdiction } from '../skills/jurisdiction';

const isValid = isValidJurisdiction("CN"); // true
const isInvalid = isValidJurisdiction("XX"); // false
```

### Example 3: Get Claim Template

```typescript
import { getClaimTemplate, JurisdictionCode } from '../skills/jurisdiction';

const cnTemplate = getClaimTemplate(JurisdictionCode.CN);
// Returns template with "其特征在于" separator

const usTemplate = getClaimTemplate(JurisdictionCode.US);
// Returns standard US claim template
```

## Output Types

### JurisdictionRules
- `country`: Country code (CN/US/PCT)
- `examinationType`: Type of examination process
- `timeline`: { minMonths, maxMonths, stages }
- `claimFormat`: { separator, style, examples }
- `fees`: { filing, examination, grant } (if applicable)
- `language`: Primary language for filing

### ClaimFormat
- `separator`: Special separator for claims (e.g., "其特征在于" for CN)
- `independentTemplate`: Template for independent claims
- `dependentTemplate`: Template for dependent claims
- `style`: Formatting conventions

### ExaminationTimeline
- `minMonths`: Minimum examination duration
- `maxMonths`: Maximum examination duration
- `stages`: Array of examination stages with descriptions

## Notes

- Always validate jurisdiction code before using
- CN jurisdiction requires Chinese language proficiency
- PCT is for international phase only; national phase rules apply later
- Timeline estimates are approximate and subject to backlog variations
