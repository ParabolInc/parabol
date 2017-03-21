import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {DashSectionHeading} from 'universal/components/Dashboard';
import ui from 'universal/styles/ui';
import {cashay} from 'cashay';

const AgendaHeader = (props) => {
  const {hideAgenda, styles, teamId} = props;
  const toggleHide = () => {
    cashay.mutate('toggleAgendaList', {variables: {teamId}});
  };
  const label = `Agenda Queue${hideAgenda ? '...' : ''}`;
  return (
    <div className={css(styles.root)} onClick={toggleHide}>
      <DashSectionHeading icon="comment" label={label} />
    </div>
  );
};

AgendaHeader.propTypes = {
  hideAgenda: PropTypes.bool,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  root: {
    cursor: 'pointer',
    padding: '1rem 1rem 1rem 2.375rem',
    width: '100%',
    maxWidth: ui.dashAgendaWidth,
    minWidth: ui.dashAgendaWidth
  }
});

export default withStyles(styleThunk)(AgendaHeader);
