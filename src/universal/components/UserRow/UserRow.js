import PropTypes from 'prop-types'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg'
import fromNow from 'universal/utils/fromNow'
import Row from 'universal/components/Row/Row'
import Avatar from 'universal/components/Avatar/Avatar'
import RowInfo from 'universal/components/Row/RowInfo'
import RowInfoHeader from 'universal/components/Row/RowInfoHeader'
import RowInfoHeading from 'universal/components/Row/RowInfoHeading'
import RowInfoCopy from 'universal/components/Row/RowInfoCopy'
import RowInfoLink from 'universal/components/Row/RowInfoLink'
import RowActions from 'universal/components/Row/RowActions'
import Tag from 'universal/components/Tag/Tag'

const UserRow = (props) => {
  const {actions, possibleTeamMember} = props
  const {
    __typename: type,
    email,
    isLead,
    picture,
    preferredName,
    createdAt,
    updatedAt
  } = possibleTeamMember
  return (
    <Row>
      <div>
        {picture ? (
          <Avatar hasBadge={false} picture={picture} size='small' />
        ) : (
          <img alt='' src={defaultUserAvatar} />
        )}
      </div>
      <RowInfo>
        {type === 'TeamMember' ? (
          <RowInfoHeader>
            <RowInfoHeading>{preferredName}</RowInfoHeading>
            {isLead && <Tag colorPalette='blue' label='Team Lead' />}
          </RowInfoHeader>
        ) : (
          <RowInfoHeading>{email}</RowInfoHeading>
        )}
        {type !== 'TeamMember' ? (
          <RowInfoCopy useHintCopy>{`Invited ${fromNow(createdAt || updatedAt)}`}</RowInfoCopy>
        ) : (
          <RowInfoLink href={`mailto:${email}`} title='Send an email'>
            {email}
          </RowInfoLink>
        )}
      </RowInfo>
      {actions && <RowActions>{actions}</RowActions>}
    </Row>
  )
}

UserRow.propTypes = {
  actions: PropTypes.any,
  possibleTeamMember: PropTypes.object.isRequired
}

UserRow.defaultProps = {
  email: 'name@company.co'
}

export default createFragmentContainer(
  UserRow,
  graphql`
    fragment UserRow_possibleTeamMember on PossibleTeamMember {
      __typename
      email
      ... on Invitation {
        updatedAt
      }
      ... on OrgApproval {
        createdAt
      }
      ... on TeamMember {
        isLead
        picture
        preferredName
      }
    }
  `
)
