import React, {PropTypes} from 'react';
import {
  DashColumns,
  DashContent,
  DashHeader,
  DashMain,
  dashTimestamp
} from 'universal/components/Dashboard';

const Outcomes = (props) => {
  const {name, nickname} = props.user;
  return (
    <DashMain>
      <DashHeader title="My Outcomes">
        {dashTimestamp} • Carpe diem!
      </DashHeader>
      <DashContent>
        It’s the Me show! starring: <b>{name}</b>, AKA <b>{nickname}</b>
        <DashColumns />
      </DashContent>
    </DashMain>
  );
};

Outcomes.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    nickname: PropTypes.string,
  })
};

export default Outcomes;
