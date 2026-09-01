// A five-bucket histogram over one or two answers is close enough to a list of who said what, so a
// question with fewer than this many responses shows its average but not its shape.
export const MIN_SAFE_TEAM_HEALTH_RESPONSES = 4

// short enough to sit in a tooltip next to the marker
export const HIDDEN_SPREAD_TOOLTIP = 'Hidden to preserve anonymity'

// the long form, repeated as a footnote so the reason survives for anyone who never hovers
export const HIDDEN_SPREAD_FOOTNOTE = `Questions that received fewer than ${MIN_SAFE_TEAM_HEALTH_RESPONSES} responses hide individual scores to preserve anonymity. Their averages still count every answer.`
