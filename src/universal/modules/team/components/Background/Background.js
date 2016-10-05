// import React, { Component, PropTypes } from 'react';
// import withStyles from 'universal/styles/withStyles';
// import {css} from 'aphrodite/no-important';
// import * as appTheme from 'universal/styles/theme';
//
// const { cool, warm, dark, mid, light } = appTheme.palette;
// const white = '#fff';
// const padding = '2rem';
//
// const Background extends Component {
//
//   // Prop Options:
//   // -------------
//   // align: left, center, right
//   // theme: cool, warm, dark, mid, light, white
//   // width: auto, full
//
//   static propTypes = {
//     align: PropTypes.oneOf([
//       'left',
//       'center',
//       'right'
//     ]),
//     children: PropTypes.any,
//     theme: PropTypes.oneOf([
//       'cool',
//       'warm',
//       'dark',
//       'mid',
//       'light',
//       'white'
//     ]),
//     width: PropTypes.oneOf([
//       'auto',
//       'full'
//     ])
//   }
//
//   render() {
//     const { align, children, theme, width } = this.props;
//
//     const alignCSS = align || 'left';
//     const themeCSS = theme || 'dark';
//     const widthCSS = width || 'auto';
//     const backgroundStyles = combineStyles(
//       styles.base,
//       styles[alignCSS],
//       styles[themeCSS],
//       styles[widthCSS]
//     );
//
//     return (
//       <div className={backgroundStyles}>
//         {children}
//       </div>
//     );
//   }
// }
//
// const styleThunk = () => ({
//   // base
//   base: {
//     padding
//   },
//
//   // align
//   left: {
//     textAlign: 'left'
//   },
//
//   center: {
//     textAlign: 'center'
//   },
//
//   right: {
//     textAlign: 'right'
//   },
//
//   // theme
//   cool: {
//     backgroundColor: cool
//   },
//
//   warm: {
//     backgroundColor: warm
//   },
//
//   dark: {
//     backgroundColor: dark
//   },
//
//   mid: {
//     backgroundColor: mid
//   },
//
//   light: {
//     backgroundColor: light
//   },
//
//   white: {
//     backgroundColor: white
//   },
//
//   // width
//   auto: {
//     width: 'auto'
//   },
//
//   full: {
//     width: '100%'
//   }
// });
