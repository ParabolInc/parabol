import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import Avatar from 'universal/components/Avatar/Avatar';
import UserTag from 'universal/components/UserTag/UserTag';
import AvatarPlaceholder from 'universal/components/AvatarPlaceholder/AvatarPlaceholder';
import brandMark from 'universal/styles/theme/images/brand/mark-color.svg';

const OrganizationRow = (props) => {
  const {
    organization: {
      name,
      activeUserCount,
      inactiveUserCount,
      picture
    },
    onRowClick,
    styles
  } = props;
  return (
    <div className={css(styles.orgRow)}>
      <div className={css(styles.orgAvatar)} onClick={onRowClick}>
        <img className={css(styles.avatarImg)} height={50} width={50} src={picture || brandMark}/>
      </div>
      <div className={css(styles.orgInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.name)} onClick={onRowClick}>
            {name}
          </div>
          <div className={css(styles.subHeader)}>
            {activeUserCount + inactiveUserCount} Users ({activeUserCount} Active)
          </div>
        </div>
      </div>
      <div className={css(styles.orgActions)}>
        <span onClick={onRowClick}>Settings and Billing</span>
      </div>
    </div>
  );
};

OrganizationRow.propTypes = {
  actions: PropTypes.any,
  email: PropTypes.string,
  invitedAt: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLead: PropTypes.bool,
  picture: PropTypes.string,
  name: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  orgRow: {
    alignItems: 'center',
    borderBottom: `1px solid ${appTheme.palette.mid20l}`,
    display: 'flex',
    padding: '1rem 0 1rem 1rem',
    width: '100%'
  },

  orgAvatar: {
    cursor: 'pointer'
  },

  orgInfo: {
    paddingLeft: '1rem'
  },

  orgActions: {
    color: appTheme.palette.dark,
    flex: 1,
    fontWeight: 700,
    marginRight: '1rem',
    cursor: 'pointer',
    textAlign: 'right',
    textDecoration: 'underline',
  },

  nameAndTags: {
    // Define
  },

  name: {
    color: appTheme.palette.dark,
    cursor: 'pointer',
    display: 'inline-block',
    fontSize: appTheme.typography.s4,
    lineHeight: '1.625rem',
    verticalAlign: 'middle'
  },

  invitedAt: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
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
  },

  subHeader: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4,
  },
});

export default withStyles(styleThunk)(OrganizationRow);
