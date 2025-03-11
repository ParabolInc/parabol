import {getConfig} from 'mattermost-redux/selectors/entities/general'
import {getCurrentTeam} from 'mattermost-redux/selectors/entities/teams'

import {GlobalState} from 'mattermost-redux/types/store'

import manifest from './manifest'

import {PluginState} from './reducers'

const {id} = manifest

export const getSiteURL = (state: GlobalState) => {
  const config = getConfig(state)
  return config?.SiteURL ?? ''
}

export const getCurrentTeamURL = (state: GlobalState) => {
  const siteURL = getSiteURL(state)
  const team = getCurrentTeam(state)
  return `${siteURL}/${team?.name ?? ''}`
}

export const getPostURL = (state: GlobalState, postId: string) => {
  const teamURL = getCurrentTeamURL(state)
  return `${teamURL}/pl/${postId}`
}

export const getPluginRoot = (state: GlobalState) => {
  const config = getConfig(state)
  const siteURL = config?.SiteURL ?? ''
  return `${siteURL}/plugins/${id}`
}

export const getPluginServerRoute = (state: GlobalState) => {
  let basePath = ''
  const config = getConfig(state)
  const siteURL = config?.SiteURL ?? ''
  if (siteURL) {
    basePath = new URL(siteURL).pathname

    if (basePath && basePath[basePath.length - 1] === '/') {
      basePath = basePath.substr(0, basePath.length - 1)
    }
  }

  return `${basePath}/plugins/${id}`
}

export const getParabolUrl = (state: GlobalState) => {
  const siteURL = getPluginRoot(state)
  return `${siteURL}/parabol`
}

export const getAssetsUrl = (state: GlobalState) => {
  const siteURL = getPluginRoot(state)
  return `${siteURL}/public`
}

export const getPluginState = (state: GlobalState) =>
  ((state as any)[`plugins-${id}`] ?? {}) as PluginState

export const authToken = (state: GlobalState) => getPluginState(state).authToken
export const isAuthorized = (state: GlobalState) => !!authToken(state)

export const isStartActivityModalVisible = (state: GlobalState) =>
  getPluginState(state).isStartActivityModalVisible

export const isCreateTaskModalVisible = (state: GlobalState) =>
  getPluginState(state).isCreateTaskModalVisible

export const isInviteToTeamModalVisible = (state: GlobalState) =>
  getPluginState(state).isInviteToTeamModalVisible

export const isInviteToMeetingModalVisible = (state: GlobalState) =>
  getPluginState(state).isInviteToMeetingModalVisible

export const isLinkTeamModalVisible = (state: GlobalState) =>
  getPluginState(state).isLinkTeamModalVisible

export const isConfigureNotificationsModalVisible = (state: GlobalState) =>
  getPluginState(state).configureNotificationsTeam !== null

export const configureNotificationsModalTeam = (state: GlobalState) =>
  getPluginState(state).configureNotificationsTeam || null

export const pushPostAsReflection = (state: GlobalState) =>
  getPluginState(state).pushPostAsReflection

//e
