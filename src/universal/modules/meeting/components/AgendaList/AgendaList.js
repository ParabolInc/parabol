import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import AgendaItem from 'universal/modules/meeting/components/AgendaItem/AgendaItem';

const handleItemClick = (index) => console.log(`handleItemClick: ${index}`);

const AgendaList = (props) => {
  const {agenda} = props;
  const {styles} = AgendaList;

  return (
    <div className={styles.root}>
      {agenda.map((item, index) =>
        <AgendaItem
          desc={item.content}
          index={index}
          key={`agendaItem${index}`}
          onClick={() => handleItemClick(index)}
          teamMemberId={item.teamMemberId}
          isComplete={item.isComplete}
          sortOrder={item.sortOrder}
        />
      )}
    </div>
  );
};

AgendaList.styles = StyleSheet.create({
  root: {
    color: theme.palette.dark,
    width: '100%'
  }
});

export default look(AgendaList);
