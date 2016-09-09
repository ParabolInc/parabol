import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {cashay} from 'cashay';
import AgendaItem from 'universal/modules/teamDashboard/components/AgendaItem/AgendaItem';

const handleRemoveItem = (itemId) => {
  const options = {variables: {id: itemId}};
  cashay.mutate('removeAgendaItem', options);
};

const AgendaList = (props) => {
  const {styles} = AgendaList;
  const {agenda} = props;
  return (
    <div className={styles.root}>
      {agenda.map((item, idx) =>
        <AgendaItem
          desc={item.content}
          index={idx}
          key={`agendaItem${idx}`}
          onClick={() => handleRemoveItem(item.id)}
          teamMember={item.teamMember}
          isComplete={item.isComplete}
          sortOrder={item.sortOrder}
        />
      )}
    </div>
  );
};

AgendaList.propTypes = {
  agenda: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string
  }))
};

AgendaList.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    // padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaList);
