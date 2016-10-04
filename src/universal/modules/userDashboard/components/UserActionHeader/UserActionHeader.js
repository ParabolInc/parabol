import React from 'react';
import {
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';

const UserActionHeader = () => {
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar-check-o" label="My Actions" />
    </DashSectionHeader>
  );
};

export default UserActionHeader;
