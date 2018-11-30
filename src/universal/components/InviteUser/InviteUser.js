import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import {Field, SubmissionError, reduxForm} from 'redux-form'
import RaisedButton from 'universal/components/RaisedButton'
import Editable from 'universal/components/Editable/Editable'
import Row from 'universal/components/Row/Row'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import InviteTeamMembersMutation from 'universal/mutations/InviteTeamMembersMutation'
import appTheme from 'universal/styles/theme/appTheme'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import ui from 'universal/styles/ui'
import inviteUserValidation from './inviteUserValidation'
import styled from 'react-emotion'

const makeSchemaProps = (props) => {
  const {
    team: {invitations, orgApprovals, teamMembers}
  } = props
  const inviteEmails = invitations.map((i) => i.email)
  const teamMemberEmails = teamMembers.map((i) => i.email)
  const orgApprovalEmails = orgApprovals.map((i) => i.email)
  return {inviteEmails, orgApprovalEmails, teamMemberEmails}
}

const validate = (values, props) => {
  const schemaProps = makeSchemaProps(props)
  const schema = inviteUserValidation(schemaProps)
  return schema(values).errors
}

const fieldStyles = {
  color: ui.colorText,
  fontSize: appTheme.typography.s4,
  lineHeight: '1.625rem',
  placeholderColor: ui.placeholderColor
}

const InviteRow = styled(Row)({border: 0})

const FieldBlock = styled('div')({
  flex: 1,
  padding: `0 ${ui.rowGutter}`
})

const InviteUser = (props) => {
  const {atmosphere, handleSubmit, submitting, team, touch, untouch} = props
  const {teamId} = team

  const updateEditable = async (submissionData) => {
    const schemaProps = makeSchemaProps(props)
    const schema = inviteUserValidation(schemaProps)
    const {
      data: {inviteTeamMember},
      errors
    } = schema(submissionData)
    if (Object.keys(errors).length) {
      throw new SubmissionError(errors)
    }
    const invitees = [{email: inviteTeamMember}]
    InviteTeamMembersMutation(atmosphere, {invitees, teamId})
  }
  return (
    <InviteRow>
      <img alt='' src={defaultUserAvatar} />
      <FieldBlock>
        <Field
          component={Editable}
          handleSubmit={handleSubmit(updateEditable)}
          hideIconOnValue
          name='inviteTeamMember'
          placeholder='name@company.co'
          touch={touch}
          typeStyles={fieldStyles}
          untouch={untouch}
        />
      </FieldBlock>
      <RaisedButton onClick={handleSubmit(updateEditable)} palette='mid' waiting={submitting}>
        {'Send Invite'}
      </RaisedButton>
    </InviteRow>
  )
}

InviteUser.propTypes = {
  atmosphere: PropTypes.object.isRequired,
  actions: PropTypes.any,
  handleSubmit: PropTypes.func.isRequired,
  onInviteSubmitted: PropTypes.func,
  picture: PropTypes.string,
  submitting: PropTypes.bool.isRequired,
  team: PropTypes.object.isRequired,
  touch: PropTypes.func.isRequired,
  untouch: PropTypes.func.isRequired
}

/*
 * This form's redux data is automatically cleared after it is
 * submitted.
 *
 * See: universal/redux/makeReducer.js
 */
export default createFragmentContainer(
  withAtmosphere(reduxForm({form: 'inviteTeamMember', validate})(InviteUser)),
  graphql`
    fragment InviteUser_team on Team {
      teamId: id
      teamMembers(sortBy: "preferredName") {
        email
      }
      invitations {
        email
      }
      orgApprovals {
        email
      }
    }
  `
)
