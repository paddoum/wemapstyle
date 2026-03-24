export function buildGeneratePrompt(userPrompt) {
  return `You are a map style designer for MapLibre GL JS.

The user wants a map with this style: "${userPrompt}"

Return ONLY a JSON object with these exact keys — no explanation, no markdown:
{
  "background": "#hex",
  "water": "#hex",
  "green": "#hex",
  "roadPrimary": "#hex",
  "roadCasing": "#hex",
  "roadMinor": "#hex",
  "waterLabel": "#hex",
  "labelOpacity": 1,
  "summary": {
    "headline": "Done — [one sentence outcome].",
    "bullets": [
      "[color decision 1 with hex]",
      "[color decision 2 with hex]",
      "[color decision 3 with hex]",
      "[color decision 4 with hex]"
    ]
  }
}

Rules:
- Colors must be valid hex values
- roadCasing should be a darker shade of roadPrimary
- waterLabel should be legible on the water color
- labelOpacity: 0 = no labels, 0.5 = faded labels, 1 = full labels (default 1)
- summary.headline must start with "Done — "
- bullets describe the actual color choices made`
}

export function buildRefinePrompt(userPrompt, currentPalette, refinementPrompt) {
  return `You are a map style designer for MapLibre GL JS.

The user previously requested: "${userPrompt}"

The current map palette is:
${JSON.stringify(currentPalette, null, 2)}

The user now wants to refine it: "${refinementPrompt}"

Return ONLY a JSON object with these exact keys — no explanation, no markdown:
{
  "background": "#hex",
  "water": "#hex",
  "green": "#hex",
  "roadPrimary": "#hex",
  "roadCasing": "#hex",
  "roadMinor": "#hex",
  "waterLabel": "#hex",
  "labelOpacity": 1,
  "summary": {
    "headline": "Done — [one sentence describing the change].",
    "bullets": [
      "[what changed and why, with hex]",
      "[what changed and why, with hex]",
      "[what stayed the same and why]",
      "[overall effect of the change]"
    ]
  }
}

Rules:
- Colors must be valid hex values
- roadCasing should be a darker shade of roadPrimary
- waterLabel should be legible on the water color
- labelOpacity: 0 = no labels, 0.5 = faded labels, 1 = full labels (default 1)
- summary.headline must start with "Done — "
- Only change what the refinement prompt calls for; keep other values stable`
}
