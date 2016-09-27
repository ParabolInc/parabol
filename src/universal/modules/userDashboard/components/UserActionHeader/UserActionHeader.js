import React from 'react';
import look, {StyleSheet} from 'react-look';
import theme from 'universal/styles/theme';
// import ib from 'universal/styles/helpers/ib';
// import FontAwesome from 'react-fontawesome';
import {
  // DashSectionControls,
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';

// const buttonStyle = {
//   ...ib,
//   fontSize: '28px',
//   lineHeight: 'inherit'
// };

const buttonFH = {
  color: theme.palette.dark,
  opacity: '.5'
};

const UserActionHeader = () => {
  // const {styles} = UserActionHeader;
  return (
    <DashSectionHeader>
      <DashSectionHeading icon="calendar-check-o" label="My Actions" />
      {/* <DashSectionControls>
        <div className={styles.addButton}>
          <FontAwesome name="plus-square-o" style={buttonStyle} />
        </div>
      </DashSectionControls> */}
    </DashSectionHeader>
  );
};

UserActionHeader.styles = StyleSheet.create({
  addButton: {
    color: theme.palette.dark,

    ':hover': {
      ...buttonFH
    },
    ':focus': {
      ...buttonFH
    }
  }
});

export default look(UserActionHeader);
