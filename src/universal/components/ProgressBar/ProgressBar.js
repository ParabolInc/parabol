// import React, {PropTypes} from 'react';
// import look, {StyleSheet} from 'react-look';
// import t from 'universal/styles/theme';
// import {srOnly} from 'universal/styles/helpers';
//
// let s = {};
//
// const ProgressBar = (props) => {
//   const {
//     completed,
//     scale,
//     theme
//   } = props;
//
//   const height = scale === 'large' ? '.5rem' : '.25rem';
//   const backgroundColor = theme === 'cool' ? t.palette.cool50l : t.palette.warm50l;
//   const rootStyle = {
//     borderRadius: height,
//     height
//   };
//
//   const barStyle = {
//     backgroundColor,
//     height,
//     width: `${completed + 2}%`
//   };
//
//   return (
//     <div className={s.root} style={rootStyle}>
//       <div className={s.bar} style={barStyle}>
//         <div className={s.srOnly}>{completed}%</div>
//       </div>
//     </div>
//   );
// };
//
// ProgressBar.propTypes = {
//   completed: PropTypes.number,
//   scale: PropTypes.oneOf([
//     'small',
//     'large'
//   ]),
//   theme: PropTypes.oneOf([
//     'cool',
//     'warm'
//   ])
// };
//
// ProgressBar.defaultProps = {
//   completed: 64,
//   scale: 'small',
//   theme: 'cool'
// };
//
// s = StyleSheet.create({
//   root: {
//     display: 'block',
//     backgroundColor: t.palette.dark10l,
//     overflow: 'hidden',
//     width: '100%'
//   },
//
//   bar: {
//     transition: 'width .2s ease-in',
//   },
//
//   srOnly: {
//     ...srOnly
//   }
// });
//
// export default look(ProgressBar);
