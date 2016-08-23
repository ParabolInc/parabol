import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import AgendaItem from 'universal/modules/meeting/components/AgendaItem/AgendaItem';

const handleItemClick = (idx) => console.log(`handleItemClick: ${idx}`);

const AgendaList = (props) => {
  const {styles} = AgendaList;
  const {agenda, teamMembers} = props;
  return (
    <div className={styles.root}>
      {agenda.map((item, idx) =>
        <AgendaItem
          desc={item.content}
          index={idx}
          key={`agendaItem${idx}`}
          onClick={() => handleItemClick(idx)}
          teamMember={teamMembers.find(m => m.id === item.teamMemberId)}
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
    padding: '1rem',
    width: '100%'
  }
});

export default look(AgendaList);
