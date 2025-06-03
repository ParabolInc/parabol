import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {useHistory} from 'react-router'
import type {PageActions_page$key} from '../../__generated__/PageActions_page.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useArchivePageMutation} from '../../mutations/useArchivePageMutation'
import {useCreatePageMutation} from '../../mutations/useCreatePageMutation'
import {Menu} from '../../ui/Menu/Menu'
import {MenuContent} from '../../ui/Menu/MenuContent'
import {MenuItem} from '../../ui/Menu/MenuItem'
import {Tooltip} from '../../ui/Tooltip/Tooltip'
import {TooltipContent} from '../../ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '../../ui/Tooltip/TooltipTrigger'

interface Props {
  pageRef: PageActions_page$key
  expandChildren: () => void
}
export const PageActions = (props: Props) => {
  const {pageRef, expandChildren} = props
  const page = useFragment(
    graphql`
      fragment PageActions_page on Page {
        id
        access {
          viewer
        }
      }
    `,
    pageRef
  )
  const {id: pageId, access} = page
  const {viewer: viewerAccess} = access
  const history = useHistory()
  const [execute, submitting] = useCreatePageMutation()
  const [executeArchive] = useArchivePageMutation()
  const atmosphere = useAtmosphere()
  const archivePage = (e: Event) => {
    e.preventDefault()
    executeArchive({
      variables: {pageId, action: 'archive'},
      onCompleted(_res, errors) {
        const firstError = errors?.[0]?.message
        if (firstError) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageActionsArchive',
            message: firstError,
            autoDismiss: 5
          })
        }
      }
    })
  }

  const addChildPage = (e: React.MouseEvent) => {
    e.preventDefault()
    if (submitting) return
    execute({
      variables: {parentPageId: pageId},
      onCompleted: (response) => {
        const {createPage} = response
        const {page} = createPage
        const {id} = page
        const [_, pageId] = id.split(':')
        history.push(`/pages/${pageId}`)
        expandChildren()
      }
    })
  }

  return (
    <div className='flex flex-1 items-center justify-end'>
      {viewerAccess === 'owner' && (
        <div className='flex size-6 items-center justify-center rounded-sm hover:bg-slate-400'>
          <Menu
            trigger={
              <div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <MoreVertIcon className='hidden size-5 group-hover:block' />
                  </TooltipTrigger>
                  <TooltipContent side={'bottom'}>{'More page actions'}</TooltipContent>
                </Tooltip>
              </div>
            }
          >
            <MenuContent align='start' sideOffset={4} className='max-h-80'>
              <MenuItem onClick={archivePage}>{'Delete page'}</MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )}
      <div className='flex size-6 items-center justify-center rounded-sm hover:bg-slate-400'>
        <Tooltip>
          <TooltipTrigger asChild>
            <AddIcon className='hidden size-5 group-hover:block' onClick={addChildPage} />
          </TooltipTrigger>
          <TooltipContent side={'bottom'}>{'Add a page inside'}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
