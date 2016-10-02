import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import appTheme from 'universal/styles/theme/appTheme';
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
  color: appTheme.palette.dark,
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

UserActionHeader.const styleThunk = () => ({
  addButton: {
    color: appTheme.palette.dark,

    ':hover': {
      ...buttonFH
    },
    ':focus': {
      ...buttonFH
    }
  }
});

export default withStyles(styleThunk)(UserActionHeader);
