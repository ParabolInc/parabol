// import React, { Component, PropTypes } from 'react';
// import withStyles from 'universal/styles/withStyles'; import {css} from 'aphrodite/no-important';
// import appTheme from 'universal/styles/theme/appTheme';
//
// const styles = {};
//
// @look
// // eslint-disable-next-line react/prefer-stateless-function
// export default class SetupHeader extends Component {
//   static propTypes = {
//     heading: PropTypes.string,
//     subHeading: PropTypes.object
//   }
//
//   render() {
//     const { heading, subHeading } = this.props;
//
//     return (
//       <div className={styles.setupHeader}>
//         <h1 className={styles.setupHeading}>
//           {heading}
//         </h1>
//         {subHeading &&
//           <h2 className={styles.setupSubHeading}>{subHeading}</h2>
//         }
//       </div>
//     );
//   }
// }
//
// const styleThunk = () => ({
//   setupHeader: {
//     // Define container
//   },
//
//   setupHeading: {
//     color: appTheme.palette.warm,
//     // TODO: Check font assets, font weight of Werrimeather (TA)
//     fontFamily: appTheme.typography.serif,
//     fontSize: appTheme.typography.s7,
//     margin: '2rem 0 1rem',
//     textAlign: 'center'
//   },
//
//   setupSubHeading: {
//     color: appTheme.palette.dark10d,
//     fontSize: appTheme.typography.s6,
//     margin: '0 0 2rem',
//     textAlign: 'center'
//   }
// });
