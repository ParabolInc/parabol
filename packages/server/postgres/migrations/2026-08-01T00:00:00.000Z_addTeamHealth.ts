import {type Kysely, sql} from 'kysely'

const SEED_DATE = new Date('2026-07-08T00:00:00.000Z')

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Add 'teamHealth' to MeetingTypeEnum by rebuilding the type in place. pg forbids
  // *using* an enum value in the same transaction that added it via `ALTER TYPE ... ADD
  // VALUE`, and kysely runs every pending migration in a single transaction — so a later
  // migration in this batch that seeds MeetingTemplate rows of type 'teamHealth' would
  // fail with "unsafe use of new value". Doing the ADD VALUE on a separate autocommit
  // connection doesn't work either: on a fresh database the whole batch (including the
  // init migration that CREATEs MeetingTypeEnum) is still uncommitted, so that connection
  // can't see the type ("type does not exist"). Recreating the type here sidesteps both:
  // values of a type created in the current transaction may be used within it.
  await sql`ALTER TYPE public."MeetingTypeEnum" RENAME TO "MeetingTypeEnum_old"`.execute(db)
  await sql`
    CREATE TYPE public."MeetingTypeEnum" AS ENUM (
      'action',
      'retrospective',
      'poker',
      'teamPrompt',
      'teamHealth'
    )
  `.execute(db)
  await sql`
    ALTER TABLE public."NewMeeting"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingMember"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSettings"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSeries"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingTemplate"
    ALTER COLUMN "type" TYPE public."MeetingTypeEnum"
    USING "type"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" DROP DEFAULT`.execute(db)
  await sql`
    ALTER TABLE public."Team"
    ALTER COLUMN "lastMeetingType" TYPE public."MeetingTypeEnum"
    USING "lastMeetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" SET DEFAULT 'retrospective'`.execute(
    db
  )
  await sql`DROP TYPE public."MeetingTypeEnum_old"`.execute(db)

  await db.schema.createType('TeamHealthQuestionTypeEnum').asEnum(['likert']).execute()

  await db.schema
    .createTable('TeamHealthCategory')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(100)', (col) => col.notNull())
    .addColumn('description', 'varchar(500)')
    .addColumn('sortOrder', 'smallint', (col) => col.notNull().defaultTo(0))
    // seeded/built-in categories belong to 'aGhostUser'
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('uniq_TeamHealthCategory_userId_name')
    .ifNotExists()
    .on('TeamHealthCategory')
    .unique()
    .columns(['userId', sql`lower(name)`])
    .where(sql.ref('removedAt'), 'is', null)
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthCategory_userId')
    .ifNotExists()
    .on('TeamHealthCategory')
    .column('userId')
    .execute()

  await db.schema
    .createTable('TeamHealthQuestionPack')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(250)', (col) => col.notNull())
    .addColumn('description', 'varchar(2000)')
    .addColumn('source', 'varchar(255)')
    .addColumn('sourceUrl', 'varchar(2048)')
    // the user who owns this pack. 'aGhostUser' for the built-in/seeded packs
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    // no removedAt: packs are only ever added or hard-deleted (cascade on User delete)
    .execute()

  // one pack per real user. The built-in packs all belong to 'aGhostUser' (there are many), so the
  // uniqueness is partial — it excludes the ghost user. This partial index also serves as the arbiter
  // for the find-or-create upsert in addTeamHealthQuestion (single ON CONFLICT statement)
  await db.schema
    .createIndex('idx_TeamHealthQuestionPack_userId')
    .ifNotExists()
    .unique()
    .on('TeamHealthQuestionPack')
    .column('userId')
    .where(sql.ref('userId'), '<>', 'aGhostUser')
    .execute()

  await db.schema
    .createTable('TeamHealthQuestion')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('packId', 'integer', (col) =>
      col.notNull().references('TeamHealthQuestionPack.id').onDelete('cascade')
    )
    // no cascade: categories soft-delete; a hard delete must not destroy questions across packs
    .addColumn('categoryId', 'integer', (col) => col.notNull().references('TeamHealthCategory.id'))
    .addColumn('question', 'varchar(500)', (col) => col.notNull())
    .addColumn('description', 'varchar(1000)')
    .addColumn('questionType', sql`"TeamHealthQuestionTypeEnum"`, (col) =>
      col.notNull().defaultTo('likert')
    )
    // null = built-in/seeded (system) question. Set to the author's userId for user-created questions
    .addColumn('createdBy', 'varchar(100)', (col) => col.references('User.id').onDelete('set null'))
    // when non-null, this question was superseded by a new version (see replacedBy) and is hidden from
    // pack listings, but stays resolvable by id so historical responses reference the question as asked
    .addColumn('replacedBy', 'integer', (col) =>
      col.references('TeamHealthQuestion.id').onDelete('set null')
    )
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('removedAt', 'timestamptz')
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthQuestion_packId')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .column('packId')
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthQuestion_categoryId')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .column('categoryId')
    .execute()
  await db.schema
    .createIndex('uniq_TeamHealthQuestion_packId_question')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .unique()
    .columns(['packId', sql`lower(question)`])
    .where(sql.ref('removedAt'), 'is', null)
    .where(sql.ref('replacedBy'), 'is', null)
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthQuestion_replacedBy')
    .ifNotExists()
    .on('TeamHealthQuestion')
    .column('replacedBy')
    .where(sql.ref('replacedBy'), 'is not', null)
    .execute()

  await db.schema
    .createTable('TeamHealthTemplateQuestion')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('templateId', 'varchar(100)', (col) =>
      col.notNull().references('MeetingTemplate.id').onDelete('cascade')
    )
    .addColumn('questionId', 'integer', (col) =>
      col.notNull().references('TeamHealthQuestion.id').onDelete('cascade')
    )
    // the unique btree's leading templateId column also serves list-by-template queries
    .addUniqueConstraint('uniq_TeamHealthTemplateQuestion_templateId_questionId', [
      'templateId',
      'questionId'
    ])
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthTemplateQuestion_questionId')
    .ifNotExists()
    .on('TeamHealthTemplateQuestion')
    .column('questionId')
    .execute()

  await db.schema
    .createTable('TeamHealthResponse')
    .ifNotExists()
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('meetingId', 'varchar(100)', (col) =>
      col.notNull().references('NewMeeting.id').onDelete('cascade')
    )
    .addColumn('questionId', 'integer', (col) =>
      col.notNull().references('TeamHealthQuestion.id').onDelete('cascade')
    )
    .addColumn('userId', 'varchar(100)', (col) =>
      col.notNull().references('User.id').onDelete('cascade')
    )
    // null score = skipped, or a future non-likert questionType
    .addColumn('score', 'smallint')
    .addColumn('comment', 'varchar(2000)')
    .addColumn('commentParaphrased', 'varchar(2000)')
    .addColumn('createdAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addColumn('updatedAt', 'timestamptz', (col) => col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`))
    .addUniqueConstraint('uniq_TeamHealthResponse_meetingId_questionId_userId', [
      'meetingId',
      'questionId',
      'userId'
    ])
    .addCheckConstraint('ck_TeamHealthResponse_score', sql`"score" BETWEEN 1 AND 5`)
    .execute()

  await db.schema
    .createIndex('idx_TeamHealthResponse_questionId')
    .ifNotExists()
    .on('TeamHealthResponse')
    .column('questionId')
    .execute()
  await db.schema
    .createIndex('idx_TeamHealthResponse_userId')
    .ifNotExists()
    .on('TeamHealthResponse')
    .column('userId')
    .execute()

  await db.schema
    .alterTable('MeetingSeries')
    .addColumn('templateId', 'varchar(100)', (col) =>
      col.references('MeetingTemplate.id').onDelete('set null')
    )
    .execute()
  await db.schema
    .createIndex('idx_MeetingSeries_templateId')
    .ifNotExists()
    .on('MeetingSeries')
    .column('templateId')
    .where(sql.ref('templateId'), 'is not', null)
    .execute()

  await db
    .insertInto('TeamHealthCategory')
    .values([
      {
        name: 'Psychological Safety',
        sortOrder: 1,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Dependability',
        sortOrder: 2,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Structure & Clarity',
        sortOrder: 3,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Meaning',
        sortOrder: 4,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      },
      {
        name: 'Impact',
        sortOrder: 5,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      }
    ])
    .execute()

  // Read back the seeded category ids to map questions onto them
  const categories = await db
    .selectFrom('TeamHealthCategory')
    .select(['id', 'name'])
    .where('userId', '=', 'aGhostUser')
    .execute()
  const categoryId = (name: string) => {
    const category = categories.find((c: {name: string}) => c.name === name)
    if (!category) throw new Error(`Seed error: TeamHealthCategory "${name}" not found`)
    return category.id
  }
  const CATEGORY = {
    PS: 'Psychological Safety',
    DEP: 'Dependability',
    SC: 'Structure & Clarity',
    MEANING: 'Meaning',
    IMPACT: 'Impact'
  } as const

  // Built-in question packs, each sourced from a real team-effectiveness model.
  // Every question maps to exactly one of Parabol's five categories.
  const PACKS: {
    name: string
    description: string
    source: string
    sourceUrl: string
    questions: {category: string; question: string}[]
  }[] = [
    {
      name: 'Google Project Aristotle',
      description:
        "Google's Project Aristotle “five dynamics” of effective teams — the canonical source of Parabol's five categories, mapping 1:1.",
      source: 'Google re:Work — Project Aristotle',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/google-project-aristotle/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'If I make a mistake on this team, it is not held against me.'
        },
        {
          category: CATEGORY.PS,
          question: 'I feel safe to take risks and be vulnerable in front of my teammates.'
        },
        {category: CATEGORY.PS, question: 'I can raise problems and tough issues with this team.'},
        {
          category: CATEGORY.DEP,
          question: "When my teammates say they'll do something, they follow through with it."
        },
        {
          category: CATEGORY.DEP,
          question: 'I can count on my teammates to deliver quality work on time.'
        },
        {category: CATEGORY.DEP, question: 'Everyone on this team pulls their weight.'},
        {category: CATEGORY.SC, question: 'Our team has an effective decision-making process.'},
        {
          category: CATEGORY.SC,
          question: "I know what's expected of me, and the goals for my work are clear."
        },
        {
          category: CATEGORY.SC,
          question: "I understand my role and how it fits with my teammates' roles."
        },
        {category: CATEGORY.MEANING, question: 'The work I do for our team is meaningful to me.'},
        {category: CATEGORY.MEANING, question: 'I find a sense of personal purpose in my work.'},
        {
          category: CATEGORY.IMPACT,
          question: "I understand how our team's work contributes to the organization's goals."
        },
        {category: CATEGORY.IMPACT, question: "I can see the difference our team's work makes."}
      ]
    },
    {
      name: 'Edmondson Psychological Safety',
      description:
        "Amy Edmondson's peer-reviewed, validated 7-item team Psychological Safety (1999), restated to positive phrasing, plus two optional team-learning items.",
      source: 'Edmondson (1999), Administrative Science Quarterly 44:350–383',
      sourceUrl:
        'https://www.parabol.co/agile/team-health-check-tool/psychological-safety-assessment/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'If I make a mistake on this team, it is not held against me.'
        },
        {
          category: CATEGORY.PS,
          question: 'Members of this team are able to bring up problems and tough issues.'
        },
        {
          category: CATEGORY.PS,
          question: 'People on this team are accepted, even when they are different.'
        },
        {category: CATEGORY.PS, question: 'It is safe to take a risk on this team.'},
        {category: CATEGORY.PS, question: 'It is easy to ask other members of this team for help.'},
        {
          category: CATEGORY.PS,
          question:
            'No one on this team would deliberately act in a way that undermines my efforts.'
        },
        {
          category: CATEGORY.PS,
          question: 'My unique skills and talents are valued and put to good use on this team.'
        },
        {
          category: CATEGORY.SC,
          question:
            "We regularly take time to figure out ways to improve our team's work processes."
        },
        {
          category: CATEGORY.DEP,
          question:
            "People on this team speak up to test assumptions about the issues we're working on."
        }
      ]
    },
    {
      name: 'Lencioni Five Dysfunctions',
      description:
        "Patrick Lencioni's Five Dysfunctions of a Team — the published 15-item assessment restated as positive agree/disagree statements. Strong on trust, healthy conflict, and peer accountability.",
      source: 'Lencioni, The Five Dysfunctions of a Team (2002)',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/five-dysfunctions-of-a-team/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'Team members openly admit their weaknesses and mistakes.'
        },
        {
          category: CATEGORY.PS,
          question:
            'Team members quickly and genuinely apologize when they say or do something damaging to the team.'
        },
        {
          category: CATEGORY.PS,
          question: 'Team members are comfortable discussing their personal lives with one another.'
        },
        {
          category: CATEGORY.PS,
          question: 'Team members are passionate and unguarded in their discussion of issues.'
        },
        {
          category: CATEGORY.PS,
          question:
            'During team meetings, the most important — and difficult — issues are put on the table to be resolved.'
        },
        {category: CATEGORY.PS, question: 'Our team meetings are compelling and engaging.'},
        {
          category: CATEGORY.DEP,
          question: "Team members call out one another's deficiencies or unproductive behaviors."
        },
        {
          category: CATEGORY.DEP,
          question:
            'Team members are deeply concerned about the prospect of letting down their peers.'
        },
        {
          category: CATEGORY.DEP,
          question: 'Team members challenge one another about their plans and approaches.'
        },
        {
          category: CATEGORY.SC,
          question:
            'Team members know what their peers are working on and how it contributes to the team.'
        },
        {
          category: CATEGORY.SC,
          question:
            'Team members leave meetings confident their peers are committed to the decisions agreed on, even after initial disagreement.'
        },
        {
          category: CATEGORY.SC,
          question:
            'Team members end discussions with clear, specific resolutions and calls to action.'
        },
        {
          category: CATEGORY.IMPACT,
          question:
            'Team members willingly make sacrifices in their own areas for the good of the team.'
        },
        {
          category: CATEGORY.IMPACT,
          question: 'Our morale is significantly affected by whether we achieve our team goals.'
        },
        {
          category: CATEGORY.IMPACT,
          question:
            'Team members are quick to point out the contributions of others, and slow to seek credit for themselves.'
        }
      ]
    },
    {
      name: 'Hackman Team Diagnostic',
      description:
        "Hackman & Wageman's Team Diagnostic Survey “enabling conditions” — Parabol-worded adaptations of real, peer-reviewed constructs (the instrument itself is proprietary).",
      source: 'Wageman, Hackman & Lehman (2005), JABS 41:373–398',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/team-diagnostic-survey/',
      questions: [
        {
          category: CATEGORY.PS,
          question:
            'Our team has clear, shared norms for how we treat each other and handle disagreement.'
        },
        {
          category: CATEGORY.PS,
          question:
            'The wider organization gives our team the support and respect it needs to do good work.'
        },
        {
          category: CATEGORY.DEP,
          question: 'This team has the right mix of people and skills to get its work done.'
        },
        {
          category: CATEGORY.DEP,
          question: 'Our team keeps getting better at how we work together.'
        },
        {
          category: CATEGORY.SC,
          question: 'Our team has a clear, compelling direction that everyone understands.'
        },
        {
          category: CATEGORY.SC,
          question: "Our work is well organized — it's clear what we do and how we do it."
        },
        {category: CATEGORY.SC, question: "It's clear who is, and who isn't, part of our team."},
        {
          category: CATEGORY.MEANING,
          question: 'Being on this team contributes to my own learning and growth.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'The experience of working on this team is satisfying and worthwhile to me.'
        },
        {
          category: CATEGORY.IMPACT,
          question:
            'The results of our work meet or exceed the standards of the people who use them.'
        },
        {
          category: CATEGORY.IMPACT,
          question:
            'Our team consistently delivers outcomes that matter to our customers and stakeholders.'
        }
      ]
    },
    {
      name: 'Gallup Q12',
      description:
        "Gallup's Q12 employee engagement items — verbatim, lightly re-voiced toward the team. Individual-level, with strong coverage of Meaning and Structure & clarity.",
      source: 'Gallup Q12 — Buckingham & Coffman, First, Break All the Rules (1999)',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/gallup-q12/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'My supervisor, or someone at work, seems to care about me as a person.'
        },
        {category: CATEGORY.PS, question: 'At work, my opinions seem to count.'},
        {category: CATEGORY.PS, question: 'I have a best friend at work.'},
        {category: CATEGORY.DEP, question: 'My teammates are committed to doing quality work.'},
        {category: CATEGORY.SC, question: 'I know what is expected of me at work.'},
        {
          category: CATEGORY.SC,
          question: 'I have the materials and equipment I need to do my work right.'
        },
        {
          category: CATEGORY.SC,
          question: 'In the last six months, someone at work has talked to me about my progress.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'At work, I have the opportunity to do what I do best every day.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'This last year, I have had opportunities at work to learn and grow.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'There is someone at work who encourages my development.'
        },
        {
          category: CATEGORY.MEANING,
          question:
            'In the last seven days, I have received recognition or praise for doing good work.'
        },
        {
          category: CATEGORY.IMPACT,
          question: 'The mission or purpose of my organization makes me feel my job is important.'
        }
      ]
    },
    {
      name: 'Spotify Squad Health Check',
      description:
        "Spotify's Squad Health Check — the healthy “green” pole of each of the 10 cards (verbatim, Creative Commons). Some cards are software-specific.",
      source: 'Spotify Engineering — Squad Health Check (2014)',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/spotify-squad-health-check/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'We love going to work, and have great fun working together.'
        },
        {
          category: CATEGORY.PS,
          question: 'We always get great support and help when we ask for it.'
        },
        {
          category: CATEGORY.DEP,
          question: 'Releasing is simple, safe, painless and mostly automated.'
        },
        {
          category: CATEGORY.DEP,
          question: "We're proud of the quality of our work; it's clean and easy to build on."
        },
        {
          category: CATEGORY.DEP,
          question: 'We get stuff done quickly — no waiting, no delays.'
        },
        {category: CATEGORY.SC, question: 'Our way of working fits us perfectly.'},
        {
          category: CATEGORY.MEANING,
          question: "We're learning lots of interesting things all the time."
        },
        {
          category: CATEGORY.MEANING,
          question: 'We are in control of our own destiny — we decide what to build and how.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'We know exactly why we are here, and we are really excited about it.'
        },
        {
          category: CATEGORY.IMPACT,
          question: "We deliver great stuff! We're proud of it and our stakeholders are happy."
        }
      ]
    },
    {
      name: 'Atlassian Team Health Monitor',
      description:
        "Atlassian Team Playbook's Team Health Monitor — its 8 attributes rewritten as positive self-assessment statements. Designed for facilitated team workshops.",
      source: 'Atlassian Team Playbook — Team Health Monitor',
      sourceUrl:
        'https://www.parabol.co/agile/team-health-check-tool/atlassian-team-health-monitor/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'There is a high level of mutual trust and respect on our team.'
        },
        {
          category: CATEGORY.PS,
          question: 'People feel safe to voice diverse viewpoints and challenge the status quo.'
        },
        {
          category: CATEGORY.PS,
          question: 'Team members are engaged, and support each other when things get tough.'
        },
        {
          category: CATEGORY.DEP,
          question: 'We regularly reflect and take action to get better at how we work.'
        },
        {
          category: CATEGORY.SC,
          question: 'We have the right people and skills, and roles are clearly defined.'
        },
        {category: CATEGORY.SC, question: 'Our ways of working suit the team and the work we do.'},
        {
          category: CATEGORY.SC,
          question: 'We share a clear, common understanding of our mission and milestones.'
        },
        {
          category: CATEGORY.IMPACT,
          question: "We're clear on the value we provide and how we measure it."
        }
      ]
    },
    {
      name: 'Google Project Oxygen',
      description:
        "Google's Project Oxygen Manager Feedback Survey (verbatim 13 items). Measures the manager, not peer dynamics — offer as a separate “manager effectiveness” lens, ideally as upward feedback.",
      source: 'Google re:Work — Project Oxygen Manager Feedback Survey',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/google-project-oxygen/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'My manager consistently shows consideration for me as a person.'
        },
        {
          category: CATEGORY.PS,
          question:
            'The actions of my manager show they value the perspective I bring to the team, even if it is different from their own.'
        },
        {
          category: CATEGORY.PS,
          question:
            'My manager provides the autonomy I need to do my job (i.e., does not micromanage by getting involved in details that should be handled at other levels).'
        },
        {category: CATEGORY.PS, question: 'I would recommend my manager to others.'},
        {
          category: CATEGORY.DEP,
          question: 'My manager has the technical expertise required to effectively manage me.'
        },
        {category: CATEGORY.SC, question: 'My manager communicates clear goals for our team.'},
        {
          category: CATEGORY.SC,
          question: 'My manager gives me actionable feedback on a regular basis.'
        },
        {
          category: CATEGORY.SC,
          question:
            "My manager keeps the team focused on priorities, even when it's difficult (e.g., declining or deprioritizing other projects)."
        },
        {
          category: CATEGORY.SC,
          question:
            'My manager regularly shares relevant information from their manager and senior leadership.'
        },
        {
          category: CATEGORY.SC,
          question:
            'My manager makes tough decisions effectively (e.g., decisions involving multiple teams or competing priorities).'
        },
        {
          category: CATEGORY.MEANING,
          question: 'My manager assigns stretch opportunities to help me develop in my career.'
        },
        {
          category: CATEGORY.MEANING,
          question: 'My manager has meaningful discussions with me about my career development.'
        },
        {
          category: CATEGORY.IMPACT,
          question:
            'My manager effectively collaborates across boundaries (e.g., team, organizational).'
        }
      ]
    },
    {
      name: 'David Rock — SCARF',
      description:
        "David Rock's SCARF model (Status, Certainty, Autonomy, Relatedness, Fairness). Questions are authored by Parabol and grounded in the model — no public instrument exists. Covers only three categories; pair with a results-oriented pack.",
      source: 'Rock (2008), SCARF — NeuroLeadership Journal',
      sourceUrl: 'https://www.parabol.co/agile/team-health-check-tool/scarf-model/',
      questions: [
        {
          category: CATEGORY.PS,
          question: 'I feel a real sense of belonging and trust with my teammates.'
        },
        {category: CATEGORY.PS, question: 'I can be myself around the people I work with.'},
        {
          category: CATEGORY.PS,
          question: 'I can give and receive feedback here without feeling diminished.'
        },
        {
          category: CATEGORY.PS,
          question: 'Recognition, workload, and opportunities are distributed fairly on our team.'
        },
        {
          category: CATEGORY.SC,
          question:
            "I have a clear understanding of what's expected of me and where the team is headed."
        },
        {
          category: CATEGORY.SC,
          question:
            'Changes that affect my work are communicated with enough notice for me to adjust.'
        },
        {
          category: CATEGORY.SC,
          question: 'The rules and processes on our team are applied consistently to everyone.'
        },
        {category: CATEGORY.MEANING, question: 'I have meaningful control over how I do my work.'},
        {
          category: CATEGORY.MEANING,
          question: "I'm trusted to make decisions without being micromanaged."
        },
        {
          category: CATEGORY.MEANING,
          question: 'My contributions are recognized and valued by my team.'
        }
      ]
    }
  ]

  for (const {questions, ...pack} of PACKS) {
    const {id: packId} = await db
      .insertInto('TeamHealthQuestionPack')
      .values({
        ...pack,
        userId: 'aGhostUser',
        createdAt: SEED_DATE,
        updatedAt: SEED_DATE
      })
      .returning('id')
      .executeTakeFirstOrThrow()
    await db
      .insertInto('TeamHealthQuestion')
      .values(
        questions.map(({category, question}) => ({
          packId,
          categoryId: categoryId(category),
          question,
          questionType: 'likert',
          createdAt: SEED_DATE,
          updatedAt: SEED_DATE
        }))
      )
      .execute()
  }
}

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('TeamHealthResponse').ifExists().execute()
  await db.schema.dropTable('TeamHealthTemplateQuestion').ifExists().execute()
  await db.schema.dropTable('TeamHealthQuestion').ifExists().execute()
  await db.schema.dropTable('TeamHealthQuestionPack').ifExists().execute()
  await db.schema.dropTable('TeamHealthCategory').ifExists().execute()

  await db.schema.alterTable('MeetingSeries').dropColumn('templateId').execute()
  await sql`DROP TYPE IF EXISTS public."TeamHealthQuestionTypeEnum"`.execute(db)

  // remove 'teamHealth' from MeetingTypeEnum: purge rows using it, then rebuild the type
  await sql`DELETE FROM public."NewMeeting" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingMember" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingSettings" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingSeries" WHERE "meetingType" = 'teamHealth'`.execute(db)
  await sql`DELETE FROM public."MeetingTemplate" WHERE "type" = 'teamHealth'`.execute(db)
  await sql`UPDATE public."Team" SET "lastMeetingType" = 'retrospective' WHERE "lastMeetingType" = 'teamHealth'`.execute(
    db
  )

  await sql`ALTER TYPE public."MeetingTypeEnum" RENAME TO "MeetingTypeEnum_old"`.execute(db)
  await sql`
    CREATE TYPE public."MeetingTypeEnum" AS ENUM (
      'action',
      'retrospective',
      'poker',
      'teamPrompt'
    )
  `.execute(db)
  await sql`
    ALTER TABLE public."NewMeeting"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingMember"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSettings"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingSeries"
    ALTER COLUMN "meetingType" TYPE public."MeetingTypeEnum"
    USING "meetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`
    ALTER TABLE public."MeetingTemplate"
    ALTER COLUMN "type" TYPE public."MeetingTypeEnum"
    USING "type"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" DROP DEFAULT`.execute(db)
  await sql`
    ALTER TABLE public."Team"
    ALTER COLUMN "lastMeetingType" TYPE public."MeetingTypeEnum"
    USING "lastMeetingType"::text::public."MeetingTypeEnum"
  `.execute(db)
  await sql`ALTER TABLE public."Team" ALTER COLUMN "lastMeetingType" SET DEFAULT 'retrospective'`.execute(
    db
  )
  await sql`DROP TYPE public."MeetingTypeEnum_old"`.execute(db)
}
