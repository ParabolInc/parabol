import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import upperFirst from 'universal/utils/upperFirst';
import OutcomeCardMenuButton from './OutcomeCardMenuButton';
import getOutcomeNames from 'universal/utils/getOutcomeNames';

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: theme.palette.mid50l
};
let styles = {};

const OutcomeCardStatusMenu = (props) => {
  const {onComplete, outcome, isAgenda, isProject} = props;
  const {id: outcomeId, status} = outcome;
  const outcomeName = isProject ? 'Project' : 'Action';

  const notArchivedLabel = <span>Move to Ar<u>c</u>hive</span>;
  const deleteOutcomeLabel = <span>De<u>l</u>ete this {outcomeName}</span>;
  const moveToActionsLabel = <span>Move to Ac<u>t</u>ions</span>;
  const moveToProjectsLabel = <span>Move to <u>P</u>rojects</span>;
  const buttonArray = labels.projectStatus.slugs.slice(0);

  const archiveProject = () => {
    const options = {
      variables: {
        updatedProject: {
          id: outcomeId,
          isArchived: true
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  const deleteOutcome = () => {
    const {argName, mutationName} = getOutcomeNames(outcome, 'delete');
    const options = {
      variables: {
        [argName]: outcomeId
      }
    };
    cashay.mutate(mutationName, options);
    if (onComplete) {
      onComplete();
    }
  };

  const toggleOutcomeType = () => {
    const {argName, mutationName} = getOutcomeNames(outcome, 'toggleType');
    const options = {
      variables: {
        [argName]: outcomeId
      }
    };
    cashay.mutate(mutationName, options);
    if (onComplete) {
      onComplete();
    }
  };

  const handleProjectUpdateFactory = (newStatus) => () => {
    if (newStatus === status) {
      return;
    }
    const options = {
      variables: {
        updatedProject: {
          id: outcomeId,
          status: newStatus
        }
      }
    };
    cashay.mutate('updateProject', options);
    if (onComplete) {
      onComplete();
    }
  };

  const makeButton = (newStatus, icon, label) => {
    const title = `Set status to ${upperFirst(newStatus)}`;
    const handleProjectUpdate = handleProjectUpdateFactory(newStatus);
    return (
      <OutcomeCardMenuButton
        disabled={status === newStatus}
        icon={icon}
        label={label}
        onClick={handleProjectUpdate}
        status={newStatus}
        title={title}
      />
    );
  };

  return (
    <div className={styles.root}>
      {isProject && buttonArray.map((btn, idx) => {
        const btnStatus = labels.projectStatus[btn];
        return (
          <div className={styles.column} key={idx}>
            {makeButton(btnStatus.slug, btnStatus.icon, btnStatus.shortcutLabel, idx)}
          </div>
        );
      })}
      {isProject && !isAgenda &&
        <div className={styles.buttonBlock}>
          <OutcomeCardMenuButton
            icon="archive"
            label={notArchivedLabel}
            onClick={archiveProject}
            status="archive"
            title="Move to archive"
          />
        </div>
      }
      {isAgenda &&
        <div className={styles.buttonBlock}>
          <OutcomeCardMenuButton
            icon="times"
            label={deleteOutcomeLabel}
            onClick={deleteOutcome}
            status="archive"
            title={`Delete this ${outcomeName}`}
          />
        </div>
      }
      {isAgenda &&
        (isProject ?
          <div className={styles.buttonBlock}>
            <OutcomeCardMenuButton
              icon="calendar-check-o"
              label={moveToActionsLabel}
              onClick={toggleOutcomeType}
              status="active"
              title="Move to Actions"
            />
          </div> :
          <div className={styles.buttonBlock}>
            <OutcomeCardMenuButton
              icon="calendar"
              label={moveToProjectsLabel}
              onClick={toggleOutcomeType}
              status="active"
              title="Move to Projects"
            />
          </div>)
      }
    </div>
  );
};

OutcomeCardStatusMenu.propTypes = {
  outcome: PropTypes.object,
  isAgenda: PropTypes.bool,
  isProject: PropTypes.bool,
  onComplete: PropTypes.func
};

styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    fontSize: 0,
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '12rem',
    minHeight: '5.1875rem',
    padding: '.125rem',
    textAlign: 'center',
    width: '100%'
  },

  column: {
    display: 'inline-block',
    fontSize: '1rem',
    padding: '.25rem',
    width: '50%'
  },

  button: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
    color: theme.palette.dark,
    cursor: 'pointer',
    margin: 0,
    outline: 'none',
    padding: '.25rem .5rem',
    width: '100%',

    ':hover': {
      ...buttonHF
    },
    ':focus': {
      ...buttonHF,
      borderColor: theme.palette.dark90d
    }
  },

  buttonBlock: {
    padding: '.25rem',
    width: '100%'
  },

  label: {
    fontWeight: 700,
    textTransform: 'uppercase'
  },

  disabled: {
    cursor: 'not-allowed',
    opacity: '.35'
  },

  ...projectStatusStyles('color'),

  archive: {
    color: labels.archive.color
  },
  archived: {
    color: labels.archived.color
  }
});

export default look(OutcomeCardStatusMenu);
