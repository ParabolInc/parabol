import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';

const {combineStyles} = StyleSheet;
const descriptionFA = {
  backgroundColor: theme.palette.cool10l,
  borderTopColor: 'currentColor',
  color: theme.palette.cool,
  outline: 'none'
};
const descriptionActionFA = {
  backgroundColor: 'rgba(255, 255, 255, .85)',
  borderTopColor: theme.palette.mid,
  color: theme.palette.mid10d
};

const OutcomeCardTextAreaField = (field) => {
  const {styles} = OutcomeCardTextAreaField;
  const {input, isProject, handleSubmit, timestamp, meta: {active}} = field;
  const descStyles = isProject ? styles.content : combineStyles(styles.content, styles.descriptionAction);
  const allClassNames = combineStyles(descStyles, 'mousetrap');
  const handleBlur = () => {
    handleSubmit();
    input.onBlur();
  };
  let _textarea;
  const setRef = (c) => _textarea = c;
  const handleKeyUp = (e) => {
    if (e.keyCode === 13 && !e.shiftKey) {
      handleBlur();
      _textarea.blur()
    }
  };
  return (
    <div>
      <div className={styles.timestamp}>
        {active ? 'editing...' : timestamp}
      </div>
      <textarea
        ref={setRef}
        className={allClassNames}
        placeholder="que pedo wey"
        onBlur={handleBlur}
        onKeyDown={handleKeyUp}
        {...field.input}
      />
    </div>
  );
};

OutcomeCardTextAreaField.styles = StyleSheet.create({
  content: {
    backgroundColor: 'transparent',
    border: 0,
    borderTop: '1px solid transparent',
    color: theme.palette.dark10d,
    display: 'block',
    fontFamily: theme.typography.sansSerif,
    fontSize: theme.typography.s3,
    lineHeight: theme.typography.s4,
    // TODO: Clean up these comments (TA)
    // minHeight: '2.6875rem', // A
    // minHeight: '2.1875rem', // B
    minHeight: '3.3125rem', // Oversizing for menu (TA)
    padding: '.5rem .5rem 1rem', // A
    // padding: '.5rem', // B
    resize: 'none',
    width: '100%',

    ':focus': {
      ...descriptionFA
    },
    ':active': {
      ...descriptionFA
    }
  },
  descriptionAction: {
    // NOTE: modifies styles.content
    ':focus': {
      ...descriptionActionFA
    },
    ':active': {
      ...descriptionActionFA
    }
  },
  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    lineHeight: theme.typography.s3,
    padding: '.5rem',
    textAlign: 'right'
  },
});

export default look(OutcomeCardTextAreaField);
