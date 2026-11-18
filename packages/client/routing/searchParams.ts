import {parseSearchWith, stringifySearchWith} from '@tanstack/react-router'

// Search params stay strings, as URLSearchParams reads them, so a value like 007 survives a navigation
export const parseSearch = parseSearchWith((value) => value)
export const stringifySearch = stringifySearchWith(JSON.stringify)
