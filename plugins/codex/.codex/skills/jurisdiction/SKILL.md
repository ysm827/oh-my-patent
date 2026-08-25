---
name: jurisdiction
description: Use when applying CN, US, or PCT patent jurisdiction rules, claim formats, procedures, or timelines.
---

# Jurisdiction Rules Skill

Provides patent jurisdiction rules for CN, US, and PCT.

## Usage

Import from `../skills/jurisdiction.ts`:

```typescript
import { getJurisdictionRules, JurisdictionCode } from '../skills/jurisdiction';

const rules = getJurisdictionRules(JurisdictionCode.CN);
```

## Supported Jurisdictions

- **CN** (中国): 实质审查, 18-36 months, claim format with "其特征在于"
- **US** (United States): Substantive Examination, 18-48 months
- **PCT** (International): International Search & Examination, 16-30 months

## Output

- `JurisdictionRules`: Country, examination type, fees
- `ClaimFormat`: Independent/dependent claim templates
- `ExaminationTimeline`: Min/max months, stages
