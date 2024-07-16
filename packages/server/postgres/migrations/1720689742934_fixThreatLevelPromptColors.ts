import {r} from 'rethinkdb-ts'
import connectRethinkDB from '../../database/connectRethinkDB'

export async function up() {
  await connectRethinkDB()

  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateSeverePrompt')
    .update({groupColor: '#FD6157'})
    .run()
  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateElevatedPrompt')
    .update({groupColor: '#FFCC63'})
    .run()
  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateLowPrompt')
    .update({groupColor: '#66BC8C'})
    .run()
}

export async function down() {
  await connectRethinkDB()

  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateSeverePrompt')
    .update({groupColor: '#66BC8C'})
    .run()
  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateElevatedPrompt')
    .update({groupColor: '#FD6157'})
    .run()
  await r
    .table('ReflectPrompt')
    .get('threatLevelPremortemTemplateLowPrompt')
    .update({groupColor: '#FFCC63'})
    .run()
}
