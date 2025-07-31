import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import graphql from 'babel-plugin-relay/macro'
import {DragDropContext, Draggable, Droppable, type DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import type {LeftNavTeamsSection_viewer$key} from '../../__generated__/LeftNavTeamsSection_viewer.graphql'
import useEventCallback from '../../hooks/useEventCallback'
import {useUpdateTeamSortOrderMutation} from '../../mutations/useUpdateTeamSortOrderMutation'
import {getSortOrder} from '../../shared/sortOrder'
import {LeftNavHeader} from './LeftNavHeader'
import {LeftNavHeaderButton} from './LeftNavHeaderButton'
import {LeftNavItemButtons} from './LeftNavItemButtons'
import {LeftNavTeamLink} from './LeftNavTeamLink'
import PublicTeamsOverflow from './PublicTeamsOverflow'

interface Props {
  viewerRef: LeftNavTeamsSection_viewer$key
}
export const LeftNavTeamsSection = (props: Props) => {
  const {viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment LeftNavTeamsSection_viewer on User {
        ...PublicTeamsOverflow_viewer
        draggingPageId
        draggingPageIsPrivate
        teams {
          id
          sortOrder
          ...LeftNavTeamLink_team
        }
      }
    `,
    viewerRef
  )
  const [execute, submitting] = useUpdateTeamSortOrderMutation()
  const {teams, draggingPageId} = viewer
  const onDragEnd = useEventCallback((result: DropResult) => {
    const {source, destination} = result
    if (!destination || submitting) return

    const destinationItem = teams[destination.index]
    const sourceItem = teams[source.index]
    if (
      destination.droppableId !== 'Team' ||
      source.droppableId !== 'Team' ||
      destination.index === source.index ||
      !destinationItem ||
      !sourceItem
    ) {
      return
    }
    const sortOrder = getSortOrder(teams, source.index, destination.index)
    execute({variables: {teamId: sourceItem.id, sortOrder}})
  })
  const history = useHistory()
  return (
    <div>
      <div className='group flex flex-1 cursor-pointer items-center justify-center rounded-md py-0.5 pl-3 font-semibold text-xs leading-5 hover:bg-slate-300'>
        <LeftNavHeader>{'Teams'}</LeftNavHeader>
        <LeftNavItemButtons>
          <LeftNavHeaderButton
            Icon={ManageAccountsIcon}
            onClick={(e) => {
              e.preventDefault()
              history.push('/me/organizations')
            }}
            tooltip={'Manage Teams'}
          />
        </LeftNavItemButtons>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId={'Team'}>
          {(provided) => {
            return (
              <div ref={provided.innerRef}>
                {teams.map((team, idx) => {
                  const {id: teamId} = team
                  return (
                    <Draggable key={teamId} draggableId={teamId} index={idx}>
                      {(dragProvided) => {
                        return (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <LeftNavTeamLink
                              teamRef={team}
                              draggingPageId={draggingPageId ?? null}
                            />
                          </div>
                        )
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
                <PublicTeamsOverflow viewerRef={viewer} />
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
    </div>
  )
}
