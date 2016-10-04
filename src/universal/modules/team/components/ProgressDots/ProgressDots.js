// import React, { Component, PropTypes } from 'react';
// import withStyles from 'universal/styles/withStyles'; import {css} from 'aphrodite';
// import tinycolor from 'tinycolor2';
// import appTheme from 'universal/styles/theme/appTheme';
//
// const combineStyles = StyleSheet.combineStyles;
// const progressDotColor = tinycolor.mix(appTheme.palette.d, '#fff', 50).toHexString();
//
// const onClick = event => {
//   event.preventDefault();
//   console.log('TODO: Navigate to step');
// };
//
// const styles = {};
//
// @look
// // eslint-disable-next-line react/prefer-stateless-function
// export default class ProgressDots extends Component {
//   static propTypes = {
//     // children included here for multi-part landing pages (FAQs, pricing, cha la la)
//     // children: PropTypes.element,
//     numDots: PropTypes.number.isRequired, // how many total dots shall we draw?
//     numCompleted: PropTypes.number,       // how many of the dots are completed?
//     currentDot: PropTypes.number,         // which dot (1=first dot) is the user on now?
//   };
//
//   renderDot(idx) {
//     let { numCompleted, currentDot } = this.props;
//     numCompleted--;
//     currentDot--;
//     let dotStyle = null;
//
//     if (idx === currentDot) {
//       /* we're the active dot */
//       dotStyle = combineStyles(styles.progressDot, styles.progressDotCurrent);
//     } else {
//       if (idx < numCompleted) {
//         /* render a completed dot */
//         dotStyle = combineStyles(styles.progressDot, styles.progressDotCompleted);
//       } else {
//         /* a dot for the future! */
//         dotStyle = styles.progressDot;
//       }
//     }
//
//     return (
//       <a className={dotStyle} href="#" key={idx} onClick={onClick}>
//         <span className={styles.progressDotLabel}>Step {idx + 1}</span>
//       </a>
//     );
//   }
//
//   render() {
//     const { numDots } = this.props;
//
//     return (
//       <div className={styles.progressDotGroup}>
//         {(() => {
//           const dots = [];
//           for (let i = 0; i < numDots; i++) {
//             dots.push(this.renderDot(i));
//           }
//           return dots;
//         })()}
//       </div>
//     );
//   }
// }
//
// const styleThunk = () => ({
//   progressDotGroup: {
//     fontSize: 0,
//     margin: '2rem 0 0',
//     textAlign: 'center',
//     width: '100%'
//   },
//
//   progressDot: {
//     backgroundColor: 'transparent',
//     border: `1px solid ${progressDotColor}`,
//     borderRadius: '100%',
//     // NOTE: Removing cursor until dots can change navigation
//     cursor: 'default',
//     display: 'inline-block',
//     height: '.75rem',
//     margin: '0 .375rem',
//     width: '.75rem'
//   },
//
//   // NOTE: Same thing, different semantics (completed, current)
//   progressDotCompleted: {
//     backgroundColor: progressDotColor
//   },
//   progressDotCurrent: {
//     backgroundColor: progressDotColor
//   },
//
//   progressDotLabel: {
//     // TODO: Make mixin for Sass: @include sr-only;
//     border: 0,
//     clip: 'rect(0, 0, 0, 0)',
//     height: '1px',
//     margin: '-1px',
//     overflow: 'hidden',
//     padding: 0,
//     position: 'absolute',
//     width: '1px'
//   }
// });
