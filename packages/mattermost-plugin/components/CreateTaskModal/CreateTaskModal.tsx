import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useDispatch} from 'react-redux'
import {useLazyLoadQuery, useMutation} from 'react-relay'

import {closeCreateTaskModal} from '../../reducers'

import Select from '../Select'
import SimpleSelect from '../SimpleSelect'

import type {TaskStatusEnum} from '../../__generated__/CreateTaskModalMutation.graphql'
import {CreateTaskModalMutation} from '../../__generated__/CreateTaskModalMutation.graphql'
import {CreateTaskModalQuery} from '../../__generated__/CreateTaskModalQuery.graphql'
import LoadingSpinner from '../LoadingSpinner'
import Modal from '../Modal'

const TaskStatus: TaskStatusEnum[] = ['active', 'done', 'future', 'stuck']

const CreateTaskModal = () => {
  const data = useLazyLoadQuery<CreateTaskModalQuery>(
    graphql`
      query CreateTaskModalQuery {
        viewer {
          teams {
            id
            name
            orgId
            teamMembers {
              id
              email
            }
          }
        }
      }
    `,
    {}
  )

  const {viewer} = data
  const {teams} = viewer

  const [createTask, createTaskLoading] = useMutation<CreateTaskModalMutation>(graphql`
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

  const [description, setDescription] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<NonNullable<typeof teams>[number]>()
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusEnum>('active')

  useEffect(() => {
    if (!selectedTeam && teams && teams.length > 0) {
      setSelectedTeam(teams[0])
    }
  }, [teams, selectedTeam])

  const dispatch = useDispatch()
  const handleClose = () => {
    dispatch(closeCreateTaskModal())
  }

  const handleStart = async () => {
    if (!selectedTeam || !description || !selectedStatus) {
      return
    }
    if (createTaskLoading) {
      return
    }

    // TODO: let's cheat our way to new task content for now
    const content = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              text: description,
              type: 'text'
            }
          ]
        }
      ]
    }

    createTask({
      variables: {
        newTask: {
          content: JSON.stringify(content),
          status: selectedStatus,
          teamId: selectedTeam.id
        }
      }
    })

    handleClose()
  }

  return (
    <Modal
      title='Add a Task'
      commitButtonLabel='Add Task'
      handleClose={handleClose}
      handleCommit={handleStart}
    >
      <div className='form-group'>
        <label className='control-label' htmlFor='description'>
          Description<span className='error-text'> *</span>
        </label>
        <textarea
          style={{
            width: '100%'
          }}
          id='description'
          className='form-control'
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
