import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {cashay} from 'cashay';
import appTheme from 'universal/styles/theme/appTheme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import upperFirst from 'universal/utils/upperFirst';
import OutcomeCardMenuButton from 'universal/modules/outcomeCard/components/OutcomeCardMenuButton/OutcomeCardMenuButton';

import getOutcomeNames from 'universal/utils/getOutcomeNames';

const buttonArray = labels.projectStatus.slugs.slice(0);

const OutcomeCardStatusMenu = (props) => {
  const {onComplete, outcome, isAgenda, isProject, styles} = props;
  const {id: outcomeId, status} = outcome;
  const outcomeName = isProject ? 'Project' : 'Action';
  const notArchivedLabel = <span>Move to Ar<u>c</u>hive</span>;
  const deleteOutcomeLabel = <span>De<u>l</u>ete this {outcomeName}</span>;
  const moveToActionsLabel = <span>Move to Ac<u>t</u>ions</span>;
  const moveToProjectsLabel = <span>Move to <u>P</u>rojects</span>;

  const archiveProject = () => {
    const options = {
      ops: {},
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
      ops: {},
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
    <div className={css(styles.root)}>
      {isProject && buttonArray.map((btn, idx) => {
        const btnStatus = labels.projectStatus[btn];
        return (
          <div className={css(styles.column)} key={btn}>
            {makeButton(btnStatus.slug, btnStatus.icon, btnStatus.shortcutLabel, idx)}
          </div>
        );
      })}
      {isProject && !isAgenda &&
        <div className={css(styles.buttonBlock)}>
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
        <div className={css(styles.buttonBlock)}>
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
          <div className={css(styles.buttonBlock)}>
            <OutcomeCardMenuButton
              icon="calendar-check-o"
              label={moveToActionsLabel}
              onClick={toggleOutcomeType}
              status="active"
              title="Move to Actions"
            />
          </div> :
          <div className={css(styles.buttonBlock)}>
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
  onComplete: PropTypes.func,
  styles: PropTypes.object
};

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: appTheme.palette.mid50l
};

const styleThunk = () => ({
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
    border: `1px solid ${appTheme.palette.mid30l}`,
    borderRadius: '.25rem',
    color: appTheme.palette.dark,
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
      borderColor: appTheme.palette.dark90d
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

export default withStyles(styleThunk)(OutcomeCardStatusMenu);
