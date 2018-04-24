import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {Avatar, Row, Tag} from 'universal/components';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';
import styled from 'react-emotion';
import appTheme from 'universal/styles/theme/appTheme';


const UserAvatar = styled('div')({
  // Define
});

const UserInfo = styled('div')({
  paddingLeft: '1rem'
});

const UserActions = styled('div')({
  alignItems: 'center',
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-end'
});

const NameAndTags = styled('div')({
  // Define
});

const PreferredName = styled('div')({
  color: appTheme.palette.dark,
  display: 'inline-block',
  fontSize: appTheme.typography.s4,
  lineHeight: '1.625rem',
  verticalAlign: 'middle'
});

const InfoLink = styled('a')({
  color: appTheme.palette.mid,
  fontSize: appTheme.typography.s2,
  fontWeight: 600,
  lineHeight: appTheme.typography.s4,

  '&:hover,:focus': {
    color: appTheme.palette.mid,
    textDecoration: 'underline'
  }
});


const OrgUserRow = (props) => {
  const {
    actions,
    orgMember: {
      user: {
        email,
        inactive,
        picture,
        preferredName
      },
      isBillingLeader
    },
    viewerIsBillingLeader
  } = props;
  return (
    <Row>
      <UserAvatar>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small" /> :
          <img alt="" src={defaultUserAvatar} />
        }
      </UserAvatar>
      <UserInfo>
        <NameAndTags>
          <PreferredName>
            {preferredName}
          </PreferredName>
          {isBillingLeader &&
            <Tag colorPalette="blue" label="Billing Leader" />
          }
          {inactive && !viewerIsBillingLeader &&
            <Tag colorPalette="midGray" label="Inactive" />
          }
        </NameAndTags>
        <InfoLink href={`mailto:${email}`} title="Send an email">
          {email}
        </InfoLink>
      </UserInfo>
      {actions &&
        <UserActions>
          {actions}
        </UserActions>
      }
    </Row>
  );
};

OrgUserRow.propTypes = {
  actions: PropTypes.any,
  orgMember: PropTypes.object.isRequired,
  viewerIsBillingLeader: PropTypes.bool
};

export default createFragmentContainer(
  OrgUserRow,
  graphql`
    fragment OrgUserRow_orgMember on OrganizationMember {
      user {
        email
        inactive
        picture
        preferredName
      }
      isBillingLeader
    }
  `
);
