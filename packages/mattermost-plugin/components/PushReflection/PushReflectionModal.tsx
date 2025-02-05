import {generateJSON, mergeAttributes} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import graphql from 'babel-plugin-relay/macro'
import {getPost} from 'mattermost-redux/selectors/entities/posts'
import {GlobalState} from 'mattermost-redux/types/store'
import {TipTapEditor} from 'parabol-client/components/promptResponse/TipTapEditor'
import React, {useEffect, useMemo} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {useLazyLoadQuery, useMutation} from 'react-relay'
import {PushReflectionModalMutation} from '../../__generated__/PushReflectionModalMutation.graphql'
import {PushReflectionModalQuery} from '../../__generated__/PushReflectionModalQuery.graphql'
import {useTipTapTaskEditor} from '../../hooks/useTipTapTaskEditor'
import {closePushPostAsReflection} from '../../reducers'
import {getPostURL, pushPostAsReflection} from '../../selectors'
import Modal from '../Modal'
import Select from '../Select'

const PostUtils = (window as any).PostUtils

const PushReflectionModal = () => {
  const postId = useSelector(pushPostAsReflection)
  const post = useSelector((state: GlobalState) => getPost(state, postId!))
  const postUrl = useSelector((state: GlobalState) => getPostURL(state, postId!))

  const data = useLazyLoadQuery<PushReflectionModalQuery>(
    graphql`
      query PushReflectionModalQuery {
        viewer {
          teams {
            id
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
  const {viewer} = data
  const {teams} = viewer
  const retroMeetings = useMemo(
    () =>
      teams
        .flatMap(({activeMeetings}) => activeMeetings)
        .filter(({meetingType}) => meetingType === 'retrospective'),
    [teams]
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

  const [createReflection] = useMutation<PushReflectionModalMutation>(graphql`
    mutation PushReflectionModalMutation($input: CreateReflectionInput!) {
      createReflection(input: $input) {
        reflectionId
      }
    }
  `)

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
      console.log('missing data', selectedPrompt, selectedMeeting, post.message)
      return
    }

    const content = JSON.stringify(editor.getJSON())

    createReflection({
      variables: {
        input: {
          meetingId: selectedMeeting.id,
          promptId: selectedPrompt.id,
          content,
          sortOrder: 0
        }
      }
    })

    handleClose()
  }

  const {editor, setLinkState, linkState} = useTipTapTaskEditor(tipTapJson)
  if (!editor) {
    return null
  }

  if (!postId) {
    return null
  }

  return (
    <Modal
      title='Add Comment to Parabol Activity'
      commitButtonLabel='Add Comment'
      handleClose={handleClose}
      handleCommit={handlePush}
    >
      <div>
        <p>
          Choose an open Retro activity and the Prompt where you want to send the Mattermost
          comment. A reference link back to Mattermost will be inlcuded in the reflection.
        </p>
      </div>
      {post && (
        <div className='form-group'>
          <label className='control-label' htmlFor='comment'>
            Add a Comment<span className='error-text'> *</span>
          </label>
          <TipTapEditor
            id='comment'
            className='channel-switch-modal form-control h-auto min-h-32 p-2'
            editor={editor}
            linkState={linkState}
            setLinkState={setLinkState}
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
