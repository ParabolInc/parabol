import React from 'react';
// import withStyles from 'universal/styles/withStyles';
// import {css} from 'aphrodite';
// import appTheme from 'universal/styles/theme/appTheme';
import {
  DashSectionHeader,
  DashSectionHeading
} from 'universal/components/Dashboard';

const UserActionHeader = () => {
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

// const buttonFH = {
//   color: appTheme.palette.dark,
//   opacity: '.5'
// };

// const styleThunk = () => ({
//   addButton: {
//     color: appTheme.palette.dark,
//
//     ':hover': {
//       ...buttonFH
//     },
//     ':focus': {
//       ...buttonFH
//     }
//   }
// });

export default UserActionHeader;
// export default withStyles(styleThunk)(UserActionHeader);
