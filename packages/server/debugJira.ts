// call with yarn sucrase-node debugJira.ts
import '../../scripts/webpack/utils/dotenv'
import AtlassianServerManager from './utils/AtlassianServerManager'

const debugJira = async () => {
  // const cloudId = "foo"
  // const issueKey = 'foo'
  // const fieldId = 'customfield_10000'
  // const fieldName = 'Story Points'
  const refreshToken = 'foofoo'
  const {accessToken} = await AtlassianServerManager.refresh(refreshToken)
  const manager = new AtlassianServerManager(accessToken)
  const screens = await manager.getCloudNameLookup()
  console.log(JSON.stringify(screens))
}

debugJira()
