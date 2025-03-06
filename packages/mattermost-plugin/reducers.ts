import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Client4} from 'mattermost-redux/client'
import {getPluginServerRoute} from './selectors'

export type Command = {
  trigger: string
  description: string
}

export type ClientConfig = {
  commands: Command[]
}

export const connect = createAsyncThunk('connect', async (config: ClientConfig, thunkApi) => {
  const serverUrl = getPluginServerRoute(thunkApi.getState() as any)
  const res = await fetch(
    `${serverUrl}/connect`,
    Client4.getOptions({
      method: 'POST',
      body: JSON.stringify(config)
    })
  )
  if (!res.ok) {
    throw new Error(`Failed to initialize commands: ${res.statusText}`)
  }
  return
})

const localSlice = createSlice({
  name: 'local',
  initialState: {
    authToken: null as string | null,
    isStartActivityModalVisible: false,
    isCreateTaskModalVisible: false,
    isInviteToTeamModalVisible: false,
    isInviteToMeetingModalVisible: false,
    pushPostAsReflection: null as string | null,
    isLinkTeamModalVisible: false,
    configureNotificationsTeam: null as string | null,
    linkedTeamIds: {} as Record<string, {loading: boolean; teamIds: string[]}>
  },
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.authToken = action.payload
    },
    logout: (state) => {
      state.authToken = null
    },
    openStartActivityModal: (state) => {
      state.isStartActivityModalVisible = true
    },
    closeStartActivityModal: (state) => {
      state.isStartActivityModalVisible = false
    },
    openCreateTaskModal: (state) => {
      state.isCreateTaskModalVisible = true
    },
    closeCreateTaskModal: (state) => {
      state.isCreateTaskModalVisible = false
    },
    openInviteToTeamModal: (state) => {
      state.isInviteToTeamModalVisible = true
    },
    closeInviteToTeamModal: (state) => {
      state.isInviteToTeamModalVisible = false
    },
    openInviteToMeetingModal: (state) => {
      state.isInviteToMeetingModalVisible = true
    },
    closeInviteToMeetingModal: (state) => {
      state.isInviteToMeetingModalVisible = false
    },
    openPushPostAsReflection: (state, action: PayloadAction<string>) => {
      state.pushPostAsReflection = action.payload
    },
    closePushPostAsReflection: (state) => {
      state.pushPostAsReflection = null
    },
    openLinkTeamModal: (state) => {
      state.isLinkTeamModalVisible = true
    },
    closeLinkTeamModal: (state) => {
      state.isLinkTeamModalVisible = false
    },
    openConfigureNotificationsModal: (state, action: PayloadAction<string>) => {
      state.configureNotificationsTeam = action.payload
    },
    closeConfigureNotificationsModal: (state) => {
      state.configureNotificationsTeam = null
    }
  }
})

export const {
  login,
  logout,
  openStartActivityModal,
  closeStartActivityModal,
  openCreateTaskModal,
  closeCreateTaskModal,
  openInviteToTeamModal,
  closeInviteToTeamModal,
  openInviteToMeetingModal,
  closeInviteToMeetingModal,
  openPushPostAsReflection,
  closePushPostAsReflection,
  openLinkTeamModal,
  closeLinkTeamModal,
  openConfigureNotificationsModal,
  closeConfigureNotificationsModal
} = localSlice.actions

export type PluginState = ReturnType<typeof localSlice.reducer>

export default localSlice.reducer
