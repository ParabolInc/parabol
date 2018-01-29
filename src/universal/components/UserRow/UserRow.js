import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import Row from 'universal/components/Row/Row';
import Tag from 'universal/components/Tag/Tag';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import fromNow from 'universal/utils/fromNow';

const UserRow = (props) => {
  const {
    actions,
    possibleTeamMember,
    styles
  } = props;
  const {__typename: type, email, isLead, picture, preferredName, createdAt, updatedAt} = possibleTeamMember;
  return (
    <Row>
      <div className={css(styles.userAvatar)}>
        {picture ?
          <Avatar hasBadge={false} picture={picture} size="small" /> :
          <AvatarPlaceholder />
        }
      </div>
      <div className={css(styles.userInfo)}>
        {type === 'TeamMember' ?
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.preferredName)}>
              {preferredName}
            </div>
            {isLead &&
              <Tag colorPalette="light" label="Lead" />
            }
          </div> :
          <div className={css(styles.nameAndTags)}>
            <div className={css(styles.preferredName)}>
              {email}
            </div>
          </div>
        }
        {type !== 'TeamMember' ?
          <div className={css(styles.invitedAt)}>
            {`invited ${fromNow(createdAt || updatedAt)}`}
          </div> :
          <a className={css(styles.infoLink)} href={`mailto:${email}`} title="Send an email">
            {email}
          </a>
        }
      </div>
      {actions &&
        <div className={css(styles.userActions)}>
          {actions}
        </div>
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

const styleThunk = () => ({
  userAvatar: {
    // Define
  },

  userInfo: {
    paddingLeft: '1rem'
  },

  userActions: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end'
  },

  nameAndTags: {
    // Define
  },

  preferredName: {
    color: appTheme.palette.dark,
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },

  invitedAt: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
  },

  infoLink: {
    color: appTheme.palette.dark,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(UserRow),
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
