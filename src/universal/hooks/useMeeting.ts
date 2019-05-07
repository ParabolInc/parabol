import {useMeetingTeam} from '__generated__/useMeetingTeam.graphql'
import {useCallback, useEffect, useRef} from 'react'
import {commitLocalUpdate, graphql} from 'react-relay'
import {Omit} from 'types/generics'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useDocumentTitle from 'universal/hooks/useDocumentTitle'
import useForceUpdate from 'universal/hooks/useForceUpdate'
import useHotkey from 'universal/hooks/useHotkey'
import useMeetingLocalState from 'universal/hooks/useMeetingLocalState'
import useSwarm from 'universal/hooks/useSwarm'
import {demoTeamId} from 'universal/modules/demo/initDB'
import LocalAtmosphere from 'universal/modules/demo/LocalAtmosphere'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import NavigateMeetingMutation from 'universal/mutations/NavigateMeetingMutation'
import {INavigateMeetingOnMutationArguments, MeetingTypeEnum} from 'universal/types/graphql'
import findStageAfterId from 'universal/utils/meetings/findStageAfterId'
import findStageBeforeId from 'universal/utils/meetings/findStageBeforeId'
import findStageById from 'universal/utils/meetings/findStageById'
import handleHotkey from 'universal/utils/meetings/handleHotkey'
import isForwardProgress from 'universal/utils/meetings/isForwardProgress'
import {meetingTypeToLabel} from 'universal/utils/meetings/lookups'
import UNSTARTED_MEETING from 'universal/utils/meetings/unstartedMeeting'
import updateLocalStage from 'universal/utils/relay/updateLocalStage'
import {useMeetingLocalStateTeam} from '__generated__/useMeetingLocalStateTeam.graphql'

export const useDemoMeeting = () => {
  const atmosphere = useAtmosphere()
  const forceUpdate = useForceUpdate()
  useEffect(() => {
    const {clientGraphQLServer} = (atmosphere as unknown) as LocalAtmosphere
    if (clientGraphQLServer) {
      clientGraphQLServer.on('botsFinished', () => {
        // for the demo, we're essentially using the isBotFinished() prop as state
        forceUpdate()
      })
    }
  }, [])
}

export const useEndMeetingHotkey = (meetingId: string) => {
  const atmosphere = useAtmosphere()
  const endMeeting = useCallback(
    handleHotkey(() => {
      EndNewMeetingMutation(atmosphere, {meetingId}, {history})
    }),
    []
  )
  useHotkey('i c a n t h a c k i t', endMeeting)
}

graphql`
  fragment useMeetingGotoStageIdTeam on Team {
    id
    newMeeting {
      id
      facilitatorStageId
      facilitatorUserId
      localStage {
        id
      }
      phases {
        stages {
          id
          isComplete
          isNavigable
          isNavigableByFacilitator
        }
      }
    }
  }
`

export const useGotoStageId = (team: Team | null) => {
  const atmosphere = useAtmosphere()
  return useCallback(
    async (stageId: string) => {
      if (!team) return
      const {newMeeting, id: teamId} = team
      if (!newMeeting) return
      const {facilitatorStageId, facilitatorUserId, id: meetingId, phases} = newMeeting
      const {viewerId} = atmosphere
      const isViewerFacilitator = viewerId === facilitatorUserId
      const res = findStageById(phases, stageId)
      if (!res) return
      const {stage} = res
      const {isNavigable, isNavigableByFacilitator} = stage
      const canNavigate = isViewerFacilitator ? isNavigableByFacilitator : isNavigable
      if (!canNavigate) return
      if (teamId === demoTeamId) {
        await ((atmosphere as any) as LocalAtmosphere).clientGraphQLServer.finishBotActions()
      }
      updateLocalStage(atmosphere, meetingId, stageId)
      if (isViewerFacilitator && isNavigableByFacilitator) {
        const res = findStageById(phases, facilitatorStageId)
        if (!res) return
        const {stage} = res
        const {isComplete} = stage
        const variables = {
          meetingId,
          facilitatorStageId: stageId
        } as INavigateMeetingOnMutationArguments
        if (!isComplete && isForwardProgress(phases, facilitatorStageId, stageId)) {
          variables.completedStageId = facilitatorStageId
        }
        NavigateMeetingMutation(atmosphere, variables)
      }
    },
    [team]
  )
}

