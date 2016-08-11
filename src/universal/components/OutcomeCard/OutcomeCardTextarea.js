import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import Textarea from 'react-textarea-autosize';
import theme from 'universal/styles/theme';

const combineStyles = StyleSheet.combineStyles;
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
let styles = {};

const OutcomeCardTextarea = (props) => {
  const {
    content,
    isProject,
  } = props;
  const descStyles = isProject ? styles.content : combineStyles(styles.content, styles.descriptionAction);

  return (
    <Textarea className={descStyles} defaultValue={content}/>
  );
};

OutcomeCardTextarea.propTypes = {
  content: PropTypes.string,
  isProject: PropTypes.bool
};

OutcomeCardTextarea.defaultProps = {
  content: 'Parabol website updated',
  isProject: true
};

styles = StyleSheet.create({
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
  }
});

export default look(OutcomeCardTextarea);
