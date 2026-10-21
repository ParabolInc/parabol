import {sql} from 'kysely'

// A discussion's topic is its retro group's title or its check-in agenda item. Other discussions have none
export const joinTopic = (discussionAlias: string, groupAlias: string, agendaItemAlias: string) => {
  const topicType = sql.ref(`${discussionAlias}.discussionTopicType`)
  const topicId = sql.ref(`${discussionAlias}.discussionTopicId`)
  return sql`LEFT JOIN "RetroReflectionGroup" AS ${sql.table(groupAlias)}
      ON ${topicType} = 'reflectionGroup' AND ${sql.ref(`${groupAlias}.id`)} = ${topicId}
    LEFT JOIN "AgendaItem" AS ${sql.table(agendaItemAlias)}
      ON ${topicType} = 'agendaItem' AND ${sql.ref(`${agendaItemAlias}.id`)} = ${topicId}`
}

// Topics match whatever their case, so the same topic in two retros adds up
export const topicOf = (groupAlias: string, agendaItemAlias: string) => {
  const text = sql<string>`NULLIF(btrim(COALESCE(
    ${sql.ref(`${groupAlias}.title`)},
    ${sql.ref(`${groupAlias}.smartTitle`)},
    ${sql.ref(`${agendaItemAlias}.content`)}
  )), '')`
  return {
    key: sql<string>`lower(${text})`,
    label: text,
    requires: sql<boolean>`${text} IS NOT NULL`
  }
}
