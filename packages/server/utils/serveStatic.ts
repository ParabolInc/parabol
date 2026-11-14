import type {HttpRequest, HttpResponse} from 'uWebSockets.js'
import path from 'path'
import getProjectRoot from '../../../scripts/webpack/utils/getProjectRoot'
import {applyEnvVarsToClientAssets, CLIENT_ASSET_SKELETONS} from './applyEnvVarsToClientAssets'
import StaticServer, {readStaticRequest, sendStaticFile} from './StaticServer'

const PROJECT_ROOT = getProjectRoot()

const staticServer = new StaticServer(
  __PRODUCTION__
    ? {
        roots: [
          {
            dirname: path.join(PROJECT_ROOT, 'build'),
            exclude: (name) => CLIENT_ASSET_SKELETONS.has(name)
          },
          // the server's own assets, e.g. template illustrations. The rest of /dist is the server itself
          {dirname: path.join(PROJECT_ROOT, 'dist', 'images'), prefix: 'images/'}
        ],
        // sw.js, manifest.json & the like are made in memory from the env vars
        files: applyEnvVarsToClientAssets()
      }
    : // the dev server makes its own sw.js & the like, & the server's assets are at the root of /dev
      {
        roots: [
          {dirname: path.join(PROJECT_ROOT, 'build')},
          {dirname: path.join(PROJECT_ROOT, 'dev')}
        ]
      }
)

const serveStatic = (res: HttpResponse, req: HttpRequest, fileName: string) => {
  const file = staticServer.get(fileName)
  if (!file) return false
  sendStaticFile(res, readStaticRequest(req), file)
  return true
}

export default serveStatic
