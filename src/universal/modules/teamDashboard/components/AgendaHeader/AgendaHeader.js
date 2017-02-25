import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {DashSectionHeading} from 'universal/components/Dashboard';

const AgendaHeader = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.root)}>
      <DashSectionHeading icon="comment" label="Agenda Queue" />
    </div>
  );
};

AgendaHeader.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    padding: '1rem 1rem 1rem 2.375rem',
    width: '100%'
  }
});

export default withStyles(styleThunk)(AgendaHeader);
