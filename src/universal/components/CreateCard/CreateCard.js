import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
// import FontAwesome from 'react-fontawesome';
import PushButton from '../PushButton/PushButton';
import Ellipsis from '../Ellipsis/Ellipsis';
import Type from '../Type/Type';
import theme from 'universal/styles/theme';
import withHotkey from 'react-hotkey-hoc';
import CreateCardRootStyles from './CreateCardRootStyles';

const combineStyles = StyleSheet.combineStyles;
const labelStyles = {
  display: 'inline-block',
  border: '1px solid transparent',
  borderRadius: '.25rem',
  borderWidth: '2px 1px 1px',
  padding: '1px 4px 2px',
  verticalAlign: 'middle'
};
let s = {};

const CreateCard = (props) => {
  let cardStyles = s.root;
  const {
    bindHotkey, createdBy, handleAddAction, handleAddProject, hasControls,
    isCreating, isProject
  } = props;
  const cardBorderVariantStyles = combineStyles(s.root, s.rootBorderVariant);
  bindHotkey('a', handleAddAction);
  bindHotkey('p', handleAddProject);
  const actionLabel = () =>
    <span className={s.label}>
      <span className={s.labelStyles}>Add an{' '}</span>
      <span className={s.actionLabel}>
        <u>A</u>ction
      </span>
    </span>;

  const projectLabel = () =>
    <span className={s.label}>
      <span className={s.labelStyles}>Add a{' '}</span>
      <span className={s.projectLabel}>
        <u>P</u>roject
      </span>
    </span>;

  const trimmedName = createdBy.replace(/\s+/g, '');

  if (hasControls || isCreating) {
    cardStyles = cardBorderVariantStyles;
  }

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={s.controlsBlock}>
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
        <Type align="center" bold scale="s3" theme="mid">
          @{trimmedName}<br />is adding {isProject ? 'a Project' : 'an Action'}<Ellipsis />
        </Type>
      }
    </div>
  );
};

CreateCard.propTypes = {
  bindHotkey: PropTypes.func,
  createdBy: PropTypes.string,
  handleAddAction: PropTypes.func,
  handleAddProject: PropTypes.func,
  hasControls: PropTypes.bool,
  isCreating: PropTypes.bool,
  isProject: PropTypes.bool
};

CreateCard.defaultProps = {
  createdBy: 'Taya Mueller',
  hasControls: false,
  isCreating: false,
  isProject: false
};

s = StyleSheet.create({
  root: {
    ...CreateCardRootStyles
  },

  rootBorderVariant: {
    '::after': {
      color: theme.palette.mid
    }
  },

  controlsBlock: {
    // Define
  },

  label: {
    color: theme.palette.mid,
    fontFamily: theme.typography.sansSerif,
    fontStyle: 'normal',
    fontWeight: 700
  },

  labelStyles: {
    ...labelStyles
  },

  actionLabel: {
    ...labelStyles,
    backgroundColor: theme.palette.light50l,
    borderColor: theme.palette.light50g,
    borderTopColor: theme.palette.dark,
    color: theme.palette.dark
  },

  projectLabel: {
    ...labelStyles,
    borderColor: theme.palette.dark30l,
    borderTopColor: theme.palette.cool,
    color: theme.palette.cool
  }
});

export default withHotkey(look(CreateCard));
