import React, {PropTypes} from 'react';

import DashColumns from 'universal/components/DashColumns/DashColumns';
import DashContent from 'universal/components/DashContent/DashContent';
import DashHeader from 'universal/components/DashHeader/DashHeader';
import dashTimestamp from 'universal/components/DashTimestamp/DashTimestamp';

const Outcomes = (props) => {
  const {name, nickname} = props.user;
  return (
    <div>
      <DashHeader title="My Outcomes" meta={`${dashTimestamp} • Carpe diem!`} />
      <DashContent>
        It’s the Me show! starring: <b>{name}</b>, AKA <b>{nickname}</b>
        <DashColumns />
      </DashContent>
    </div>
  );
};

Outcomes.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
  })
};

export default Outcomes;
