import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import theme from 'universal/styles/theme';
import labels from '../../../../styles/theme/labels';
import projectStatusStyles from '../../../../styles/helpers/projectStatusStyles';
import upperFirst from '../../../../utils/upperFirst';
import OutcomeCardMenuButton from './OutcomeCardMenuButton';

const buttonHF = {
  backgroundColor: 'transparent',
  borderColor: theme.palette.mid50l
};
let styles = {};

const OutcomeCardStatusMenu = (props) => {
  const {project: {id: projectId, status}} = props;

  const notArchivedLabel = <span>Move to Ar<u>c</u>hive</span>;
  const buttonArray = labels.projectStatus.slugs.slice(0);
  const archiveProject = () => {
    const options = {
      variables: {
        updatedProject: {
          id: projectId,
          isArchived: true
        }
      }
    };
    cashay.mutate('updateProject', options);
  };
  const handleProjectUpdate = (newStatus) => {
    if (newStatus === status) {
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

  return (
    <div className={styles.root}>
      {buttonArray.map((btn, idx) => {
        const btnStatus = labels.projectStatus[btn];
        return (
          <div className={styles.col} key={idx}>
            {makeButton(btnStatus.slug, btnStatus.icon, btnStatus.shortcutLabel, idx)}
          </div>
        );
      })}
      <div className={styles.archivedBtnBlock}>
        <OutcomeCardMenuButton
          icon="archive"
          label={notArchivedLabel}
          onClick={archiveProject}
          status="archive"
          title="Move to archive"
        />
      </div>
    </div>
  );
};

OutcomeCardStatusMenu.propTypes = {
  project: PropTypes.shape({
    isArchived: PropTypes.bool,
    projectId: PropTypes.string,
    status: PropTypes.oneOf(labels.projectStatus.slugs)
  })
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    fontSize: 0,
    margin: '0 auto',
    maxWidth: '12rem',
    minHeight: '5.1875rem',
    padding: '.125rem',
    textAlign: 'center',
    width: '100%'
  },

  col: {
    display: 'inline-block',
    fontSize: '1rem',
    padding: '.125rem',
    width: '50%'
  },

  button: {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.mid30l}`,
    borderRadius: '.25rem',
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
  },

  archivedBtnBlock: {
    padding: '.125rem'
  }
});

export default look(OutcomeCardStatusMenu);
