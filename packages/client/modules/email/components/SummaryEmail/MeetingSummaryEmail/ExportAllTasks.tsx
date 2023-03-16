import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {Check} from '@mui/icons-material'
import {MenuPosition} from '../../../../../hooks/useCoords'
import useMenu from '../../../../../hooks/useMenu'
import useMutationProps from '../../../../../hooks/useMutationProps'
import lazyPreload from '../../../../../utils/lazyPreload'
import {useFragment} from 'react-relay'
import {ExportAllTasks_meeting$key} from '../../../../../__generated__/ExportAllTasks_meeting.graphql'
import styled from '@emotion/styled'
import BaseButton from '../../../../../components/BaseButton'
import {PALETTE} from '../../../../../styles/paletteV3'
import {buttonShadow} from '../../../../../styles/elevation'
import {emailFontFamily} from '../../../styles'

const ExportAllTasksMenuRoot = lazyPreload(
  () => import(/* webpackChunkName: 'ExportAllTasksMenuRoot' */ './ExportAllTasksMenuRoot')
)

interface Props {
  meetingRef: ExportAllTasks_meeting$key
}

const ExportButton = styled(BaseButton)({
  backgroundColor: PALETTE.SKY_500,
  opacity: 1,
  outline: 0,
  marginTop: 12,
  padding: '9px 20px',
  borderRadius: '4em',
  boxShadow: buttonShadow,
  color: '#FFFFFF',
  cursor: 'pointer',
  display: 'block',
  fontFamily: emailFontFamily,
  fontSize: 14,
  fontWeight: 600,
  margin: '0px auto',
  textAlign: 'center',
  textDecoration: 'none'
})

const ExportAllTasks = (props: Props) => {
  const {meetingRef} = props
  const mutationProps = useMutationProps()
  const {togglePortal, originRef, menuPortal, menuProps, loadingWidth, loadingDelay} = useMenu(
    MenuPosition.UPPER_RIGHT,
    {
      loadingWidth: 200
    }
  )
  const meeting = useFragment(
    graphql`
      fragment ExportAllTasks_meeting on NewMeeting {
        teamId
        ...ExportAllTasksMenuRoot_meeting
        ... on RetrospectiveMeeting {
          tasks {
            taskService
            integration {
              id
            }
          }
        }
        ... on ActionMeeting {
          tasks {
            taskService
            integration {
              id
            }
          }
        }
      }
    `,
    meetingRef
  )

  const {tasks} = meeting
  if (!tasks) {
    return null
  }

  const filteredTasks = tasks.filter((task) => !task.integration)
  const taskServices = Array.from(
    tasks.reduce(
      (serviceSet, task) => (task.taskService ? serviceSet.add(task.taskService) : serviceSet),
      new Set<string>()
    )
  )

  return (
    <>
      {filteredTasks.length === 0 ? (
        <span className='flex justify-center text-center'>
          {taskServices.length === 1
            ? `All tasks pushed to ${taskServices[0]}`
            : `All tasks pushed to integration`}
          <Check className='ml-2' />
        </span>
      ) : (
        <ExportButton
          onClick={togglePortal}
          ref={originRef}
          onMouseEnter={ExportAllTasksMenuRoot.preload}
        >
          Export tasks to integration
        </ExportButton>
      )}
      {menuPortal(
        <ExportAllTasksMenuRoot
          menuProps={menuProps}
          loadingDelay={loadingDelay}
          loadingWidth={loadingWidth}
          mutationProps={mutationProps}
          meetingRef={meeting}
        />
      )}
    </>
  )
}

export default ExportAllTasks
