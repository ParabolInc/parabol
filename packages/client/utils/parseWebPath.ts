import {upperFirst} from './upperFirst'

export const parseWebPath = (webPath: string) => {
  const [fullPath, issuesAndIid] = webPath.split('/-/') as [string, string]
  const [, iid] = issuesAndIid.split('/') as [string, string]
  const formattedFullPath = upperFirst(fullPath.slice(1))
  return {fullPath: formattedFullPath, iid}
}
