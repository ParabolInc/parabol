import {upperFirst} from './upperFirst'

export const parseWebUrl = (webUrl: string) => {
  const [projectUrl, issuesAndIid] = webUrl.split('/-/') as [string, string]
  const fullPath = projectUrl.split('https://gitlab.com/')[1] as string
  const [, iid] = issuesAndIid.split('/') as [string, string]
  const formattedFullPath = upperFirst(fullPath)
  return {fullPath: formattedFullPath, iid}
}
