import {AnyAction, createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit'
import {Client4} from 'mattermost-redux/client'
import {getPluginServerRoute} from './selectors'

export const fetchLinkedTeamIds = createAsyncThunk(
  'linkedTeamIds/fetch',
  async (channel: string, thunkApi) => {
    const serverUrl = getPluginServerRoute(thunkApi.getState() as any)
    const res = await fetch(
      `${serverUrl}/linkedTeams/${channel}`,
      Client4.getOptions({method: 'GET'})
    )
    if (!res.ok) {
      throw new Error(`Failed to fetch linked teams: ${res.statusText}`)
    }
    const teamIds = await res.json()
    return {channel, teamIds}
  }
)

export const addTeamToChannel = createAsyncThunk(
  'linkedTeamIds/add',
  async ({channel, teamId}: {channel: string; teamId: string}, thunkApi) => {
    const serverUrl = getPluginServerRoute(thunkApi.getState() as any)
    const res = await fetch(
      `${serverUrl}/linkTeam/${channel}/${teamId}`,
      Client4.getOptions({method: 'POST'})
    )
    if (!res.ok) {
      throw new Error(`Failed to link team: ${res.statusText}`)
    }
    return {channel, teamId}
  }
)

export const removeTeamFromChannel = createAsyncThunk(
  'linkedTeamIds/remove',
  async ({channel, teamId}: {channel: string; teamId: string}, thunkApi) => {
    const serverUrl = getPluginServerRoute(thunkApi.getState() as any)
    const res = await fetch(
      `${serverUrl}/unlinkTeam/${channel}/${teamId}`,
      Client4.getOptions({method: 'POST'})
    )
    if (!res.ok) {
      throw new Error(`Failed to unlink team: ${res.statusText}`)
    }
    return {channel, teamId}
  }
)

const localSlice = createSlice({
  name: 'local',
  initialState: {
    isStartActivityModalVisible: false,
    isCreateTaskModalVisible: false,
    pushPostAsReflection: null as string | null,
    isLinkTeamModalVisible: false,
    linkedTeamIds: {} as Record<string, {loading: boolean; teamIds: string[]}>
  },
  reducers: {
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
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchLinkedTeamIds.pending, (state, action) => {
      const channel = action.meta.arg
      state.linkedTeamIds[channel] = {
        loading: true,
        teamIds: state.linkedTeamIds[channel]?.teamIds ?? []
      }
    })
    builder.addCase(fetchLinkedTeamIds.fulfilled, (state, action) => {
      const {channel, teamIds} = action.payload
      state.linkedTeamIds[channel] = {loading: false, teamIds}
    })
    builder.addCase(fetchLinkedTeamIds.rejected, (state, action) => {
      const channel = action.meta.arg
      state.linkedTeamIds[channel] = {
        loading: false,
        teamIds: state.linkedTeamIds[channel]?.teamIds ?? []
      }
    })

    builder.addCase(addTeamToChannel.fulfilled, (state, action) => {
      const {channel, teamId} = action.payload
      const teamIds = state.linkedTeamIds[channel]?.teamIds ?? []
      teamIds.push(teamId)
      state.linkedTeamIds[channel] = {loading: false, teamIds}
    })

    builder.addCase(removeTeamFromChannel.fulfilled, (state, action) => {
      const {channel, teamId} = action.payload
      const oldTeamIds = state.linkedTeamIds[channel]?.teamIds ?? []
      state.linkedTeamIds[channel] = {
        loading: false,
        teamIds: oldTeamIds.filter((id) => id !== teamId)
      }
    })
  }
})

export const {
  openStartActivityModal,
  closeStartActivityModal,
  openCreateTaskModal,
  closeCreateTaskModal,
  openPushPostAsReflection,
  closePushPostAsReflection,
  openLinkTeamModal,
  closeLinkTeamModal
} = localSlice.actions

export type PluginState = ReturnType<typeof localSlice.reducer>

const rootReducer = (state: PluginState, action: AnyAction) => {
  const localState = localSlice.reducer(state, action)
  return {
    ...localState
  }
}
export default rootReducer
