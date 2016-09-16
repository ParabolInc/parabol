import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';
import labels from 'universal/styles/theme/labels';
import projectStatusStyles from 'universal/styles/helpers/projectStatusStyles';

const combineStyles = StyleSheet.combineStyles;
let styles = {};

const OutcomeCard = (props) => {
  const {children, isProject, status} = props;
  let rootStyles;
  const rootStyleOptions = [
    styles.root,
    styles.cardBlock
  ];

  if (isProject) {
    rootStyleOptions.push(styles[status]);
  } else {
    rootStyleOptions.push(styles.isAction);
  }

  rootStyles = combineStyles.apply(null, rootStyleOptions);

  return (
    <div className={rootStyles}>
      {children}
    </div>
  );
};

OutcomeCard.propTypes = {
  children: PropTypes.any,
  isProject: PropTypes.bool,
  status: PropTypes.oneOf(labels.projectStatus.slugs)
};

OutcomeCard.defaultProps = {
  isProject: true,
  status: labels.projectStatus.active.slug
};

styles = StyleSheet.create({
  root: {
    backgroundColor: '#fff',
    border: `1px solid ${ui.cardBorderColor}`,
    borderRadius: ui.cardBorderRadius,
    borderTop: `.25rem solid ${theme.palette.mid}`,
    maxWidth: '20rem',
    width: '100%'
  },

  // TODO: Cards need block containers, not margin (TA)
  cardBlock: {
    marginBottom: '.5rem'
  },

  isAction: {
    backgroundColor: theme.palette.light50l
  },

  // Status theme colors
  // --------------------
  ...projectStatusStyles('borderTopColor')
});

export default look(OutcomeCard);
