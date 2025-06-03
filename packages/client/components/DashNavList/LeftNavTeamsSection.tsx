import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'
import graphql from 'babel-plugin-relay/macro'
import {DragDropContext, Draggable, Droppable, type DropResult} from 'react-beautiful-dnd'
import {useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import type {LeftNavTeamsSection_viewer$key} from '../../__generated__/LeftNavTeamsSection_viewer.graphql'
import useEventCallback from '../../hooks/useEventCallback'
import {useUpdateTeamSortOrderMutation} from '../../mutations/useUpdateTeamSortOrderMutation'
import {getSortOrder} from '../../shared/sortOrder'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'
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

  return (
    <div>
      <div className='group flex flex-1 cursor-pointer items-center rounded-md py-0.5 pl-3 text-xs leading-5 font-semibold hover:bg-slate-300'>
        <div className='flex flex-col text-sm font-medium'>
          <span>{'Teams'}</span>
        </div>
        <div className={'flex flex-1 items-center justify-end'}>
          <div className='mr-1 flex size-5 items-center justify-center rounded-sm hover:bg-slate-400'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  className='hidden size-4 cursor-pointer group-hover:block'
                  to={`/me/organizations`}
                >
                  <ManageAccountsIcon className={'size-5'} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side={'bottom'}>{'Manage Teams'}</TooltipContent>
            </Tooltip>
          </div>
        </div>
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
