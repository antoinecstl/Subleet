// Design tokens for Subleet.
// Subleet identity: technical studio with a warm editorial edge.
// Warm paper palette, sharp ember accent, refined type system.

export const COLORS = {
  ember: '#d97706',
  emberHot: '#b45309',
  emberSoft: 'rgba(217,119,6,0.10)',
  emberLine: 'rgba(217,119,6,0.32)',

  ink: '#2a1f17',
  inkSoft: 'rgba(42,31,23,0.62)',
  inkMuted: 'rgba(42,31,23,0.42)',
  inkFaint: 'rgba(42,31,23,0.14)',
  inkHair: 'rgba(42,31,23,0.08)',

  paper: '#ecdfcb',
  paperWarm: '#e6d6bd',
  paperDeep: '#d8c5a6',

  noir: '#1a120a',
  noirSoft: '#241a10',
} as const

// Legacy aliases for compatibility with existing pages
export const ACCENT = COLORS.ember

export const FONT_DISPLAY = 'var(--font-display), Georgia, serif'
export const FONT_MONO = 'var(--font-mono), ui-monospace, monospace'
export const FONT_BODY = 'var(--font-body), system-ui, sans-serif'

// Back-compat — old variable names used elsewhere in the project
export const FONT_POPPINS = FONT_DISPLAY
export const FONT_DM_SANS = FONT_BODY
