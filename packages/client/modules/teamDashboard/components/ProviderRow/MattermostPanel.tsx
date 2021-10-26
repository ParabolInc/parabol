import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent, useEffect, useRef} from 'react'
import {createFragmentContainer} from 'react-relay'
import useForm from '~/hooks/useForm'
import FlatButton from '../../../../components/FlatButton'
import BasicInput from '../../../../components/InputField/BasicInput'
import StyledError from '../../../../components/StyledError'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useMutationProps from '../../../../hooks/useMutationProps'
import AddMattermostAuthMutation from '../../../../mutations/AddMattermostAuthMutation'
import {PALETTE} from '../../../../styles/paletteV3'
import Legitity from '../../../../validation/Legitity'
import {MattermostPanel_viewer} from '../../../../__generated__/MattermostPanel_viewer.graphql'
import {Layout} from '../../../../types/constEnums'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import linkify from '~/utils/linkify'
import useTooltip from '~/hooks/useTooltip'
import {MenuPosition} from '~/hooks/useCoords'

interface Props {
  viewer: MattermostPanel_viewer
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

const MattermostConfigConnection = (props: Props) => {
  const {teamId, viewer} = props
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

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (fields.webhookUrl.value == '') {
      inputRef.current?.focus()
    }
  }, [fields])

  const {
    submitting,
    onError,
    error: mutationError,
    onCompleted,
    submitMutation
  } = useMutationProps()

  const {error: fieldError} = fields.webhookUrl

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const {error: webhookUrlErr, value: webhookUrl} = validateField('webhookUrl')
    if (webhookUrlErr) return
    // corner case: let them re-upsert the same webhook url when reverting to a
    //              previous value
    if (mattermost?.webhookUrl == webhookUrl && !mutationError) return
    setDirtyField()
    submitMutation()
    AddMattermostAuthMutation(atmosphere, {webhookUrl, teamId}, {onError, onCompleted})
  }

  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_LEFT
  )
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => setDirtyField(e.target.name)

  return (
    <MattermostPanelStyles>
      <ConnectionGroup>
        <Heading>Connection</Heading>
      </ConnectionGroup>
      <form onSubmit={onSubmit}>
        <Row>
          <Label onMouseEnter={openTooltip} onMouseLeave={closeTooltip} ref={originRef}>
            Mattermost Webhook
          </Label>
          {tooltipPortal('Configure in Mattermost: Main Menu > Integrations > Incoming Webhook')}
          <BasicInput
            value={fields.webhookUrl.value}
            error=''
            onChange={onChange}
            onBlur={handleBlur}
            name='webhookUrl'
            placeholder='http://my.mattermost.com:8065/hooks/abc123'
            ref={inputRef}
          />
          <StyledButton size='medium'>Update</StyledButton>
        </Row>
        {fieldError && <StyledError>{fieldError}</StyledError>}
        {!fieldError && mutationError && <StyledError>{mutationError.message}</StyledError>}
      </form>
    </MattermostPanelStyles>
  )
}

export default createFragmentContainer(MattermostConfigConnection, {
  viewer: graphql`
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
  `
})
