// import React, {PropTypes} from 'react';
// import withStyles from 'universal/styles/withStyles';
// import {css} from 'aphrodite-local-styles/no-important';
// import appTheme from 'universal/styles/theme/appTheme';
// import FontAwesome from 'react-fontawesome';
// import {Link} from 'react-router';
//
// const faStyle = {
//   lineHeight: 'inherit',
//   color: 'white'
// };
//
// const SettingsHub = (props) => {
//   const {styles} = props;
//   return (
//     <div className={css(styles.root)}>
//       <Link
//         className={css(styles.link)}
//         title="Sign Out"
//         to="/signout"
//       >
//         <div className={css(styles.linkIcon)}>
//           <FontAwesome
//             name="sign-out"
//             style={faStyle}
//           />
//         </div>
//         <div className={css(styles.linkLabel)}>
//           Sign Out
//         </div>
//       </Link>
//       <div className={css(styles.closeIcon)} title="My Settings">
//         <Link to="/me">
//           <FontAwesome
//             name="times-circle"
//             style={faStyle}
//             title="Close My Settings"
//           />
//         </Link>
//       </div>
//     </div>
//   );
// };
//
// SettingsHub.propTypes = {
//   styles: PropTypes.object
// };
//
// const styleThunk = () => ({
//   root: {
//     borderBottom: '2px solid rgba(0, 0, 0, .10)',
//     display: 'flex !important',
//     minHeight: '4.875rem',
//     padding: '1rem 0 1rem 1rem',
//     width: '100%'
//   },
//
//   link: {
//     color: 'inherit',
//     cursor: 'pointer',
//     display: 'block',
//     flex: 1,
//     fontSize: 0,
//     height: '2.75rem',
//     lineHeight: '2.75rem',
//     marginRight: '3.5rem',
//     paddingLeft: '2.375rem',
//
//     ':hover': {
//       color: 'inherit',
//       opacity: '.5'
//     },
//     ':focus': {
//       color: 'inherit',
//       opacity: '.5'
//     }
//   },
//
//   linkIcon: {
//     display: 'inline-block',
//     fontSize: appTheme.typography.s3,
//     marginRight: '.5rem',
//     verticalAlign: 'middle',
//     width: appTheme.typography.s3,
//   },
//
//   linkLabel: {
//     display: 'inline-block',
//     fontSize: appTheme.typography.s3,
//     fontWeight: 700,
//     verticalAlign: 'middle'
//   },
//
//   closeIcon: {
//     cursor: 'pointer',
//     fontSize: appTheme.typography.s3,
//     height: '2.75rem',
//     lineHeight: '2.75rem',
//     textAlign: 'center',
//     width: '2rem',
//
//     ':hover': {
//       opacity: '.5'
//     },
//     ':focus': {
//       opacity: '.5'
//     }
//   }
// });
//
// export default withStyles(styleThunk)(SettingsHub);
