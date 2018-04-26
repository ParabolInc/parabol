import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import {
  Avatar,
  Row,
  RowActions,
  RowInfo,
  RowInfoHeader,
  RowInfoHeading,
  RowInfoLink,
  Tag
} from 'universal/components';
import defaultUserAvatar from 'universal/styles/theme/images/avatar-user.svg';

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
      <div>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small" /> :
          <img alt="" src={defaultUserAvatar} />
        }
      </div>
      <RowInfo>
        <RowInfoHeader>
          <RowInfoHeading>{preferredName}</RowInfoHeading>
          {isBillingLeader &&
            <Tag colorPalette="blue" label="Billing Leader" />
          }
          {inactive && !viewerIsBillingLeader &&
            <Tag colorPalette="midGray" label="Inactive" />
          }
        </RowInfoHeader>
        <RowInfoLink href={`mailto:${email}`} title="Send an email">
          {email}
        </RowInfoLink>
      </RowInfo>
      {actions &&
        <RowActions>
          {actions}
        </RowActions>
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
