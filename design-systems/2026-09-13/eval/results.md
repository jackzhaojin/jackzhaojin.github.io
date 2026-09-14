# Eval results, 2026-09-14

Gates from SPEC.md section 10. Static checks run on the files; browser checks run in Chromium via playwright-cli at 390, 768, 1024, 1440, 1920 and 2560 px.

| System | Static checks | Overflow | Centered at 1440+ | Theme control | Contrast AA | Bands | No JS |
|---|---|---|---|---|---|---|---|
| Claude Fable 5.1 | 136/136 | none | yes | pass | all pairs pass AA; dark frames pass (155 nodes) | 7 bands, full bleed, distinct grounds, text passes | pass |
| Astra | 136/136 | none | yes | pass | all pairs pass AA; dark frames pass (213 nodes) | 7 bands, full bleed, distinct grounds, text passes | pass |
| Kimi K3 | 136/136 | none | yes | pass | all pairs pass AA; dark frames pass (162 nodes) | 7 bands, full bleed, distinct grounds, text passes | pass |
| Google Stitch | 136/136 | none | yes | pass | all pairs pass AA; dark frames pass (196 nodes) | 7 bands, full bleed, distinct grounds, text passes | pass |
