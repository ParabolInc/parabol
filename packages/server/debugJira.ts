// call with pnpm sucrase-node debugJira.ts
import '../../scripts/webpack/utils/dotenv'
import AtlassianServerManager from './utils/AtlassianServerManager'
import {Logger} from './utils/Logger'

const debugJira = async () => {
  // const cloudId = "foo"
  // const issueKey = 'foo'
  // const fieldId = 'customfield_10000'
  // const fieldName = 'Story Points'
  const refreshToken = 'foofoo'
  const res = await AtlassianServerManager.refresh(refreshToken)
  if (res instanceof Error) return
  const manager = new AtlassianServerManager(res.accessToken)
  const screens = await manager.getCloudNameLookup()
  Logger.log(JSON.stringify(screens))
}

debugJira()
