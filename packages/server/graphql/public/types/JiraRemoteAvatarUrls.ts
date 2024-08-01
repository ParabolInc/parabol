import {JiraRemoteAvatarUrlsResolvers} from '../resolverTypes'

export type JiraRemoteAvatarUrlsSource = {
  '48x48': string
  '24x24': string
  '16x16': string
  '32x32': string
}

const JiraRemoteAvatarUrls: JiraRemoteAvatarUrlsResolvers = {
  x48: (source) => {
    return source['48x48']
  },

  x24: (source) => {
    return source['24x24']
  },

  x16: (source) => {
    return source['16x16']
  },

  x32: (source) => {
    return source['32x32']
  }
}

export default JiraRemoteAvatarUrls