export const useGotoNext = (team: Team | null, gotoStageId: ReturnType<typeof useGotoStageId>) => {
  const ref = useRef<HTMLElement>(null)
  const handleGotoNext = useRef<{
    gotoNext: (options?: {isHotkey?: boolean}) => void
    ref: typeof ref
  }>({
    gotoNext: () => {
      /**/
    },
    ref
  })
  useEffect(() => {
    handleGotoNext.current.gotoNext = (options: {isHotkey?: boolean} = {}) => {
      const {newMeeting} = team!
      if (!newMeeting) return
      const {localStage, phases} = newMeeting
      const {id: localStageId} = localStage
      const currentStageRes = findStageById(phases, localStageId)
      const nextStageRes = findStageAfterId(phases, localStageId)
      if (!nextStageRes || !currentStageRes) return
      const {
        stage: {id: nextStageId}
      } = nextStageRes
      if (!options.isHotkey || currentStageRes.stage.isComplete) {
        gotoStageId(nextStageId).catch()
      } else if (options.isHotkey) {
        const {ref} = handleGotoNext.current
        ref.current && ref.current.focus()
      }
    }
  }, [gotoStageId, team])
  return handleGotoNext
}

export const useGotoNextHotkey = (
  gotoNext: ReturnType<typeof useGotoNext>['current']['gotoNext']
) => {
  const latestHandler = useRef<typeof gotoNext>()
  useEffect(() => {
    latestHandler.current = gotoNext
  }, [gotoNext])

  const cb = useCallback(
    handleHotkey(() => {
      latestHandler.current && latestHandler.current({isHotkey: true})
    }),
    []
  )
  useHotkey('right', cb)
}

export const useGotoPrevHotkey = (
  team: Team | null,
  gotoStageId: ReturnType<typeof useGotoStageId>
) => {
  const gotoPrev = useGotoPrev(team, gotoStageId)
  const latestHandler = useRef<typeof gotoPrev>()
  useEffect(() => {
    latestHandler.current = gotoPrev
  }, [gotoPrev])
  const cb = useCallback(
    handleHotkey(() => {
      latestHandler.current && latestHandler.current()
    }),
    []
  )
  useHotkey('left', cb)
}

export const useGotoPrev = (team: Team | null, gotoStageId: ReturnType<typeof useGotoStageId>) => {
  return useCallback(() => {
    const {newMeeting} = team!
    if (!newMeeting) return
    const {
      localStage: {id: localStageId},
      phases
    } = newMeeting
    const nextStageRes = findStageBeforeId(phases, localStageId)
    if (!nextStageRes) return
    const {
      stage: {id: nextStageId}
    } = nextStageRes
    gotoStageId(nextStageId).catch()
  }, [gotoStageId, team])
}

export const useToggleSidebar = (teamId: string, isMeetingSidebarCollapsed: boolean) => {
  const atmosphere = useAtmosphere()
  return useCallback(() => {
    commitLocalUpdate(atmosphere, (store) => {
      store.get(teamId)!.setValue(!isMeetingSidebarCollapsed, 'isMeetingSidebarCollapsed')
    })
  }, [teamId, isMeetingSidebarCollapsed])
}

export const DEFAULT_TEAM = {
  id: '',
  isMeetingSidebarCollapsed: false,
  name: '',
  newMeeting: null
}

graphql`
  fragment useMeetingTeam on Team {
    id
    isMeetingSidebarCollapsed
    name
    ...useMeetingLocalStateTeam @relay(mask: false)
    ...useMeetingGotoStageIdTeam @relay(mask: false)
  }
`

type Team = Omit<useMeetingTeam, ' $refType'>
const useMeeting = (meetingType: MeetingTypeEnum, team: Team | null) => {
  const {name: teamName, newMeeting} = team || DEFAULT_TEAM
  const {id: meetingId} = newMeeting || UNSTARTED_MEETING
  const gotoStageId = useGotoStageId(team)
  const handleGotoNext = useGotoNext(team, gotoStageId)
  const safeRoute = useMeetingLocalState((team as unknown) as useMeetingLocalStateTeam)
  useEndMeetingHotkey(meetingId)
  useGotoNextHotkey(handleGotoNext.current.gotoNext)
  useGotoPrevHotkey(team, gotoStageId)
  useDemoMeeting()
  useDocumentTitle(`${meetingTypeToLabel[meetingType]} Meeting | ${teamName}`)
  const teamId = team ? team.id : ''
  const isMeetingSidebarCollapsed = team ? team.isMeetingSidebarCollapsed : false
  const toggleSidebar = useToggleSidebar(teamId, !!isMeetingSidebarCollapsed)
  const {streams, swarm} = useSwarm(teamId)
  return {handleGotoNext, gotoStageId, safeRoute, toggleSidebar, streams, swarm}
}

export default useMeeting
