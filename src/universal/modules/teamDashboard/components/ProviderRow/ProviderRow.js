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
    description: 'Sync issues and PRs',
    color: 'black',
    icon: 'github',
    providerName: 'GitHub'
  },
  [SLACK]: {
    description: 'Get meeting notifications',
    color: 'blue',
    icon: 'slack',
    providerName: 'Slack',
    makeUri: (jwt, teamMemberId) => {
      const redirect = makeHref('/auth/slack');
      const [, teamId] = teamMemberId.split('::');
      // state is useful for CSRF, but we jwt to make sure the person isn't overwriting the int for another team
      const state = `${teamId}::${jwt}`;
      console.log('state', state)
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
  console.log('provD', providerDetails)
  const openOauth = () => {
    const {teamMemberId} = props;
    //const team =
    const uri = makeUri(jwt, teamMemberId);
    window.open(uri);
  };
  const [,teamId] = teamMemberId.split('::');
  return (
    <Row>
      <Link to={`/team/${teamId}/settings/integrations/${name}`}>
      <div className={css(styles.providerAvatar)} style={{backgroundColor: color}}>
        <FontAwesome name={icon} className={css(styles.providerIcon)}/>
        {/*<img className={css(styles.avatarImg)} height={50} width={50} src={image}/>*/}
      </div>
      </Link>
      <div className={css(styles.userInfo)}>
        <div className={css(styles.nameAndTags)}>
          <div className={css(styles.preferredName)}>
            {providerName}
          </div>
          <div className={css(styles.subHeader)}>
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
    //height: 50,
    //width: 50,
    borderRadius: '8px'
    // Define
  },
  providerIcon: {
    alignItems: 'center',
    color: '#fff',
    display: 'flex !important',
    fontSize: `${ui.iconSize2x} !important`,
    height: 50,
    justifyContent: 'center',
    width: 50
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
  subHeader: {
    color: appTheme.palette.mid,
    fontSize: appTheme.typography.s2,
    fontWeight: 700,
    lineHeight: appTheme.typography.s4
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