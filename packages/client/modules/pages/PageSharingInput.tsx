import SendIcon from '@mui/icons-material/Send'
import {useState} from 'react'
import type {PageRoleEnum} from '../../../server/graphql/private/resolverTypes'
import TeamAvatar from '../../components/TeamAvatar/TeamAvatar'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useUpdatePageAccessMutation} from '../../mutations/useUpdatePageAccessMutation'
import {Button} from '../../ui/Button/Button'
import {Chip} from '../../ui/Chip/Chip'
import {PageAccessComboboxControl} from './PageAccessComboboxControl'
import {
  getOptionLabel,
  getOptionValue,
  type usePageSharingAutocomplete
} from './usePageSharingAutocomplete'

interface Props {
  pageId: string
  getRootProps: ReturnType<typeof usePageSharingAutocomplete>['getRootProps']
  getInputProps: ReturnType<typeof usePageSharingAutocomplete>['getInputProps']
  getTagProps: ReturnType<typeof usePageSharingAutocomplete>['getTagProps']
  setAnchorEl: ReturnType<typeof usePageSharingAutocomplete>['setAnchorEl']
  value: ReturnType<typeof usePageSharingAutocomplete>['value']
  setValue: ReturnType<typeof usePageSharingAutocomplete>['setValue']
}
export const PageSharingInput = (props: Props) => {
  const {setValue, pageId, getInputProps, getRootProps, getTagProps, setAnchorEl, value} = props
  const [inviteeRole, setInviteeRole] = useState<PageRoleEnum | null>('owner')
  const [execute, submitting] = useUpdatePageAccessMutation()
  const atmosphere = useAtmosphere()
  const onSubmit = () => {
    if (submitting) return

    value.forEach((invitee) => {
      const {type} = invitee
      execute({
        variables: {
          pageId,
          role: inviteeRole,

          subjectId:
            type === 'external'
              ? invitee.email
              : type === 'user'
                ? invitee.userId
                : type === 'team'
                  ? invitee.teamId
                  : invitee.orgId,
          subjectType: type
        },
        onCompleted(_res, errors) {
          const firstError = errors?.[0]?.message
          if (firstError) {
            atmosphere.eventEmitter.emit('addSnackbar', {
              key: 'PageSharingInput',
              message: firstError,
              autoDismiss: 5
            })
          }
        },
        onError(error) {
          const firstError = (error as any).source.errors?.[0]?.message ?? error.message
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'PageSharingInput',
            message: firstError,
            autoDismiss: 5
          })
        }
      })
    })
    setValue([])
  }
  return (
    <div {...getRootProps()} className='flex grow space-x-2'>
      <div
        ref={setAnchorEl}
        className='flex min-h-[44px] w-full flex-wrap rounded-sm border border-slate-500 bg-white px-1 py-0.5 align-center text-sm'
      >
        {value.map((option, index: number) => (
          <Chip
            {...getTagProps({index})}
            label={getOptionLabel(option)}
            picture={'picture' in option ? option.picture : null}
            icon={
              option.type === 'external' ? (
                <SendIcon className='flex h-6 w-6 shrink-0 p-2' />
              ) : option.type === 'team' ? (
                <TeamAvatar teamId={option.teamId} teamName={option.name} />
              ) : option.type === 'organization' && !option.picture ? (
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
        <Button variant='dialogPrimary' shape='pill' className='h-10 px-6' onClick={onSubmit}>
          Share
        </Button>
        {value.length > 0 && (
          <div className=''>
            <PageAccessComboboxControl defaultRole={inviteeRole!} onClick={setInviteeRole} />
          </div>
        )}
      </div>
    </div>
  )
}
