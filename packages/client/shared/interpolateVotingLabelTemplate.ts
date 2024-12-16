import interpolateMustache from './interpolateMustache'

const interpolateVotingLabelTemplate = (labelTemplate: string, score?: string | null) => {
  const rawLabel = interpolateMustache(labelTemplate, {
    '#': score ?? '#'
  })
  // in some future use case we may not want to trim whitespace for all mustache templates.
  // but GH does that automatically, so we should, too
  return rawLabel.trim()
}

export default interpolateVotingLabelTemplate
