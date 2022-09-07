import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {ReactNode, RefObject, useMemo, useRef} from 'react'
import {useTranslation} from 'react-i18next'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useCoverable} from '~/hooks/useControlBarCovers'
import {Breakpoint, DiscussionThreadEnum, MeetingControlBarEnum} from '~/types/constEnums'
import {Elevation} from '../styles/elevation'
import makeMinWidthMediaQuery from '../utils/makeMinWidthMediaQuery'
import {DiscussionThreadQuery} from '../__generated__/DiscussionThreadQuery.graphql'
import DiscussionThreadInput from './DiscussionThreadInput'
import DiscussionThreadList, {DiscussionThreadables} from './DiscussionThreadList'
import {isLocalPoll} from './Poll/local/newPoll'

const Wrapper = styled('div')<{isExpanded: boolean; width?: string}>(({isExpanded, width}) => ({
  background: '#fff',
  borderRadius: 4,
  boxShadow: Elevation.DISCUSSION_THREAD,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
  overflow: 'hidden',
  width: width || '100%',
  [makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)]: {
    height: isExpanded ? '100%' : `calc(100% - ${MeetingControlBarEnum.HEIGHT}px)`,
    width: DiscussionThreadEnum.WIDTH
  }
}))

interface Props {
  meetingContentRef?: RefObject<HTMLDivElement>
  allowedThreadables: DiscussionThreadables[]
  width?: string
  queryRef: PreloadedQuery<DiscussionThreadQuery>
  header?: ReactNode
  emptyState?: ReactNode
}

const DiscussionThread = (props: Props) => {
  const {meetingContentRef, allowedThreadables, width, queryRef, header, emptyState} = props

  const {t} = useTranslation()

  const {viewerId} = useAtmosphere()
  const isDrawer = !!width // hack to say this is in a poker meeting
  const listRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const ref = useRef<HTMLDivElement>(null)
  const data = usePreloadedQuery<DiscussionThreadQuery>(
    graphql`
      query DiscussionThreadQuery($discussionId: ID!) {
        viewer {
          ...DiscussionThreadInput_viewer
          ...DiscussionThreadList_viewer
          discussion(id: $discussionId) {
            ...DiscussionThreadInput_discussion
            ...DiscussionThreadList_discussion
            id
            replyingToCommentId
            commentors {
              id
              preferredName
              __typename
            }
            thread(first: 1000) @connection(key: "DiscussionThread_thread") {
              edges {
                node {
                  id
                  threadSortOrder
                  discussionId
                  ...DiscussionThreadList_threadables
                }
              }
            }
          }
        }
      }
    `,
    queryRef,
    {UNSTABLE_renderPolicy: 'full'}
  )
  const {viewer} = data
  const isExpanded =
    useCoverable(
      'threads',
      ref,
      MeetingControlBarEnum.HEIGHT,
      meetingContentRef,
      undefined,
      isDrawer
    ) || allowedThreadables.length === 0
  const {discussion} = viewer
  const commentors = discussion?.commentors ?? []
  const preferredNames = useMemo(
    () => commentors.filter(({id}) => id !== viewerId).map(({preferredName}) => preferredName),
    [viewerId, discussion]
  )
  if (!discussion) {
    return <div>{t('DiscussionThread.NoDiscussionFound')}</div>
  }

  const {replyingToCommentId, thread} = discussion
  const edges = thread?.edges ?? [] // should never happen, but Terry reported it in demo. likely relay error
  const threadables = edges.map(({node}) => node)
  const getMaxSortOrder = () => {
    return Math.max(0, ...threadables.map((threadable) => threadable.threadSortOrder || 0))
  }
  const isCreatingPoll = threadables.some(isLocalPoll)

  return (
    <Wrapper isExpanded={isExpanded} width={width} ref={ref}>
      <DiscussionThreadList
        dataCy='discuss-thread-list'
        discussion={discussion}
        allowedThreadables={allowedThreadables}
        preferredNames={preferredNames}
        threadables={threadables}
        ref={listRef}
        editorRef={editorRef}
        viewer={viewer}
        header={header}
        emptyState={emptyState}
      />
      <DiscussionThreadInput
        allowedThreadables={allowedThreadables}
        dataCy='discuss-input'
        editorRef={editorRef}
        isDisabled={!!replyingToCommentId}
        getMaxSortOrder={getMaxSortOrder}
        discussion={discussion}
        viewer={viewer}
        isCreatingPoll={isCreatingPoll}
      />
    </Wrapper>
  )
}

export default DiscussionThread
