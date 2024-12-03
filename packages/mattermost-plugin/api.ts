import {BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError} from '@reduxjs/toolkit/query/react'

import {Client4} from 'mattermost-redux/client'

import manifest from './manifest'

import {getPluginServerRoute} from './selectors'

const {id} = manifest

const joinUrl = (baseUrl: string, url: string) => {
  if (url.startsWith('/')) {
    return `${baseUrl}${url}`
  }
  return url
}

const rawBaseQuery = fetchBaseQuery({})

const baseQuery: BaseQueryFn<
string | FetchArgs,
unknown,
FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const baseUrl = getPluginServerRoute(api.getState() as any)
  const adjustedArgs =
    typeof args === 'string' ? {
      url: joinUrl(baseUrl, args),
    } : {
      ...args,
      url: joinUrl(baseUrl, args.url),
    }
  return rawBaseQuery(Client4.getOptions(adjustedArgs as any) as any, api, extraOptions)
}

export const api = createApi({
  reducerPath: `plugins-${id}`,
  baseQuery,
  tagTypes: ['Teams', 'MeetingTemplates', 'MeetingSettings', 'Meetings'],
  endpoints: (builder) => ({
    linkedTeams: builder.query<string[], {channelId: string}>({
      query: ({channelId}) => ({
        url: `/linkedTeams/${channelId}`,
        method: 'GET',
      }),
      providesTags: ['Teams'],
    }),
    linkTeam: builder.mutation<void, {channelId: string, teamId: string}>({
      query: ({channelId, teamId}) => ({
        url: `/linkTeam/${channelId}/${teamId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Teams'],
    }),
    unlinkTeam: builder.mutation<void, {channelId: string, teamId: string}>({
      query: ({channelId, teamId}) => ({
        url: `/unlinkTeam/${channelId}/${teamId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Teams'],
    }),
    config: builder.query<{parabolURL: string}, void>({
      query: () => ({
        url: '/config',
        method: 'GET',
      }),
    }),
  }),
})

export const isError = (result: any): result is {error: Error} => {
  return 'error' in result && result.error instanceof Object
}

export const {
  useLinkedTeamsQuery,
  useLinkTeamMutation,
  useUnlinkTeamMutation,
  useConfigQuery,
} = api
