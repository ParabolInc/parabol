import graphql from 'babel-plugin-relay/macro'
import {type FormEvent, useEffect} from 'react'
import {useFragment} from 'react-relay'
import type {MattermostPanel_viewer$key} from '~/__generated__/MattermostPanel_viewer.graphql'
import useForm from '~/hooks/useForm'
import {Button} from '~/ui/Button/Button'
import {Info as InfoIcon} from '~/ui/icons'
import {Tooltip} from '~/ui/Tooltip/Tooltip'
import {TooltipContent} from '~/ui/Tooltip/TooltipContent'
import {TooltipTrigger} from '~/ui/Tooltip/TooltipTrigger'
import linkify from '~/utils/linkify'
import type {AddIntegrationProviderMutation as TAddIntegrationProviderMutation} from '../../../../__generated__/AddIntegrationProviderMutation.graphql'
import BasicInput from '../../../../components/InputField/BasicInput'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddIntegrationProviderMutation from '../../../../mutations/AddIntegrationProviderMutation'
import AddTeamMemberIntegrationAuthMutation from '../../../../mutations/AddTeamMemberIntegrationAuthMutation'
import UpdateIntegrationProviderMutation from '../../../../mutations/UpdateIntegrationProviderMutation'
import Legitity from '../../../../validation/Legitity'
import NotificationSettings from './NotificationSettings'

interface Props {
  viewerRef: MattermostPanel_viewer$key
  teamId: string
}

const MattermostPanel = (props: Props) => {
  const {teamId, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MattermostPanel_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            mattermost {
              auth {
                provider {
                  id
                  webhookUrl
                }
              }
              teamNotificationSettings {
                ...NotificationSettings_settings
              }
            }
          }
        }
      }
    `,
    viewerRef
  )
  const {teamMember} = viewer
  const {integrations} = teamMember!
  const {mattermost} = integrations
  const {teamNotificationSettings, auth} = mattermost
  const activeProvider = auth?.provider
  const atmosphere = useAtmosphere()

  // corner case: let them re-upsert the same webhook url when reverting to a previous value
  const serverWebhookUrl = activeProvider?.webhookUrl ?? ''
  const {validateField, setDirtyField, onChange, fields} = useForm({
    webhookUrl: {
      getDefault: () => serverWebhookUrl,
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    }
  })
  // because we render this panel also when isConnectClicked, we cannot guarantee the serverWebhookUrl is correct on first render
  useEffect(() => {
    if (serverWebhookUrl && !fields.webhookUrl.value) {
      fields.webhookUrl.resetValue(serverWebhookUrl)
    }
  }, [serverWebhookUrl])

  const {
    submitting,
    onError,
    error: mutationError,
    onCompleted,
    submitMutation
  } = useMutationProps()

  const {error: fieldError, value: fieldValue} = fields.webhookUrl
  const isUpdateDisabled = (error?: string, value?: any) =>
    !!error || submitting || !value || (value === serverWebhookUrl && !mutationError)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const {error, value: webhookUrl} = validateField('webhookUrl')
    if (isUpdateDisabled(error, webhookUrl)) return
    setDirtyField()
    submitMutation()
    if (activeProvider) {
      UpdateIntegrationProviderMutation(
        atmosphere,
        {
          provider: {
            id: activeProvider.id,
            scope: 'team',
            teamId,
            webhookProviderMetadataInput: {
              webhookUrl
            }
          }
        },
        {onError, onCompleted}
      )
    } else {
      const handleCompleted = (res: TAddIntegrationProviderMutation['response']) => {
        const {addIntegrationProvider} = res
        const {provider} = addIntegrationProvider
        if (!provider) return
        const {id: providerId} = provider
        AddTeamMemberIntegrationAuthMutation(
          atmosphere,
          {providerId, teamId},
          {onError, onCompleted}
        )
      }

      AddIntegrationProviderMutation(
        atmosphere,
        {
          input: {
            scope: 'team',
            service: 'mattermost',
            teamId,
            authStrategy: 'webhook',
            webhookProviderMetadataInput: {
              webhookUrl
            }
          }
        },
        {onError, onCompleted: handleCompleted}
      )
    }
  }

  return (
    <div className='border-hairline border-t p-4'>
      <div className='flex items-center pb-4'>
        <LabelHeading className='w-full'>Connection</LabelHeading>
      </div>
      <form onSubmit={onSubmit}>
        <div className='flex items-center py-2'>
          <span className='relative mr-4 flex w-full items-center text-[14px]'>
            Mattermost Webhook
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='ml-1 h-6 w-6 text-fg-secondary hover:cursor-pointer'>
                  <InfoIcon />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                Configure in Mattermost: Main Menu &gt; Integrations &gt; Incoming Webhook
              </TooltipContent>
            </Tooltip>
          </span>
          <BasicInput
            value={fields.webhookUrl.value}
            error=''
            onChange={onChange}
            name='webhookUrl'
            placeholder='Enter your webhook URL here...'
          />
          <Button
            variant='flat'
            size='md'
            className='mx-4 min-w-9 border-hairline-strong font-semibold text-[12px] text-fg-primary'
            disabled={isUpdateDisabled(fieldError, fieldValue)}
          >
            Update
          </Button>
        </div>
        {fieldError && <StyledError>{fieldError}</StyledError>}
        {!fieldError && mutationError && <StyledError>{mutationError.message}</StyledError>}
      </form>
      {teamNotificationSettings && <NotificationSettings settings={teamNotificationSettings} />}
    </div>
  )
}

export default MattermostPanel
