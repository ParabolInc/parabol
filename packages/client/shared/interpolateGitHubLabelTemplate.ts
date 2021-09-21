import interpolateMustache from './interpolateMustache'

const interpolateGitHubLabelTemplate = (labelTemplate: string, score?: string | null) => {
  return interpolateMustache(labelTemplate, {
    '#': score ?? '#'
  })
}

export default interpolateGitHubLabelTemplate
