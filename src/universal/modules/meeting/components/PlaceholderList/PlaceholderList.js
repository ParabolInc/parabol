import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
import PlaceholderItem from 'universal/modules/meeting/components/PlaceholderItem/PlaceholderItem';

const handleItemClick = (index) =>
  console.log(`handleItemClick: ${index}`);

const placeholderItems = [
  {
    desc: 'tokens',
    owner: 'JH',
    status: 'processed'
  },
  {
    desc: 'SPA',
    owner: 'TM',
    status: 'active'
  },
  {
    desc: 'pull request',
    owner: 'MK',
    status: 'waiting'
  },
  {
    desc: 'meeting UI',
    owner: 'TA',
    status: 'waiting'
  },
  {
    desc: 'UX stories',
    owner: 'TM',
    status: 'waiting'
  }
];

let s = {};

const PlaceholderList = () => {
  return (
    <div className={s.root}>
      {placeholderItems.map((item, index) =>
        <PlaceholderItem
          desc={item.desc}
          index={index}
          key={index}
          onClick={() => handleItemClick(index)}
          owner={item.owner}
          status={item.status}
        />
      )}
    </div>
  );
};

s = StyleSheet.create({
  root: {
    color: theme.palette.dark,
    width: '100%'
  }
});

export default look(PlaceholderList);
