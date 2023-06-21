// CAN REMOVE WHEN WE UPGRADE TO NODE V20
// There's a memory leak in fetch that shipped with Node v18.
// The leak is fixed in v20, but we have clients who cannot run v20 yet
// For now, we monkeypatch the native fetch with the fixed one

import {fetch} from 'undici'

global.fetch = fetch as any
