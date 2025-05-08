import SendIcon from '@mui/icons-material/Send'
import {useState} from 'react'
import {PageRoleEnum} from '../../../server/graphql/private/resolverTypes'
import TeamAvatar from '../../components/TeamAvatar/TeamAvatar'
import {Button} from '../../ui/Button/Button'
import {Chip} from '../../ui/Chip/Chip'
import {PageAccessComboboxControl} from './PageAccessComboboxControl'
import {
  getOptionLabel,
  getOptionValue,
  type usePageSharingAutocomplete
} from './usePageSharingAutocomplete'

interface Props {
  getRootProps: ReturnType<typeof usePageSharingAutocomplete>['getRootProps']
  getInputProps: ReturnType<typeof usePageSharingAutocomplete>['getInputProps']
  getTagProps: ReturnType<typeof usePageSharingAutocomplete>['getTagProps']
  setAnchorEl: ReturnType<typeof usePageSharingAutocomplete>['setAnchorEl']
  value: ReturnType<typeof usePageSharingAutocomplete>['value']
}
export const PageSharingInput = (props: Props) => {
  const {getInputProps, getRootProps, getTagProps, setAnchorEl, value} = props
  const [inviteeRole, setInviteeRole] = useState<PageRoleEnum>('owner')
  return (
    <div {...getRootProps()} className='flex grow space-x-2'>
      <div
        ref={setAnchorEl}
        className='align-center flex min-h-[44px] w-full flex-wrap rounded-sm border border-slate-500 bg-white px-1 py-0.5 text-sm'
      >
        {value.map((option, index: number) => (
          <Chip
            {...getTagProps({index})}
            label={getOptionLabel(option)}
            picture={'picture' in option ? option.picture : null}
            icon={
              'email' in option && !('userId' in option) ? (
                <SendIcon className='flex h-6 w-6 shrink-0 p-2' />
              ) : 'teamId' in option ? (
                <TeamAvatar teamId={option.teamId} teamName={option.name} />
              ) : 'orgId' in option && !option.picture ? (
                <TeamAvatar teamId={option.orgId} teamName={option.name} />
              ) : null
            }
            key={getOptionValue(option)}
            className='m-0.5'
          />
        ))}
        <input
          {...getInputProps()}
          placeholder={!value.length ? 'ex. Traci or traci@example.com' : ''}
          className='m-0 box-border min-h-[36px] w-0 min-w-[30px] grow border-0 bg-white pl-1 text-black outline-hidden'
        />
      </div>
      <div className='flex shrink-0 flex-col self-center'>
        <Button variant='secondary' className='rounded-full bg-sky-500 px-3 py-1 hover:bg-sky-600'>
          Invite
        </Button>
        {value.length > 0 && (
          <div className=''>
            <PageAccessComboboxControl defaultRole={inviteeRole} onClick={setInviteeRole} />
          </div>
        )}
      </div>
    </div>
  )
}
