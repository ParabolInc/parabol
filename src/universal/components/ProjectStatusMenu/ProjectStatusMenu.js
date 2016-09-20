// import React, {PropTypes} from 'react';
// import look, {StyleSheet} from 'react-look';
// import theme from 'universal/styles/theme';
// import labels from 'universal/styles/theme/labels';
// import ProjectStatusMenuItem from './ProjectStatusMenuItem';
//
// let styles = {};
//
// const ProjectStatusMenu = props => {
//   const {
//     status,
//     isArchived
//   } = props;
//
//   const onClickItem = (value) => {
//     console.log(`ProjectStatusMenuItem onClick ${value}`);
//   };
//
//   const menuStatusItems = labels.projectStatus.slugs.slice(0);
//
//   // TODO: Add HotKeys
//
//   return (
//     <div className={styles.root}>
//       <div className={styles.menuLabel}>Set Status:</div>
//       {menuStatusItems.map((statusItem, idx) => {
//         const statusLabel = labels.projectStatus[statusItem];
//         return (
//           <ProjectStatusMenuItem
//             icon={statusLabel.icon}
//             isCurrent={status === statusItem}
//             key={idx}
//             onClick={onClickItem}
//             label={statusLabel.shortcutLabel}
//             value={statusItem}
//           />
//         );
//       }
//       )}
//       <div className={styles.hr} />
//       {isArchived ?
//         <div>isArchived, TODO: Un-archive?</div> :
//         <ProjectStatusMenuItem
//           icon={labels.archive.icon}
//           onClick={onClickItem}
//           label={labels.archive.shortcutLabel}
//           value={labels.archive.slug}
//         />
//       }
//     </div>
//   );
// };
//
// ProjectStatusMenu.propTypes = {
//   status: PropTypes.oneOf(labels.projectStatus.slugs),
//   isArchived: PropTypes.bool
// };
//
// ProjectStatusMenu.defaultProps = {
//   status: labels.projectStatus.active.slug,
//   isArchived: false
// };
//
// styles = StyleSheet.create({
//   root: {
//     backgroundColor: theme.palette.mid10l,
//     border: `1px solid ${theme.palette.mid40l}`,
//     borderRadius: '.5rem',
//     padding: '0 0 .25rem',
//     width: '10rem'
//   },
//
//   menuLabel: {
//     color: theme.palette.mid,
//     fontSize: theme.typography.s2,
//     fontWeight: 700,
//     padding: '.5rem 0 .25rem 2.75rem'
//   },
//
//   keystroke: {
//     textDecoration: 'underline'
//   },
//
//   hr: {
//     borderTop: `1px solid ${theme.palette.mid40l}`,
//     height: '1px',
//     margin: '.25rem 0',
//     width: '100%'
//   }
// });
//
// export default look(ProjectStatusMenu);
