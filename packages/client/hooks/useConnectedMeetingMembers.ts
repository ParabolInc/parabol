import {HocuspocusProvider} from '@hocuspocus/provider'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import MeetingMemberId from '../shared/gqlIds/MeetingMemberId'
import {providerManager} from '../tiptap/providerManager'
import {isNotNull} from '../utils/predicates'
import useAtmosphere from './useAtmosphere'

export const useConnectedMeetingMembers = (meetingId: string | null, addViewer: boolean) => {
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const oldUserIdsRef = useRef<Set<string>>(new Set())
  const providerRef = useRef<HocuspocusProvider>()

  useEffect(() => {
    if (!meetingId) return
    // viewer joins room
    const room = `meeting:${meetingId}`
    const provider = providerManager.register(room)
    providerRef.current = provider
    const setConnectedUserIdsThunk = () => {
      const states = provider.awareness?.getStates()
      if (!states) return
      const nextUserIds = new Set(
        Array.from(states.entries())
          .map(([_clientId, obj]) => {
            if (!obj.userId) return null
            return obj.userId as string
          })
          .filter(isNotNull)
      )
      // Update Relay
      const oldUserIds = oldUserIdsRef.current
      const add = [...nextUserIds].filter((userId) => !oldUserIds.has(userId))
      const remove = [...oldUserIds].filter((userId) => !nextUserIds.has(userId))
      if (add.length || remove.length) {
        commitLocalUpdate(atmosphere, (store) => {
          add.forEach((userId) => {
            const meetingMember = store.get(MeetingMemberId.join(meetingId, userId))
            if (meetingMember) {
              meetingMember.setValue(new Date().toJSON(), 'isConnectedAt')
              oldUserIds.add(userId)
            }
          })
          remove.forEach((userId) => {
            const meetingMember = store.get(MeetingMemberId.join(meetingId, userId))
            if (meetingMember) {
              meetingMember.setValue(undefined, 'isConnectedAt')
              oldUserIds.delete(userId)
            }
          })
        })
      }
    }
    provider.awareness?.on('update', setConnectedUserIdsThunk)

    // initialize
    setConnectedUserIdsThunk()

    return () => {
      provider.awareness?.off('update', setConnectedUserIdsThunk)
      // when going from meeting to team dash, it takes awhile before MeetingCard calls this hook
      // make sure we don't unregister until then
      providerManager.unregister(room, 2000)
    }
  }, [meetingId])

  useEffect(() => {
    if (!meetingId) return
    const awareness = providerRef.current?.awareness
    if (!awareness) return
    if (addViewer) {
      const localState = awareness.getLocalState()
      if (!localState || !localState.userId) {
        awareness.setLocalStateField('userId', viewerId)
      }
    }
    return () => {
      if (addViewer) {
        awareness.setLocalStateField('userId', null)
        commitLocalUpdate(atmosphere, (store) => {
          const meetingMember = store.get(MeetingMemberId.join(meetingId, viewerId))
          meetingMember?.setValue(undefined, 'isConnectedAt')
        })
      }
    }
  }, [addViewer, meetingId])
}
