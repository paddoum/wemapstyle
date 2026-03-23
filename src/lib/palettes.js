// Keyword-triggered map palettes for demo refinement flow

export const PALETTES = {
  warmEarth: {
    id: 'warmEarth',
    background: '#efebe6',
    water:       '#89b4cc',
    green:       '#a8c99a',
    roadPrimary: '#e0d8ce',
    roadCasing:  '#c8b9aa',
    roadMinor:   '#ede8e2',
    waterLabel:  '#4a7a9b',
    summary: {
      en: {
        headline: 'Refined.',
        bullets: ['Warm earthy tones maintained', 'Water: soft blue (#89b4cc)', 'Parks: muted sage green', 'Roads: de-emphasised'],
      },
      fr: {
        headline: 'Affiné.',
        bullets: ['Tons chauds et terreux maintenus', 'Eau : bleu doux (#89b4cc)', 'Parcs : vert sauge atténué', 'Routes : dé-accentuées'],
      },
    },
  },

  halloween: {
    id: 'halloween',
    background: '#1a0e06',
    water:       '#0a1520',
    green:       '#1e2d10',
    roadPrimary: '#8b3a00',
    roadCasing:  '#5c2600',
    roadMinor:   '#2d1800',
    waterLabel:  '#2d4a6a',
    summary: {
      en: {
        headline: 'Halloween palette applied.',
        bullets: ['Background: near-black (#1a0e06)', 'Roads: burnt orange (#8b3a00)', 'Parks: dark moss', 'Water: night black'],
      },
      fr: {
        headline: 'Palette Halloween appliquée.',
        bullets: ['Fond : quasi-noir (#1a0e06)', 'Routes : orange brûlé (#8b3a00)', 'Parcs : mousse sombre', 'Eau : noir nuit'],
      },
    },
  },

  night: {
    id: 'night',
    background: '#1a1a2e',
    water:       '#0d2137',
    green:       '#1a2e1a',
    roadPrimary: '#3d3d5c',
    roadCasing:  '#2d2d45',
    roadMinor:   '#252535',
    waterLabel:  '#3a6a8a',
    summary: {
      en: {
        headline: 'Night mode applied.',
        bullets: ['Background: deep navy (#1a1a2e)', 'Roads: dark slate', 'Water: midnight blue', 'All surfaces darkened'],
      },
      fr: {
        headline: 'Mode nuit appliqué.',
        bullets: ['Fond : marine profond (#1a1a2e)', 'Routes : ardoise sombre', 'Eau : bleu minuit', 'Toutes surfaces assombries'],
      },
    },
  },

  winter: {
    id: 'winter',
    background: '#e8f4f8',
    water:       '#a8d4e8',
    green:       '#c8dfc8',
    roadPrimary: '#d0e4ec',
    roadCasing:  '#b0c8d8',
    roadMinor:   '#e4eef4',
    waterLabel:  '#4a8aab',
    summary: {
      en: {
        headline: 'Winter palette applied.',
        bullets: ['Background: icy white (#e8f4f8)', 'Water: arctic blue', 'Roads: cool grey-blue', 'Parks: muted sage'],
      },
      fr: {
        headline: 'Palette hiver appliquée.',
        bullets: ['Fond : blanc givré (#e8f4f8)', 'Eau : bleu arctique', 'Routes : gris-bleu froid', 'Parcs : sauge atténué'],
      },
    },
  },

  desert: {
    id: 'desert',
    background: '#f5e6c8',
    water:       '#c8a060',
    green:       '#c8a850',
    roadPrimary: '#e8d090',
    roadCasing:  '#c8b070',
    roadMinor:   '#f0e4c0',
    waterLabel:  '#8a6030',
    summary: {
      en: {
        headline: 'Desert palette applied.',
        bullets: ['Background: warm sand (#f5e6c8)', 'Roads: golden ochre', 'Water: sandy brown', 'Parks: dry scrub'],
      },
      fr: {
        headline: 'Palette désert appliquée.',
        bullets: ['Fond : sable chaud (#f5e6c8)', 'Routes : ocre doré', 'Eau : brun sableux', 'Parcs : garrigue sèche'],
      },
    },
  },

  forest: {
    id: 'forest',
    background: '#d8f0d0',
    water:       '#70b8a8',
    green:       '#5a9e6e',
    roadPrimary: '#c0d8b0',
    roadCasing:  '#a0c090',
    roadMinor:   '#d8eccc',
    waterLabel:  '#3a7a6a',
    summary: {
      en: {
        headline: 'Forest palette applied.',
        bullets: ['Background: pale green (#d8f0d0)', 'Parks: deep forest green', 'Water: earthy teal', 'Roads: muted green-grey'],
      },
      fr: {
        headline: 'Palette forêt appliquée.',
        bullets: ['Fond : vert pâle (#d8f0d0)', 'Parcs : vert forêt profond', 'Eau : bleu-vert terreux', 'Routes : gris-vert atténué'],
      },
    },
  },

  ocean: {
    id: 'ocean',
    background: '#caf0f8',
    water:       '#0077b6',
    green:       '#52b788',
    roadPrimary: '#90e0ef',
    roadCasing:  '#70c8e0',
    roadMinor:   '#ade8f4',
    waterLabel:  '#0096c7',
    summary: {
      en: {
        headline: 'Ocean palette applied.',
        bullets: ['Background: seafoam (#caf0f8)', 'Water: deep ocean blue (#0077b6)', 'Roads: light aqua', 'Parks: tropical green'],
      },
      fr: {
        headline: 'Palette océan appliquée.',
        bullets: ['Fond : écume de mer (#caf0f8)', 'Eau : bleu océan (#0077b6)', 'Routes : aqua clair', 'Parcs : vert tropical'],
      },
    },
  },

  corporate: {
    id: 'corporate',
    background: '#f2f4f6',
    water:       '#2d6a9f',
    green:       '#7ab38a',
    roadPrimary: '#8a9ab0',
    roadCasing:  '#6a7a90',
    roadMinor:   '#c0cad8',
    waterLabel:  '#1a3a5c',
    summary: {
      en: {
        headline: 'Done — looks professional and ready to share.',
        bullets: [
          '✓ Clean visual hierarchy — content reads clearly at a glance',
          '✓ Professional blues — corporate without being cold',
          '✓ Board-ready tone — confident, not flashy',
          '· Core: deep navy #1a3a5c, corporate blue #2d6a9f, light grey #f2f4f6',
          '· Roads: muted mid-grey, hierarchy maintained',
        ],
      },
      fr: {
        headline: 'Terminé — professionnel et prêt à partager.',
        bullets: [
          '✓ Hiérarchie visuelle claire — se lit d\'un coup d\'œil',
          '✓ Bleus professionnels — corporate sans être froid',
          '✓ Ton board-ready — affirmé, sans ostentation',
          '· Noyau : marine #1a3a5c, bleu corporate #2d6a9f, gris clair #f2f4f6',
          '· Routes : gris moyen atténué, hiérarchie maintenue',
        ],
      },
    },
  },

  pastel: {
    id: 'pastel',
    background: '#fdf6f0',
    water:       '#b8d8e8',
    green:       '#c8e8c0',
    roadPrimary: '#f0e0d0',
    roadCasing:  '#e0c8b8',
    roadMinor:   '#f8f0e8',
    waterLabel:  '#7aa8c0',
    summary: {
      en: {
        headline: 'Pastel palette applied.',
        bullets: ['Background: soft cream (#fdf6f0)', 'Water: pale blue', 'Roads: peachy beige', 'Parks: light mint'],
      },
      fr: {
        headline: 'Palette pastel appliquée.',
        bullets: ['Fond : crème doux (#fdf6f0)', 'Eau : bleu pâle', 'Routes : beige pêche', 'Parcs : menthe légère'],
      },
    },
  },
}

// Keywords → palette (checked in order, first match wins)
const KEYWORD_MAP = [
  { regex: /corporate|professional|board|business|entreprise/i, palette: 'corporate' },
  { regex: /halloween|spooky|scary|horror|pumpkin/i,    palette: 'halloween' },
  { regex: /night|dark mode|darkmode|noir/i,            palette: 'night' },
  { regex: /dark|black/i,                               palette: 'night' },
  { regex: /winter|snow|cold|ice|frozen|neige/i,        palette: 'winter' },
  { regex: /desert|sahara|arid|sand|sable/i,            palette: 'desert' },
  { regex: /forest|jungle|wood|trees|forêt/i,           palette: 'forest' },
  { regex: /ocean|sea|marine|beach|mer/i,               palette: 'ocean' },
  { regex: /blue|bleu/i,                                palette: 'corporate' },
  { regex: /pastel|soft|gentle|doux/i,                  palette: 'pastel' },
  { regex: /warm|earth|earthy|chaud/i,                  palette: 'warmEarth' },
]

export function detectPalette(input) {
  for (const { regex, palette } of KEYWORD_MAP) {
    if (regex.test(input)) return PALETTES[palette]
  }
  return null
}
