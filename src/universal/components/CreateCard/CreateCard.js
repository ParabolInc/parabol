import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import CreateCardRootStyles from './CreateCardRootStyles';
import {cardBorderTop} from 'universal/styles/helpers';

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
    <span title="Press “a” to add a new Action">
      + New Private <u>A</u>ction
    </span>;

  const projectLabel = () =>
    <span title="Press “p” to add a new Project">
      + New Team <u>P</u>roject
    </span>;

  const addNewOutcome = (labelStyles, label, handler) =>
    <div className={css(labelStyles)} onClick={handler}>
      {label()}
    </div>;

  const cardStyles = css(
    styles.root,
    (hasControls || isCreating) && styles.hasControls
  );

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={css(styles.controlsBlock)}>
          {addNewOutcome(styles.actionStyles, actionLabel, handleAddAction)}
          {addNewOutcome(styles.projectStyles, projectLabel, handleAddProject)}
        </div>
      }
      {isCreating &&
        <Type align="center" bold scale="s3" colorPalette="mid">
          {createdBy}<br />is adding {isProject ? 'a Project' : 'an Action'}<Ellipsis />
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
  isProject: PropTypes.bool,
  styles: PropTypes.object
};

const borderRadius = '.1875rem';

const labelBaseStyles = {
  border: '1px solid transparent',
  borderRadius,
  cursor: 'pointer',
  fontWeight: 700,
  margin: '.875rem 0',
  minWidth: '10.375rem',
  padding: `${borderRadius} .375rem .125rem .25rem`,
  position: 'relative',
  verticalAlign: 'middle',

  ':hover': {
    opacity: '.65'
  },

  ':after': {
    backgroundColor: 'currentColor',
    borderRadius: `${borderRadius} ${borderRadius} 0 0`,
    content: '""',
    display: 'block',
    height: borderRadius,
    left: '-1px',
    position: 'absolute',
    right: '-1px',
    top: '-1px'
  }
};

const styleThunk = () => ({
  root: {
    ...CreateCardRootStyles,
    paddingLeft: 0,
    paddingRight: 0,

    '::after': {
      ...cardBorderTop,
      color: appTheme.palette.mid40l
    }
  },

  hasControls: {
    '::after': {
      color: appTheme.palette.mid
    }
  },

  controlsBlock: {
    // Define
  },

  actionStyles: {
    ...labelBaseStyles,
    backgroundColor: ui.actionCardBgColor,
    borderColor: appTheme.palette.light50g,
    color: appTheme.palette.dark
  },

  projectStyles: {
    ...labelBaseStyles,
    borderColor: appTheme.palette.dark30l,
    color: appTheme.palette.cool
  }
});

export default withStyles(styleThunk)(CreateCard);
