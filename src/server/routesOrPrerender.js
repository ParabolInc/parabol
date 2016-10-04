// import {renderToStaticMarkup} from 'react-dom/server';
// import routes from 'universal/routes/index';
// import Html from './Html';
// import React from 'react';
// import {cashay} from 'cashay';
// import ActionHTTPTransport from 'universal/utils/ActionHTTPTransport';
//
// const PROD = process.env.NODE_ENV === 'production';
//
// export default option => {
//   // if (option === 'routes') return routes;
//   return function renderApp(req, res, store, entries = {}, renderProps) {
//     console.log('renderApp');
//     if (PROD) {
//       // eslint-disable-next-line global-require
//       let cashaySchema = null;
//       console.log('typeof __WEBPACK__', typeof __WEBPACK__);
//       if (typeof __WEBPACK__ !== 'undefined' && __WEBPACK__) {
//         // if we're building server, we must allow the server to exit:
//         // eslint-disable-next-line global-require
//         cashaySchema = require('cashay!./utils/getCashaySchema.js?stopRethink');
//       } else {
//         // eslint-disable-next-line global-require
//         cashaySchema = require('cashay!./utils/getCashaySchema.js');
//       }
//       const cashayHttpTransport = new ActionHTTPTransport();
//       cashay.create({
//         store,
//         schema: cashaySchema,
//         httpTransport: cashayHttpTransport
//       });
//     }
//     console.log('renderApp2');
//     // Needed so some components can render based on location
//     const htmlString = renderToStaticMarkup(
//       <Html
//         title="Action | Parabol Inc"
//         store={store}
//         entries={entries}
//         renderProps={renderProps}
//       />
//     );
//     res.send(`<!DOCTYPE html>${htmlString}`);
//   };
// };
