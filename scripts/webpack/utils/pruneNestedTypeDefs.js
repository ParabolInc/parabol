const fs = require('fs')
const path = require('path')
const getProjectRoot = require('./getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const SERVER_ROOT = path.join(PROJECT_ROOT, 'packages', 'server')

// each nested endpoint's prefix & SDL, as nestGitHub, nestGitLab & nestLinear set them up.
// The server prunes an endpoint missing here when it starts
const ENDPOINT_SDL_PATHS = {
  _xGitHub: 'utils/githubSchema.graphql',
  _xGitLab: 'graphql/nestedSchema/GitLab/gitlabSchema.graphql',
  _xLinear: 'graphql/nestedSchema/Linear/linearSchema.graphql'
}

// Each endpoint's types pruned to the usage, so the server doesn't parse every endpoint's whole SDL when it starts.
// Like the server, it keeps the fields of the interfaces that Parabol's own nested types implement
const pruneNestedTypeDefs = (usage) => {
  const resolveFromServer = (name) => require(require.resolve(name, {paths: [SERVER_ROOT]}))
  const {isInterfaceType, isObjectType, print} = resolveFromServer('graphql')
  const {mergeSchemas} = resolveFromServer('@graphql-tools/schema')
  const {mergeNestedUsage, nestGraphQLEndpoint} = resolveFromServer('nest-graphql-endpoint')

  const typeDefsDir = path.join(SERVER_ROOT, 'graphql', 'public', 'typeDefs')
  const parabolTypeDefs = mergeSchemas({
    typeDefs: fs
      .readdirSync(typeDefsDir)
      .filter((name) => name.endsWith('.graphql'))
      .map((name) => fs.readFileSync(path.join(typeDefsDir, name), 'utf8'))
  })
  const interfaceUsage = {}
  Object.values(parabolTypeDefs.getTypeMap()).forEach((type) => {
    if (!type.name.startsWith('_x') || !(isObjectType(type) || isInterfaceType(type))) return
    interfaceUsage[type.name] = type
      .getInterfaces()
      .flatMap((iface) => Object.keys(iface.getFields()))
  })
  const endpointUsage = mergeNestedUsage(usage, interfaceUsage)

  return Object.fromEntries(
    Object.entries(ENDPOINT_SDL_PATHS).map(([prefix, sdlPath]) => {
      // getTypeDefs only needs the prefix & SDL
      const endpoint = nestGraphQLEndpoint({
        prefix,
        schemaIDL: fs.readFileSync(path.join(SERVER_ROOT, sdlPath), 'utf8')
      })
      return [prefix, print(endpoint.getTypeDefs(endpointUsage))]
    })
  )
}

module.exports = pruneNestedTypeDefs
