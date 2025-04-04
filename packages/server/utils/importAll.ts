import path from 'path'
import '../types/webpackEnv'

const importAll = (context: __WebpackModuleApi.RequireContext) => {
  const collector = {} as Record<string, any>
  context.keys().forEach((relativePath) => {
    const {name} = path.parse(relativePath)
    collector[name] = context(relativePath).default
  })
  return collector
}

export default importAll
