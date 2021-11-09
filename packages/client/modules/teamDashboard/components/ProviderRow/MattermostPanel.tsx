import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent} from 'react'
import {useFragment} from 'react-relay'
import useForm from '~/hooks/useForm'
import FlatButton from '../../../../components/FlatButton'
import BasicInput from '../../../../components/InputField/BasicInput'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddMattermostAuthMutation from '../../../../mutations/AddMattermostAuthMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import Legitity from '../../../../validation/Legitity'
import {MattermostPanel_viewer$key} from '~/__generated__/MattermostPanel_viewer.graphql'
import {Layout} from '../../../../types/constEnums'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import linkify from '~/utils/linkify'
import useTooltip from '~/hooks/useTooltip'
import {MenuPosition} from '~/hooks/useCoords'

interface Props {
  viewerRef: MattermostPanel_viewer$key
  teamId: string
}

const MattermostPanelStyles = styled('div')({
  borderTop: `1px solid ${PALETTE.SLATE_300}`,
  padding: Layout.ROW_GUTTER
})

const ConnectionGroup = styled('div')({
  alignItems: 'center',
  display: 'flex',
  paddingBottom: 16
})

const Heading = styled(LabelHeading)({
  width: '100%'
})

const Row = styled('div')({
  alignItems: 'center',
  display: 'flex',
  padding: '8px 0'
})

const Label = styled('span')({
  fontSize: 14,
  marginRight: 16,
  width: '100%'
})

const StyledButton = styled(FlatButton)({
  borderColor: PALETTE.SLATE_400,
  color: PALETTE.SLATE_700,
  fontSize: 12,
  fontWeight: 600,
  minWidth: 36,
  marginLeft: '16px',
  marginRight: '16px'
})

const MattermostPanel = (props: Props) => {
  const {teamId, viewerRef} = props
  const viewer = useFragment(
    graphql`
      fragment MattermostPanel_viewer on User {
        teamMember(teamId: $teamId) {
          integrations {
            mattermost {
              isActive
              webhookUrl
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
  const atmosphere = useAtmosphere()

  const {validateField, setDirtyField, onChange, fields} = useForm({
    webhookUrl: {
      getDefault: () => mattermost?.webhookUrl || '',
      validate: (rawInput: string) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : ''
        })
      }
    }
  })

  const {
    submitting,
    onError,
    error: mutationError,
    onCompleted,
    submitMutation
  } = useMutationProps()

  const {error: fieldError, value: fieldValue} = fields.webhookUrl
  // corner case: let them re-upsert the same webhook url when reverting to a
  //              previous value
  const updateDisabled = (error, value) =>
    error || submitting || !value || (value === mattermost?.webhookUrl && !mutationError)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const {error, value: webhookUrl} = validateField('webhookUrl')
    if (updateDisabled(error, webhookUrl)) return
    setDirtyField()
    submitMutation()
    AddMattermostAuthMutation(atmosphere, {webhookUrl, teamId}, {onError, onCompleted})
  }

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_LEFT
  )

  return (
    <MattermostPanelStyles>
      <ConnectionGroup>
        <Heading>Connection</Heading>
      </ConnectionGroup>
      <form onSubmit={onSubmit}>
        <Row>
          <Label onMouseOver={openTooltip} onMouseOut={closeTooltip} ref={originRef}>
            Mattermost Webhook
          </Label>
          {tooltipPortal('Configure in Mattermost: Main Menu > Integrations > Incoming Webhook')}
          <BasicInput
            value={fields.webhookUrl.value}
            error=''
            onChange={onChange}
            name='webhookUrl'
            placeholder='https://my.mattermost.com:8065/hooks/abc123'
          />
          <StyledButton size='medium' disabled={updateDisabled(fieldError, fieldValue)}>
            Update
          </StyledButton>
        </Row>
        {fieldError && <StyledError>{fieldError}</StyledError>}
        {!fieldError && mutationError && <StyledError>{mutationError.message}</StyledError>}
      </form>
    </MattermostPanelStyles>
  )
}

export default MattermostPanel
