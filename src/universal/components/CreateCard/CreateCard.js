import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';

import {css} from 'aphrodite';
import PushButton from '../PushButton/PushButton';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import appTheme from 'universal/styles/theme/appTheme';
import CreateCardRootStyles from './CreateCardRootStyles';

const CreateCard = (props) => {
  const {
    createdBy,
    handleAddAction,
    handleAddProject,
    hasControls,
    isCreating,
    isProject,
    styles
  } = props;

  const actionLabel = () =>
    <span className={css(styles.label)}>
      <span className={css(styles.labelStyles)}>Add an{' '}</span>
      <span className={css(styles.actionLabel)}>
        <u>A</u>ction
      </span>
    </span>;

  const projectLabel = () =>
    <span className={css(styles.label)}>
      <span className={css(styles.labelStyles)}>Add a{' '}</span>
      <span className={css(styles.projectLabel)}>
        <u>P</u>roject
      </span>
    </span>;

  const trimmedName = createdBy.replace(/\s+/g, '');

  const cardStyles = css(
    styles.root,
    (hasControls || isCreating) && styles.rootBorderVariant
  );

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={css(styles.controlsBlock)}>
          <PushButton
            handleOnClick={handleAddAction}
            keystroke="a"
            label={actionLabel()}
            size="default"
          />
          <PushButton
            handleOnClick={handleAddProject}
            keystroke="p"
            label={projectLabel()}
            size="default"
          />
        </div>
      }
      {isCreating &&
        // TODO change theme to colorPalette
        <Type align="center" bold scale="s3" colorPalette="mid">
          @{trimmedName}<br />is adding {isProject ? 'a Project' : 'an Action'}<Ellipsis />
        </Type>
      }
    </div>
  );
};

CreateCard.propTypes = {
  createdBy: PropTypes.string,
  handleAddAction: PropTypes.func,
  handleAddProject: PropTypes.func,
  hasControls: PropTypes.bool,
  isCreating: PropTypes.bool,
  isProject: PropTypes.bool
};

const labelStyles = {
  display: 'inline-block',
  border: '1px solid transparent',
  borderRadius: '.25rem',
  borderWidth: '2px 1px 1px',
  padding: '1px 4px 2px',
  verticalAlign: 'middle'
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles
  },

  rootBorderVariant: {
    '::after': {
      color: appTheme.palette.mid
    }
  },

  controlsBlock: {
    // Define
  },

  label: {
    color: appTheme.palette.mid,
    fontFamily: appTheme.typography.sansSerif,
    fontStyle: 'normal',
    fontWeight: 700
  },

  labelStyles: {
    ...labelStyles
  },

  actionLabel: {
    ...labelStyles,
    backgroundColor: appTheme.palette.light50l,
    borderColor: appTheme.palette.light50g,
    borderTopColor: appTheme.palette.dark,
    color: appTheme.palette.dark
  },

  projectLabel: {
    ...labelStyles,
    borderColor: appTheme.palette.dark30l,
    borderTopColor: appTheme.palette.cool,
    color: appTheme.palette.cool
  }
});

export default withStyles(styleThunk)(CreateCard);
