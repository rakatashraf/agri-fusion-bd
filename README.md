# AgriFusion BD

A redesigned derivative of `baseplate-admin/nasa-space-apps-web`, focused on Bangladeshi farmers first and agriculture specialists second.

## Product structure

- `/farmer` - Bangla-first action dashboard: what to do today, why, likely cost/water impact, weather preparation, targeted pest scouting and intercropping ideas.
- `/specialist` - zone-level diagnostic workspace: satellite/rover/fused measurements, evidence, trends, intervention priorities and rover mission summary.
- `/field` - unified field report shared between farmer and specialist workflows.
- `/map` - GPS bounding-box input and rover route planning preview.

## Data architecture

1. **Satellite ingestion**: NDVI/vegetation, surface temperature, rainfall and other EO layers.
2. **Rover ingestion**: GPS-tagged soil moisture, pH, EC, temperatures and crop imagery.
3. **Weather/forecast ingestion**: rainfall, heat and disaster probabilities.
4. **Normalization**: timestamps, units, coordinate system and quality flags.
5. **Spatial alignment**: map rover samples to grid cells / satellite pixels.
6. **Fusion**: confidence- and freshness-weighted estimates. `src/lib/fusion.ts` contains a simple transparent baseline.
7. **Decision engine**: crop-stage thresholds, forecast context, input-cost rules and agronomic constraints.
8. **Output**: explainable recommendations with source confidence, expected saving and next action.

## Important implementation note

The current repository is a front-end prototype. The values in `src/lib/data.ts` are realistic demo values to make the redesigned UX testable. They must be replaced by backend API responses before production use. Recommendations involving pesticides, fertilizer rates or crop disease should be validated against local agronomy rules and Bangladesh agricultural guidance before being presented as prescriptive instructions.

## Run

```bash
npm install
npm run dev
```
