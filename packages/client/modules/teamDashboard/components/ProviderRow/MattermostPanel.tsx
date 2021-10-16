import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {FormEvent} from 'react'
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
      getDefault: () => mattermost?.webhookUrl,
      validate: (rawInput) => {
        return new Legitity(rawInput).test((maybeUrl) => {
          if (!maybeUrl) return 'No link provided'
          const links = linkify.match(maybeUrl)
          return !links ? 'Not looking too linky' : undefined
        })
      }
    }
  })

  const {submitting, onError, error, onCompleted, submitMutation} = useMutationProps()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    const {error: webhookUrlErr, value: webhookUrl} = validateField('webhookUrl')
    if (webhookUrlErr) return
    submitMutation()
    AddMattermostAuthMutation(atmosphere, {webhookUrl, teamId}, {onError, onCompleted})
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => setDirtyField(e.target.name)

  // does not show disabled when submitting because the temporary disabled mouse icon is ugly
  return (
    <MattermostPanelStyles>
      <ConnectionGroup>
        <Heading>Connection</Heading>
      </ConnectionGroup>
      <form onSubmit={onSubmit}>
        <Row>
          <Label>Mattermost Webhook</Label>
          <BasicInput
            value={fields.webhookUrl.value}
            error={fields.webhookUrl.dirty ? fields.webhookUrl.error : undefined}
            onChange={onChange}
            onBlur={onBlur}
            name='webhookUrl'
            placeholder='http://my.mattermost.com:8065/hooks/abc123'
          />
          <StyledButton size='medium'>Update</StyledButton>
        </Row>
        {fields.webhookUrl.error && <StyledError>{fields.webhookUrl.error}</StyledError>}
        {error && <StyledError>{error}</StyledError>}
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
