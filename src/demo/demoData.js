// Fictional data for the public demo: invented forests, plots and alerts,
// generated deterministically and dated relative to today so the charts are never empty.

const SPECIES = [
  { id: 1, name: 'Chêne', name_fr: 'Chêne' },
  { id: 2, name: 'Hêtre', name_fr: 'Hêtre' },
  { id: 3, name: 'Épicéa', name_fr: 'Épicéa' },
  { id: 4, name: 'Sapin pectiné', name_fr: 'Sapin pectiné' },
  { id: 5, name: 'Pin sylvestre', name_fr: 'Pin sylvestre' },
  { id: 6, name: 'Douglas', name_fr: 'Douglas' },
  { id: 7, name: 'Frêne', name_fr: 'Frêne' },
  { id: 8, name: 'Charme', name_fr: 'Charme' }
]

const FORESTS = [
  { id: '1', name: 'Forêt du Val Clair', center: [6.82, 48.21], type: 'Résineux', species: [3, 4, 6] },
  { id: '2', name: 'Massif des Hautes Fougères', center: [7.05, 48.02], type: 'Mixte', species: [2, 4, 3, 1] },
  { id: '3', name: 'Bois de la Roche Grise', center: [6.31, 48.62], type: 'Feuillus', species: [1, 2, 8, 7] },
  { id: '4', name: 'Forêt des Trois Sources', center: [5.92, 48.35], type: 'Feuillus', species: [1, 8, 5] }
]

const PLOT_NAMES = ['Combe aux Loups', 'Haut du Faing', 'Les Grands Prés', 'Côte Sainte-Anne', 'Bas des Roches',
  'Clairière du Moulin', 'Ravin de la Source', 'Plateau des Genêts', 'Fond de Belle-Vue']

// Small seeded PRNG (mulberry32) so every visitor sees the same demo
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = rng(2025)
const pick = arr => arr[Math.floor(rand() * arr.length)]

// Irregular polygon around a center, sizes in degrees
function blob([lon, lat], rx, ry, points = 14) {
  const ring = []
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2
    const k = 0.78 + rand() * 0.38
    ring.push([+(lon + Math.cos(a) * rx * k).toFixed(5), +(lat + Math.sin(a) * ry * k).toFixed(5)])
  }
  ring.push(ring[0])
  return { type: 'Polygon', coordinates: [ring] }
}

function rect([lon, lat], w, h) {
  const ring = [[lon, lat], [lon + w, lat], [lon + w, lat + h], [lon, lat + h], [lon, lat]]
    .map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)])
  return { type: 'Polygon', coordinates: [ring] }
}

const iso = d => d.toISOString()

function build() {
  const now = new Date()
  const forests = []
  const plots = []
  const events = []
  let plotSeq = 1
  let eventSeq = 1000

  FORESTS.forEach(f => {
    const plotCount = 6 + Math.floor(rand() * 3)
    const w = 0.022, h = 0.014
    const cols = 3
    const origin = [f.center[0] - (cols * w) / 2, f.center[1] - (Math.ceil(plotCount / cols) * h) / 2]
    let forestArea = 0

    for (let i = 0; i < plotCount; i++) {
      const c = i % cols, r = Math.floor(i / cols)
      const pw = w * (0.85 + rand() * 0.1), ph = h * (0.85 + rand() * 0.1)
      const corner = [origin[0] + c * w, origin[1] + r * h]
      const area = Math.round(pw * 74000 * ph * 111000) // m², rough at this latitude
      forestArea += area
      const sp = f.species.filter(() => rand() > 0.35)
      const plot = {
        id: `P${String(plotSeq++).padStart(3, '0')}`,
        forestId: f.id,
        name: PLOT_NAMES[i % PLOT_NAMES.length],
        forestType: f.type,
        area,
        species: sp.length ? sp : [f.species[0]],
        geom: rect(corner, pw, ph),
        createdAt: '2024-03-01T09:00:00Z',
        updatedAt: '2025-09-01T09:00:00Z'
      }
      plots.push(plot)

      // Alerts over the last 24 months, more frequent in summer (drought) and in conifer stands
      const intensity = f.type === 'Résineux' ? 6 : f.type === 'Mixte' ? 4 : 3
      const n = intensity + Math.floor(rand() * intensity)
      for (let k = 0; k < n; k++) {
        let daysAgo = Math.floor(rand() * 720)
        const d = new Date(now.getTime() - daysAgo * 864e5)
        const m = d.getMonth()
        if ((m < 4 || m > 9) && rand() > 0.45) continue
        const score = +(Math.min(0.98, 0.15 + rand() * 0.85)).toFixed(2)
        const severity = score > 0.7 ? 'high' : score > 0.4 ? 'medium' : 'low'
        const start = new Date(d.getTime() - 20 * 864e5)
        events.push({
          id: `A${eventSeq++}`,
          forestId: f.id,
          plotId: plot.id,
          eventTypeId: pick(['dieback', 'drought', 'bark-beetle', 'windthrow']),
          status: daysAgo > 120 && rand() > 0.3 ? 'Archived' : 'Active',
          severity,
          score,
          anomalieIndex: score,
          area: Math.round(400 + rand() * (severity === 'high' ? 18000 : 6000)),
          periodStart: iso(start),
          periodEnd: iso(d),
          createdAt: iso(d),
          confirmationDate: iso(new Date(d.getTime() + 864e5)),
          updatedAt: iso(d),
          geom: {
            type: 'Point',
            coordinates: [+(corner[0] + pw * (0.1 + rand() * 0.8)).toFixed(5), +(corner[1] + ph * (0.1 + rand() * 0.8)).toFixed(5)]
          }
        })
      }
    }

    forests.push({
      id: f.id,
      name: f.name,
      area: Math.round(forestArea * 1.6),
      bboxArea: Math.round(forestArea * 2),
      geom: blob(f.center, w * 2.2, h * 2.4),
      createdAt: '2024-01-15T09:00:00Z',
      updatedAt: '2025-09-01T09:00:00Z'
    })
  })

  return { forests, plots, events, species: SPECIES }
}

export const demoData = build()
