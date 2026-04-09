import MoreVertIcon from '@mui/icons-material/MoreVert'
import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment, useMutation} from 'react-relay'
import type {PersonalAccessTokens_viewer$key} from '../../../__generated__/PersonalAccessTokens_viewer.graphql'
import type {PersonalAccessTokensRevokeMutation} from '../../../__generated__/PersonalAccessTokensRevokeMutation.graphql'
import Panel from '../../../components/Panel/Panel'
import SecondaryButton from '../../../components/SecondaryButton'
import {Menu} from '../../../ui/Menu/Menu'
import {MenuContent} from '../../../ui/Menu/MenuContent'
import {MenuItem} from '../../../ui/Menu/MenuItem'
import PersonalAccessTokenUpsertDialog, {type TokenForEdit} from './PersonalAccessTokenUpsertDialog'

interface Props {
  viewerRef: PersonalAccessTokens_viewer$key
}

const formatScope = (scope: string) => {
  const parts = scope.toLowerCase().split('_')
  const action = parts[parts.length - 1]
  const resource = parts.slice(0, -1).join('_')
  return `${resource}:${action}`
}

const PersonalAccessTokens = ({viewerRef}: Props) => {
  const viewer = useFragment(
    graphql`
      fragment PersonalAccessTokens_viewer on User {
        ...PersonalAccessTokenUpsertDialog_viewer
        id
        personalAccessTokens {
          id
          name
          prefix
          scopes
          grantedOrgIds
          grantedTeamIds
          grantedPageIds
          createdAt
          lastUsedAt
          expiresAt
          revokedAt
        }
      }
    `,
    viewerRef
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingToken, setEditingToken] = useState<TokenForEdit | null>(null)

  const [commitRevoke] = useMutation<PersonalAccessTokensRevokeMutation>(graphql`
    mutation PersonalAccessTokensRevokeMutation(
    $tokenId: ID!
    $name: String
    $scopes: [OAuthScopeEnum!]
    $grantedOrgIds: [ID!]
    $grantedTeamIds: [ID!]
    $grantedPageIds: [ID!]
    $expiresAt: DateTime
    $revoke: Boolean
    ) {
      updatePersonalAccessToken(
        tokenId: $tokenId
        name: $name
        scopes: $scopes
        grantedOrgIds: $grantedOrgIds
        grantedTeamIds: $grantedTeamIds
        grantedPageIds: $grantedPageIds
        expiresAt: $expiresAt
        revoke: $revoke
        ) {
        personalAccessToken {
          id
          revokedAt
          name
          scopes
          grantedOrgIds
          grantedTeamIds
          grantedPageIds
          expiresAt
        }
      }
    }
  `)

  const activeTokens = viewer.personalAccessTokens.filter((t) => !t.revokedAt)

  const handleRevoke = (tokenId: string) => {
    commitRevoke({
      variables: {tokenId, revoke: true}
    })
  }

  const controls = (
    <div className='py-2'>
      <SecondaryButton size='small' onClick={() => setIsCreateOpen(true)}>
        New Token
      </SecondaryButton>
    </div>
  )
  return (
    <>
      <Panel label='Personal Access Tokens' casing='capitalize' controls={controls}>
        {activeTokens.length === 0 ? (
          <div className='border-slate-300 border-t p-8 text-center text-slate-500 text-sm'>
            No personal access tokens. Create one to get programmatic API access.
          </div>
        ) : (
          <div className='overflow-x-auto border-slate-300 border-t'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-slate-200 border-b bg-slate-50 text-left text-slate-500 text-xs uppercase tracking-wider'>
                  <th className='px-4 py-2 font-semibold'>Name</th>
                  <th className='px-4 py-2 font-semibold'>Token</th>
                  <th className='px-4 py-2 font-semibold'>Scopes</th>
                  <th className='px-4 py-2 font-semibold'>Created</th>
                  <th className='px-4 py-2 font-semibold'>Last Used</th>
                  <th className='px-4 py-2 font-semibold'>Expires</th>
                  <th className='px-4 py-2' />
                </tr>
              </thead>
              <tbody>
                {activeTokens
                  .filter((token) => !token.revokedAt)
                  .map((token) => (
                    <tr
                      key={token.id}
                      className='border-slate-100 border-b last:border-0 hover:bg-slate-50'
                    >
                      <td className='px-4 py-3 font-medium text-slate-800'>{token.name}</td>
                      <td className='px-4 py-3 font-medium text-slate-800'>{token.id}</td>
                      <td className='max-w-[200px] px-4 py-3 text-slate-800'>
                        {token.scopes.map(formatScope).join(', ')}
                      </td>
                      <td className='whitespace-nowrap px-4 py-3 text-slate-800'>
                        {new Date(token.createdAt).toLocaleDateString()}
                      </td>
                      <td className='whitespace-nowrap px-4 py-3 text-slate-800'>
                        {token.lastUsedAt ? new Date(token.lastUsedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className='whitespace-nowrap px-4 py-3 text-slate-800'>
                        {token.expiresAt ? new Date(token.expiresAt).toLocaleDateString() : '—'}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <Menu
                          trigger={
                            <button className='flex size-8 cursor-pointer items-center justify-center rounded-lg p-1 text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-60'>
                              <MoreVertIcon className='size-5' />
                            </button>
                          }
                        >
                          <MenuContent align='end'>
                            <MenuItem
                              onClick={() =>
                                setEditingToken({
                                  ...token,
                                  grantedOrgIds: token.grantedOrgIds ?? null,
                                  grantedTeamIds: token.grantedTeamIds ?? null,
                                  grantedPageIds: token.grantedPageIds ?? null,
                                  expiresAt: token.expiresAt ?? null
                                })
                              }
                            >
                              Edit
                            </MenuItem>
                            <MenuItem onClick={() => handleRevoke(token.id)}>
                              <span className='text-red-600'>Revoke</span>
                            </MenuItem>
                          </MenuContent>
                        </Menu>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {isCreateOpen && (
        <PersonalAccessTokenUpsertDialog
          viewerRef={viewer}
          onClose={() => setIsCreateOpen(false)}
        />
      )}
      {editingToken && (
        <PersonalAccessTokenUpsertDialog
          viewerRef={viewer}
          personalAccessToken={editingToken}
          onClose={() => setEditingToken(null)}
        />
      )}
    </>
  )
}

export default PersonalAccessTokens
