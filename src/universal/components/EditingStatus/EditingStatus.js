import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import ui from 'universal/styles/ui';

const EditingStatus = ({status}) => {
  const {styles} = EditingStatus;
  return <div className={styles.timestamp}>{status}</div>
};

EditingStatus.propTypes = {
  status: PropTypes.any
};

EditingStatus.styles = StyleSheet.create({
  timestamp: {
    color: theme.palette.dark,
    fontSize: theme.typography.s1,
    fontWeight: 700,
    lineHeight: theme.typography.s3,
    padding: `.25rem ${ui.cardPaddingBase}`,
    textAlign: 'right'
  }
});

export default look(EditingStatus);
