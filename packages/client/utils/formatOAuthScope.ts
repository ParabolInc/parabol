const formatOAuthScope = (scope: string) => {
  const parts = scope.toLowerCase().split('_')
  const action = parts[parts.length - 1]
  const resource = parts.slice(0, -1).join('_')
  return `${resource}:${action}`
}

export default formatOAuthScope
