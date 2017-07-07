import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import FontAwesome from 'react-fontawesome';
import {createFragmentContainer} from 'react-relay';
import Row from 'universal/components/Row/Row';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {GITHUB, SLACK} from 'universal/utils/constants';
import makeHref from 'universal/utils/makeHref';
import {Link} from 'react-router-dom';

const providerLookup = {
  [GITHUB]: {
    ...ui.providers.github
  },
  [SLACK]: {
    ...ui.providers.slack,
    makeUri: (jwt, teamMemberId) => {
      const redirect = makeHref('/auth/slack');
      const [, teamId] = teamMemberId.split('::');
      // state is useful for CSRF, but we jwt to make sure the person isn't overwriting the int for another team
      const state = `${teamId}::${jwt}`;
      // eslint-disable-next-line
      return `https://slack.com/oauth/authorize?client_id=${window.__ACTION__.slack}&scope=channels:read,chat:write:bot&state=${state}&redirect_uri=${redirect}`;
    }
  }
};

const defaultDetails = {
  userCount: 0,
  integrationCount: 0
};

const ProviderRow = (props) => {
  const {
    jwt,
    name,
    providerDetails,
    styles,
    teamMemberId
  } = props;
  const {
    accessToken,
    userCount,
    integrationCount,
    providerUserName
  } = providerDetails || defaultDetails;
  const {color, icon, description, makeUri, providerName} = providerLookup[name];
  const openOauth = () => {
    const {teamMemberId} = props;
    //const team =
    const uri = makeUri(jwt, teamMemberId);
    window.open(uri);
  };
  const [,teamId] = teamMemberId.split('::');
  const linkStyle = {
    display: 'block',
    textDecoration: 'none'
  };
  return (
    <Row>
      <Link to={`/team/${teamId}/settings/integrations/${name}`} style={linkStyle}>
        <div className={css(styles.providerAvatar)} style={{backgroundColor: color}}>
          <FontAwesome name={icon} className={css(styles.providerIcon)}/>
        </div>
      </Link>
      <div className={css(styles.userInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.providerName)}>
            {providerName}
          </div>
          <div className={css(styles.subHeading)}>
            {description}
          </div>
        </div>
      </div>
      <div className={css(styles.providerActions)}>
        {accessToken ?
          <span>Team Settings</span> :
          <span onClick={openOauth}>Link my account</span>
        }
      </div>
    </Row>
  );
};


ProviderRow.propTypes = {
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
    borderRadius: ui.providerIconBorderRadius
  },

  providerIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: ui.providerIconSize,
    justifyContent: 'center',
    width: ui.providerIconSize
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

  providerName: {
    ...ui.providerName,
    display: 'inline-block',
    verticalAlign: 'middle'
  },

  providerActions: {
    color: appTheme.palette.dark,
    flex: 1,
    fontWeight: 700,
    marginRight: '1rem',
    cursor: 'pointer',
    textAlign: 'right',
    textDecoration: 'underline'
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
  },
  subHeading: {
    ...ui.rowSubheading
  }
});

export default createFragmentContainer(
  withStyles(styleThunk)(ProviderRow),
  graphql`
    fragment ProviderRow_providerDetails on ProviderRow {
      accessToken
    }
  `
);
