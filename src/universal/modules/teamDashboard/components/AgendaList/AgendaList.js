import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import {overflowTouch} from 'universal/styles/helpers';
import {cashay} from 'cashay';
import AgendaItem from 'universal/modules/teamDashboard/components/AgendaItem/AgendaItem';

const removeItemFactory = (itemId) => () => {
  const options = {variables: {id: itemId}};
  cashay.mutate('removeAgendaItem', options);
};

const AgendaList = (props) => {
  const {agenda, agendaPhaseItem, phaseItemFactory, styles} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.inner)}>
        {agenda.map((item, idx) =>
          <AgendaItem
            desc={item.content}
            idx={idx}
            key={`agendaItem${idx}`}
            handleRemove={removeItemFactory(item.id)}
            gotoAgendaItem={phaseItemFactory(idx + 1)}
            teamMember={item.teamMember}
            isComplete={item.isComplete}
            agendaPhaseItem={agendaPhaseItem}
            sortOrder={item.sortOrder}
          />
        )}
      </div>
    </div>
  );
};

AgendaList.propTypes = {
  agenda: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string
  })),
  agendaPhaseItem: PropTypes.number,
  phaseItemFactory: PropTypes.func
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    position: 'relative',
    width: '100%'
  },

  inner: {
    ...overflowTouch,
    bottom: 0,
    position: 'absolute',
    top: 0,
    width: '100%'
  }
});

export default withStyles(styleThunk)(AgendaList);
