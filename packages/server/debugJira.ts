// call with node --env-file .env -r sucrase/register packages/server/debugJira.ts
import AtlassianServerManager from './utils/AtlassianServerManager'

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
  console.log(JSON.stringify(screens))
}

debugJira()
