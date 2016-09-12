import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import theme from 'universal/styles/theme';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';
import upperFirst from 'universal/utils/upperFirst';
import OutcomeCardMenuButton from './OutcomeCardMenuButton';

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: theme.palette.mid50l
};
let styles = {};

const OutcomeCardStatusMenu = (props) => {
  const {project: {isArchived, id: projectId, status}, isProject} = props;
  // const {project: {id: projectId, status}, isProject} = props;

  // const isArchived = true;

  const isArchivedLabel = <span>Take out of Ar<u>c</u>hive</span>;
  const notArchivedLabel = <span>Move to Ar<u>c</u>hive</span>;
  const deleteActionLabel = <span>De<u>l</u>ete this Action</span>;
  const moveToActionsLabel = <span>Move to Ac<u>t</u>ions</span>;
  const moveToProjectsLabel = <span>Move to <u>P</u>rojects</span>;

  const buttonArray = labels.projectStatus.slugs.slice(0);

  const unhandledStates = ['archive', 'action', 'project', 'deleted'];

  const handleProjectUpdate = (newStatus) => {
    if (newStatus === status) {
      return;
    } else if (unhandledStates.indexOf(newStatus) > -1) {
      console.log(`TODO: Handle change: ${newStatus}`);
      return;
    }
    const options = {
      variables: {
        updatedProject: {
          id: projectId,
          status: newStatus
        }
      }
    };
    cashay.mutate('updateProject', options);
  };

  const makeButton = (newStatus, icon, label) => {
    let isDisabled = false;
    const title = `Set status to ${upperFirst(newStatus)}`;
    if (status === newStatus) {
      isDisabled = true;
    }
    return (
      <OutcomeCardMenuButton
        disabled={isDisabled}
        icon={icon}
        label={label}
        onClick={() => handleProjectUpdate(newStatus)}
        status={newStatus}
        title={title}
      />
    );
  };

  const archivedLabel = isArchived ? isArchivedLabel : notArchivedLabel;
  const isProjectAndNotArchived = isProject && !isArchived;

  return (
    <div className={styles.root}>
      {isProjectAndNotArchived &&
        <div className={styles.columns}>
        {buttonArray.map((btn, idx) => {
          const btnStatus = labels.projectStatus[btn];
          return (
            <div className={styles.column} key={idx}>
              {makeButton(btnStatus.slug, btnStatus.icon, btnStatus.shortcutLabel, idx)}
            </div>
          );
        })}
        </div>
      }
      {/* TODO: Move this to “AgendaCard”s only (TA) */}
      {isProjectAndNotArchived &&
        <div className={styles.buttonBlock}>
          {makeButton('action', 'calendar-check-o', moveToActionsLabel)}
        </div>
      }
      {!isProject &&
        <div className={styles.buttonBlock}>
          {makeButton('project', 'calendar', moveToProjectsLabel)}
        </div>
      }
      {!isProject &&
        <div className={styles.buttonBlock}>
          {makeButton('deleted', 'times', deleteActionLabel)}
        </div>
      }
      {isProject &&
        <div className={styles.buttonBlock}>
          {makeButton('archive', 'archive', archivedLabel)}
        </div>
      }
    </div>
  );
};

OutcomeCardStatusMenu.propTypes = {
  project: PropTypes.shape({
    isArchived: PropTypes.bool,
    projectId: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs)
  }),
  isProject: PropTypes.bool,
};

styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    fontSize: 0,
    justifyContent: 'center',
    margin: '0 auto',
    maxWidth: '12rem',
    minHeight: '5.1875rem',
    padding: '.125rem',
    textAlign: 'center',
    width: '100%'
  },

  columns: {
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
