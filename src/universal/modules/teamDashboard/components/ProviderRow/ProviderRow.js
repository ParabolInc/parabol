import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import Row from 'universal/components/Row/Row';
import Tag from 'universal/components/Tag/Tag';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import github from 'universal/styles/theme/images/graphics/GitHub-Mark-120px-plus.png';
import slack from 'universal/styles/theme/images/graphics/Slack_Mark.svg';

const imageLookup = {
  github,
  slack
};

const OrgUserRow = (props) => {
  const {
    name,
    provider: {
      accessToken,
      userCount,
      integrationCount,
      providerUserName
    },
    styles
  } = props;
  return (
    <Row>
      <div className={css(styles.providerAvatar)}>
        <img className={css(styles.avatarImg)} height={50} width={50} src={imageLookup[name]} />
      </div>
      <div className={css(styles.userInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.preferredName)}>
            {providerUserName}
          </div>
        </div>
      </div>
    </Row>
  );
};

OrgUserRow.propTypes = {
  actions: PropTypes.any,
  orgUser: PropTypes.shape({
    email: PropTypes.string,
    inactive: PropTypes.bool,
    picture: PropTypes.string,
    preferredName: PropTypes.string
  }),
  styles: PropTypes.object
};

const styleThunk = () => ({
  providerAvatar: {
    // Define
  },

  userInfo: {
    paddingLeft: '1rem'
  },

  userActions: {
    alignItems: 'center',
    display: 'flex',
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
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
  },

  infoLink: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,

    ':hover': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    },
    ':focus': {
      color: appTheme.palette.mid,
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(OrgUserRow);
