import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import Row from 'universal/components/Row/Row';
import Tag from 'universal/components/Tag/Tag';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import fromNow from 'universal/utils/fromNow';
import styled from 'react-emotion';

const UserInfo = styled('div')({
  paddingLeft: '1rem'
});

const UserActions = styled('div')({
  alignItems: 'center',
  flex: 1,
  justifyContent: 'flex-end'
});

const PreferredName = styled('div')({
  color: appTheme.palette.dark,
  display: 'inline-block',
  fontSize: appTheme.typography.s4,
  lineHeight: '1.625rem',
  verticalAlign: 'middle'
});

const InvitedAt = styled('div')({
  color: appTheme.palette.dark,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: appTheme.typography.s4
});

const InfoLink = styled('a')({
  color: appTheme.palette.mid,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: appTheme.typography.s4,

  ':hover, :focus': {
    color: appTheme.palette.mid,
    textDecoration: 'underline'
  }
});

const UserRow = (props) => {
  const {actions, possibleTeamMember} = props;
  const {__typename: type, email, isLead, picture, preferredName, createdAt, updatedAt} = possibleTeamMember;
  return (
    <Row>
      <div>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small" /> :
          <img alt="" src={defaultUserAvatar} />
        }
      </div>
      <UserInfo>
        {type === 'TeamMember' ?
          <div>
            <PreferredName>{preferredName}</PreferredName>
            {isLead && <Tag colorPalette="blue" label="Team Lead" />}
          </div> :
          <PreferredName>{email}</PreferredName>
        }
        {type !== 'TeamMember' ?
          <InvitedAt>
            {`invited ${fromNow(createdAt || updatedAt)}`}
          </InvitedAt> :
          <InfoLink href={`mailto:${email}`} title="Send an email">
            {email}
          </InfoLink>
        }
      </UserInfo>
      {actions &&
        <UserActions>
          {actions}
        </UserActions>
      }
    </Row>
  );
};

UserRow.propTypes = {
  actions: PropTypes.any,
  possibleTeamMember: PropTypes.object.isRequired,
  styles: PropTypes.object
};

UserRow.defaultProps = {
  email: 'name@company.co'
};

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
);
