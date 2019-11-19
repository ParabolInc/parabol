import {matchPath} from 'react-router'

const isLegacyMeetingPath = () => {
  const matchRes = matchPath<{meetingSlug: string; teamId: string}>(window.location.pathname, {
    path: '/:meetingSlug/:teamId'
  })
  if (!matchRes) return false
  const {params} = matchRes
  const {meetingSlug} = params
  if (meetingSlug === 'retro' || meetingSlug === 'meeting') return meetingSlug
  return false
}

export default isLegacyMeetingPath
