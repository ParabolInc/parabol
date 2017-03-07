import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import {ib} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';
import shortid from 'shortid';
import {cashay} from 'cashay';
import {selectNewActionTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';
import getNextSortOrder from 'universal/utils/getNextSortOrder';

const height = '1.25rem';
const lineHeight = height;

const iconStyle = {
  ...ib,
  fontSize: ui.iconSize,
  height,
  lineHeight,
  marginRight: '.3125rem',
  textAlign: 'center',
  verticalAlign: 'middle',
  width: '1rem'
};

const UserActionListTeamSelect = (props) => {
  const {actions, styles, teams, userId} = props;
  const cancelAddAction = () => {
    props.dispatch(selectNewActionTeam(false));
  };

  const selectTeamFactory = (teamId) => () => {
    const options = {
      variables: {
        newAction: {
          id: `${teamId}::${shortid.generate()}`,
          teamMemberId: `${userId}::${teamId}`,
          sortOrder: getNextSortOrder(actions)
        }
      }
    };
    cashay.mutate('createAction', options);
    props.dispatch(selectNewActionTeam(false));
  };
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.header)}>
        <FontAwesome
          className={css(styles.cancel)}
          name="times-circle"
          onClick={cancelAddAction}
          style={iconStyle}
          title="Cancel"
        />
        <Type bold display="inlineBlock" lineHeight={lineHeight} scale="s3" width="auto">
          Select a Team:
        </Type>
      </div>
      <div className={css(styles.controls)}>
        {teams.map(({name, id}) => {
          return (
            <div
              key={`teamSelect${id}`}
              className={css(styles.control)}
              onClick={selectTeamFactory(id)}
              title={`Select team: ${name}`}
            >
              {name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

UserActionListTeamSelect.propTypes = {
  actions: PropTypes.array,
  styles: PropTypes.object,
  teams: PropTypes.array,
  userId: PropTypes.string
};

const styleThunk = () => ({
  root: {
    width: '100%'
  },

  header: {
    fontSize: 0,
    padding: '.25rem .875rem .25rem .4375rem'
  },

  cancel: {
    color: appTheme.palette.mid,
    cursor: 'pointer',

    ':hover': {
      color: appTheme.palette.dark
    },
    ':focus': {
      color: appTheme.palette.dark
    }
  },

  controls: {
    padding: '0 .5rem .5rem 1.75rem'
  },

  control: {
    color: appTheme.palette.warm,
    cursor: 'pointer',
    lineHeight: '1.5rem',
    padding: '.25rem 0',

    ':hover': {
      textDecoration: 'underline'
    },
    ':focus': {
      textDecoration: 'underline'
    }
  }
});

export default withStyles(styleThunk)(UserActionListTeamSelect);
