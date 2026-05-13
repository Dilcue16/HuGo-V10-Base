# HuGo v10 PWA
## Human Rights on the Go
### Bulacan Police Provincial Human Rights Affairs Office · BULPPO, PRO 3

---

## WHAT'S NEW IN v10 — STRICT MULTI-CONDITION INSPECTION ENGINE

### Official HuGo AI Validation Logic System
- Anti-hallucination protection
- 7-step validation pipeline per condition
- Temporal consistency check (5 consecutive frames minimum)
- Weighted confidence scoring
- Only 3 valid output statuses: VERIFIED | UNVERIFIED | FAILED

### Confidence Thresholds (per condition)
- Fire Extinguisher: 92% minimum
- Medical Kit / Medicines: 90% minimum
- Log Book: 88% minimum
- Detainee Formation: 93% minimum
- CCTV Cameras: 90% minimum

### 7-Step Validation Pipeline
1. Object Detection
2. Context Validation
3. Condition Validation (sub-checks)
4. Environmental Relationship Check
5. Temporal Stability Check (5 frames)
6. Weighted Confidence Scoring
7. Final Classification

### Anti-Hallucination Rules
- Never invent unseen objects
- Never assume missing conditions
- Never auto-pass unclear detections
- Never use single-frame confirmation
- Never ignore low confidence
- Reject blurry, obstructed, low-light detections

### Official JSON Output per Condition
{
  "inspection_type": "",
  "object_detected": false,
  "context_verified": false,
  "condition_verified": false,
  "environment_verified": false,
  "temporal_stability_verified": false,
  "confidence_score": 0,
  "threshold_required": 0,
  "final_status": "",
  "failure_reasons": [],
  "verification_summary": ""
}

---

## ALL 5 INSPECTION CONDITIONS
1. Fire Extinguisher — cylinder, hose, gauge (green), tag, mounted, accessible
2. Medical Kits/Medicines — kit, medical symbol, items visible, accessible
3. Log Book — notebook, open pages, handwriting, multiple entries
4. Detainee Formation — 3+ detainees, rows, facing forward, yellow uniform, stable
5. CCTV Cameras — camera body, lens, mounted, unobstructed view

## LOGIN CREDENTIALS
Station passcode: PHRA2025
Super user password: HUGO@ADMIN2025
Camera tokens: HUGO-INSPECT-01 · PHRA-CAM-2025 · BULPPO-SU-99

## DEPLOY TO GITHUB (Dilcue16)
1. github.com/new → hugo-pwa → Public → Create
2. Upload all files from this package
3. Settings → Pages → Deploy from main → Save
4. URL: https://dilcue16.github.io/hugo-pwa/

## INSTALL ON ANDROID
Chrome → URL → ⋮ → Add to Home screen → Add

## INSTALL ON iPHONE
Safari → URL → Share → Add to Home Screen → Add
