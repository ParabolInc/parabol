import graphql from 'babel-plugin-relay/macro'
import {Client4} from 'mattermost-redux/client'
import {useEffect, useMemo, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery, useMutation} from 'react-relay'

import {closeCreateTaskModal} from '../../reducers'

import {useCurrentChannel} from '../../hooks/useCurrentChannel'
import {useCurrentUser} from '../../hooks/useCurrentUser'
import Select from '../Select'
import SimpleSelect from '../SimpleSelect'

import {Post} from 'mattermost-redux/types/posts'
import {TipTapEditor} from 'parabol-client/components/promptResponse/TipTapEditor'
import useEventCallback from 'parabol-client/hooks/useEventCallback'
import {convertTipTapTaskContent} from 'parabol-client/shared/tiptap/convertTipTapTaskContent'
import {PALETTE} from '../../../client/styles/paletteV3'
import type {TaskStatusEnum} from '../../__generated__/CreateTaskModalMutation.graphql'
import {CreateTaskModalMutation} from '../../__generated__/CreateTaskModalMutation.graphql'
import {CreateTaskModalQuery} from '../../__generated__/CreateTaskModalQuery.graphql'
import {useConfig} from '../../hooks/useConfig'
import {useTipTapTaskEditor} from '../../hooks/useTipTapTaskEditor'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'
import NoLinkedTeamsModal from '../NoLinkedTeamsModal'

const TaskStatus: TaskStatusEnum[] = ['active', 'done', 'future', 'stuck']

const CreateTaskModal = () => {
  const config = useConfig()
  const {parabolUrl} = config
  const channel = useCurrentChannel()
  const mmUser = useCurrentUser()

  const data = useLazyLoadQuery<CreateTaskModalQuery>(
    graphql`
      query CreateTaskModalQuery {
        viewer {
          id
          teams {
            id
            name
            orgId
            viewerTeamMember {
              id
              integrations {
                mattermost {
                  linkedChannels
                }
              }
            }
          }
        }
      }
    `,
    {}
  )

  const {viewer} = data
  const {id: userId, teams} = viewer

  const linkedTeams = useMemo(() => {
    const {viewer} = data
    return viewer.teams.filter(
      (team) =>
        channel &&
        team.viewerTeamMember?.integrations.mattermost.linkedChannels.includes(channel.id)
    )
  }, [data, channel])

  const [createTask, isLoading] = useMutation<CreateTaskModalMutation>(graphql`
    mutation CreateTaskModalMutation($newTask: CreateTaskInput!) {
      createTask(newTask: $newTask) {
        task {
          id
        }
        error {
          message
        }
      }
    }
  `)
  const [error, setError] = useState<string>()

  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof teams>[number]>()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusEnum>('active')

  useEffect(() => {
    if (!selectedTeam && teams && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])
  const teamId = selectedTeam?.id
  const teamName = selectedTeam?.name

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeCreateTaskModal())
  }

  const handleSubmit = useEventCallback(async () => {
    if (!teamId || !selectedStatus || !editor || editor.isEmpty) {
      return
    }
    if (isLoading) {
      return
    }

    const content = editor.getJSON()

    setError(undefined)
    try {
      await new Promise((resolve, reject) =>
        createTask({
          variables: {
            newTask: {
              content: JSON.stringify(content),
              status: selectedStatus,
              userId,
              teamId
            }
          },
          onCompleted: (data) => {
            if (data.createTask.error) {
              reject(data.createTask.error.message)
            } else {
              resolve(data.createTask.task?.id)
            }
          },
          onError: reject
        })
      )
    } catch (error) {
      console.error('Failed to create task', error)
      setError('Failed to create task')
    }

    if (channel) {
      const teamUrl = `${parabolUrl}/team/${teamId}/tasks`
      const message = `Task created in [${teamName}](${teamUrl})`
      const props = {
        attachments: [
          {
            fallback: message,
            title: message,
            color: PALETTE.GRAPE_500
          }
        ]
      }

      Client4.doFetch(`${Client4.getPostsRoute()}/ephemeral`, {
        method: 'post',
        body: JSON.stringify({
          user_id: mmUser.id,
          post: {
            channel_id: channel.id,
            props
          }
        } as Partial<Post>)
      })
    }

    handleClose()
  })

  const {editor} = useTipTapTaskEditor(convertTipTapTaskContent(''))
  if (!editor) {
    return null
  }

  if (!linkedTeams || linkedTeams.length === 0) {
    return <NoLinkedTeamsModal title='Add a Task' handleClose={handleClose} />
  }

  return (
    <Modal
      title='Add a Task'
      commitButtonLabel='Add Task'
      handleClose={handleClose}
      handleCommit={handleSubmit}
      error={error}
      isLoading={isLoading}
    >
      <div className='absolute top-0 left-0 z-10 z-1050' />
      <div className='form-group'>
        <label className='control-label' htmlFor='description'>
          Description<span className='error-text'> *</span>
        </label>
        {/* className='channel-switch-modal' is a hack to not lose focus on key press, see 
            https://github.com/mattermost/mattermost/blob/dc06bb21558aca05dbe330f25459528b39247c32/webapp/channels/src/components/advanced_text_editor/use_textbox_focus.tsx#L63 */}
        <TipTapEditor
          id='description'
          className='channel-switch-modal form-control h-auto min-h-32 p-2'
          editor={editor}
          placeholder='Description'
        />
      </div>
      {teams ? (
        <Select
          label='Parabol Team'
          required={true}
          options={teams ?? []}
          value={selectedTeam}
          onChange={setSelectedTeam}
        />
      ) : (
        <LoadingSpinner />
      )}
      <SimpleSelect
        label='Status'
        required={true}
        options={TaskStatus}
        value={selectedStatus}
        onChange={setSelectedStatus}
      />
    </Modal>
  )
}

export default CreateTaskModal
