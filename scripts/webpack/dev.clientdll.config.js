const path = require('path')
const webpack = require('webpack')
const getProjectRoot = require('./utils/getProjectRoot')

const PROJECT_ROOT = getProjectRoot()
const DLL_ROOT = path.join(PROJECT_ROOT, 'dev/dll')

module.exports = {
  mode: 'development',
  entry: {
    vendors: [
      // global packages
      '@floating-ui/dom',
      '@tiptap/core',
      '@tiptap/extension-collaboration',
      '@tiptap/extension-collaboration-caret',
      '@tiptap/extension-details',
      '@tiptap/extension-document',
      '@tiptap/extension-drag-handle',
      '@tiptap/extension-heading',
      '@tiptap/extension-image',
      '@tiptap/extension-link',
      '@tiptap/extension-list',
      '@tiptap/extension-mention',
      '@tiptap/extension-node-range',
      '@tiptap/extension-table',
      '@tiptap/extension-text',
      '@tiptap/extensions',
      '@tiptap/html',
      '@tiptap/pm',
      '@tiptap/react',
      '@tiptap/starter-kit',
      '@tiptap/suggestion',
      'y-indexeddb',
      'y-prosemirror',
      'y-protocols',
      'yjs',
      // client packages
      '@amplitude/analytics-browser',
      '@datadog/browser-rum',
      '@emoji-mart/data',
      '@emoji-mart/react',
      '@emotion/core',
      '@emotion/react',
      '@emotion/styled',
      '@graphiql/toolkit',
      '@mattkrick/sanitize-svg',
      '@mui/base',
      '@mui/icons-material',
      '@mui/material',
      '@mui/system',
      '@mui/x-date-pickers',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-avatar',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-collapsible',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-scroll-area',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-tooltip',
      '@sereneinserenade/tiptap-search-and-replace',
      '@stripe/react-stripe-js',
      '@stripe/stripe-js',
      '@tanstack/react-table',
      '@types/history',
      'cleave.js',
      'clsx',
      'date-fns',
      'dayjs',
      'dompurify',
      'email-addresses',
      'emoji-mart',
      'eventemitter3',
      'fbjs',
      'flatted',
      'graphiql',
      'history',
      'hoist-non-react-statics',
      'humanize-duration',
      'js-cookie',
      'json2csv',
      'jwt-decode',
      'linkify-it',
      'mousetrap',
      'node-html-markdown-cloudflare',
      'react-beautiful-dnd',
      'react-copy-to-clipboard',
      'react-day-picker',
      'react-dom',
      'react-dom-confetti',
      'react-ga4',
      'react-router',
      'react-router-dom',
      'react-swipeable-views',
      'react-swipeable-views-core',
      'react-swipeable-views-utils',
      'react-textarea-autosize',
      'react-transition-group',
      'react-virtualized',
      'resize-observer-polyfill',
      'rrule',
      'sanitize-html',
      'swiper',
      'tailwind-merge',
      'tayden-clusterfck',
      'tiptap-extension-auto-joiner',
      'tiptap-extension-global-drag-handle',
      'tlds',
      'tslib'
    ]
  },
  resolve: {
    fallback: {
      assert: path.join(PROJECT_ROOT, 'scripts/webpack/assert.js')
    }
  },
  output: {
    filename: '[name].dll.js',
    path: DLL_ROOT,
    library: '[name]'
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]',
      path: path.join(DLL_ROOT, '[name].json')
    })
  ],
  module: {
    rules: [
      {test: /\.flow$/, loader: 'ignore-loader'},
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
}
