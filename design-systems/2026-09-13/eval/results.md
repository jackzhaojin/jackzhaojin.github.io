# Eval results, 2026-09-14

Gates from SPEC.md section 10. Static checks run on the files; browser checks run in Chromium via playwright-cli at 390, 768, 1024, 1440, 1920 and 2560 px.

| System | Static checks | Overflow | Centered at 1440+ | Theme control | Contrast AA | Bands | No JS |
|---|---|---|---|---|---|---|---|
| Claude Fable 5.1 | 136/136 | none | yes | pass | all pairs pass AA; dark frames pass (153 nodes) | 7 bands, full bleed, distinct grounds, text passes | pass |
| Astra | 129/136 | none | yes | pass | all pairs pass AA; dark frames pass (175 nodes) | none | pass |
| Kimi K3 | 129/136 | none | yes | pass | all pairs pass AA; dark frames pass (151 nodes) | none | pass |
| Google Stitch | 129/136 | none | yes | pass | all pairs pass AA; dark frames pass (185 nodes) | none | pass |

## Astra: static failures
- (folder): all component classes styled .band, .band--alt, .band--tint, .band--inverse, .band--milestone, .divider, .divider__label
- (folder): band tint uses color-mix
- (folder): home uses five bands across three variants 0 bands, variants []
- (folder): post uses a non-plain band 0 bands, variants []
- (folder): blog uses a non-plain band 0 bands, variants []
- index.html: docs section #c-band
- index.html: docs section #c-divider

## Kimi K3: static failures
- (folder): all component classes styled .band, .band--alt, .band--tint, .band--inverse, .band--milestone, .divider, .divider__label
- (folder): band tint uses color-mix
- (folder): home uses five bands across three variants 0 bands, variants []
- (folder): post uses a non-plain band 0 bands, variants []
- (folder): blog uses a non-plain band 0 bands, variants []
- index.html: docs section #c-band
- index.html: docs section #c-divider

## Google Stitch: static failures
- (folder): all component classes styled .band, .band--alt, .band--tint, .band--inverse, .band--milestone, .divider, .divider__label
- (folder): band tint uses color-mix
- (folder): home uses five bands across three variants 0 bands, variants []
- (folder): post uses a non-plain band 0 bands, variants []
- (folder): blog uses a non-plain band 0 bands, variants []
- index.html: docs section #c-band
- index.html: docs section #c-divider
