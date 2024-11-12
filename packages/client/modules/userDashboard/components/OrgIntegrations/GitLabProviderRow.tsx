import {MoreVert as MoreVertIcon} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {GitLabProviderRow_integrationProvider$key} from '../../../../__generated__/GitLabProviderRow_integrationProvider.graphql'
import FlatButton from '../../../../components/FlatButton'
import ProviderActions from '../../../../components/ProviderActions'
import RowInfoCopy from '../../../../components/Row/RowInfoCopy'
import {useDialogState} from '../../../../ui/Dialog/useDialogState'
import {Menu} from '../../../../ui/Menu/Menu'
import {MenuContent} from '../../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../../ui/Menu/MenuItem'
import EditGitLabProviderDialog from './EditGitLabProviderDialog'
import RemoveIntegrationProviderDialog from './RemoveIntegrationProviderDialog'

type Props = {
  integrationProviderRef: GitLabProviderRow_integrationProvider$key
}

const GitLabProviderRow = (props: Props) => {
  const {integrationProviderRef} = props
  const integrationProvider = useFragment(
    graphql`
      fragment GitLabProviderRow_integrationProvider on IntegrationProviderOAuth2 {
        id
        serverBaseUrl
        ...EditGitLabProviderDialog_integrationProvider
        ...RemoveIntegrationProviderDialog_integrationProvider
      }
    `,
    integrationProviderRef
  )
  const {id, serverBaseUrl} = integrationProvider

  const {isOpen: isEditOpen, open: openEdit, close: closeEdit} = useDialogState()
  const {isOpen: isDeleteOpen, open: openDelete, close: closeDelete} = useDialogState()

  return (
    <>
      <div key={id} className='flex-center flex items-center border-t border-slate-300 p-4'>
        <div className='flex flex-col px-2'>
          <div className='font-semibold text-slate-700'>
            {serverBaseUrl.replace(/https:\/\//, '')}
          </div>
          <RowInfoCopy></RowInfoCopy>
        </div>
        <ProviderActions>
          <Menu
            modal={false}
            trigger={
              <FlatButton className='p-2'>
                <MoreVertIcon />
              </FlatButton>
            }
          >
            <MenuContent>
              <MenuItem onClick={openEdit}>Edit</MenuItem>
              <MenuItem onClick={openDelete}>Delete</MenuItem>
            </MenuContent>
          </Menu>
        </ProviderActions>
      </div>
      <EditGitLabProviderDialog
        isOpen={isEditOpen}
        onClose={closeEdit}
        integrationProviderRef={integrationProvider}
      />
      <RemoveIntegrationProviderDialog
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        integrationProviderRef={integrationProvider}
      />
    </>
  )
}

export default GitLabProviderRow
