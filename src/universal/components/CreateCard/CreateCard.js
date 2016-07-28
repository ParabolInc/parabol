import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
// import FontAwesome from 'react-fontawesome';
import PushButton from '../PushButton/PushButton';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
const labelStyles = {
  display: 'inline-block',
  border: '1px solid transparent',
  borderRadius: '.25rem',
  padding: '1px 4px',
  verticalAlign: 'middle'
};
let s = {};

const CreateCard = props => {
  const {hasControls} = props;
  const cardHasControlsStyles = combineStyles(s.root, s.rootHasControls);
  const cardStyles = hasControls ? cardHasControlsStyles : s.root;

  const actionLabel = () =>
    <span className={s.label}>
      <span className={s.labelStyles}>Add an{' '}</span>
      <span className={s.actionLabel}>
        <span className={s.underline}>A</span>ction
      </span>
    </span>;

  const projectLabel = () =>
    <span className={s.label}>
      <span className={s.labelStyles}>Add a{' '}</span>
      <span className={s.projectLabel}>
        <span className={s.underline}>P</span>roject
      </span>
    </span>;

  const nextRequestLabel = () =>
    <span className={s.label}>
      <span className={s.labelStyles}>
        <span className={s.underline}>N</span>ext Request
      </span>
    </span>;

  return (
    <div className={cardStyles}>
      {hasControls &&
        <div className={s.controls}>
          <PushButton keystroke="a" label={actionLabel()} size="default" />
          <PushButton keystroke="p" label={projectLabel()} size="default" />
          <PushButton keystroke="n" label={nextRequestLabel()} size="default" />
        </div>
      }
    </div>
  );
};

CreateCard.propTypes = {
  hasControls: PropTypes.bool
};

CreateCard.defaultProps = {
  hasControls: false
};

s = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
    border: `1px solid ${theme.palette.mid40l}`,
    borderRadius: '.5rem',
    borderTop: `.25rem solid ${theme.palette.mid40l}`,
    display: 'flex !important',
    maxWidth: '20rem',
    minHeight: '126px',
    padding: '.5rem 1.25rem',
    width: '100%'
  },

  rootHasControls: {
    borderTopColor: theme.palette.mid
  },

  controls: {
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
    borderColor: theme.palette.light50g
  },

  projectLabel: {
    ...labelStyles,
    backgroundColor: theme.palette.cool10l,
    borderColor: theme.palette.cool,
    color: theme.palette.cool
  },

  underline: {
    textDecoration: 'underline'
  }
});

export default look(CreateCard);
