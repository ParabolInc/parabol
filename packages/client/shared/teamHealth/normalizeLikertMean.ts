// A 1-5 Likert mean mapped onto the 0-100 scale every Team Health surface reports. Shared by the
// server rollup and the client so the result phase, the summary page, the summary email, and
// Reporting can never disagree about what a category scored.
export const normalizeLikertMean = (mean: number) => Math.round(((mean - 1) / 4) * 100)
