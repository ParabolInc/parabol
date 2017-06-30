 import PropTypes from 'prop-types';
 import React from 'react';
 import withStyles from 'universal/styles/withStyles';
 import {css} from 'aphrodite-local-styles/no-important';
 import Tabs from 'universal/components/Tabs/Tabs';
 import Tab from 'universal/components/Tab/Tab';
 import FontAwesome from 'react-fontawesome';
 import {withRouter} from 'react-router-dom';
 import {SETTINGS, settingsOrder} from 'universal/utils/constants';
 import appTheme from 'universal/styles/theme/appTheme';

 const iconStyle = {opacity: '.5'};

 const TeamSettingsTabs = (props) => {
   const {activeKey, notificationCount, history, styles, teamId} = props;
   const makeOnClick = (area = '') => {
     return area === activeKey ? undefined : () => {
       history.push(`/team/${teamId}/settings/${area}`);
     };
   };
   return (
     <Tabs activeKey={activeKey}>
       <Tab
         key=""
         label="Overview"
         onClick={makeOnClick()}
       />
       <Tab
         key="integrations"
         label="Integrations"
         onClick={makeOnClick('integrations')}
       />
     </Tabs>
   );
 };

 TeamSettingsTabs.propTypes = {
   notificationCount: PropTypes.number,
   history: PropTypes.object,
   styles: PropTypes.object
 };

 const styleThunk = () => ({
   badge: {
     background: appTheme.palette.warm,
     borderRadius: '100%',
     bottom: 0,
     color: 'white',
     fontSize: '14px',
     fontWeight: 700,
     height: '16px',
     cursor: 'default',
     position: 'absolute',
     right: '-4px',
     textAlign: 'center',
     width: '16px'
   },
   badgeAndBell: {
     position: 'relative'
   }
 });
 export default withRouter(withStyles(styleThunk)(TeamSettingsTabs));
