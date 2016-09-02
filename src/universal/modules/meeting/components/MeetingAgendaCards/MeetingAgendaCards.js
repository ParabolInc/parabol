import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import {withRouter} from 'react-router';
import labels from 'universal/styles/theme/labels';
import {srOnly} from 'universal/styles/helpers';
import CreateCard from 'universal/components/CreateCard/CreateCard';

let s = {};

const sampleCardContent = [
  {
    id: 'sample1',
    content: 'Outcome sample written',
    status: labels.projectStatus.slugs[1]
  },
  {
    id: 'sample2',
    content: 'Outcome sample written',
    status: labels.projectStatus.slugs[1]
  },
  {
    id: 'sample3',
    content: 'Outcome sample written',
    status: labels.projectStatus.slugs[1]
  },
  {
    id: 'sample4',
    content: 'Outcome sample written',
    status: labels.projectStatus.slugs[1]
  },
  {
    id: 'sample5',
    content: 'Outcome sample written',
    status: labels.projectStatus.slugs[1]
  }
];

const sampleSubset = sampleCardContent.slice(3, sampleCardContent.length);

const makeCards = (array) => {
  const cards = [];
  array.map((card, idx) =>
    cards.push(
      <div className={s.item} key={idx}>
        {/* TODO: Outcome Card component goes here */}
        {/* TODO: We need to revisit Action type as a card */}
        <div className={s.sample}>
          id: {card.id}<br />
          content: {card.content}<br />
          status: {card.status}
        </div>
      </div>
    )
  );
  return cards;
};

const makePlaceholders = (length) => {
  const rowLength = 4;
  const fullRows = Math.floor(length / rowLength);
  const itemsTotal = (fullRows * 4) + rowLength;
  const placeholdersTotal = itemsTotal - (length + 1);
  const placeholders = [];
  for (let i = 0; i < placeholdersTotal; i++) {
    placeholders.push(<div className={s.item}><CreateCard /></div>);
  }
  return placeholders;
};

const MeetingAgendaCards = (props) => {
  const {outcomes} = props;
  const outcomesLength = outcomes.length;
  return (
    <div className={s.root}>
      {/* Get Cards */}
      {outcomes.length !== 0 &&
        makeCards(outcomes)
      }
      {/* Input Card */}
      <div className={s.item}>
        <CreateCard hasControls />
      </div>
      {/* Placeholder Cards */}
      {makePlaceholders(outcomesLength)}
    </div>
  );
};

s = StyleSheet.create({
  root: {
    display: 'flex !important',
    flexWrap: 'wrap'
  },

  item: {
    marginTop: '2rem',
    padding: '0 1rem',
    width: '25%'
  },

  sample: {
    border: '1px solid #eee',
    borderRadius: '.5rem',
    minHeight: '126px',
    padding: '.5rem'
  },

  srOnly: {
    ...srOnly
  }
});

MeetingAgendaCards.propTypes = {
  outcomes: PropTypes.array
};

MeetingAgendaCards.defaultProps = {
  outcomes: sampleSubset
};

export default withRouter(look(MeetingAgendaCards));
