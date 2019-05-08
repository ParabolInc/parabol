// import {css} from 'aphrodite-local-styles/no-important'
// import PropTypes from 'prop-types'
// import React from 'react'
// import ErrorBoundary from 'universal/components/ErrorBoundary'
// import withStyles from 'universal/styles/withStyles'
// import {meetingChromeBoxShadowInset} from 'universal/styles/meeting'
// import MeetingHelpDialog from 'universal/modules/meeting/components/MeetingHelpDialog/MeetingHelpDialog'
//
// const MeetingMain = (props) => {
//   const {children, hasBoxShadow, hasHelpFor, isFacilitating, styles} = props
//   const rootStyles = css(styles.meetingMainRoot, hasBoxShadow && styles.hasBoxShadow)
//   const innerBlockStyles = css(styles.meetingMainRoot, styles.innerBlockStyles)
//   const helpStyles = css(styles.helpStyles, isFacilitating && styles.helpIsFacilitating)
//   return (
//     <ErrorBoundary>
//       <div className={rootStyles}>
//         {hasHelpFor && (
//           <div className={helpStyles}>
//             <MeetingHelpDialog phase={hasHelpFor} />
//           </div>
//         )}
//         <div className={innerBlockStyles}>{children}</div>
//       </div>
//     </ErrorBoundary>
//   )
// }
//
// MeetingMain.propTypes = {
//   children: PropTypes.any,
//   hasBoxShadow: PropTypes.bool,
//   hasHelpFor: PropTypes.string,
//   isFacilitating: PropTypes.bool,
//   styles: PropTypes.object
// }
//
// const styleThunk = () => ({
//   meetingMainRoot: {
//     display: 'flex !important',
//     flex: 1,
//     flexDirection: 'column',
//     minWidth: '60rem',
//     position: 'relative',
//     width: '100%'
//   },
//
//   hasBoxShadow: {
//     boxShadow: meetingChromeBoxShadowInset
//   },
//
//   innerBlockStyles: {
//     zIndex: 100
//   },
//
//   helpStyles: {
//     bottom: '1.25rem',
//     position: 'absolute',
//     right: '1.25rem',
//     zIndex: 200
//   },
//
//   helpIsFacilitating: {
//     bottom: '4.75rem'
//   }
// })
//
// export default withStyles(styleThunk)(MeetingMain)
