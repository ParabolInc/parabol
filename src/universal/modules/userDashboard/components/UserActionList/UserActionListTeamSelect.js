import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import {ib} from 'universal/styles/helpers';
import ui from 'universal/styles/ui';
import FontAwesome from 'react-fontawesome';
import Type from 'universal/components/Type/Type';
import shortid from 'shortid';
import {cashay} from 'cashay';
import {SORT_STEP} from 'universal/utils/constants';
import {selectNewActionTeam} from 'universal/modules/userDashboard/ducks/userDashDuck';

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
  const {styles} = UserActionListTeamSelect;
  const {actionCount, teams, userId} = props;

  const cancelAddAction = () => {
    props.dispatch(selectNewActionTeam(false));
  };

  const selectTeamFactory = (teamId) => () => {
    const options = {
      variables: {
        newAction: {
          id: `${teamId}::${shortid.generate()}`,
          teamMemberId: `${userId}::${teamId}`,
          sortOrder: actionCount + SORT_STEP
        }
      }
    };
    cashay.mutate('createAction', options);
    props.dispatch(selectNewActionTeam(false));
  }
  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <FontAwesome
          className={styles.cancel}
          name="times-circle"
          onClick={cancelAddAction}
          style={iconStyle}
          title="Cancel"
        />
        <Type bold display="inlineBlock" lineHeight={lineHeight} scale="s3" width="auto">
          Select a Team:
        </Type>
      </div>
      <div className={styles.controls}>
        {teams.map(({name, id}) => {
          return (
            <div
              key={`teamSelect${id}`}
              className={styles.control}
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

UserActionListTeamSelect.styles = StyleSheet.create({
  root: {
    width: '100%'
  },

  header: {
    fontSize: 0,
    padding: '.25rem .875rem .25rem .4375rem'
  },

  cancel: {
    color: theme.palette.mid,
    cursor: 'pointer',

    ':hover': {
      color: theme.palette.dark
    },
    ':focus': {
      color: theme.palette.dark
    }
  },

  controls: {
    padding: '0 .5rem .5rem 1.75rem'
  },

  control: {
    color: theme.palette.warm,
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

export default look(UserActionListTeamSelect);
