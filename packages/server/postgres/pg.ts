// webpack entrypoint forcing pg & all dependencies to get bundled into a standalone file
export {Client, Pool} from 'pg'
