import {Client4} from 'mattermost-redux/client'
import {getPost} from 'mattermost-redux/selectors/entities/posts'
import {GlobalState} from 'mattermost-redux/types/store'
import React, {useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLazyLoadQuery, useMutation} from 'react-relay'

import {generateJSON, mergeAttributes} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'

import {Post} from 'mattermost-redux/types/posts'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {PushReflectionModalMutation} from '../../__generated__/PushReflectionModalMutation.graphql'
import {PushReflectionModalQuery} from '../../__generated__/PushReflectionModalQuery.graphql'
import {useConfig} from '../../hooks/useConfig'
import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useCurrentUser} from '../../hooks/useCurrentUser'
import {useTipTapTaskEditor} from '../../hooks/useTipTapTaskEditor'
import {closePushPostAsReflection, openLinkTeamModal, openStartActivityModal} from '../../reducers'
import {getPostURL, pushPostAsReflection} from '../../selectors'
import Modal from '../Modal'
import Select from '../Select'
import {TipTapEditor} from '../TipTap/Editor'

const PostUtils = (window as any).PostUtils

const PushReflectionModal = () => {
  const postId = useSelector(pushPostAsReflection)
  const post = useSelector((state: GlobalState) => getPost(state, postId!))
  const postUrl = useSelector((state: GlobalState) => getPostURL(state, postId!))
  const mmUser = useCurrentUser()
  const channel = useCurrentChannel()

  const config = useConfig()
  const {parabolUrl} = config

  const data = useLazyLoadQuery<PushReflectionModalQuery>(
    graphql`
      query PushReflectionModalQuery {
        viewer {
          teams {
            id
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
            activeMeetings {
              id
              name
              meetingType
              ... on RetrospectiveMeeting {
                phases {
                  ... on ReflectPhase {
                    reflectPrompts {
                      id
                      question
                      description
                    }
                    stages {
                      isComplete
                    }
                  }
                }
                templateId
              }
            }
          }
        }
      }
    `,
    {}
  )
  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const retroMeetings = useMemo(
    () =>
      linkedTeams
        .flatMap(({activeMeetings}) => activeMeetings)
        .filter(({meetingType}) => meetingType === 'retrospective'),
    [linkedTeams]
  )
  const [selectedMeeting, setSelectedMeeting] = React.useState<(typeof retroMeetings)[number]>()
  const [selectedPrompt, setSelectedPrompt] = React.useState<{
    id: string
    question: string
    description: string
  }>()

  const htmlPost = useMemo(() => {
    if (!post) {
      return ''
    }
    const quote = PostUtils.formatText(post.message)
    return `
    <p />
    <blockquote>
      ${quote}
    </blockquote>
    <a href=${postUrl}>See comment in Mattermost</a>
    `
  }, [post])

  const tipTapJson = useMemo(() => {
    const json = generateJSON(htmlPost, [
      StarterKit,
      BaseLink.extend({
        parseHTML() {
          return [{tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'}]
        },

        renderHTML({HTMLAttributes}) {
          return [
            'a',
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {class: 'link'}),
            0
          ]
        }
      })
    ])
    return JSON.stringify(json)
  }, [htmlPost])

  const [createReflection, isLoading] = useMutation<PushReflectionModalMutation>(graphql`
    mutation PushReflectionModalMutation($input: CreateReflectionInput!) {
      createReflection(input: $input) {
        reflectionId
      }
    }
  `)
  const [error, setError] = React.useState<string>()

  useEffect(() => {
    if (!selectedMeeting && retroMeetings && retroMeetings.length > 0) {
      setSelectedMeeting(retroMeetings[0])
    }
  }, [data, selectedMeeting])

  const reflectPhase = useMemo(
    () => selectedMeeting?.phases?.find((phase: any) => 'reflectPrompts' in phase),
    [selectedMeeting]
  )

  useEffect(() => {
    setSelectedPrompt(reflectPhase?.reflectPrompts?.[0])
  }, [reflectPhase])

  const dispatch = useDispatch()

  const handleClose = () => {
    dispatch(closePushPostAsReflection())
  }

  const handlePush = async () => {
    if (!selectedMeeting || !selectedPrompt || !editor || editor.isEmpty) {
      setError('Please fill out all required fields')
      return
    }
    setError(undefined)

    const {id: meetingId, name: meetingName} = selectedMeeting
    const {id: promptId, question} = selectedPrompt

    const content = JSON.stringify(editor.getJSON())

    try {
      await new Promise((resolve, reject) =>
        createReflection({
          variables: {
            input: {
              meetingId,
              promptId,
              content,
              sortOrder: 0
            }
          },
          onCompleted: (data) => {
            if (!data.createReflection) {
              reject('Failed to create reflection')
              return
            }
            resolve(data)
          },
          onError: reject
        })
      )
    } catch (error) {
      console.error('Failed to create reflection', error)
      setError('Failed to create reflection')
      return
    }

    const meetingUrl = `${parabolUrl}/meet/${meetingId}`
    const props = {
      attachments: [
        {
          fallback: `Reflection added to meeting ${meetingName}`,
          title: `Reflection added to meeting [${meetingName}](${meetingUrl})`,
          color: PALETTE.GRAPE_500,
          fields: [
            {
              short: true,
              title: 'Meeting',
              value: meetingName
            },
            {
              short: true,
              title: 'Question',
              value: question
            }
          ]
        }
      ]
    }

    Client4.doFetch(`${Client4.getPostsRoute()}/ephemeral`, {
      method: 'post',
      body: JSON.stringify({
        user_id: mmUser.id,
        post: {
          channel_id: post.channel_id,
          root_id: post.root_id || post.id,
          props
        }
      } as Partial<Post>)
    })
    /*
    TODO update to this call once https://github.com/mattermost/mattermost/pull/30117 was released
    Client4.createPostEphemeral(mmUser.id, {
      channel_id: post.channel_id,
      root_id: post.root_id || post.id,
      props
    })
     */

    handleClose()
  }

  const {editor} = useTipTapTaskEditor(tipTapJson)
  if (!editor) {
    return null
  }

  if (!postId) {
    return null
  }

  if (linkedTeams.length === 0) {
    const handleLink = () => {
      dispatch(openLinkTeamModal())
      handleClose()
    }
    return (
      <Modal
        title='Add Comment to Parabol Activity'
        commitButtonLabel='Link team'
        handleClose={handleClose}
        handleCommit={handleLink}
      >
        <p>There are no Parabol teams linked to this channel yet.</p>
      </Modal>
    )
  }
  if (retroMeetings.length === 0) {
    const handleStart = () => {
      dispatch(openStartActivityModal())
      handleClose()
    }
    return (
      <Modal
        title='Add Comment to Parabol Activity'
        commitButtonLabel='Start activity'
        handleClose={handleClose}
        handleCommit={handleStart}
      >
        <p>There are currently no open retrospective meetings in the linked Parabol teams.</p>
      </Modal>
    )
  }

  return (
    <Modal
      title='Add Comment to Parabol Activity'
      commitButtonLabel='Add Comment'
      handleClose={handleClose}
      handleCommit={handlePush}
      error={error}
      isLoading={isLoading}
    >
      {post && (
        <div className='form-group'>
          <label className='control-label' htmlFor='comment'>
            Add a Comment<span className='error-text'> *</span>
          </label>
          <TipTapEditor
            id='comment'
            className='channel-switch-modal form-control h-auto min-h-32 p-2'
            editor={editor}
            placeholder='TT Add your comment for the retro...'
          />
        </div>
      )}
      {data && (
        <>
          <Select
            label='Choose Activity'
            required={true}
            value={selectedMeeting}
            options={retroMeetings ?? []}
            onChange={setSelectedMeeting}
          />
          <Select
            label='Choose Prompt'
            required={true}
            value={selectedPrompt && {id: selectedPrompt.id, name: selectedPrompt.question}}
            options={
              reflectPhase?.reflectPrompts?.map(({id, question}) => ({id, name: question})) ?? []
            }
            onChange={(selected) =>
              selected &&
              setSelectedPrompt(
                reflectPhase?.reflectPrompts?.find((prompt) => prompt.id === selected.id)
              )
            }
          />
        </>
      )}
    </Modal>
  )
}

export default PushReflectionModal
