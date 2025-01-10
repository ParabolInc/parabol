import {sql, type Kysely} from 'kysely'
export async function up(db: Kysely<any>): Promise<void> {
  const hasUserTable = await sql<{exists: boolean}>`
	SELECT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename = 'User'
	);`.execute(db)
  // if the DB already exists then do not initialize
  if (hasUserTable.rows[0].exists) {
    // migrationTableName should have been incremented, so delete the previous table
    await db.schema.dropTable('_migration').execute()
    return
  }
  const {CDN_BASE_URL, FILE_STORE_PROVIDER} = process.env
  if (!FILE_STORE_PROVIDER) throw new Error('Missng Env: FILE_STORE_PROVIDER')

  let backupScript = `--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2 (Debian 16.2-1.pgdg120+2)
-- Dumped by pg_dump version 16.3

-- Started on 2025-01-08 21:44:58 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 4218803)
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- TOC entry 4527 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- TOC entry 999 (class 1247 OID 4218909)
-- Name: AuthTokenRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."AuthTokenRole" AS ENUM (
    'su'
);


--
-- TOC entry 1002 (class 1247 OID 4218912)
-- Name: ChangeSourceEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ChangeSourceEnum" AS ENUM (
    'meeting',
    'task',
    'external'
);


--
-- TOC entry 1005 (class 1247 OID 4218921)
-- Name: CreditCard; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CreditCard" AS (
	brand text,
	expiry text,
	last4 smallint
);


--
-- TOC entry 1008 (class 1247 OID 4218923)
-- Name: DiscussionTopicTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."DiscussionTopicTypeEnum" AS ENUM (
    'agendaItem',
    'reflectionGroup',
    'task',
    'githubIssue',
    'jiraIssue',
    'teamPromptResponse'
);


--
-- TOC entry 1011 (class 1247 OID 4218936)
-- Name: EmbeddingsJobStateEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmbeddingsJobStateEnum" AS ENUM (
    'queued',
    'running',
    'failed'
);


--
-- TOC entry 1014 (class 1247 OID 4218944)
-- Name: EmbeddingsObjectTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EmbeddingsObjectTypeEnum" AS ENUM (
    'retrospectiveDiscussionTopic',
    'meetingTemplate'
);


--
-- TOC entry 1017 (class 1247 OID 4218950)
-- Name: FeatureFlagScope; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."FeatureFlagScope" AS ENUM (
    'User',
    'Team',
    'Organization'
);


--
-- TOC entry 1020 (class 1247 OID 4218959)
-- Name: GoogleAnalyzedEntity; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."GoogleAnalyzedEntity" AS (
	name text,
	salience real,
	lemma text
);


--
-- TOC entry 1023 (class 1247 OID 4218961)
-- Name: ISO6391Enum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ISO6391Enum" AS ENUM (
    'aa',
    'ab',
    'af',
    'ak',
    'am',
    'ar',
    'an',
    'as',
    'av',
    'ae',
    'ay',
    'az',
    'ba',
    'bm',
    'be',
    'bn',
    'bi',
    'bo',
    'bs',
    'br',
    'bg',
    'ca',
    'cs',
    'ch',
    'ce',
    'cu',
    'cv',
    'kw',
    'co',
    'cr',
    'cy',
    'da',
    'de',
    'dv',
    'dz',
    'el',
    'en',
    'eo',
    'et',
    'eu',
    'ee',
    'fo',
    'fa',
    'fj',
    'fi',
    'fr',
    'fy',
    'ff',
    'gd',
    'ga',
    'gl',
    'gv',
    'gn',
    'gu',
    'ht',
    'ha',
    'sh',
    'he',
    'hz',
    'hi',
    'ho',
    'hr',
    'hu',
    'hy',
    'ig',
    'io',
    'ii',
    'iu',
    'ie',
    'ia',
    'id',
    'ik',
    'is',
    'it',
    'jv',
    'ja',
    'kl',
    'kn',
    'ks',
    'ka',
    'kr',
    'kk',
    'km',
    'ki',
    'rw',
    'ky',
    'kv',
    'kg',
    'ko',
    'kj',
    'ku',
    'lo',
    'la',
    'lv',
    'li',
    'ln',
    'lt',
    'lb',
    'lu',
    'lg',
    'mh',
    'ml',
    'mr',
    'mk',
    'mg',
    'mt',
    'mn',
    'mi',
    'ms',
    'my',
    'na',
    'nv',
    'nr',
    'nd',
    'ng',
    'ne',
    'nl',
    'nn',
    'nb',
    'no',
    'ny',
    'oc',
    'oj',
    'or',
    'om',
    'os',
    'pa',
    'pi',
    'pl',
    'pt',
    'ps',
    'qu',
    'rm',
    'ro',
    'rn',
    'ru',
    'sg',
    'sa',
    'si',
    'sk',
    'sl',
    'se',
    'sm',
    'sn',
    'sd',
    'so',
    'st',
    'es',
    'sq',
    'sc',
    'sr',
    'ss',
    'su',
    'sw',
    'sv',
    'ty',
    'ta',
    'tt',
    'te',
    'tg',
    'tl',
    'th',
    'ti',
    'to',
    'tn',
    'ts',
    'tk',
    'tr',
    'tw',
    'ug',
    'uk',
    'ur',
    'uz',
    've',
    'vi',
    'vo',
    'wa',
    'wo',
    'xh',
    'yi',
    'yo',
    'za',
    'zh',
    'zu'
);


--
-- TOC entry 1026 (class 1247 OID 4219330)
-- Name: IntegrationProviderAuthStrategyEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IntegrationProviderAuthStrategyEnum" AS ENUM (
    'pat',
    'oauth2',
    'webhook',
    'oauth1',
    'sharedSecret'
);


--
-- TOC entry 1029 (class 1247 OID 4219342)
-- Name: IntegrationProviderScopeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IntegrationProviderScopeEnum" AS ENUM (
    'global',
    'org',
    'team'
);


--
-- TOC entry 1032 (class 1247 OID 4219350)
-- Name: IntegrationProviderServiceEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."IntegrationProviderServiceEnum" AS ENUM (
    'gitlab',
    'mattermost',
    'jiraServer',
    'azureDevOps',
    'msTeams',
    'gcal'
);


--
-- TOC entry 1035 (class 1247 OID 4219364)
-- Name: MeetingTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MeetingTypeEnum" AS ENUM (
    'action',
    'retrospective',
    'poker',
    'teamPrompt'
);


--
-- TOC entry 1038 (class 1247 OID 4219374)
-- Name: NewMeetingPhaseTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NewMeetingPhaseTypeEnum" AS ENUM (
    'ESTIMATE',
    'SCOPE',
    'SUMMARY',
    'agendaitems',
    'checkin',
    'TEAM_HEALTH',
    'discuss',
    'firstcall',
    'group',
    'lastcall',
    'lobby',
    'reflect',
    'updates',
    'vote',
    'RESPONSES'
);


--
-- TOC entry 1041 (class 1247 OID 4219406)
-- Name: NotificationStatusEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationStatusEnum" AS ENUM (
    'UNREAD',
    'CLICKED',
    'READ'
);


--
-- TOC entry 1044 (class 1247 OID 4219414)
-- Name: NotificationTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationTypeEnum" AS ENUM (
    'DISCUSSION_MENTIONED',
    'KICKED_OUT',
    'MEETING_STAGE_TIME_LIMIT_END',
    'PAYMENT_REJECTED',
    'PROMOTE_TO_BILLING_LEADER',
    'RESPONSE_MENTIONED',
    'RESPONSE_REPLIED',
    'MENTIONED',
    'TASK_INVOLVES',
    'TEAM_ARCHIVED',
    'TEAM_INVITATION',
    'TEAMS_LIMIT_EXCEEDED',
    'TEAMS_LIMIT_REMINDER',
    'PROMPT_TO_JOIN_ORG',
    'REQUEST_TO_JOIN_ORG'
);


--
-- TOC entry 1047 (class 1247 OID 4219446)
-- Name: OrgUserRoleEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrgUserRoleEnum" AS ENUM (
    'BILLING_LEADER',
    'ORG_ADMIN'
);


--
-- TOC entry 1050 (class 1247 OID 4219452)
-- Name: OrganizationUserAuditEventTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."OrganizationUserAuditEventTypeEnum" AS ENUM (
    'added',
    'activated',
    'inactivated',
    'removed'
);


--
-- TOC entry 1053 (class 1247 OID 4219463)
-- Name: Reactji; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Reactji" AS (
	id text,
	"userId" text
);


--
-- TOC entry 1056 (class 1247 OID 4219465)
-- Name: ScheduledJobTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ScheduledJobTypeEnum" AS ENUM (
    'MEETING_STAGE_TIME_LIMIT_END',
    'LOCK_ORGANIZATION',
    'WARN_ORGANIZATION'
);


--
-- TOC entry 1059 (class 1247 OID 4219472)
-- Name: SharingScopeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SharingScopeEnum" AS ENUM (
    'USER',
    'TEAM',
    'ORGANIZATION',
    'PUBLIC'
);


--
-- TOC entry 1062 (class 1247 OID 4219482)
-- Name: SlackNotificationEventEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SlackNotificationEventEnum" AS ENUM (
    'meetingStart',
    'meetingEnd',
    'MEETING_STAGE_TIME_LIMIT_END',
    'MEETING_STAGE_TIME_LIMIT_START',
    'TOPIC_SHARED',
    'STANDUP_RESPONSE_SUBMITTED'
);


--
-- TOC entry 1065 (class 1247 OID 4219496)
-- Name: SuggestedActionTypeEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."SuggestedActionTypeEnum" AS ENUM (
    'inviteYourTeam',
    'tryTheDemo',
    'createNewTeam',
    'tryRetroMeeting',
    'tryActionMeeting'
);


--
-- TOC entry 1068 (class 1247 OID 4219508)
-- Name: TaskInvolvementEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskInvolvementEnum" AS ENUM (
    'ASSIGNEE',
    'MENTIONEE'
);


--
-- TOC entry 1071 (class 1247 OID 4219514)
-- Name: TaskStatusEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskStatusEnum" AS ENUM (
    'active',
    'stuck',
    'done',
    'future'
);


--
-- TOC entry 1074 (class 1247 OID 4219524)
-- Name: TaskTagEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TaskTagEnum" AS ENUM (
    'private',
    'archived'
);


--
-- TOC entry 1077 (class 1247 OID 4219530)
-- Name: TeamDrawerEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TeamDrawerEnum" AS ENUM (
    'agenda',
    'manageTeam'
);


--
-- TOC entry 1080 (class 1247 OID 4219536)
-- Name: TierEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TierEnum" AS ENUM (
    'starter',
    'team',
    'enterprise'
);


--
-- TOC entry 1083 (class 1247 OID 4219544)
-- Name: TimelineEventEnum; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TimelineEventEnum" AS ENUM (
    'TEAM_PROMPT_COMPLETE',
    'POKER_COMPLETE',
    'actionComplete',
    'createdTeam',
    'joinedParabol',
    'retroComplete'
);


--
-- TOC entry 319 (class 1255 OID 4219557)
-- Name: arr_append_uniq(anyarray, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.arr_append_uniq(anyarray, anyelement) RETURNS anyarray
    LANGUAGE sql IMMUTABLE
    AS $_$SELECT CASE WHEN array_position($1, $2) iS NULL THEN $1 || $2 ELSE $1 END;$_$;


--
-- TOC entry 312 (class 1255 OID 4219558)
-- Name: arr_diff(anyarray, anyarray); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.arr_diff(arr1 anyarray, arr2 anyarray) RETURNS anyarray
    LANGUAGE sql IMMUTABLE
    AS $$
      SELECT COALESCE(array_agg(el), '{}')
      FROM UNNEST(arr1) el
      WHERE el != all(arr2)
    $$;


--
-- TOC entry 327 (class 1255 OID 4219559)
-- Name: arr_merge(anyarray, anyarray); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.arr_merge(a1 anyarray, a2 anyarray) RETURNS anyarray
    LANGUAGE sql STRICT
    AS $_$
      SELECT ARRAY_AGG(a ORDER BY a) FROM (
        SELECT DISTINCT UNNEST($1 || $2) AS a
      ) s;
    $_$;


--
-- TOC entry 374 (class 1255 OID 4219560)
-- Name: getEmbedderPriority(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."getEmbedderPriority"("maxDelayInDays" integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
    BEGIN
      RETURN -(2 ^ 31) + FLOOR(EXTRACT(EPOCH FROM CURRENT_TIMESTAMP) / 1000) + "maxDelayInDays" * 86400;
    END
    $$;


--
-- TOC entry 326 (class 1255 OID 4219561)
-- Name: prevent_meeting_overlap(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.prevent_meeting_overlap() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  BEGIN
    -- Check if a meeting exists within a 2-second window of the new createdAt
    IF EXISTS (
      SELECT 1 FROM "NewMeeting"
      WHERE "teamId" = NEW."teamId"
      AND "meetingType" = NEW."meetingType"
      AND ABS(EXTRACT(EPOCH FROM (NEW."createdAt" - "createdAt"))) < 2
    ) THEN
      RAISE EXCEPTION 'Cannot insert meeting. A meeting exists within a 2-second window.';
    END IF;
    -- If no conflict, allow the insert
    RETURN NEW;
  END;
  $$;


--
-- TOC entry 316 (class 1255 OID 4219562)
-- Name: set_MeetingTemplate_updatedAt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."set_MeetingTemplate_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          -- Update the updatedAt column in MeetingTemplate
          UPDATE "MeetingTemplate"
          SET "updatedAt" = CURRENT_TIMESTAMP
          WHERE "id" = NEW."templateId";
          RETURN NEW;
      END;
      $$;


--
-- TOC entry 314 (class 1255 OID 4219563)
-- Name: set_TemplateDimension_updatedAt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."set_TemplateDimension_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          -- Update the updatedAt column in TemplateDimension
          UPDATE "TemplateDimension"
          SET "updatedAt" = CURRENT_TIMESTAMP
          WHERE "scaleId" = NEW."id";
          RETURN NEW;
      END;
      $$;


--
-- TOC entry 367 (class 1255 OID 4219564)
-- Name: set_TemplateScale_updatedAt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."set_TemplateScale_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
      BEGIN
          -- Update the updatedAt column in TemplateScale
          UPDATE "TemplateScale"
          SET "updatedAt" = CURRENT_TIMESTAMP
          WHERE id = NEW."templateScaleId";
          RETURN NEW;
      END;
      $$;


--
-- TOC entry 373 (class 1255 OID 4219565)
-- Name: set_updatedAt(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."set_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    BEGIN
      NEW."updatedAt" = now();
        RETURN NEW;
    END
    $$;


--
-- TOC entry 334 (class 1255 OID 4219566)
-- Name: updateEmbedding(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."updateEmbedding"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    DECLARE
      "metadataId" INTEGER;
    BEGIN
      BEGIN
        SELECT id FROM "EmbeddingsMetadata" WHERE "objectType" = 'meetingTemplate' AND "refId" = NEW.id INTO STRICT "metadataId";
      EXCEPTION
        WHEN NO_DATA_FOUND THEN
          INSERT INTO "EmbeddingsMetadata" ("objectType", "refId", "teamId", "refUpdatedAt") VALUES ('meetingTemplate', NEW.id, NEW."teamId", NEW."updatedAt") RETURNING id INTO "metadataId";
      END;
      INSERT INTO "EmbeddingsJobQueue" ("embeddingsMetadataId", "jobType", "priority", "model") VALUES ("metadataId", 'embed:start', "getEmbedderPriority"(1), 'Embeddings_ember_1') ON CONFLICT DO NOTHING;
      RETURN NEW;
    END
    $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 4219567)
-- Name: AgendaItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AgendaItem" (
    id character varying(100) NOT NULL,
    content character varying(64) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isComplete" boolean DEFAULT false NOT NULL,
    "sortOrder" character varying(64) NOT NULL COLLATE pg_catalog."C",
    "teamId" character varying(100) NOT NULL,
    "teamMemberId" character varying(100) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "meetingId" character varying(100),
    pinned boolean DEFAULT false NOT NULL,
    "pinnedParentId" character varying(100)
);


--
-- TOC entry 222 (class 1259 OID 4219577)
-- Name: AtlassianAuth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AtlassianAuth" (
    "accessToken" character varying(2600) NOT NULL,
    "refreshToken" character varying(2600) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "jiraSearchQueries" jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    "cloudIds" character varying(120)[] DEFAULT '{}'::character varying[] NOT NULL,
    scope character varying(240) NOT NULL,
    "accountId" character varying(120) NOT NULL,
    "teamId" character varying(120) NOT NULL,
    "userId" character varying(120) NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 4219587)
-- Name: AzureDevOpsDimensionFieldMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AzureDevOpsDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" character varying(120) NOT NULL,
    "dimensionName" character varying(120) NOT NULL,
    "fieldName" character varying(140) NOT NULL,
    "fieldId" character varying(100) NOT NULL,
    "instanceId" character varying(100) NOT NULL,
    "fieldType" character varying(100) NOT NULL,
    "projectKey" character varying(100) NOT NULL,
    "workItemType" character varying(255) NOT NULL
);


--
-- TOC entry 224 (class 1259 OID 4219592)
-- Name: AzureDevOpsDimensionFieldMap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."AzureDevOpsDimensionFieldMap_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4528 (class 0 OID 0)
-- Dependencies: 224
-- Name: AzureDevOpsDimensionFieldMap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."AzureDevOpsDimensionFieldMap_id_seq" OWNED BY public."AzureDevOpsDimensionFieldMap".id;


--
-- TOC entry 225 (class 1259 OID 4219593)
-- Name: Comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Comment" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isAnonymous" boolean DEFAULT false NOT NULL,
    "threadParentId" character varying(100),
    reactjis public."Reactji"[] DEFAULT ARRAY[]::public."Reactji"[] NOT NULL,
    content jsonb NOT NULL,
    "createdBy" character varying(100),
    "plaintextContent" character varying(2000) NOT NULL,
    "discussionId" character varying(100) NOT NULL,
    "threadSortOrder" integer NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 4219603)
-- Name: Discussion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Discussion" (
    id character varying(50) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "meetingId" character varying(100) NOT NULL,
    "discussionTopicId" character varying(100) NOT NULL,
    "discussionTopicType" public."DiscussionTopicTypeEnum" NOT NULL,
    summary character varying(2000)
);


--
-- TOC entry 227 (class 1259 OID 4219609)
-- Name: DomainJoinRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DomainJoinRequest" (
    id integer NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    domain character varying(100) NOT NULL,
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "DomainJoinRequest_domain_check" CHECK ((lower((domain)::text) = (domain)::text))
);


--
-- TOC entry 228 (class 1259 OID 4219615)
-- Name: DomainJoinRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."DomainJoinRequest_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4529 (class 0 OID 0)
-- Dependencies: 228
-- Name: DomainJoinRequest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."DomainJoinRequest_id_seq" OWNED BY public."DomainJoinRequest".id;


--
-- TOC entry 229 (class 1259 OID 4219616)
-- Name: EmailVerification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmailVerification" (
    id integer NOT NULL,
    email public.citext NOT NULL,
    expiration timestamp with time zone NOT NULL,
    token character varying(100) NOT NULL,
    "hashedPassword" character varying(100),
    "invitationToken" character varying(100),
    "pseudoId" character varying(100)
);


--
-- TOC entry 230 (class 1259 OID 4219621)
-- Name: EmailVerification_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."EmailVerification" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."EmailVerification_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 231 (class 1259 OID 4219622)
-- Name: EmbeddingsJobQueue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmbeddingsJobQueue" (
    id integer NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    state public."EmbeddingsJobStateEnum" DEFAULT 'queued'::public."EmbeddingsJobStateEnum" NOT NULL,
    "stateMessage" text,
    "retryAfter" timestamp with time zone,
    "retryCount" smallint DEFAULT 0 NOT NULL,
    "startAt" timestamp with time zone,
    priority integer DEFAULT 50 NOT NULL,
    "jobData" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "jobType" character varying(255) NOT NULL,
    model character varying(255),
    "embeddingsMetadataId" integer
);


--
-- TOC entry 232 (class 1259 OID 4219632)
-- Name: EmbeddingsJobQueue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EmbeddingsJobQueue_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4530 (class 0 OID 0)
-- Dependencies: 232
-- Name: EmbeddingsJobQueue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EmbeddingsJobQueue_id_seq" OWNED BY public."EmbeddingsJobQueue".id;


--
-- TOC entry 233 (class 1259 OID 4219633)
-- Name: EmbeddingsMetadata; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."EmbeddingsMetadata" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "objectType" public."EmbeddingsObjectTypeEnum" NOT NULL,
    "refId" character varying(100) NOT NULL,
    "refUpdatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "fullText" text,
    language public."ISO6391Enum"
);


--
-- TOC entry 234 (class 1259 OID 4219641)
-- Name: EmbeddingsMetadata_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."EmbeddingsMetadata_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4531 (class 0 OID 0)
-- Dependencies: 234
-- Name: EmbeddingsMetadata_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."EmbeddingsMetadata_id_seq" OWNED BY public."EmbeddingsMetadata".id;


--
-- TOC entry 235 (class 1259 OID 4219642)
-- Name: FailedAuthRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FailedAuthRequest" (
    id integer NOT NULL,
    email public.citext NOT NULL,
    ip inet NOT NULL,
    "time" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 4219648)
-- Name: FailedAuthRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."FailedAuthRequest" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."FailedAuthRequest_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 4219649)
-- Name: FeatureFlag; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeatureFlag" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "featureName" character varying(255) NOT NULL,
    scope public."FeatureFlagScope" NOT NULL,
    description text,
    "expiresAt" timestamp with time zone NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 4219657)
-- Name: FeatureFlagOwner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeatureFlagOwner" (
    "featureFlagId" uuid NOT NULL,
    "userId" character varying(255),
    "teamId" character varying(255),
    "orgId" character varying(255),
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT check_feature_flag_owner_exclusivity CHECK (((("userId" IS NOT NULL) AND ("teamId" IS NULL) AND ("orgId" IS NULL)) OR (("userId" IS NULL) AND ("teamId" IS NOT NULL) AND ("orgId" IS NULL)) OR (("userId" IS NULL) AND ("teamId" IS NULL) AND ("orgId" IS NOT NULL))))
);


--
-- TOC entry 239 (class 1259 OID 4219664)
-- Name: FreemailDomain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FreemailDomain" (
    domain character varying(255) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 240 (class 1259 OID 4219668)
-- Name: GitHubAuth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GitHubAuth" (
    "accessToken" character varying(40) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    login character varying(200) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "githubSearchQueries" jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    scope character varying(250) NOT NULL
);


--
-- TOC entry 241 (class 1259 OID 4219677)
-- Name: GitHubDimensionFieldMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GitHubDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" character varying(120) NOT NULL,
    "dimensionName" character varying(120) NOT NULL,
    "nameWithOwner" character varying(140) NOT NULL,
    "labelTemplate" character varying(100) NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 4219680)
-- Name: GitHubDimensionFieldMap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GitHubDimensionFieldMap_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4532 (class 0 OID 0)
-- Dependencies: 242
-- Name: GitHubDimensionFieldMap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GitHubDimensionFieldMap_id_seq" OWNED BY public."GitHubDimensionFieldMap".id;


--
-- TOC entry 243 (class 1259 OID 4219681)
-- Name: GitLabDimensionFieldMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GitLabDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "dimensionName" character varying(120) NOT NULL,
    "projectId" integer NOT NULL,
    "providerId" integer NOT NULL,
    "labelTemplate" character varying(100) NOT NULL
);


--
-- TOC entry 244 (class 1259 OID 4219684)
-- Name: GitLabDimensionFieldMap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."GitLabDimensionFieldMap_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4533 (class 0 OID 0)
-- Dependencies: 244
-- Name: GitLabDimensionFieldMap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."GitLabDimensionFieldMap_id_seq" OWNED BY public."GitLabDimensionFieldMap".id;


--
-- TOC entry 245 (class 1259 OID 4219685)
-- Name: Insight; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Insight" (
    id integer NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "startDateTime" timestamp with time zone NOT NULL,
    "endDateTime" timestamp with time zone NOT NULL,
    wins text[] NOT NULL,
    challenges text[] NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "meetingsCount" integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 246 (class 1259 OID 4219693)
-- Name: Insight_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."Insight_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4534 (class 0 OID 0)
-- Dependencies: 246
-- Name: Insight_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."Insight_id_seq" OWNED BY public."Insight".id;


--
-- TOC entry 247 (class 1259 OID 4219694)
-- Name: IntegrationProvider; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IntegrationProvider" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    service public."IntegrationProviderServiceEnum" NOT NULL,
    "authStrategy" public."IntegrationProviderAuthStrategyEnum" NOT NULL,
    scope public."IntegrationProviderScopeEnum" NOT NULL,
    "scopeGlobal" boolean GENERATED ALWAYS AS (
CASE
    WHEN (scope = 'global'::public."IntegrationProviderScopeEnum") THEN true
    ELSE false
END) STORED NOT NULL,
    "teamId" character varying(100),
    "isActive" boolean DEFAULT true NOT NULL,
    "clientId" character varying(255),
    "clientSecret" character varying(255),
    "serverBaseUrl" character varying(2056),
    "webhookUrl" character varying(2056),
    "consumerKey" character varying(255),
    "consumerSecret" text,
    "tenantId" character varying(255),
    "orgId" character varying(100),
    "sharedSecret" character varying(255),
    CONSTRAINT "scope_global_has_neither_teamId_orgId" CHECK (((scope <> 'global'::public."IntegrationProviderScopeEnum") OR (("orgId" IS NULL) AND ("teamId" IS NULL)))),
    CONSTRAINT "scope_org_has_only_orgId" CHECK (((scope <> 'org'::public."IntegrationProviderScopeEnum") OR (("orgId" IS NOT NULL) AND ("teamId" IS NULL)))),
    CONSTRAINT "scope_team_has_only_teamId" CHECK (((scope <> 'team'::public."IntegrationProviderScopeEnum") OR (("teamId" IS NOT NULL) AND ("orgId" IS NULL))))
);


--
-- TOC entry 248 (class 1259 OID 4219706)
-- Name: IntegrationProvider_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."IntegrationProvider" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."IntegrationProvider_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 249 (class 1259 OID 4219707)
-- Name: IntegrationSearchQuery; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."IntegrationSearchQuery" (
    id integer NOT NULL,
    "userId" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "providerId" integer,
    service public."IntegrationProviderServiceEnum" NOT NULL,
    query jsonb DEFAULT '{}'::jsonb NOT NULL,
    "lastUsedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 250 (class 1259 OID 4219716)
-- Name: IntegrationSearchQuery_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."IntegrationSearchQuery" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."IntegrationSearchQuery_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 251 (class 1259 OID 4219717)
-- Name: JiraDimensionFieldMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JiraDimensionFieldMap" (
    id integer NOT NULL,
    "teamId" character varying(120) NOT NULL,
    "cloudId" character varying(120) NOT NULL,
    "projectKey" character varying(120) NOT NULL,
    "issueType" character varying(120) NOT NULL,
    "dimensionName" character varying(120) NOT NULL,
    "fieldId" character varying(120) NOT NULL,
    "fieldName" character varying(120) NOT NULL,
    "fieldType" character varying(120) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 252 (class 1259 OID 4219723)
-- Name: JiraDimensionFieldMap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."JiraDimensionFieldMap_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4535 (class 0 OID 0)
-- Dependencies: 252
-- Name: JiraDimensionFieldMap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."JiraDimensionFieldMap_id_seq" OWNED BY public."JiraDimensionFieldMap".id;


--
-- TOC entry 253 (class 1259 OID 4219724)
-- Name: JiraServerDimensionFieldMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."JiraServerDimensionFieldMap" (
    id integer NOT NULL,
    "providerId" integer NOT NULL,
    "teamId" character varying(120) NOT NULL,
    "dimensionName" character varying(120) NOT NULL,
    "projectId" character varying(120) NOT NULL,
    "issueType" character varying(120) NOT NULL,
    "fieldId" character varying(120) NOT NULL,
    "fieldName" character varying(120) NOT NULL,
    "fieldType" character varying(120) NOT NULL
);


--
-- TOC entry 254 (class 1259 OID 4219729)
-- Name: JiraServerDimensionFieldMap_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."JiraServerDimensionFieldMap_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4536 (class 0 OID 0)
-- Dependencies: 254
-- Name: JiraServerDimensionFieldMap_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."JiraServerDimensionFieldMap_id_seq" OWNED BY public."JiraServerDimensionFieldMap".id;


--
-- TOC entry 255 (class 1259 OID 4219730)
-- Name: MassInvitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MassInvitation" (
    id character(12) NOT NULL,
    expiration timestamp with time zone NOT NULL,
    "meetingId" character varying(100),
    "teamMemberId" character varying(100) NOT NULL
);


--
-- TOC entry 256 (class 1259 OID 4219733)
-- Name: MeetingMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MeetingMember" (
    id character varying(100) NOT NULL,
    "meetingType" public."MeetingTypeEnum" NOT NULL,
    "meetingId" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" character varying(100) NOT NULL,
    "isSpectating" boolean,
    "votesRemaining" smallint
);


--
-- TOC entry 257 (class 1259 OID 4219737)
-- Name: MeetingSeries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MeetingSeries" (
    id integer NOT NULL,
    "meetingType" public."MeetingTypeEnum" NOT NULL,
    title character varying(255) NOT NULL,
    "recurrenceRule" character varying(255) NOT NULL,
    duration integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "cancelledAt" timestamp with time zone,
    "teamId" character varying(100) NOT NULL,
    "facilitatorId" character varying(100) NOT NULL,
    "gcalSeriesId" character varying(100)
);


--
-- TOC entry 258 (class 1259 OID 4219744)
-- Name: MeetingSeries_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."MeetingSeries" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."MeetingSeries_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 259 (class 1259 OID 4219745)
-- Name: MeetingSettings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MeetingSettings" (
    id character varying(100) NOT NULL,
    "phaseTypes" public."NewMeetingPhaseTypeEnum"[] NOT NULL,
    "meetingType" public."MeetingTypeEnum" NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "selectedTemplateId" character varying(100),
    "jiraSearchQueries" jsonb,
    "maxVotesPerGroup" smallint,
    "totalVotes" smallint,
    "disableAnonymity" boolean,
    "videoMeetingURL" character varying(2056)
);


--
-- TOC entry 260 (class 1259 OID 4219750)
-- Name: MeetingTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MeetingTemplate" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    name character varying(250) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    scope public."SharingScopeEnum" DEFAULT 'TEAM'::public."SharingScopeEnum" NOT NULL,
    "orgId" character varying(100) NOT NULL,
    "parentTemplateId" character varying(100),
    "lastUsedAt" timestamp with time zone,
    type public."MeetingTypeEnum" NOT NULL,
    "isStarter" boolean DEFAULT false NOT NULL,
    "isFree" boolean DEFAULT false NOT NULL,
    "illustrationUrl" character varying(512) NOT NULL,
    "hideStartingAt" timestamp with time zone,
    "hideEndingAt" timestamp with time zone,
    "mainCategory" character varying(100) NOT NULL
);


--
-- TOC entry 261 (class 1259 OID 4219761)
-- Name: MeetingTemplateUserFavorite; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MeetingTemplateUserFavorite" (
    "userId" character varying(100) NOT NULL,
    "templateId" character varying(100) NOT NULL
);


--
-- TOC entry 262 (class 1259 OID 4219764)
-- Name: NewFeature; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewFeature" (
    id integer NOT NULL,
    "actionButtonCopy" character varying(50) NOT NULL,
    "snackbarMessage" character varying(255) NOT NULL,
    url character varying(2056) NOT NULL
);


--
-- TOC entry 263 (class 1259 OID 4219769)
-- Name: NewFeature_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."NewFeature" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."NewFeature_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 264 (class 1259 OID 4219770)
-- Name: NewMeeting; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."NewMeeting" (
    id character varying(100) NOT NULL,
    "isLegacy" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" character varying(100),
    "endedAt" timestamp with time zone,
    "facilitatorStageId" character varying(100) NOT NULL,
    "facilitatorUserId" character varying(100),
    "meetingCount" integer NOT NULL,
    "meetingNumber" integer NOT NULL,
    name character varying(100) NOT NULL,
    "summarySentAt" timestamp with time zone,
    "teamId" character varying(100) NOT NULL,
    "meetingType" public."MeetingTypeEnum" NOT NULL,
    phases jsonb NOT NULL,
    "showConversionModal" boolean DEFAULT false NOT NULL,
    "meetingSeriesId" integer,
    "scheduledEndTime" timestamp with time zone,
    summary character varying(10000),
    "sentimentScore" double precision,
    "usedReactjis" jsonb,
    "slackTs" double precision,
    engagement double precision,
    "totalVotes" integer,
    "maxVotesPerGroup" smallint,
    "disableAnonymity" boolean,
    "commentCount" integer,
    "taskCount" integer,
    "agendaItemCount" integer,
    "storyCount" integer,
    "templateId" character varying(100),
    "topicCount" integer,
    "reflectionCount" integer,
    transcription jsonb,
    "recallBotId" character varying(255),
    "videoMeetingURL" character varying(2048),
    "autogroupReflectionGroups" jsonb,
    "resetReflectionGroups" jsonb,
    "templateRefId" character varying(25),
    "meetingPrompt" character varying(255)
);


--
-- TOC entry 265 (class 1259 OID 4219779)
-- Name: Notification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Notification" (
    id character varying(100) NOT NULL,
    status public."NotificationStatusEnum" DEFAULT 'UNREAD'::public."NotificationStatusEnum" NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    type public."NotificationTypeEnum" NOT NULL,
    "userId" character varying(100) NOT NULL,
    "meetingId" character varying(100),
    "authorId" character varying(100),
    "commentId" character varying(100),
    "discussionId" character varying(100),
    "teamId" character varying(100),
    "evictorUserId" character varying(100),
    "senderName" character varying(100),
    "senderPicture" character varying(2056),
    "senderUserId" character varying(100),
    "meetingName" character varying(100),
    "retroReflectionId" character varying(100),
    "retroDiscussStageIdx" smallint,
    "orgId" character varying(100),
    last4 smallint,
    brand character varying(50),
    "activeDomain" character varying(100),
    "domainJoinRequestId" integer,
    email public.citext,
    name character varying(100),
    picture character varying(2056),
    "requestCreatedBy" character varying(100),
    "responseId" integer,
    "changeAuthorId" character varying(100),
    involvement public."TaskInvolvementEnum",
    "taskId" character varying(100),
    "archivorUserId" character varying(100),
    "invitationId" character varying(100),
    "orgName" character varying(100),
    "orgPicture" character varying(2056),
    "scheduledLockAt" timestamp with time zone
);


--
-- TOC entry 266 (class 1259 OID 4219786)
-- Name: Organization; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Organization" (
    id character varying(100) NOT NULL,
    "activeDomain" character varying(100),
    "isActiveDomainTouched" boolean DEFAULT false NOT NULL,
    "creditCard" public."CreditCard",
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(100) NOT NULL,
    "payLaterClickCount" smallint DEFAULT 0 NOT NULL,
    "periodEnd" timestamp with time zone,
    "periodStart" timestamp with time zone,
    picture character varying(2056),
    "showConversionModal" boolean DEFAULT false NOT NULL,
    "stripeId" character varying(100),
    "stripeSubscriptionId" character varying(100),
    "upcomingInvoiceEmailSentAt" timestamp with time zone,
    tier public."TierEnum" DEFAULT 'starter'::public."TierEnum" NOT NULL,
    "tierLimitExceededAt" timestamp with time zone,
    "trialStartDate" timestamp with time zone,
    "scheduledLockAt" timestamp with time zone,
    "lockedAt" timestamp with time zone,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "featureFlags" text[] DEFAULT '{}'::text[] NOT NULL,
    "useAI" boolean DEFAULT true NOT NULL
);


--
-- TOC entry 267 (class 1259 OID 4219798)
-- Name: OrganizationApprovedDomain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrganizationApprovedDomain" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "removedAt" timestamp with time zone,
    domain character varying(255) NOT NULL,
    "orgId" character varying(100) NOT NULL,
    "addedByUserId" character varying(100) NOT NULL,
    CONSTRAINT "OrganizationApprovedDomain_domain_check" CHECK ((lower((domain)::text) = (domain)::text))
);


--
-- TOC entry 268 (class 1259 OID 4219803)
-- Name: OrganizationApprovedDomain_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."OrganizationApprovedDomain" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."OrganizationApprovedDomain_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 269 (class 1259 OID 4219804)
-- Name: OrganizationUser; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrganizationUser" (
    id character varying(100) NOT NULL,
    "suggestedTier" public."TierEnum",
    inactive boolean DEFAULT false NOT NULL,
    "joinedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "orgId" character varying(100) NOT NULL,
    "removedAt" timestamp with time zone,
    role public."OrgUserRoleEnum",
    "userId" character varying(100) NOT NULL,
    tier public."TierEnum" NOT NULL,
    "trialStartDate" timestamp with time zone
);


--
-- TOC entry 270 (class 1259 OID 4219809)
-- Name: OrganizationUserAudit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."OrganizationUserAudit" (
    id integer NOT NULL,
    "orgId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "eventDate" timestamp without time zone NOT NULL,
    "eventType" public."OrganizationUserAuditEventTypeEnum" NOT NULL
);


--
-- TOC entry 271 (class 1259 OID 4219812)
-- Name: OrganizationUserAudit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."OrganizationUserAudit" ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public."OrganizationUserAudit_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 272 (class 1259 OID 4219813)
-- Name: PasswordResetRequest; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PasswordResetRequest" (
    id integer NOT NULL,
    ip cidr NOT NULL,
    email public.citext NOT NULL,
    "time" timestamp with time zone DEFAULT now() NOT NULL,
    token character varying(64) NOT NULL,
    "isValid" boolean DEFAULT true NOT NULL
);


--
-- TOC entry 273 (class 1259 OID 4219820)
-- Name: PasswordResetRequest_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."PasswordResetRequest" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."PasswordResetRequest_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 274 (class 1259 OID 4219821)
-- Name: Poll; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Poll" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deletedAt" timestamp with time zone,
    "endedAt" timestamp with time zone,
    "createdById" character varying(100) NOT NULL,
    "discussionId" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "threadSortOrder" double precision NOT NULL,
    "meetingId" character varying(100),
    title character varying(300)
);


--
-- TOC entry 275 (class 1259 OID 4219828)
-- Name: PollOption; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PollOption" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "pollId" integer NOT NULL,
    "voteUserIds" character varying(100)[] DEFAULT ARRAY[]::character varying[] NOT NULL,
    title character varying(100)
);


--
-- TOC entry 276 (class 1259 OID 4219836)
-- Name: PollOption_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."PollOption" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."PollOption_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 277 (class 1259 OID 4219837)
-- Name: Poll_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Poll" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Poll_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 278 (class 1259 OID 4219838)
-- Name: PushInvitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."PushInvitation" (
    id integer NOT NULL,
    "userId" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "denialCount" smallint DEFAULT 0 NOT NULL,
    "lastDenialAt" timestamp with time zone
);


--
-- TOC entry 279 (class 1259 OID 4219842)
-- Name: PushInvitation_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."PushInvitation" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."PushInvitation_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 280 (class 1259 OID 4219843)
-- Name: QueryMap; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."QueryMap" (
    id character varying(24) NOT NULL,
    query text NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 281 (class 1259 OID 4219849)
-- Name: ReflectPrompt; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ReflectPrompt" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "removedAt" timestamp with time zone,
    description character varying(256) NOT NULL,
    "groupColor" character varying(9) NOT NULL,
    "sortOrder" character varying(64) NOT NULL COLLATE pg_catalog."C",
    question character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "templateId" character varying(100) NOT NULL,
    "parentPromptId" character varying(100)
);


--
-- TOC entry 282 (class 1259 OID 4219856)
-- Name: RetroReflection; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RetroReflection" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "meetingId" character varying(100) NOT NULL,
    "promptId" character varying(111) NOT NULL,
    "sortOrder" double precision DEFAULT 0 NOT NULL,
    "creatorId" character varying(100),
    content character varying(2000) NOT NULL,
    "plaintextContent" character varying(2000) NOT NULL,
    entities public."GoogleAnalyzedEntity"[] DEFAULT ARRAY[]::public."GoogleAnalyzedEntity"[] NOT NULL,
    "sentimentScore" real,
    reactjis public."Reactji"[] DEFAULT ARRAY[]::public."Reactji"[] NOT NULL,
    "reflectionGroupId" character varying(100) NOT NULL
);


--
-- TOC entry 283 (class 1259 OID 4219867)
-- Name: RetroReflectionGroup; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RetroReflectionGroup" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "meetingId" character varying(100) NOT NULL,
    "promptId" character varying(111) NOT NULL,
    "sortOrder" double precision DEFAULT 0 NOT NULL,
    "voterIds" text[] DEFAULT '{}'::character varying[] NOT NULL,
    "smartTitle" character varying(255),
    title character varying(255),
    "discussionPromptQuestion" character varying(2000)
);


--
-- TOC entry 284 (class 1259 OID 4219877)
-- Name: SAML; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SAML" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "lastUpdatedBy" character varying(100) DEFAULT 'aGhostUser'::character varying NOT NULL,
    metadata character varying(65536),
    "orgId" character varying(100),
    "metadataURL" character varying(2048)
);


--
-- TOC entry 285 (class 1259 OID 4219885)
-- Name: SAMLDomain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SAMLDomain" (
    domain character varying(255) NOT NULL,
    "samlId" character varying(100),
    CONSTRAINT "SAMLDomain_domain_check" CHECK ((lower((domain)::text) = (domain)::text))
);


--
-- TOC entry 286 (class 1259 OID 4219889)
-- Name: ScheduledJob; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ScheduledJob" (
    id integer NOT NULL,
    "runAt" timestamp with time zone DEFAULT now() NOT NULL,
    type public."ScheduledJobTypeEnum" NOT NULL,
    "orgId" character varying(100),
    "meetingId" character varying(100)
);


--
-- TOC entry 287 (class 1259 OID 4219893)
-- Name: ScheduledJob_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."ScheduledJob_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4537 (class 0 OID 0)
-- Dependencies: 287
-- Name: ScheduledJob_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."ScheduledJob_id_seq" OWNED BY public."ScheduledJob".id;


--
-- TOC entry 288 (class 1259 OID 4219894)
-- Name: SlackAuth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SlackAuth" (
    "isActive" boolean DEFAULT true NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    id character varying(100) NOT NULL,
    "botUserId" character varying(100) NOT NULL,
    "botAccessToken" character varying(100),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "defaultTeamChannelId" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "slackTeamId" character varying(100) NOT NULL,
    "slackTeamName" character varying(100) NOT NULL,
    "slackUserId" character varying(100) NOT NULL,
    "slackUserName" character varying(100) NOT NULL
);


--
-- TOC entry 289 (class 1259 OID 4219902)
-- Name: SlackNotification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SlackNotification" (
    id character varying(100) NOT NULL,
    event public."SlackNotificationEventEnum" NOT NULL,
    "channelId" character varying(100),
    "teamId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL
);


--
-- TOC entry 290 (class 1259 OID 4219905)
-- Name: StripeQuantityMismatchLogging; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StripeQuantityMismatchLogging" (
    id integer NOT NULL,
    "userId" character varying(120) DEFAULT NULL::character varying,
    "eventTime" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "eventType" character varying(20) NOT NULL,
    "stripePreviousQuantity" integer NOT NULL,
    "stripeNextQuantity" integer NOT NULL,
    "orgUsers" jsonb[] NOT NULL,
    "orgId" character varying(100)
);


--
-- TOC entry 291 (class 1259 OID 4219912)
-- Name: StripeQuantityMismatchLogging_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."StripeQuantityMismatchLogging_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- TOC entry 4538 (class 0 OID 0)
-- Dependencies: 291
-- Name: StripeQuantityMismatchLogging_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public."StripeQuantityMismatchLogging_id_seq" OWNED BY public."StripeQuantityMismatchLogging".id;


--
-- TOC entry 292 (class 1259 OID 4219913)
-- Name: SuggestedAction; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SuggestedAction" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    priority smallint DEFAULT 0 NOT NULL,
    "removedAt" timestamp with time zone,
    type public."SuggestedActionTypeEnum" NOT NULL,
    "teamId" character varying(100),
    "userId" character varying(100) NOT NULL
);


--
-- TOC entry 293 (class 1259 OID 4219918)
-- Name: Task; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Task" (
    id character varying(100) NOT NULL,
    content jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" character varying(100) NOT NULL,
    "doneMeetingId" character varying(100),
    "dueDate" timestamp with time zone,
    integration jsonb,
    "integrationHash" character varying(200),
    "meetingId" character varying(100),
    "plaintextContent" character varying(10000) NOT NULL,
    "sortOrder" double precision DEFAULT 0 NOT NULL,
    status public."TaskStatusEnum" DEFAULT 'active'::public."TaskStatusEnum" NOT NULL,
    tags public."TaskTagEnum"[] DEFAULT ARRAY[]::public."TaskTagEnum"[] NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "discussionId" character varying(100),
    "threadParentId" character varying(100),
    "threadSortOrder" integer,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "userId" character varying(100)
);


--
-- TOC entry 294 (class 1259 OID 4219928)
-- Name: TaskEstimate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TaskEstimate" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "changeSource" public."ChangeSourceEnum" NOT NULL,
    name character varying(250) NOT NULL,
    label character varying(100) NOT NULL,
    "taskId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "meetingId" character varying(100),
    "stageId" character varying(100),
    "discussionId" character varying(100),
    "jiraFieldId" character varying(100),
    "githubLabelName" character varying(50),
    "azureDevOpsFieldName" character varying(50),
    "gitlabLabelId" character varying(100)
);


--
-- TOC entry 295 (class 1259 OID 4219934)
-- Name: TaskEstimate_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."TaskEstimate" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TaskEstimate_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 296 (class 1259 OID 4219935)
-- Name: Team; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Team" (
    id character varying(100) NOT NULL,
    name character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" character varying(100),
    "isArchived" boolean DEFAULT false NOT NULL,
    "isPaid" boolean DEFAULT true NOT NULL,
    "jiraDimensionFields" jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    "lastMeetingType" public."MeetingTypeEnum" DEFAULT 'retrospective'::public."MeetingTypeEnum" NOT NULL,
    tier public."TierEnum" NOT NULL,
    "orgId" character varying(100) NOT NULL,
    "isOnboardTeam" boolean DEFAULT false NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "lockMessageHTML" text,
    "qualAIMeetingsCount" integer DEFAULT 0 NOT NULL,
    "autoJoin" boolean DEFAULT false NOT NULL,
    "trialStartDate" timestamp with time zone,
    "kudosEmojiUnicode" character varying(100) DEFAULT '❤️'::character varying NOT NULL
);


--
-- TOC entry 297 (class 1259 OID 4219950)
-- Name: TeamInvitation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamInvitation" (
    id character varying(100) NOT NULL,
    "acceptedAt" timestamp with time zone,
    "acceptedBy" character varying(100),
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "expiresAt" timestamp with time zone NOT NULL,
    email public.citext NOT NULL,
    "invitedBy" character varying(100) NOT NULL,
    "isMassInvite" boolean DEFAULT false NOT NULL,
    "meetingId" character varying(100),
    "teamId" character varying(100) NOT NULL,
    token character varying(200) NOT NULL
);


--
-- TOC entry 298 (class 1259 OID 4219957)
-- Name: TeamMeetingTemplate; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamMeetingTemplate" (
    "teamId" character varying(100) NOT NULL,
    "templateId" character varying(100) NOT NULL,
    "lastUsedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 299 (class 1259 OID 4219961)
-- Name: TeamMember; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamMember" (
    id character varying(100) NOT NULL,
    "isNotRemoved" boolean DEFAULT true NOT NULL,
    "isLead" boolean DEFAULT false NOT NULL,
    "isSpectatingPoker" boolean DEFAULT false NOT NULL,
    email public.citext NOT NULL,
    "openDrawer" public."TeamDrawerEnum",
    picture character varying(2056) NOT NULL,
    "preferredName" character varying(100) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);


--
-- TOC entry 300 (class 1259 OID 4219971)
-- Name: TeamMemberIntegrationAuth; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamMemberIntegrationAuth" (
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "providerId" integer NOT NULL,
    service public."IntegrationProviderServiceEnum" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "accessToken" character varying(2056),
    "refreshToken" character varying(2056),
    scopes character varying(255),
    "accessTokenSecret" text,
    "expiresAt" timestamp with time zone,
    channel character varying(255)
);


--
-- TOC entry 301 (class 1259 OID 4219979)
-- Name: TeamPromptResponse; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TeamPromptResponse" (
    id integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "meetingId" character varying(100) NOT NULL,
    "userId" character varying(100) NOT NULL,
    "sortOrder" integer NOT NULL,
    content jsonb NOT NULL,
    "plaintextContent" text NOT NULL,
    reactjis public."Reactji"[] DEFAULT ARRAY[]::public."Reactji"[] NOT NULL
);


--
-- TOC entry 302 (class 1259 OID 4219987)
-- Name: TeamPromptResponse_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."TeamPromptResponse" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TeamPromptResponse_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 303 (class 1259 OID 4219988)
-- Name: TemplateDimension; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateDimension" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(256) DEFAULT ''::character varying NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "templateId" character varying(100) NOT NULL,
    "scaleId" character varying(100) NOT NULL,
    "sortOrder" character varying(64) NOT NULL COLLATE pg_catalog."C",
    "removedAt" timestamp with time zone
);


--
-- TOC entry 304 (class 1259 OID 4219996)
-- Name: TemplateRef; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateRef" (
    id character(24) NOT NULL,
    template jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 305 (class 1259 OID 4220002)
-- Name: TemplateScale; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateScale" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    name character varying(50) NOT NULL,
    "teamId" character varying(100) NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    "parentScaleId" character varying(100),
    "isStarter" boolean DEFAULT false NOT NULL,
    "removedAt" timestamp with time zone
);


--
-- TOC entry 306 (class 1259 OID 4220008)
-- Name: TemplateScaleRef; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateScaleRef" (
    id character(24) NOT NULL,
    scale jsonb NOT NULL,
    "createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- TOC entry 307 (class 1259 OID 4220014)
-- Name: TemplateScaleValue; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TemplateScaleValue" (
    id integer NOT NULL,
    "templateScaleId" character varying(100) NOT NULL,
    "sortOrder" character varying(64) NOT NULL COLLATE pg_catalog."C",
    color character varying(9) NOT NULL,
    label character varying(18) NOT NULL
);


--
-- TOC entry 308 (class 1259 OID 4220017)
-- Name: TemplateScaleValue_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."TemplateScaleValue" ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TemplateScaleValue_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 309 (class 1259 OID 4220018)
-- Name: TimelineEvent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TimelineEvent" (
    id character varying(100) NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "interactionCount" smallint DEFAULT 0 NOT NULL,
    "seenCount" smallint DEFAULT 0 NOT NULL,
    type public."TimelineEventEnum" NOT NULL,
    "userId" character varying(100) NOT NULL,
    "teamId" character varying(100),
    "orgId" character varying(100),
    "meetingId" character varying(100),
    "isActive" boolean DEFAULT true NOT NULL
);


--
-- TOC entry 310 (class 1259 OID 4220027)
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id character varying(100) NOT NULL,
    email public.citext NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
    inactive boolean DEFAULT false NOT NULL,
    "lastSeenAt" timestamp with time zone DEFAULT now() NOT NULL,
    "preferredName" character varying(100) NOT NULL,
    tier public."TierEnum" DEFAULT 'starter'::public."TierEnum" NOT NULL,
    picture text NOT NULL,
    tms character varying(100)[] DEFAULT '{}'::character varying[] NOT NULL,
    "featureFlags" character varying(50)[] DEFAULT '{}'::character varying[] NOT NULL,
    identities jsonb[] DEFAULT '{}'::jsonb[] NOT NULL,
    "lastSeenAtURLs" text[],
    "pseudoId" character varying(100),
    "newFeatureId" integer,
    "overLimitCopy" character varying(500),
    "isRemoved" boolean DEFAULT false NOT NULL,
    "reasonRemoved" character varying(2000),
    rol public."AuthTokenRole",
    "payLaterClickCount" smallint DEFAULT 0 NOT NULL,
    "isWatched" boolean DEFAULT false NOT NULL,
    domain public.citext GENERATED ALWAYS AS (public.split_part(email, '@'::public.citext, 2)) STORED,
    "sendSummaryEmail" boolean DEFAULT true NOT NULL,
    "isPatient0" boolean DEFAULT false NOT NULL,
    "trialStartDate" timestamp with time zone,
    "freeCustomRetroTemplatesRemaining" smallint DEFAULT 2 NOT NULL,
    "freeCustomPokerTemplatesRemaining" smallint DEFAULT 2 NOT NULL,
    "favoriteTemplateIds" text[] DEFAULT ARRAY[]::text[] NOT NULL
);


--
-- TOC entry 3689 (class 2604 OID 4220049)
-- Name: AzureDevOpsDimensionFieldMap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AzureDevOpsDimensionFieldMap" ALTER COLUMN id SET DEFAULT nextval('public."AzureDevOpsDimensionFieldMap_id_seq"'::regclass);


--
-- TOC entry 3696 (class 2604 OID 4220050)
-- Name: DomainJoinRequest id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DomainJoinRequest" ALTER COLUMN id SET DEFAULT nextval('public."DomainJoinRequest_id_seq"'::regclass);


--
-- TOC entry 3699 (class 2604 OID 4220051)
-- Name: EmbeddingsJobQueue id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsJobQueue" ALTER COLUMN id SET DEFAULT nextval('public."EmbeddingsJobQueue_id_seq"'::regclass);


--
-- TOC entry 3705 (class 2604 OID 4220052)
-- Name: EmbeddingsMetadata id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsMetadata" ALTER COLUMN id SET DEFAULT nextval('public."EmbeddingsMetadata_id_seq"'::regclass);


--
-- TOC entry 3719 (class 2604 OID 4220053)
-- Name: GitHubDimensionFieldMap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubDimensionFieldMap" ALTER COLUMN id SET DEFAULT nextval('public."GitHubDimensionFieldMap_id_seq"'::regclass);


--
-- TOC entry 3720 (class 2604 OID 4220054)
-- Name: GitLabDimensionFieldMap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitLabDimensionFieldMap" ALTER COLUMN id SET DEFAULT nextval('public."GitLabDimensionFieldMap_id_seq"'::regclass);


--
-- TOC entry 3721 (class 2604 OID 4220055)
-- Name: Insight id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Insight" ALTER COLUMN id SET DEFAULT nextval('public."Insight_id_seq"'::regclass);


--
-- TOC entry 3733 (class 2604 OID 4220056)
-- Name: JiraDimensionFieldMap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraDimensionFieldMap" ALTER COLUMN id SET DEFAULT nextval('public."JiraDimensionFieldMap_id_seq"'::regclass);


--
-- TOC entry 3735 (class 2604 OID 4220057)
-- Name: JiraServerDimensionFieldMap id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraServerDimensionFieldMap" ALTER COLUMN id SET DEFAULT nextval('public."JiraServerDimensionFieldMap_id_seq"'::regclass);


--
-- TOC entry 3787 (class 2604 OID 4220058)
-- Name: ScheduledJob id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScheduledJob" ALTER COLUMN id SET DEFAULT nextval('public."ScheduledJob_id_seq"'::regclass);


--
-- TOC entry 3792 (class 2604 OID 4220059)
-- Name: StripeQuantityMismatchLogging id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StripeQuantityMismatchLogging" ALTER COLUMN id SET DEFAULT nextval('public."StripeQuantityMismatchLogging_id_seq"'::regclass);


--
-- TOC entry 4432 (class 0 OID 4219567)
-- Dependencies: 221
-- Data for Name: AgendaItem; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4433 (class 0 OID 4219577)
-- Dependencies: 222
-- Data for Name: AtlassianAuth; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4434 (class 0 OID 4219587)
-- Dependencies: 223
-- Data for Name: AzureDevOpsDimensionFieldMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4436 (class 0 OID 4219593)
-- Dependencies: 225
-- Data for Name: Comment; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4437 (class 0 OID 4219603)
-- Dependencies: 226
-- Data for Name: Discussion; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4438 (class 0 OID 4219609)
-- Dependencies: 227
-- Data for Name: DomainJoinRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4440 (class 0 OID 4219616)
-- Dependencies: 229
-- Data for Name: EmailVerification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4442 (class 0 OID 4219622)
-- Dependencies: 231
-- Data for Name: EmbeddingsJobQueue; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4444 (class 0 OID 4219633)
-- Dependencies: 233
-- Data for Name: EmbeddingsMetadata; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4446 (class 0 OID 4219642)
-- Dependencies: 235
-- Data for Name: FailedAuthRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4448 (class 0 OID 4219649)
-- Dependencies: 237
-- Data for Name: FeatureFlag; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FeatureFlag" VALUES ('75dc1bab-c474-46b8-a5aa-b4b314bb9256', 'insights', 'Team', 'Whether the team has access to an AI summary of their wins and challenges', '2025-01-31 00:00:00+00', '2025-01-08 00:05:13.292411+00', '2025-01-08 00:05:13.292411+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FeatureFlag" VALUES ('0a81396a-fbef-4ab2-86c4-0f15264f9e36', 'publicTeams', 'Organization', 'Whether users can see teams they are not a member of in an org', '2025-01-31 00:00:00+00', '2025-01-08 00:05:13.292411+00', '2025-01-08 00:05:13.292411+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FeatureFlag" VALUES ('50b5e2ed-187b-4103-bd7a-0749ab703331', 'relatedDiscussions', 'Organization', 'A comment in a retro discussion thread that uses AI to show similar conversations in the past', '2025-01-31 00:00:00+00', '2025-01-08 00:05:13.292411+00', '2025-01-08 00:05:13.292411+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FeatureFlag" VALUES ('f5ef3a6a-9191-485f-bd54-fa1565a25278', 'standupAISummary', 'Organization', 'Whether the standup UI has an AI meeting Summary or not', '2025-01-31 00:00:00+00', '2025-01-08 00:05:13.292411+00', '2025-01-08 00:05:13.292411+00') ON CONFLICT DO NOTHING;


--
-- TOC entry 4449 (class 0 OID 4219657)
-- Dependencies: 238
-- Data for Name: FeatureFlagOwner; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4450 (class 0 OID 4219664)
-- Dependencies: 239
-- Data for Name: FreemailDomain; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."FreemailDomain" VALUES ('0-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('027168.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('0815.su', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('0sg.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('10mail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('10minutemail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('11mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123box.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123india.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123mail.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123mail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('123qwe.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('126.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('139.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('150mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('150ml.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('15meg4free.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('163.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('16mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('188.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('189.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1ce.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1chuan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1coolplace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1freeemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1funplace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1internetdrive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1mail.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1me.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1mum.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1musicrow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1netdrive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1nsyncfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1pad.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1under.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1webave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1webhighway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('1zhuan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('20email.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('20mail.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('20mail.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('212.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('21cn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('24horas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2911.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2980.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2bmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2d2i.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2die4.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('2trom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3000.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('30minutesmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3126.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('321media.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('33mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('37.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3ammagazine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3dmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3g.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3mail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('3xl.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('444.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4email.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4mg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4newyork.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4warding.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4warding.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('4x4man.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('50mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('60minutemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('6ip.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('6mail.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('6paq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('74gmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('74.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('7mail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('7mail.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('88.am', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('8848.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('8mail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('8mail.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('97rock.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('99experts.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('a45.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aaamail.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aamail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aapt.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aaronkwok.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abbeyroadlondon.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abcflash.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abdulnour.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aberystwyth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('about.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abusemail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abv.bg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abwesend.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('abyssmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ac20mail.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('academycougars.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('acceso.or.cr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('access4less.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('accessgcc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('accountant.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('acdcfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ace-of-base.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('acmemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('acninc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('activist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adam.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('add3000.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('addcom.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('address.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adelphia.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adexec.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adfarrow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adios.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adoption.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ados.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('adrenalinefreak.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('advalvas.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('advantimo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aeiou.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aemail4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aeneasmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('afreeinternet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('africamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('africamel.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ag.us.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('agoodmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ahaa.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ahk.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aichi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aircraftmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('airforce.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('airforceemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('airpost.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ajacied.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ajaxapp.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ak47.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aknet.kg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('albawaba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alex4all.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alexandria.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('algeria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alhilal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alibaba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alice.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alive.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aliyun.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('allergist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('allmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alloymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('allracing.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('allsaintsfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alpenjodel.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alphafrau.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alskens.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('altavista.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('altavista.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('altavista.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alternativagratis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alumni.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alumnidirector.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('alvilag.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amazonses.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amele.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('america.hm', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ameritech.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amnetsal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amorki.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amrer.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amuro.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('amuromail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ananzi.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('andylau.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anfmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('angelfire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('angelic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('animail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('animalhouse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('animalwoman.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anjungcafe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('annsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ano-mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anonmails.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anonymous.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anote.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('another.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anotherdomaincyka.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anotherwin95.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anti-social.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('antisocial.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('antispam24.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('antongijsen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('antwerpen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anymoment.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('anytimenow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aol.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aon.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('apexmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('apmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('apollo.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aport.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aport2000.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('appraiser.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('approvers.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arabia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arabtop.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('archaeologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arcor.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arcotronics.bg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arcticmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('argentina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aristotle.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('army.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('armyspy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('arnet.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('art-en-ligne.pro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('artlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('artlover.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('as-if.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asdasd.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asean-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asheville.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asia-links.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asia-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asiafind.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asianavenue.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asiancityweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asiansonly.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asianwired.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asiapoint.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ass.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('assala.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('assamesemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('astroboymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('astrolover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('astrosfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('astrosfan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('asurfer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atheist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('athenachu.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atina.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atl.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atlaswebmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atmc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atozasia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('atrus.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('att.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('attglobal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('attymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('au.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('auctioneer.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ausi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('aussiemail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('austin.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('australia.edu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('australiamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('austrosearch.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('autoescuelanerja.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('autograf.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('autorambler.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('avh.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('avia-tonic.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('awsom.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('axoskate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ayna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('azazazatashkent.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('azimiweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('azmeil.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bachelorboy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bachelorgal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('backpackers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('backstreet-boys.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('backstreetboysclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bagherpour.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baldmama.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baldpapa.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ballyfinance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bangkok.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bangkok2000.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bannertown.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baptistmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baptized.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('barcelona.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bareed.ws', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bartender.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baseballmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('basketballmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('batuta.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('baudoinconsulting.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bboy.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bcvibes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beddly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beeebank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beenhad.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beep.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('beethoven.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('belice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('belizehome.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bell.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bellair.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bellsouth.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('berlin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('berlin.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('berlinexpo.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bestmail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('betriebsdirektor.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bettergolf.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bharatmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('big1.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigassweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigblue.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigboab.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigfoot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigfoot.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigger.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('biggerbadder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigmailbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigmir.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigpond.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigpond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigpond.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigpond.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigpond.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigramp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bigstring.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bikemechanics.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bikeracer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bikeracers.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bikerider.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('billsfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('billsfan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bimla.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bin-wieder-da.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bio-muesli.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('birdlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('birdowner.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bisons.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bitmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bitpage.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bizhosting.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bk.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blackburnmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blackplanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blader.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bladesmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blazemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bleib-bei-mir.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blockfilter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blogmyway.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluebottle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluehyppo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluemail.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluemail.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluesfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bluewin.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blueyonder.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blushmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('blutig.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bmlsports.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boardermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boatracers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bodhi.lawlita.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bol.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bolando.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bollywoodz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boltonfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bombdiggity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bonbon.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bootmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bootybay.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bornnaked.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bostonoffice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boun.cr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bounce.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bounces.amazon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bouncr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('box.az', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('box.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boxbg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boxemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boxformail.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boxfrog.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boximail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('boyzoneclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bradfordfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brasilia.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brazilmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brazilmail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('breadtimes.press', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('breathe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brennendesreich.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bresnan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brew-master.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brew-meister.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brfree.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('briefemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bright.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('britneyclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brittonsign.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('broadcast.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brokenvalve.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('brusseler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bsdmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('btcmail.pw', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('btconnect.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('btconnect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('btinternet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('btopenworld.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('buerotiger.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('buffymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bullsfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bullsgame.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bumerang.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bumpymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bund.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('burnthespam.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('burstmail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('buryfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('business-man.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('businessman.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('busta-rhymes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('buyersusa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('bvimailbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('byom.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('c2.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('c2i.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('c3.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('c4.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('c51vsgq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cabacabana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cable.comcast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cableone.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('caere.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cairomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('calendar-server.bounces.google.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('calidifontain.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('californiamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('callnetuk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('callsign.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('caltanet.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('camidge.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('canada-11.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('canada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('canadianmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('canoemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('canwetalk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('caramail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('care2.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('careerbuildermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('carioca.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cartelera.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cartestraina.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('casablancaresort.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('casema.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cash4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cashette.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('casino.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('catcha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('catchamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('catholic.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('catlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cd2.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('celineclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('celtic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('center-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centermail.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centermail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centermail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centoper.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centralpets.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centrum.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centrum.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('centurytel.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('certifiedmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cfl.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cgac.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cghost.s-a-d.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chacuo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chaiyomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chammy.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chance2mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chandrasekar.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('charmedmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('charter.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chat.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chattown.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chauhanweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cheatmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chechnya.conf.work', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('check.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('check1check.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cheerful.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chef.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chello.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chemist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chequemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cheyenneweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chez.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chickmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('china.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('china.net.vg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chinamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chirk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chocaholic.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chong-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('chong-mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('churchusa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cia-agent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cia.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ciaoweb.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cicciociccio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cincinow.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cinci.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('citiz.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('citlink.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('citromail.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-bath.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-birmingham.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-brighton.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-cambridge.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-coventry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-edinburgh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-lichfield.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-lincoln.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-liverpool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-manchester.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-nottingham.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-oxford.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-swansea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-westminster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-westminster.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('city-of-york.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cityofcardiff.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cityoflondon.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ckaazaza.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('claramail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('classicalfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('classicmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clear.net.nz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clearwire.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clerk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cliffhanger.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clixser.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('close2you.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clrmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('club4x4.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubalfa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubbers.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubducati.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubhonda.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubmember.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubnetnoir.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('clubvdo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cluemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cmpmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cnnsimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cntv.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('codec.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coder.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coid.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coldmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('collectiblesuperstore.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('collector.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('collegeclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('collegemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('colleges.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('columbus.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('columbusrr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('columnist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('comcast.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('comic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('communityconnect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('comporium.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('comprendemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('compuserve.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('computer-freak.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('computer4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('computermail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('conexcol.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('conk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('connect4free.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('connectbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('consultant.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('consumerriot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('contractor.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('contrasto.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cookiemonster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cool.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coole-files.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolgoose.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolgoose.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolkiwi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coollist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolsend.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coolsite.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cooooool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cooperation.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cooperationtogo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('copacabana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('copper.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cornells.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cornerpub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('corporatedirtbag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('correo.terra.com.gt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cortinet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cotas.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('counsellor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('countrylover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cox.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('coxinet.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cracker.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crapmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crazedanddazed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crazymailing.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crazysexycool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cristianemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('critterpost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('croeso.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crosshairs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crosswinds.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('crwmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cry4helponline.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('csinibaba.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cuemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('curio-city.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('curryworld.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cute-girl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cuteandcuddly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cutey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cww.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber-africa.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber-innovation.club', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber-matrix.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber-phone.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber-wizard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyber4all.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberbabies.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybercafemaui.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberdude.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberforeplay.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybergal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybergrrl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberleports.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybermail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybernet.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberservices.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyberspace-asia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cybertrains.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cyclefanz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('cynetcity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dabsol.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dadacasa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('daha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dailypioneer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dallasmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dangerous-minds.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dansegulvet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dasdasdascyka.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('data54.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('davegracey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dawnsonmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dawsonmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dazedandconfused.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dbzmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dcemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deadlymob.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deagot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deal-maker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dearriba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('death-star.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deliveryman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deneg.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('depechemode.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deseretmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('desertmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('desilota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deskpilot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('destin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('detik.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('deutschland-net.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('devotedcouples.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dezigner.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dfwatson.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('di-ve.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('die-besten-bilder.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('die-genossen.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('die-optimisten.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('die-optimisten.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('diemailbox.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('digibel.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('digital-filestore.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('diplomats.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('directbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dirtracer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('discard.email', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('discard.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('discard.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('disciples.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('discofan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('discoverymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('disign-concept.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('disign-revelation.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('disinfo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dispomail.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('disposable.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dispose.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dm.w3internet.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dmailman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dnainternet.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dnsmadeeasy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doclist.bounces.google.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('docmail.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('docs.google.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doctor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dodgit.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dodo.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dodsi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dog.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dogit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doglover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dogmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dogsnob.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doityourself.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb1.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb2.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb3.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb4.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb5.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb6.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb7.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domforfb8.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('domozmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doneasy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('donjuan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dontgotmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dontmesswithtexas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('doramail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dostmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dotcom.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dotmsg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dott.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('download-privat.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dplanet.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dragoncon.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dropmail.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dropzone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('drotposta.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dubaimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dublin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dublin.ie', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('duck.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dumpmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dumpmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dumpyemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dunlopdriver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dunloprider.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('duno.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('duskmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dutchmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dwp.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dygo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dynamitemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('dyndns.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-apollo.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mail.com.tr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mail.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mail.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mailanywhere.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-mails.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('e-tapaal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthalliance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthcam.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthdome.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthling.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthlink.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('earthonline.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eastcoast.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eastmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('easy.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('easypost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('easytrashmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ec.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ecardmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ecbsolutions.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('echina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ecolo-online.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ecompare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('edmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ednatx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('edtnmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('educacao.te.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eelmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ehmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('einrot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('einrot.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eintagsmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eircom.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('elisanet.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('elitemail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('elsitio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('elvis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('elvisfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email-fake.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email-london.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.cbes.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.ee', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.nu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.si', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.su', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email2me.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('email4u.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailacc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailaccount.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailage.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailage.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailasso.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailchoice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailcorner.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailem.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailengine.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailengine.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailer.hubspot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailforyou.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailgo.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailgroups.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailinfive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailpinoy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailplanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailplus.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailproxsy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emails.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emails.incisivemedia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emails.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailthe.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailto.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailuser.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailx.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailz.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emailz.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ematic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('embarqmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emeil.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emeil.ir', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('emil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eml.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eml.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('end-war.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('enel.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('engineer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('england.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('england.edu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('englandmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('epage.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('epatra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ephemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('epix.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('epost.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eposta.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eqqu.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eramail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eresmas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eriga.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('estranet.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ethos.st', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('etoast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('etrademail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('etranquil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('etranquil.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eudoramail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('europamel.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('europe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('europemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('euroseek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eurosport.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('every1.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('everyday.com.kh', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('everymail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('everyone.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('everytg.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('examnotes.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('excite.co.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('excite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('excite.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('execs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('exemail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('exg6.exghost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('existiert.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('expressasia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('extenda.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('extended.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eyepaste.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('eyou.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ezcybersearch.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ezmail.egine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ezmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ezrs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('f-m.fm', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('f1fans.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('facebook-email.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('facebook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('facebookmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('facebookmail.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fahr-zur-hoelle.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fake-email.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fake-mail.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fake-mail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fake-mail.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fakemailz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('falseaddress.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fansonlymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fansworldwide.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fantasticmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('farang.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('farifluset.mailexpire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('faroweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fast-email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fast-mail.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fast-mail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastacura.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastchevy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastchrysler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastem.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastemail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastemailer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastest.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastimap.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastkawasaki.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.fm', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.im', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.mx', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.tw', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmailbox.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmazda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmessaging.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastmitsubishi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastnissan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastservice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastsubaru.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastsuzuki.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fasttoyota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fastyamaha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fatcock.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fatflap.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fathersrightsne.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fax.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fbi-agent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fbi.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fdfdsfds.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fea.st', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('federalcontractors.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('feinripptraeger.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('felicitymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('femenino.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fetchmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fettabernett.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('feyenoorder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ffanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fiberia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ficken.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fightallspam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('filipinolinks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('financemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('financier.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('findmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('finebody.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fire-brigade.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fireman.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fishburne.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fishfuse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fixmail.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fizmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('flashbox.5july.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('flashmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('flashmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fleckens.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('flipcode.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fmailbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fmgirl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fmguy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fnbmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fnmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('folkfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('foodmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('footard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('footballmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('foothills.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('for-president.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('force9.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('forfree.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('forgetmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fornow.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('forpresident.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fortuncity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fortunecity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('forum.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('foxmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fr33mail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('francemel.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('free-email.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('free-online.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('free-org.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('free.com.pe', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('free.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeaccess.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeaccount.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeandsingle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freedom.usa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freedomlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freegates.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeghana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freelance-france.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeler.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.c3.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.com.pk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.et', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.lt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.ms', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemail.org.mk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemails.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freemeil.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freenet.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freenet.kg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeola.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeola.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeserve.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freestart.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freesurf.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freesurf.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeuk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeuk.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeukisp.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeweb.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freewebemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freeyellow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freezone.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fresnomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freudenkinder.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('freundin.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('friendlymail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('friends-cafe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('friendsfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-africa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-america.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-argentina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-asia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-australia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-belgium.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-brazil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-canada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-china.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-england.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-europe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-france.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-germany.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-holland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-israel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-italy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-japan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-korea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-mexico.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-outerspace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-russia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('from-spain.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromalabama.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromalaska.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromarizona.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromarkansas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromcalifornia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromcolorado.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromconnecticut.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromdelaware.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromflorida.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromgeorgia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromhawaii.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromidaho.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromillinois.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromindiana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromiowa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromjupiter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromkansas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromkentucky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromlouisiana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommaine.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommaryland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommassachusetts.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommiami.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommichigan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromminnesota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommississippi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommissouri.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frommontana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnebraska.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnevada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnewhampshire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnewjersey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnewmexico.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnewyork.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnorthcarolina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromnorthdakota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromohio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromoklahoma.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromoregon.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frompennsylvania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromrhodeisland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromru.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromsouthcarolina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromsouthdakota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromtennessee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromtexas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromthestates.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromutah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromvermont.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromvirginia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromwashington.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromwashingtondc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromwestvirginia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromwisconsin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fromwyoming.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('front.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frontier.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frontiernet.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('frostbyte.uk.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fsmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ftc-i.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ftml.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fullmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('funkfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fuorissimo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('furnitureprovider.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fuse.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fut.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fux0ringduh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fwnb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('fxsmails.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('galaxy5.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('galaxyhit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gamebox.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gamegeek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gamespotmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gamno.config.work', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('garbage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gardener.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gawab.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gaybrighton.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gaza.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gazeta.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gazibooks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gci.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geecities.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geek.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geeklife.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gelitik.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gencmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('general-hospital.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gentlemansclub.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geocities.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geography.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('geopia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('germanymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('get.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('get1mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('getairmail.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('getairmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('getairmail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('getairmail.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('getonemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ghanamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ghostmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ghosttexter.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('giga4u.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gigileung.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('girl4god.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('givepeaceachance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('glay.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('glendale.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('globalfree.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('globalpagan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('globalsite.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.li', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gmx.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('go.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('go.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('go.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('go2net.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gocollege.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gocubs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goemailgo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gofree.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gol.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goldenmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goldmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goldtoolbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('golfemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('golfilla.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('golfmail.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gonavy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goodnewsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goodstick.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('googlegroups.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('googlemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('goplay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gorillaswithdirtyarmpits.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gorontalo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gospelfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gothere.uk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gotmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gotmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gotomy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gotti.otherinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gportal.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('graduate.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('graffiti.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gramszu.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('grandmamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('grandmasmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('graphic-designer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('grapplers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gratisweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('greenmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('groupmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('grr.la', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('grungecafe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gtmc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gua.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('guessmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('guju.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gustr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('guy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('guy2.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('guyanafriends.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gyorsposta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('gyorsposta.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('h-mail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hab-verschlafen.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('habmalnefrage.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hacccc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hackermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hackermail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hailmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hairdresser.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hamptonroads.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('handbag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('handleit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hang-ten.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hanmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('happemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('happycounsel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('happypuppy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('harakirimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hardcorefreak.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hartbot.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hawaii.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hawaiiantel.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('heartthrob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('heerschap.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('heesun.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hehe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hello.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hello.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hello.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('helter-skelter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('herediano.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('herono1.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('herp.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('herr-der-mails.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hetnet.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hey.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hhdevel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hidzz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('highmilton.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('highquality.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('highveldmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hilarious.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hiphopfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hispavista.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hitmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hitthe.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hkg.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hkstarphoto.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hockeymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hollywoodkids.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home-email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home.no.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('home.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('homelocator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('homemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('homestead.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('honduras.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hongkong.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hookup.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hoopsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hopemail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('horrormail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hot-mail.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hot-shot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hot.ee', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotbot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotbrev.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotfire.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotletter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co.il', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co.nz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.com.tr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.kg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.kz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotmail.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotpop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotpop3.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hotvoice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('housemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hsuchi.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hu2.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hughes.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('humanoid.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('humn.ws.gy', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hunsa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hurting.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hush.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hushmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('hypernautica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i-connect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i-france.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i-mail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i-p.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i.am', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i12.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('i2pmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iamawoman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iamwaiting.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iamwasted.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iamyours.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icestorm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ich-bin-verrueckt-nach-dir.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ich-will-net.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icloud.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icmsconsultants.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icqmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('icrazy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('id-base.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ididitmyway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('idigjesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('idirect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ieatspam.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ieatspam.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ieh-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iespana.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ifoward.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ig.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ignazio.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ignmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ihateclowns.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ihateyoualot.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iheartspam.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iinet.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ijustdontcare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ikbenspamvrij.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ilkposta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ilovechocolate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ilovejesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ilovetocollect.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ilse.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imaginemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imailbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imap-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imap.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imapmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imel.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imgof.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imgv.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('immo-gerance.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imneverwrong.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imposter.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imstations.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imstressed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('imtoosexy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('in-box.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('in2jesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iname.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbax.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbound.plus', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbox.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbox.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inbox.si', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inboxalias.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('incamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('incredimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indeedemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('index.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indexa.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('india.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indiatimes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indo-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indocities.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('indyracers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inerted.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inet.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('info-media.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('info-radio.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('info66.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('infohq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('infomail.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('infomart.or.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('infospacemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('infovia.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inicia.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inmail.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inmail24.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inmano.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inmynetwork.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('innocent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inorbit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inoutbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('insidebaltimore.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('insight.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('instant-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('instantemailaddress.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('instantmail.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('instruction.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('instructor.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('insurer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('interburp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('interfree.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('interia.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('interlap.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('intermail.co.il', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internet-e-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internet-mail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internet-police.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internetbiz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internetdrive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internetegypt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internetemails.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internetmailing.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('internode.on.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('invalid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('inwind.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iobox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iobox.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iol.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iol.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iowaemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ip3.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ip4.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ip6.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ipoo.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iprimus.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iqemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('irangate.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iraqmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ireland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('irelandmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iremail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('irj.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iroid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('isellcars.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iservejesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('islamonline.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('isleuthmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ismart.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('isonfire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('isp9.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('israelmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ist-allein.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ist-einmalig.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ist-ganz-allein.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ist-willig.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('italymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('itloox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('itmom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ivebeenframed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ivillage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iwan-fals.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iwmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('iwon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('izadpanah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jahoopa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jakuza.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('japan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jaydemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jazzandjava.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jazzfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jazzgame.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('je-recycle.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jerusalemmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jet-renovation.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jetable.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jetable.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jetemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jippii.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('job4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jobbikszimpatizans.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('joelonsoftware.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('joinme.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jokes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jordanmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('journalist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jourrapide.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jovem.te.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('joymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jpopmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jsrsolutions.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jubiimail.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jump.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('jumpy.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('juniormail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('junk1e.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('junkmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('junkmail.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('juno.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('justemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('justicemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kaazoo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kaffeeschluerfer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kaffeeschluerfer.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kaixo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kalpoint.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kansascity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kapoorweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('karachian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('karachioye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('karbasi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('katamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kayafmmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kbjrmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kcks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('keg-party.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('keinpardon.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('keko.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kellychen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('keromail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('keyemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kgb.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('khosropour.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kickassmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('killermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kimo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kimsdisk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kinglibrary.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kinki-kids.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kissfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kittymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kitznet.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kiwibox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kiwitown.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('klassmaster.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('km.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('knol-power.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kolumbus.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kommespaeter.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('konx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('korea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('koreamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kpnmail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('krim.ws', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('krongthip.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('krunis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ksanmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ksee24mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kube93mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kukamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kulturbetrieb.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kumarweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('kuwait-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('l33r.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('la.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('labetteraverouge.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ladymail.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lagerlouts.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lags.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lahoreoye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lakmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lamer.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('land.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lankamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('laoeq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('laposte.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lass-es-geschehen.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('last-chance.pro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lastmail.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('latemodels.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('latinmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lavache.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('law.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lawyer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lazyinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('leehom.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('legalactions.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('legalrc.loan', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('legislator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lenta.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('leonlai.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('letsgomets.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('letterboxes.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('letthemeatspam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('levele.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('levele.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lex.bg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lexis-nexis-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('libero.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liberomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lick101.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liebt-dich.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('linkmaster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('linktrader.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('linuxfreemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('linuxmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lionsfan.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liontrucks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liquidinformation.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('list.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('listomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('littleapple.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('littleblueroom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com.mx', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.com.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.ie', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.no', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('live.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liveradio.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('liverpoolfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('llandudno.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('llangollen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lmxmail.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lobbyist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('localbar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('locos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('login-email.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('loh.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lolfreak.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lolito.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('london.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('looksmart.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('looksmart.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('looksmart.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lopezclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('louiskoo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('love.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('loveable.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovecat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovefall.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovefootball.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovelygirl.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lover-boy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovergirl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovesea.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovethebroncos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovethecowboys.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('loveyouforever.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lovingjesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lowandslow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lr7.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lroid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('luso.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('luukku.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('luv2.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lvie.com.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycos.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycos.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycos.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycos.ne.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('lycosmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('m-a-i-l.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('m-hmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('m4.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('m4ilweb.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mac.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('macbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('macfreak.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('machinecandy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('macmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('madcreations.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('madonnafan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('madrid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maennerversteherin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maennerversteherin.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maffia.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('magicmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('magspam.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mahmoodweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.bg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-awu.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-box.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-center.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-central.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-easy.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-filter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-me.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-page.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail-tester.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.austria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.az', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.bulgaria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.by', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.com.tr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.ee', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.entrepeneurmag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.freetown.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.hitthebeach.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.htl22.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.md', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.misterpinball.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.nu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.org.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.pf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.r-o-o-t.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.sisna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.svenz.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.usa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.vasarhely.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail.wtf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail114.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail15.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2007.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aaron.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2abby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2abc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2actor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2admiral.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2adorable.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2adoration.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2adore.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2adventure.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aeolus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aether.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2affection.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2afghanistan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2africa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2agent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ahoy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2air.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2airbag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2airforce.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2airport.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alabama.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alaska.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2albania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alcoholic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alec.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alexa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2algeria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alicia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alien.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2allan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2allen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2allison.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alpha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2alyssa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2amanda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2amazing.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2amber.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2america.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2american.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2andorra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2andrea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2andy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2anesthesiologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2angela.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2angola.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ann.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2anna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2anne.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2anthony.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2anything.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aphrodite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2apollo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2april.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aquarius.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arabia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arabic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2architect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ares.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2argentina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aries.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arizona.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arkansas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2armenia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2army.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arnold.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2art.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2artemus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2arthur.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2artist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ashley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ask.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2astronomer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2athena.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2athlete.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2atlas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2atom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2attitude.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2auction.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2aunt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2australia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2austria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2azerbaijan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2baby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bahamas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bahrain.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ballerina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ballplayer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2band.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bangladesh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2banker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bankrupt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2baptist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2barbados.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2barbara.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2barter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2basketball.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2batter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beach.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beatles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beauty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2becky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beijing.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2belgium.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2belize.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ben.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bernard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2betty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beverly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2beyond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2biker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bill.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2billionaire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2billy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2biologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2black.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2blackbelt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2blake.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2blind.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2blonde.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2blues.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bobby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bolivia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bombay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bonn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bookmark.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2boreas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bosnia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2boston.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2botswana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bradley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brazil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2breakfast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bride.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brittany.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2broker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bruce.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brunei.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brunette.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2brussels.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bryan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bug.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2bulgaria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2business.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2buy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ca.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2california.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2calvin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cambodia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cameroon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2canada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cancer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2capeverde.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2capricorn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cardinal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cardiologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2care.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2caroline.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2carolyn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2casey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2caterer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cathy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2catlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2catwalk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chad.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2champaign.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2charles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chef.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chemist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cherry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chicago.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chile.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2china.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chinese.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chocolate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2christian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2christie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2christmas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2christy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2chuck.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cindy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2clark.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2classifieds.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2claude.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cliff.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2clinic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2clint.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2close.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2club.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2coach.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2coastguard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2colin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2college.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2colombia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2color.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2colorado.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2columbia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2comedian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2composer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2computer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2computers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2concert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2congo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2connect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2connecticut.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2consultant.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2convict.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cory.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2costarica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2country.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2courtney.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cowboy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cowgirl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2craig.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2crave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2crazy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2create.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2croatia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2crystal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cuba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2culture.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2curt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2customs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cute.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cutey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cynthia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2cyprus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2czechrepublic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dad.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dale.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dallas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dancer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2danielle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2danny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2darlene.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2darling.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2darren.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2daughter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dawn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dealer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2deanna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dearest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2debbie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2debby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2deer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2delaware.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2delicious.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2demeter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2democrat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2denise.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2denmark.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dennis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dentist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2derek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2desert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2devoted.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2devotion.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diamond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diehard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dilemma.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dillon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dinner.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dinosaur.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dionysos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diplomat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2director.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dirk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2disco.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2diver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2divorced.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2djibouti.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2doctor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2doglover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dominic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dominica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dominicanrepublic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2don.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2donald.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2donna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2doris.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dorothy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2doug.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dough.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2douglas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2downtown.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dream.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dreamer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dude.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dustin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dyke.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2dylan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2earl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2earth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eastend.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2economist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ecuador.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eddie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2edgar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2edwin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2egypt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2electron.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eli.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2elizabeth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ellen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2elliot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2elsalvador.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2elvis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2emergency.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2emily.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2engineer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2english.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2environmentalist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eric.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2erica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2erin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2erinyes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eris.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eritrea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ernie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eros.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2estonia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ethan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ethiopia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eu.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2europe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eurus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2eva.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2evan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2evelyn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2everything.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2exciting.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2expert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fairy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2faith.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fanatic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fancy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fantasy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2farm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2farmer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fashion.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2feeling.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2female.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fever.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fighter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fiji.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2filmfestival.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2films.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2finance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2finland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fireman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2firm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fisherman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2flexible.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2florence.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2florida.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2floyd.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fondness.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2football.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2footballfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2found.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2france.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2frank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2frankfurt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2franklin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fred.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2freddie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2free.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2freedom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2french.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2freudian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2friendship.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2from.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2fun.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gabon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gabriel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2galaxy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gambia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2games.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gavin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gemini.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gene.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2genes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2geneva.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2george.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2georgia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gerald.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2german.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2germany.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ghana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gilbert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2girl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2glen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gloria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2goddess.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gold.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2golfclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2golfer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gordon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2government.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grab.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2graham.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grandma.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grandpa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grant.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2greece.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2green.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2greg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2grenada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2gsm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2guard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2guatemala.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2guy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hades.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2haiti.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2handhelds.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hannah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2harold.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2harry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hawaii.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2headhunter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2heal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2heather.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2heaven.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hebe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hecate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2heidi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2helen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2help.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2helpdesk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2henry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hephaestus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hera.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hercules.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2herman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hermes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hespera.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hestia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2highschool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hindu.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hip.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hiphop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2holland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2holly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hollywood.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2homer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2honduras.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2honey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hongkong.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hope.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2horse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hotel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2houston.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2howard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hugh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2human.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hungary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hungry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hygeia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hyperspace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2hypnos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ice-cream.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2iceland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2idaho.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2idontknow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2illinois.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2imam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2in.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2india.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2indian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2indiana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2indonesia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2infinity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2intense.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2iowa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2iran.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2iraq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ireland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2irene.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2iris.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2irresistible.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2irving.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2irwin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2isaac.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2israel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2italian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2italy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jackie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jacob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jaime.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jake.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jamaica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2james.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jamie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2janet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2janice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2japan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2japanese.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jasmine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jason.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2java.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jazz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jeffrey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jennifer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jenny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jeremy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jerry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jessica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jessie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jew.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jeweler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jimmy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joann.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joanna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jody.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2john.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2join.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jonathan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jones.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jordan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joseph.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2josh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2joy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2juan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2judge.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2judy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2juggler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2julian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2julie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2jumbo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2junk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2justin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2justme.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2k.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kansas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2karate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2karen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2karl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2karma.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kathleen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kathy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2katie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kazakhstan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2keen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2keith.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kelly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kelsey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ken.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kendall.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kennedy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kenneth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kenny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kentucky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kenya.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kerry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kevin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kimberly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2king.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kirk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kiss.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kosher.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kristin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kurt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kuwait.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kyle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2kyrgyzstan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2la.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lacrosse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lance.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lao.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2larry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2latvia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2laugh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2laura.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lauren.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2laurie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lawrence.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lawyer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lebanon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2leo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2leon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2leonard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2leone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2leslie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2letter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2liberia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2libertarian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2libra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2libya.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2liechtenstein.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2life.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2linda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2linux.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lionel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lipstick.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2liquid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lisa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lithuania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2litigator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2liz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lloyd.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lois.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lola.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2london.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2looking.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lori.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lou.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2louis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2louisiana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lovable.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2love.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lucky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lucy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lunch.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lust.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2luxembourg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2luxury.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lyle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2lynn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2madagascar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2madison.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2madrid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maggie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mail4.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2malawi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2malaysia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maldives.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mali.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2malta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mambo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2man.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mandy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2manhunter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mankind.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2many.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marcia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2margaret.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2margie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marhaba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marilyn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marines.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mark.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marriage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2married.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marries.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mars.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marsha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marshallislands.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2martha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2martin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2marvin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maryland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mason.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2massachusetts.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2matt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2matthew.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maurice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mauritania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mauritius.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2max.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maxwell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2maybe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mba.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2me4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mechanic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2medieval.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2megan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2melanie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2melissa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2melody.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2member.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2memphis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2methodist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mexican.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mexico.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mgz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2miami.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2michael.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2michelle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2michigan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mike.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2milan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2milano.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mildred.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2milkyway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2millennium.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2millionaire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2milton.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mime.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mindreader.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mini.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2minister.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2minneapolis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2minnesota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2miracle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2missionary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mississippi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2missouri.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mitch.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2model.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2moldova.commail2molly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2monaco.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2money.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mongolia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2monica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2montana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2monty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2moon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2morocco.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2morpheus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mors.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2moscow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2moslem.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mouseketeer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2movies.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mozambique.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mp3.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mrright.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2msright.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2museum.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2music.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2musician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2muslim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2my.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2myboat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mycar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mycell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mygsm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mylaptop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mymac.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mypager.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mypalm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2mypc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2myphone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2myplane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2namibia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nancy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nasdaq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nathan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nauru.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2navy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2neal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nebraska.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ned.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2neil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nelson.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nemesis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nepal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2netherlands.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2network.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nevada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2newhampshire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2newjersey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2newmexico.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2newyork.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2newzealand.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nicaragua.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nick.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nicole.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2niger.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nigeria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nike.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2no.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2noah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2noel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2noelle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2normal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2norman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2northamerica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2northcarolina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2northdakota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2northpole.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2norway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2notus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2noway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nowhere.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nuclear.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2nun.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oasis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oceanographer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ohio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ok.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oklahoma.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oliver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2one.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2onfire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2online.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oops.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2open.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ophthalmologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2optometrist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oregon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oscars.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2oslo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2painter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pakistan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2palau.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2panama.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2paraguay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2paralegal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2paris.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2park.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2parker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2party.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2passion.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2patricia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2patrick.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2patty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2paul.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2paula.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2peace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pediatrician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2peggy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pennsylvania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2perry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2persephone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2persian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2peru.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pete.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2peter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pharmacist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2phil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2philippines.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2phoenix.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2phonecall.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2phyllis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pickup.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pilot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pisces.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2planet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2platinum.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2plato.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pluto.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2podiatrist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2poet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2poland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2policeman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2policewoman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2politician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2pope.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2popular.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2portugal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2poseidon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2potatohead.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2power.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2presbyterian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2president.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2priest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2prince.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2princess.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2producer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2professor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2protect.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2psychiatrist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2psycho.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2psychologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2qatar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2queen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rabbi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2race.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2racer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rachel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rainmaker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ralph.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2randy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rap.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ray.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2raymond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2realtor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rebecca.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2recruiter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2recycle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2redhead.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2reed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2reggie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2register.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2republican.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2resort.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rex.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rhodeisland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rich.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2richard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ricky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ride.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2riley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rita.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2robert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2roberta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2robin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rock.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rocker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rod.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rodney.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2romania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rome.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ron.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ronald.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ronnie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rose.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rosie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2roy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rss.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rudy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rugby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2runner.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2russell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2russia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2russian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rusty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ruth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2rwanda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ryan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sabrina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2safe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sagittarius.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sailor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2salaam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2samantha.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2samoa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2samurai.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sandra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sandy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sanfrancisco.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sanmarino.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2santa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sara.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sarah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2saturn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2saudi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2saudiarabia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2save.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2savings.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2school.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2scientist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2scorpio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2scott.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sean.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2search.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2seattle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2secretagent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2senate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2senegal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sensual.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2seth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sevenseas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sexy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2seychelles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2shane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sharon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2shawn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ship.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2shirley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2shoot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2shuttle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sierraleone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2simon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2singapore.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2single.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2site.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2skater.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2skier.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sleek.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2slim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2slovakia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2slovenia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2smile.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2smith.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2smooth.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2soccer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2soccerfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2socialist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2soldier.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2somalia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2son.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2song.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sos.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sound.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southafrica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southamerica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southcarolina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southdakota.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southkorea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2southpole.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2spain.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2spanish.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2spare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2spectrum.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2splash.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sponsor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sports.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2srilanka.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stacy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stanley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2star.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2state.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stephanie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2steve.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2steven.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stewart.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stlouis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stock.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stockholm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stockmarket.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2storage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2store.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2strong.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2student.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2studio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2studio54.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2stuntman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2subscribe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sudan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2superstar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2surfer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2suriname.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2susan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2suzie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2swaziland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sweden.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sweetheart.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2swim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2swimmer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2swiss.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2switzerland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sydney.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2sylvia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2syria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taboo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taiwan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tajikistan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tammy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tango.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tanya.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tanzania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tara.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taurus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taxi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taxidermist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taylor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2taz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2teacher.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2technician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ted.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2telephone.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2teletubbie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tenderness.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tennessee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tennis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tennisfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2terri.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2terry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2test.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2texas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2thailand.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2therapy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2think.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tickets.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tiffany.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2time.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2timothy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2titanic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2toby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2todd.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2togo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tommy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tonga.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tony.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2touch.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tourist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tracey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tracy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tramp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2travel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2traveler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2travis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2trekkie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2trex.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2triallawyer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2trick.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2trillionaire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2troy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2truck.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2trump.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2try.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tunisia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2turbo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2turkey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2turkmenistan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tv.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tycoon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2tyler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2u4me.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uae.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uganda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2ukraine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uncle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2unsubscribe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uptown.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uruguay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2usa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2utah.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2uzbekistan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2v.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vacation.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2valentines.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2valerie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2valley.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vamoose.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vanessa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vanuatu.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2venezuela.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2venous.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2venus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vermont.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vickie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2victor.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2victoria.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vienna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vietnam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vince.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2virginia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2virgo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2visionary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2vodka.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2volleyball.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2waiter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wallstreet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wally.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2walter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2warren.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2washington.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2way.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2waycool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wayne.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2webmaster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2webtop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2webtv.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2weird.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wendell.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wendy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2westend.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2westvirginia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2whether.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2whip.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2white.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2whitehouse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2whitney.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2why.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wilbur.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wild.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2willard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2willie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2winner.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wired.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wisconsin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2woman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wonder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2world.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2worship.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2www.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2wyoming.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2xfiles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2xox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2yachtclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2yahalla.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2yemen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2yes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2yugoslavia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zambia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zenith.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zephir.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zeus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zipper.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zoo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zoologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail2zurich.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail3000.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail333.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail4trash.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mail4u.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailandftp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailandnews.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailasia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbolt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbomb.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailboom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox.as', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox72.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbox80.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailbr.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailcan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailcat.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailcc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailchoose.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailcity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailclub.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailclub.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maildrop.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maildrop.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maildx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailed.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailexcite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailfa.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailfence.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailforce.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailforspam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailfree.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailfs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailftp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailgenie.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailguard.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailhaven.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailhood.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailimate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailinator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailinator.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailinator.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailinblack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailingaddress.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailingweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailisent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailismagic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailmate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailme.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailme.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailme24.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailmight.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailmij.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailnator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailnew.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailops.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailoye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpanda.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpick.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpokemon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpost.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpride.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailproxsy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailpuppy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailquack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailrock.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailroom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailru.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailsac.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailseal.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailsent.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailservice.ms', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailshuttle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailslapping.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailstart.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailstartplus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailsurf.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailtag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailtemp.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailto.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailtothis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailueberfall.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailup.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailwire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailworks.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailzi.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mailzilla.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maktoob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('malayalamtelevision.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maltesemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mamber.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('manager.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mancity.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mantrafreenet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mantramail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mantraonline.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('manybrain.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('marchmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mariahc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('marijuana.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('marijuana.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('married-not.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('marsattack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('martindalemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mash4077.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('masrawy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('matmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mauimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mauritius.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maxleft.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('maxmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mbox.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mchsi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('me-mail.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('me.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('medical.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('medscape.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meetingmall.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('megago.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('megamail.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('megapoint.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mehrani.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mehtaweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meine-dateien.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meine-diashow.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meine-fotos.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meine-urlaubsfotos.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mekhong.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('melodymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('meloo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('merda.flu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('merda.igg.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('merda.nut.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('merda.usa.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('message.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('message.myspace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('messages.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('metacrawler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('metalfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('metaping.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('metta.lk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mexicomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mezimages.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mfsa.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mierdamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('miesto.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mighty.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('migmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('migmail.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('migumail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('miho-nakayama.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mikrotamanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('millionaireintraining.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('millionairemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('milmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mindless.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mindspring.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('minister.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('misery.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mittalweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mixmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mjfrogmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ml1.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mlb.bounce.ed10.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mm.st', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mns.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moakt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mobilbatam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mobileninja.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mochamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mohammed.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mohmal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moldova.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moldova.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moldovacc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('momslife.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('monemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('money.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('montevideo.com.uy', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('monumentmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moonman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moose-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mor19.uu.gl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mortaza.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mosaicfx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('moscowmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('most-wanted.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mostlysunny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('motormania.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('movemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('movieluver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mox.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mp4.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mr-potatohead.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mscold.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('msgbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('msn.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('msn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('msn.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mt2015.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mt2016.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mttestdriver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muehlacker.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muell.icu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muellmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muellemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mundomail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('munich.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('music.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('musician.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('musicscene.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muskelshirt.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muslim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('muslimsonline.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mutantweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mvrht.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('my.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('my10minutemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mybox.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mycabin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mycity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mycool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mydomain.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mydotcomaddress.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myfamily.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myfastmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mygo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myiris.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mymacmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mynamedot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mynet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mynetaddress.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mynetstore.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myownemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myownfriends.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mypacks.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mypad.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mypersonalemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myplace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myrambler.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myrealbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myremarq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myself.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myspaceinc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myspamless.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mystupidjob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mytemp.email', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('mythirdage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('myworldmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2baseball.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2business.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2soccer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('n2software.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nabc.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nafe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nagpal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nakedgreens.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('name.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nameplanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nandomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('naplesnews.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('naseej.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nativestar.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nativeweb.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('naui.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('naver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('navigator.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('navy.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('naz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nc.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nchoicemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('neeva.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nemra1.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nenter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('neo.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nervhq.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.cat', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.lu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-c.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-pager.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net-shopping.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net4b.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('net4you.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netbounce.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netbroadcaster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netby.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netc.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netc.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netc.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netc.lu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netc.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netcenter-vn.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netcmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netcourrier.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netexecutive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netexpressway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netgenie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netizen.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netlane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netlimit.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netmongol.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netnet.com.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netnoir.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netpiper.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netposta.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netralink.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netscape.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netscapeonline.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netspace.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netspeedway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netsquare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nettaxi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nettemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netterchef.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netti.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netzero.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netzero.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('netzidiot.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('neue-dateien.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('neuro.md', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('newmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('newmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('newmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('newsboysmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('newyork.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nextmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nexxmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nfmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nicebush.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nicegal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nicholastse.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nicolastse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nightmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nikopage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ninfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nirvanafan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nmail.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('noavar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nonpartisan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nonspam.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nonspammer.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('norika-fujiwara.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('norikomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('northgates.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nospammail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nospamthanks.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nowhere.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ntelos.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ntlhelp.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ntlworld.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ntscan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('null.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nullbox.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nur-fuer-spam.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nus.edu.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nwldx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nwytg.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nxt.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nybella.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nyc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nycmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('nzoomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('o-tay.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('o2.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oaklandas-fan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oath.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oceanfree.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('odaymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oddpost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('odmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('office-dateien.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('office-email.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('offroadwarrior.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oicexchange.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oida.icu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oikrach.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okbank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okhuman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okmad.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okmagic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okname.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('okuk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oldies104mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ole.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('olemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('olympist.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('olypmall.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('omaninfo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('omen.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onebox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onenet.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oneoffmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onet.com.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onet.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onet.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oninet.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('online.ie', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('online.ms', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('online.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onlinewiz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onmilwaukee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('onobox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('op.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('opayq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('openmailbox.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('operafan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('operamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('opoczta.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('optician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('optonline.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('optusnet.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('orange.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('orbitel.bg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('orgmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('orthodontist.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('osite.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('oso.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('otakumail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('our-computer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('our-office.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('our.st', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ourbrisbane.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ourklips.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ournet.md', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outgun.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlawspam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.co.id', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.co.il', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.co.nz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.co.th', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.pe', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.tr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.com.vn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.ie', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.kr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.lv', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.my', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.ph', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.sa', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('outlook.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('over-the-rainbow.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ownmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ozbytes.net.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ozemail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pacbell.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pacific-ocean.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pacific-re.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pacificwest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('packersfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pagina.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pagons.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pakistanmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pakistanoye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('palestinemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pandora.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('papierkorb.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('parkjiyoon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('parsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('partlycloudy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('partybombe.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('partyheld.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('partynight.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('parvazi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('passwordmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pathfindermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pconnections.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pcpostal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pcsrock.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pcusers.otherinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pediatrician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('penpen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('peoplepc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('peopleweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pepbot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('perfectmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('perso.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('personal.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('personales.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('petlover.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('petml.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pettypool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pezeshkpour.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pfui.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('phayze.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('phone.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('photo-impact.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('photographer.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('phpbb.uu.gl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('phreaker.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('phus8kajuspa.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('physicist.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pianomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pickupman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('picusnet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pigpig.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pinoymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('piracha.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pisem.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pjjkp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planet.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetaccess.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetarymotion.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetearthinter.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('planetout.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('plasa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('playersodds.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('playful.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('playstation.sony.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('plus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('plus.google.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('plusmail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pobox.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pobox.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pochta.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('poczta.fm', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('poczta.onet.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('poetic.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pokemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pokemonpost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pokepost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('polandmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('polbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('policeoffice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('politician.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('polizisten-duzer.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('polyfaust.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pool-sharks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('poond.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('popaccount.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('popmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('popsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('popstar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('portugalmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('portugalmail.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('portugalnet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('positive-thinking.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('post.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('post.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('post.sk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posta.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postaccesslite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postafree.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postaweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.gl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.no', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('posteo.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postfach.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postino.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postmark.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postmaster.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postmaster.twitter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('postpro.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pousa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('powerfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pp.inet.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('praize.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('premium-mail.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('premiumservice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('presidency.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('press.co.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('priest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('primposta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('primposta.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('privy-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('privymail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pro.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('probemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('prodigy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('progetplus.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('programist.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('programmer.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('programozo.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('proinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('project2k.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('promessage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('prontomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('protestant.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('protonmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('prydirect.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('psv-supporter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ptd.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('public-files.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('public.usa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('publicist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pulp-fiction.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('punkass.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('purpleturtle.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('put2.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('pwrby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('q.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qatarmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qprfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qrio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quackquack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quakemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qualityservice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quantentunnel.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qudsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quepasa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quickhosts.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quickmail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quicknet.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quickwebmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quiklinks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('quikmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qv7.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qwest.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('qwestoffice.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('r-o-o-t.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('raakim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('racedriver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('racefanz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('racingfan.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('racingmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('radicalz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('radiku.ye.vc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('radiologist.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ragingbull.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ralib.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rambler.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ranmamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rastogi.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ratt-n-roll.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rattle-snake.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('raubtierbaendiger.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ravearena.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ravemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('razormail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rccgmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rcn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('realemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reality-concept.club', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reallyfast.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reallyfast.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reallymymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('realradiomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('realtyagent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reborn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reconmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('recycler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('recyclermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rediff.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rediffmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rediffmailpro.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rednecks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('redseven.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('redsfans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('regbypass.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reggaefan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('registerednurses.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('regspaces.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reincarnate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('religious.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('remail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('renren.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('repairman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reply.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('reply.ticketmaster.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('representative.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rescueteam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('resgedvgfed.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('resource.calendar.google.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('resumemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rezai.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rhyta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('richmondhill.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rickymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rin.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('riopreto.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rklips.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ro.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('roadrunner.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('roanokemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rock.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rocketmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rocketship.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rockfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rodrun.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rogers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rome.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('roosh.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rootprompt.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('roughnet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('royal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rrohio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rsub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rubyridge.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('runbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rushpost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ruttolibero.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('rvshop.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('s-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sabreshockey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sacbeemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('saeuferleber.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('safe-mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('safrica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sagra.lu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sags-per-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sailormoon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('saintly.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('saintmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sale-sale-sale.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('salehi.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('salesperson.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('samerica.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('samilan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sammimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sandelf.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sanfranmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sanook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sapo.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('saudia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('savelife.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sayhi.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('saynotospams.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sbcglbal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sbcglobal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sbcglobal.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scandalmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scarlet.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schafmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schizo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schmusemail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schoolemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schoolmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schoolsucks.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schreib-doch-mal-wieder.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('schweiz.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sci.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scientist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scifianime.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scotland.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scotlandmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scottishmail.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scottsboro.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('scubadiving.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seanet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('search.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('searchwales.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sebil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seckinmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('secret-police.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('secretary.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('secretservices.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('secure-mail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('secure-mail.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seductive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seekstoyboy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seguros.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('selfdestructingmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('send.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sendme.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sendspamhere.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sent.as', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sent.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sent.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sentrismail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('serga.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('servemymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('servermaps.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sesmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sexmagnet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('seznam.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shahweb.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shaniastuff.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shared-files.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sharedmailbox.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sharmaweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shaw.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('she.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shieldedmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shinedyoureyes.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.gq', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitaway.usa.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shitware.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shockinmytown.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shootmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shortmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shotgun.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('showslow.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('shuf.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sialkotcity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sialkotian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sialkotoye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sify.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('silkroad.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sina.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sinamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('singapore.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('singles4jesus.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('singmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('singnet.com.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sinnlos-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('siteposter.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skafan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skeefmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skim.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skizo.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skrx.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sky.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('skynet.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slamdunkfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slave-auctions.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slingshot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slippery.email', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slipry.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slo.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('slotter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smap.4nmv.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smapxsmap.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smashmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smellrear.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smileyface.comsmithemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('smoothmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sms.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snail-mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snakebite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snakemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sndt.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sneakemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snet.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sniper.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snkmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snoopymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snowboarding.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('snowdonia.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('socamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('socceramerica.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soccermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soccermomz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('social-mailer.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('socialworker.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sociologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sofort-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sofortmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('softhome.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sogou.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sohu.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sol.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('solar-impact.pro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('solcon.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soldier.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('solution4u.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('solvemail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('songwriter.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sonnenkinder.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soodomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('soulfoodcookbook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sp.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('space-bank.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('space-man.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('space-ship.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('space-travel.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('space.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spacemart.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spacetowns.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spacewar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spainmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spam.2012-2016.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamavert.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spambob.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spambob.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spambog.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spambooger.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spam.care', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamcero.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamdecoy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spameater.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spameater.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamex.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamfree24.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamfree24.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamgoes.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spaminator.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamkill.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spaml.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamoff.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spamstack.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spartapiet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spazmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('speedemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('speedpost.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('speedrules.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('speedrulz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('speedymail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sperke.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spils.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spinfinder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spl.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spoko.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spoofmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sportemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sportsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sporttruckdriver.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spray.no', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spray.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spybox.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('spymac.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sraka.xyz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('srilankan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ssl-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('st-davids.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stade.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stalag13.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stargateradio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('starmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('starmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('starmedia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('starplace.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('starspath.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('start.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('startkeys.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stinkefinger.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stipte.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stoned.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stones.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stop-my-spam.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stopdropandroll.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('storksite.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('streber24.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('streetwisemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stribmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('strompost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('strongguy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('student.su', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('studentcenter.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('stuffmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('subram.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudanmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudolife.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudolife.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudomail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudomail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudoverse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudoverse.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudoweb.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudoworld.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sudoworld.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('suhabi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('suisse.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sukhumvit.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sunpoint.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sunrise-sunset.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sunsgame.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sunumail.sn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('suomi24.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('superdada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('supereva.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('supermail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('superrito.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('superstachel.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surf3.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surfree.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surfy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surgical.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('surimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('survivormail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('susi.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('svk.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swbell.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sweb.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swedenmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sweetville.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sweetxxx.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swift-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swiftdesk.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swingeasyhithard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swingfan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swipermail.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swirve.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swissinfo.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swissmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('swissmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('switchboardmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('switzerland.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('sx172.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('syom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('syriamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('t-online.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('t.psh.me', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('t2mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tafmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('takuyakimura.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('talk21.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('talkcity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('talkinator.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tamil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tampabay.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tankpolice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tatanova.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tbwt.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tcc.on.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tds.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teachermail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teachers.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teamdiscovery.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teamtulsa.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tech-center.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tech4peace.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('techemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('techie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('technisamail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('technologist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('techscout.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('techspot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teenagedirtbag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tele2.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telebot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telefonica.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teleline.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telenet.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telepac.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telerymd.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('teleworm.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telfort.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telfortglasvezel.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telinco.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telkom.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telpage.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telstra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('telstra.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temp-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temp-mail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temp.headstrong.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempemail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempmail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempmail2.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempmaildemo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempmailer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temporarioemail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temporaryemail.us', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempthe.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tempymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('temtulsa.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tenchiclub.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tenderkiss.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tennismail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terminverpennt.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terra.cl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terra.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terra.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terra.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('terra.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('test.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('test.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tfanus.com.er', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tfz.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thai.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thaimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thaimail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thanksnospam.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-african.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-airforce.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-aliens.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-american.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-animal.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-army.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-astronaut.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-beauty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-big-apple.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-biker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-boss.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-brazilian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-canadian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-canuck.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-captain.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-chinese.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-country.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-cowboy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-davis-home.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-dutchman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-eagles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-englishman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-fastest.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-fool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-frenchman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-galaxy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-genius.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-gentleman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-german.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-gremlin.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-hooligan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-italian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-japanese.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-lair.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-madman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-mailinglist.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-marine.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-master.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-mexican.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-ministry.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-monkey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-newsletter.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-pentagon.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-police.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-prayer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-professional.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-quickest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-russian.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-snake.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-spaceman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-stock-market.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-student.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-whitehouse.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the-wild-west.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('the18th.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thecoolguy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thecriminals.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thedoghousemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thedorm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theend.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theglobe.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thegolfcourse.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thegooner.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theheadoffice.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theinternetemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thelanddownunder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('themail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('themillionare.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theoffice.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theplate.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thepokerface.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thepostmaster.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theraces.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theracetrack.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('therapist.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thestreetfighter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('theteebox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thewatercooler.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thewebpros.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thewizzard.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thewizzkid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thezhangs.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thirdage.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thisgirl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thraml.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('throwam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('thundermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tidni.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('timein.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.lu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tiscali.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tkcity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tmail.ws', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('toast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('toke.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('toolsource.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('toomail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('toothfairy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topchat.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topgamers.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topletter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topmail-files.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topmail.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('topsurf.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('torchmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('torontomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tortenboxer.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('totalmail.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('totalmusic.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('townisp.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tpg.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trash-amil.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trash-mail.ga', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trash-mail.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trash2010.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trash2011.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trashdevil.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trashymail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('travel.li', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trayna.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trialbytrivia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trickmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trimix.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tritium.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trmailbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tropicalstorm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('truckerz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('truckracer.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('truckracers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('trust-me.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('truthmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tsamail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ttml.co.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tunisiamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('turboprinz.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('turboprinzessin.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('turkey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('turual.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tut.by', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tvstar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('twc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('twcny.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('twinstarsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tx.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('tycoonmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('typemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('u14269.ml', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('u2club.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ua.fm', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uae.ac', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uaemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ubbi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ubbi.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uboot.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uk2.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uk2k.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uk2net.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uk7.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uk8.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukbuilder.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukcool.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukdreamcast.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukmail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukmax.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ukr.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uku.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ultra.fyi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ultapulta.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ultrapostman.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ummah.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('umpire.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unbounded.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unforgettable.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uni.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unican.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unihome.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unitybox.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('universal.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uno.ee', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uno.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unofree.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('unterderbruecke.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uol.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uol.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uol.com.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uol.com.mx', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uol.com.ve', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uole.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uole.com.ve', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uolmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('upc.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('upcmail.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('upf.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uplipht.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ureach.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('urgentmail.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('urhen.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uroid.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usa.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usa.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usaaccess.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usanetmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('used-product.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('username.e4ward.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usma.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('usmc.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uswestmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('uyuyuy.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('v-sexi.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vaasfc4.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vahoo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('valemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vampirehunter.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('varbizmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vcmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('velnet.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('velocall.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('verizon.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('verizonmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('verlass-mich-nicht.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('versatel.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('veryfast.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('veryrealemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('veryspeedy.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vfemail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vickaentb.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('videotron.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('viditag.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('viewcastmedia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('viewcastmedia.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vinbazar.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('violinmakers.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.126.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.21cn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.citiz.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.onet.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.qq.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vip.sina.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vipmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('virgilio.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('virgin.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('virginbroadband.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('virginmedia.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('virtualmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('visitmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('visitweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('visto.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('visualcities.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vivavelocity.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vivianhsu.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vjtimail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vkcode.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vnet.citiz.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vnn.vn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vodafone.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vodafonethuis.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('volcanomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vollbio.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('volloeko.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vomoto.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vorsicht-bissig.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vorsicht-scharf.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vote-democrats.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vote-hillary.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vote-republicans.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vote4gop.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('votenet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vp.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vr9.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('vubby.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('w3.to', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wahoye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('walala.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wales2000.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('walkmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('walkmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wam.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wanadoo.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wanadoo.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('war-im-urlaub.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('warmmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('warpmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('warrior.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('waumail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wazabi.club', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wbdet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wearab.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-contact.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-emailbox.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-ideal.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-mail.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-mail.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web-police.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('web.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webave.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webcammail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webcity.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webcontact-france.eu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webdream.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webindia123.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webjump.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webm4il.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webmail.co.yu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webmail.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webmail.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webmails.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webname.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webprogramming.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webstation.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('websurfer.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webtopmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('webuser.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wee.my', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weedmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weekmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weekonline.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wefjo.grn.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weg-werf-email.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wegas.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wegwerf-emails.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wegwerfmail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wegwerpmailadres.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wehshee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weibsvolk.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weibsvolk.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('weinenvorglueck.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('welsh-lady.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('westnet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('westnet.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wetrainbayarea.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wfgdfhj.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whale-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whartontx.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whatiaas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whatpaas.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wheelweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whipmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whoever.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whoopymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('whtjddn.33mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wi.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wi.twcbc.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wickmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wideopenwest.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wildmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wilemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('will-hier-weg.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('windowslive.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('windrivers.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('windstream.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wingnutz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('winmail.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('winning.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wir-haben-nachwuchs.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wir-sind-cool.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wirsindcool.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('witty.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wiz.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wkbwmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wmail.cf', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wo.com.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('woh.rr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wolf-web.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wolke7.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wollan.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wombles.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('women-at-work.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wongfaye.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wooow.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('worker.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('workmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('worldemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('worldnet.att.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wormseo.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wosaddict.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wouldilie.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wovz.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wowgirl.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wowmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wowway.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wp.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wptamail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wrexham.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('writeme.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('writemeback.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wrongmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wtvhmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wwdg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('www.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('www.e4ward.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('www2000.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wx88.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('wxs.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('x-mail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('x-networks.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('x5g.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xagloo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xaker.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xing886.uu.gl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xmastime.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xms.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xmsg.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xoom.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xoxox.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xpressmail.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xs4all.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xsecurity.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xsmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xtra.co.nz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xuno.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xww.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xy9ce.tk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xyzfree.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('xzapmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('y7mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ya.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yada-yada.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yaho.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ae', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.at', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.be', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ca', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ch', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.id', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.il', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.kr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.nz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.th', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.co.za', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.ar', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.au', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.cn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.co', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.hk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.is', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.mx', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.my', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.ph', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.sg', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.tr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.tw', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.com.vn', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.cz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.de', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.dk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.es', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.fi', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.gr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.hu', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ie', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.it', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.jp', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.no', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.pt', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ro', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoo.se', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yahoofs.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yalla.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yalla.com.lb', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yalook.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yam.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yandex.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yandex.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yandex.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yandex.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yapost.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yapped.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yawmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yeah.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yebox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yehey.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yemenmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yepmail.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yert.ye.vc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yesey.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yifan.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ymail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yogotemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yomail.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yopmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yopmail.pp.ua', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yopolis.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yopweb.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('youareadork.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('youmailr.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('your-house.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('your-mail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourinbox.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourlifesucks.cu.cc', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourlover.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourname.freeservers.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yournightmare.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yours.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourssincerely.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yoursubdomain.zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourteacher.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yourwap.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yuuhuu.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('yyhmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('z1p.biz', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('za.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zahadum.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zaktouni.fr', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zeepost.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zetmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zhaowei.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zhouemail.510520.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ziggo.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zionweb.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zip.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zipido.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('ziplip.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zipmail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zipmail.com.br', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zipmax.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zmail.ru', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zoemail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zoemail.org', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zoho.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zohomail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zomg.info', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zonnet.nl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zoominternet.net', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zubee.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zuvio.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zuzzurello.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zwallet.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zweb.in', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zxcv.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zxcvbnm.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zybermail.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zydecofan.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zzn.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zzom.co.uk', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zzz.com', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;
INSERT INTO public."FreemailDomain" VALUES ('zzz.pl', '2024-10-21 20:55:53.59053+00') ON CONFLICT DO NOTHING;


--
-- TOC entry 4451 (class 0 OID 4219668)
-- Dependencies: 240
-- Data for Name: GitHubAuth; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4452 (class 0 OID 4219677)
-- Dependencies: 241
-- Data for Name: GitHubDimensionFieldMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4454 (class 0 OID 4219681)
-- Dependencies: 243
-- Data for Name: GitLabDimensionFieldMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4456 (class 0 OID 4219685)
-- Dependencies: 245
-- Data for Name: Insight; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4458 (class 0 OID 4219694)
-- Dependencies: 247
-- Data for Name: IntegrationProvider; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4460 (class 0 OID 4219707)
-- Dependencies: 249
-- Data for Name: IntegrationSearchQuery; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4462 (class 0 OID 4219717)
-- Dependencies: 251
-- Data for Name: JiraDimensionFieldMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4464 (class 0 OID 4219724)
-- Dependencies: 253
-- Data for Name: JiraServerDimensionFieldMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4466 (class 0 OID 4219730)
-- Dependencies: 255
-- Data for Name: MassInvitation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4467 (class 0 OID 4219733)
-- Dependencies: 256
-- Data for Name: MeetingMember; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4468 (class 0 OID 4219737)
-- Dependencies: 257
-- Data for Name: MeetingSeries; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4470 (class 0 OID 4219745)
-- Dependencies: 259
-- Data for Name: MeetingSettings; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MeetingSettings" VALUES ('settings:aGhostTeam:654', '{checkin,SCOPE,ESTIMATE}', 'poker', 'aGhostTeam', 'estimatedEffortTemplate', NULL, NULL, NULL, false, NULL) ON CONFLICT DO NOTHING;


--
-- TOC entry 4471 (class 0 OID 4219750)
-- Dependencies: 260
-- Data for Name: MeetingTemplate; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."MeetingTemplate" VALUES ('teamPrompt', '2024-10-21 20:55:53.427584+00', true, 'Standup', 'aGhostTeam', '2024-10-21 20:55:53.770494+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'teamPrompt', true, true, '/self-hosted/Organization/aGhostOrg/template/teamPrompt.png', NULL, NULL, 'standup') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('action', '2024-10-21 20:55:53.428546+00', true, 'Check-in', 'aGhostTeam', '2024-10-21 20:55:53.770494+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'action', true, true, '/self-hosted/Organization/aGhostOrg/template/action.png', NULL, NULL, 'standup') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('oneOnOneAction', '2024-10-21 20:55:53.494483+00', false, 'One on One', 'aGhostTeam', '2024-10-21 20:55:53.83397+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'action', true, true, '/self-hosted/Organization/aGhostOrg/template/action.png', NULL, NULL, 'standup') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('estimatedEffortTemplate', '2024-10-21 20:53:55.201+00', true, 'Estimated Effort', 'aGhostTeam', '2024-10-21 20:55:54.637204+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'poker', true, true, '/self-hosted/Organization/aGhostOrg/template/estimatedEffortTemplate.png', NULL, NULL, 'estimation') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('moscowPrioritizationTemplate', '2024-10-21 20:55:19.897+00', true, 'MoSCoW Prioritization', 'aGhostTeam', '2024-10-21 20:55:54.637204+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'poker', true, true, '/self-hosted/Organization/aGhostOrg/template/newTemplate.png', NULL, NULL, 'strategy') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('wsjfTemplate', '2024-10-21 20:53:55.201+00', true, 'Weighted Shortest Job First', 'aGhostTeam', '2024-10-21 20:55:54.637204+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'poker', true, true, '/self-hosted/Organization/aGhostOrg/template/wsjfTemplate.png', NULL, NULL, 'estimation') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('ricePrioritizationTemplate', '2024-10-21 20:55:19.897+00', true, 'RICE Prioritization', 'aGhostTeam', '2024-10-21 20:55:54.637204+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'poker', true, true, '/self-hosted/Organization/aGhostOrg/template/newTemplate.png', NULL, NULL, 'strategy') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('360ReviewFeedbackOnDevelopmentTemplate', '2024-10-21 20:55:18.539+00', true, '360 Review: Feedback on Development', 'aGhostTeam', '2024-10-21 20:55:55.247183+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/hopesAndFearsTemplate.png', NULL, NULL, 'feedback') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('agilePostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Agile post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.252978+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('communicationRisksPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Communication risks pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.259091+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('dropAddKeepImproveDAKITemplate', '2024-10-21 20:53:55.206+00', true, 'Drop Add Keep Improve (DAKI)', 'aGhostTeam', '2024-10-21 20:55:55.267235+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/dakiTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('energyLevelsTemplate', '2024-10-21 20:53:55.199+00', true, 'Energy Levels 🔋', 'aGhostTeam', '2024-10-21 20:55:55.269488+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/energyLevelsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('360ReviewFeedbackOnProgressionTemplate', '2024-10-21 20:55:18.539+00', true, '360 Review: Feedback on Progression', 'aGhostTeam', '2024-10-21 20:55:55.248225+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/mountainClimberTemplate.png', NULL, NULL, 'feedback') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('360ReviewOpenendedFeedbackTemplate', '2024-10-21 20:55:18.539+00', true, '360 Review: Open-ended Feedback', 'aGhostTeam', '2024-10-21 20:55:55.249706+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/heardSeenRespectedHSRTemplate.png', NULL, NULL, 'feedback') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('bestworstCaseScenarioPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Best/worst case scenario pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.255214+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('blindSpotPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Blind spot pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.257388+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('budgetReviewPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Budget review post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.258063+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('successAndFailurePremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Success and failure pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.334456+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('sWOTAnalysisTemplate', '2024-10-21 20:54:28.757+00', true, 'SWOT Analysis 🎯', 'aGhostTeam', '2024-10-21 20:55:55.341145+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/sWOTAnalysisTemplate.png', NULL, NULL, 'strategy') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('teamEfficiencyPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Team efficiency pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.343493+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('threatLevelPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Threat level pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.348757+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('timelinePremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Timeline pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.350962+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('timeManagementPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Time management post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.352133+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('timeTravelPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Time travel post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.353595+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('aChristmasCarolRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Christmas Retrospective 🎅🏼', 'aGhostTeam', '2024-10-21 20:55:55.250881+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/aChristmasCarolRetrospectiveTemplate.png', '2020-01-01 00:00:00+00', '2019-11-15 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('alwaysBeLearningRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Always Be Learning Retrospective 🌱', 'aGhostTeam', '2024-10-21 20:55:55.253674+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/alwaysBeLearningRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('blamelessPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Blameless post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.256019+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('controlRangePostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Control range post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.260374+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('customerFeedbackAnalysisTemplate', '2024-10-21 20:55:18.197+00', true, 'Customer feedback analysis', 'aGhostTeam', '2024-10-21 20:55:55.261246+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/whatWentWellTemplate.png', NULL, NULL, 'feedback') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('dreamTeamRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Dream Team Retrospective 🦄', 'aGhostTeam', '2024-10-21 20:55:55.26612+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/dreamTeamRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('engineeringPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Engineering post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.270481+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('highlightsLowlightsTemplate', '2024-10-21 20:54:28.757+00', true, 'Highlights & Lowlights 🎢', 'aGhostTeam', '2024-10-21 20:55:55.283151+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/highlightsLowlightsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('hopesAndFearsTemplate', '2024-10-21 20:54:28.757+00', true, 'Hopes and Fears 🎭', 'aGhostTeam', '2024-10-21 20:55:55.284908+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/hopesAndFearsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('iTProjectPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'IT project post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.294002+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('madScientistPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Mad scientist pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.297602+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('midsummerRetrospectiveTemplate', '2024-10-21 20:55:06.962+00', true, 'Midsummer Retrospective', 'aGhostTeam', '2024-10-21 20:55:55.299496+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/midsummerRetrospectiveTemplate.png', '2020-07-01 00:00:00+00', '2020-05-15 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('diwaliRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Diwali Retrospective 🪔', 'aGhostTeam', '2024-10-21 20:55:55.265008+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/diwaliRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('easterRetrospectiveTemplate', '2024-10-21 20:55:06.962+00', true, 'Easter Retrospective', 'aGhostTeam', '2024-10-21 20:55:55.268613+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/easterRetrospectiveTemplate.png', '2020-04-16 00:00:00+00', '2020-02-28 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('fortuneTellerPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Fortune teller pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.273807+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('gladSadMadTemplate', '2016-06-01 00:00:00+00', true, 'Glad, Sad, Mad', 'aGhostTeam', '2024-10-21 20:55:55.277228+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('herosJourneyTemplate', '2024-10-21 20:54:28.757+00', true, 'Hero’s Journey 👑', 'aGhostTeam', '2024-10-21 20:55:55.282187+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/herosJourneyTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('iguanaCrocodileKomodoDragonPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Iguana, Crocodile, Komodo Dragon pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.287963+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('incidentResponsePostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Incident response post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.292515+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('mountainClimberTemplate', '2024-10-21 20:53:55.199+00', true, 'Mountain Climber ⛰️', 'aGhostTeam', '2024-10-21 20:55:55.300575+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/mountainClimberTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('newYearRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'New Year Retrospective 🗓️', 'aGhostTeam', '2024-10-21 20:55:55.302874+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/newYearRetrospectiveTemplate.png', '2020-01-08 00:00:00+00', '2019-11-22 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('excitedAndWorriedPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Excited and worried pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.271177+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('featureLaunchPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Feature launch post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.272469+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('fourLsTemplate', '2016-06-01 00:00:00+00', true, 'Four L’s', 'aGhostTeam', '2024-10-21 20:55:55.274536+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/fourLsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('glassHalfemptyPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Glass half-empty pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.277944+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('halloweenRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Halloween Retrospective 🎃', 'aGhostTeam', '2024-10-21 20:55:55.278721+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/halloweenRetrospectiveTemplate.png', '2020-11-07 00:00:00+00', '2020-09-21 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('heardSeenRespectedHSRTemplate', '2024-10-21 20:54:28.766+00', true, 'Heard, Seen, Respected (HSR)', 'aGhostTeam', '2024-10-21 20:55:55.281205+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/heardSeenRespectedHSRTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('hotAirBalloonTemplate', '2024-10-21 20:54:28.757+00', true, 'Hot Air Balloon 🎈', 'aGhostTeam', '2024-10-21 20:55:55.285743+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/hotAirBalloonTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('keepProblemTryTemplate', '2024-10-21 20:54:28.757+00', true, 'Keep, Problem, Try 🤔', 'aGhostTeam', '2024-10-21 20:55:55.295273+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/keepProblemTryTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('marieKondoRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Marie Kondo Retrospective 😌', 'aGhostTeam', '2024-10-21 20:55:55.298696+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/marieKondoRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('obstacleCoursePremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Obstacle course pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.304208+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('gameShowPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Game show post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.275809+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('handsOnDeckActivityTemplate', '2024-10-21 20:54:28.757+00', true, 'Hands on Deck Activity 🚢', 'aGhostTeam', '2024-10-21 20:55:55.279841+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/handsOnDeckActivityTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('holiRetrospectiveTemplate', '2024-10-21 20:55:06.962+00', true, 'Holi Retrospective', 'aGhostTeam', '2024-10-21 20:55:55.284107+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/holiRetrospectiveTemplate.png', '2020-04-01 00:00:00+00', '2020-02-13 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('howLikelyToFailPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'How likely to fail pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.286653+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('incidentImpactPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Incident impact post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.29147+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('leanCoffeeTemplate', '2024-10-21 20:53:55.206+00', true, 'Lean Coffee ☕', 'aGhostTeam', '2024-10-21 20:55:55.295951+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/leanCoffeeTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('lunarNewYearRetrospectiveTemplate', '2024-10-21 20:55:06.962+00', true, 'Lunar New Year Retrospective', 'aGhostTeam', '2024-10-21 20:55:55.296774+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/lunarNewYearRetrospectiveTemplate.png', '2020-02-25 00:00:00+00', '2019-12-15 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('postincidentReviewTemplate', '2024-10-21 20:55:10.872+00', true, 'Post-incident review', 'aGhostTeam', '2024-10-21 20:55:55.306394+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('postmortemAnalysisTemplate', '2024-10-21 20:55:10.872+00', true, 'Post-mortem analysis', 'aGhostTeam', '2024-10-21 20:55:55.307908+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('questionsCommentsConcernsTemplate', '2024-10-21 20:54:28.757+00', true, 'Questions, Comments, Concerns❓', 'aGhostTeam', '2024-10-21 20:55:55.310427+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/questionsCommentsConcernsTemplate.png', NULL, NULL, 'feedback') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('risksAndPrecautionsPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Risks and precautions pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.317414+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('movieDirectorPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Movie director post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.301848+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('original4Template', '2024-10-21 20:54:28.757+00', true, 'Original 4', 'aGhostTeam', '2024-10-21 20:55:55.305508+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/original4Template.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('remoteWorkPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Remote work post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.311476+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('safariPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Safari pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.319167+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('speedCarTemplate', '2024-10-21 20:54:28.757+00', true, 'Speed Car 🏎️', 'aGhostTeam', '2024-10-21 20:55:55.329435+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/speedCarTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('startStopContinueTemplate', '2016-06-01 00:00:00+00', true, 'Start, Stop, Continue', 'aGhostTeam', '2024-10-21 20:55:55.333559+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/startStopContinueTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('surprisedWorriedInspiredTemplate', '2024-10-21 20:54:28.757+00', true, 'Surprised, Worried, Inspired 😯', 'aGhostTeam', '2024-10-21 20:55:55.340347+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/surprisedWorriedInspiredTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('teamPerformancePostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Team performance post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.345817+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('thanksgivingRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Thanksgiving Retrospective 🥧', 'aGhostTeam', '2024-10-21 20:55:55.347925+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/thanksgivingRetrospectiveTemplate.png', '2020-11-30 00:00:00+00', '2020-10-14 00:00:00+00', 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('whatIfPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'What if... pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.355617+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('whyDidTheProjectFailPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Why did the project fail pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.357785+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('processImprovementPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Process improvement post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.308884+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('resourceAllocationPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Resource allocation pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.312318+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('roseThornBudTemplate', '2024-10-21 20:54:28.757+00', true, 'Rose, Thorn, Bud 🌹', 'aGhostTeam', '2024-10-21 20:55:55.317994+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/roseThornBudTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('saMoLoTemplate', '2024-10-21 20:54:28.757+00', true, 'SaMoLo ⚖️', 'aGhostTeam', '2024-10-21 20:55:55.321127+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/saMoLoTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('scrumSprintPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Scrum sprint pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.323134+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('sixThinkingHatsTemplate', '2024-10-21 20:54:28.757+00', true, 'Six Thinking Hats 🎩', 'aGhostTeam', '2024-10-21 20:55:55.326714+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/sixThinkingHatsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('stakeholderConcernsPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Stakeholder concerns pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.330067+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('starfishTemplate', '2024-10-21 20:53:55.206+00', true, 'Starfish ⭐', 'aGhostTeam', '2024-10-21 20:55:55.332467+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/starfishTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('riskManagementPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Risk management post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.313892+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('sailboatTemplate', '2016-06-01 00:00:00+00', true, 'Sailboat', 'aGhostTeam', '2024-10-21 20:55:55.320037+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/sailboatTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('scrumRolesPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Scrum roles pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.321799+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('simplePostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Simple post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.325907+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('superheroRetrospectiveTemplate', '2024-10-21 20:54:28.757+00', true, 'Superhero Retrospective 🦸', 'aGhostTeam', '2024-10-21 20:55:55.336585+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/superheroRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('teamCharterTemplate', '2024-10-21 20:54:28.76+00', true, 'Team Charter', 'aGhostTeam', '2024-10-21 20:55:55.342607+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/teamCharterTemplate.png', NULL, NULL, 'strategy') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('uncertainWatersPremortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Uncertain waters pre-mortem', 'aGhostTeam', '2024-10-21 20:55:55.354756+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'premortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('workingStuckTemplate', '2016-06-01 00:00:00+00', true, 'Working & Stuck', 'aGhostTeam', '2024-10-21 20:55:55.361246+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/workingStuckTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('wRAPTemplate', '2024-10-21 20:54:28.757+00', true, 'WRAP 🧞', 'aGhostTeam', '2024-10-21 20:55:55.362229+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/wRAPTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('scrumValuesRetrospectiveTemplate', '2024-10-21 20:54:28.762+00', true, 'Scrum Values Retrospective', 'aGhostTeam', '2024-10-21 20:55:55.324309+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/scrumValuesRetrospectiveTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('softwareProjectPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Software project post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.328214+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('stakeholderSatisfactionPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Stakeholder satisfaction post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.331294+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('superheroPostmortemTemplate', '2024-10-21 20:55:10.872+00', true, 'Superhero post-mortem', 'aGhostTeam', '2024-10-21 20:55:55.335149+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', false, true, '/self-hosted/Organization/aGhostOrg/template/gladSadMadTemplate.png', NULL, NULL, 'postmortem') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('teamRetreatPlanningTemplate', '2024-10-21 20:54:28.757+00', true, 'Team Retreat Planning 🌴', 'aGhostTeam', '2024-10-21 20:55:55.346758+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/teamRetreatPlanningTemplate.png', NULL, NULL, 'strategy') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('threeLittlePigsTemplate', '2024-10-21 20:53:55.199+00', true, 'Three Little Pigs 🐷 🐷 🐷', 'aGhostTeam', '2024-10-21 20:55:55.350236+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/threeLittlePigsTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('whatWentWellTemplate', '2024-10-21 20:53:55.206+00', true, 'What Went Well', 'aGhostTeam', '2024-10-21 20:55:55.357194+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/whatWentWellTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;
INSERT INTO public."MeetingTemplate" VALUES ('winningStreakTemplate', '2024-10-21 20:53:55.199+00', true, 'Winning Streak 🏆', 'aGhostTeam', '2024-10-21 20:55:55.358568+00', 'PUBLIC', 'aGhostOrg', NULL, NULL, 'retrospective', true, true, '/self-hosted/Organization/aGhostOrg/template/winningStreakTemplate.png', NULL, NULL, 'retrospective') ON CONFLICT DO NOTHING;


--
-- TOC entry 4472 (class 0 OID 4219761)
-- Dependencies: 261
-- Data for Name: MeetingTemplateUserFavorite; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4473 (class 0 OID 4219764)
-- Dependencies: 262
-- Data for Name: NewFeature; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4475 (class 0 OID 4219770)
-- Dependencies: 264
-- Data for Name: NewMeeting; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4476 (class 0 OID 4219779)
-- Dependencies: 265
-- Data for Name: Notification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4477 (class 0 OID 4219786)
-- Dependencies: 266
-- Data for Name: Organization; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Organization" VALUES ('aGhostOrg', NULL, false, NULL, '2016-06-01 00:00:00+00', 'Parabol', 0, NULL, NULL, 'https://action-files.parabol.co/production/build/v5.10.1/42342faa774f05b7626fa91ff8374e59.svg', false, NULL, NULL, NULL, 'enterprise', NULL, NULL, NULL, NULL, '2016-06-01 00:00:00+00', '{}', true) ON CONFLICT DO NOTHING;


--
-- TOC entry 4478 (class 0 OID 4219798)
-- Dependencies: 267
-- Data for Name: OrganizationApprovedDomain; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4480 (class 0 OID 4219804)
-- Dependencies: 269
-- Data for Name: OrganizationUser; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."OrganizationUser" VALUES ('aGhostOrganizationUser', NULL, false, '2016-06-01 00:00:00+00', 'aGhostOrg', NULL, 'BILLING_LEADER', 'aGhostUser', 'enterprise', NULL) ON CONFLICT DO NOTHING;


--
-- TOC entry 4481 (class 0 OID 4219809)
-- Dependencies: 270
-- Data for Name: OrganizationUserAudit; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4483 (class 0 OID 4219813)
-- Dependencies: 272
-- Data for Name: PasswordResetRequest; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4485 (class 0 OID 4219821)
-- Dependencies: 274
-- Data for Name: Poll; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4486 (class 0 OID 4219828)
-- Dependencies: 275
-- Data for Name: PollOption; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4489 (class 0 OID 4219838)
-- Dependencies: 278
-- Data for Name: PushInvitation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4491 (class 0 OID 4219843)
-- Dependencies: 280
-- Data for Name: QueryMap; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4492 (class 0 OID 4219849)
-- Dependencies: 281
-- Data for Name: ReflectPrompt; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."ReflectPrompt" VALUES ('herosJourneyTemplate:cavernPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What challenges lie ahead?', '#DB70DB', '$', 'Cavern', 'aGhostTeam', 'herosJourneyTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('blindSpotPremortemTemplateInvisiblePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What hidden or unknown threats should we pre-empt?', '#8EC7F1', '"', '👻 Invisible', 'aGhostTeam', 'blindSpotPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('original4Template:learningsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What did we learn?', '#FFCC63', '"', 'Learnings 🎓 ', 'aGhostTeam', 'original4Template', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnDevelopmentTemplateOpportunitiesPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What areas would you like to see this colleague develop in? How could they be more helpful to you or the organization?', '#66BC8C', '$', 'Opportunities', 'aGhostTeam', '360ReviewFeedbackOnDevelopmentTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnProgressionTemplateQuestionsPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What questions do you have about this colleague’s roles, work, development, or performance in general?', '#FE975D', '$', 'Questions', 'aGhostTeam', '360ReviewFeedbackOnProgressionTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewOpenendedFeedbackTemplateValuesPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'Share examples of a company value this person has brought to life.', '#FE975D', '$', 'Values', 'aGhostTeam', '360ReviewOpenendedFeedbackTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('customerFeedbackAnalysisTemplateWhereDidOurCustomersGetStuckPrompt', '2024-10-21 20:55:18.197+00', '2024-10-21 20:55:18.197+00', NULL, 'Share verbatim comments and/or observations', '#ED4C86', '"', 'Where did our customers get stuck?', 'aGhostTeam', 'customerFeedbackAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnProgressionTemplateCollaborationPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What should this colleague stop, start, or continue doing when working alongside others?', '#ED4C86', '"', 'Collaboration', 'aGhostTeam', '360ReviewFeedbackOnProgressionTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewOpenendedFeedbackTemplateTrustPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What examples can you give that have helped or hurt you trust this colleague’s ability to assist you with your own work?', '#55C0CF', '!', 'Trust', 'aGhostTeam', '360ReviewOpenendedFeedbackTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewOpenendedFeedbackTemplateInFocusPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What appears to have this colleague’s attention over other efforts? Give some examples.', '#ED4C86', '"', 'In Focus', 'aGhostTeam', '360ReviewOpenendedFeedbackTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('aChristmasCarolRetrospectiveTemplate:christmasFuturePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are your personal or team aspirations for the year ahead?', '#FE975D', '#', 'Christmas Future ⭐ ', 'aGhostTeam', 'aChristmasCarolRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('agilePostmortemTemplateHowEffectiveWereOurCollaborationAndCommunicationPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess your team''s quality of teamwork, information sharing, and cooperation.', '#444258', '"', '🤝 How effective were our collaboration and communication?', 'aGhostTeam', 'agilePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnDevelopmentTemplateRemarkablePrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What does this colleague do that you find remarkable? What do you brag about them to other people?', '#A06BD6', '!', 'Remarkable', 'aGhostTeam', '360ReviewFeedbackOnDevelopmentTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewOpenendedFeedbackTemplateOutOfFocusPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What isn’t getting as much attention as perhaps it should?', '#66BC8C', '#', 'Out of Focus', 'aGhostTeam', '360ReviewOpenendedFeedbackTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('aChristmasCarolRetrospectiveTemplate:allIWantForChristmasIsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s your Christmas wish for the team? What would make your work easier or relieve a burden?', '#DB70DB', '$', 'All I want for Christmas is… 🎁', 'aGhostTeam', 'aChristmasCarolRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('agilePostmortemTemplateHowWellDidWeAdaptAndIterateThroughoutTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Evaluate your team''s ability to respond to changes and implement iterations during the project.', '#DB70DB', '!', '🔄 How well did we adapt and iterate throughout the project?', 'aGhostTeam', 'agilePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('bestworstCaseScenarioPremortemTemplateActionsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What actions can we take to transform the worst-case scenario into the best-case scenario? Develop strategic plans and contingencies to turn challenges into opportunities.', '#66BC8C', '#', '⛳ Actions', 'aGhostTeam', 'bestworstCaseScenarioPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('blamelessPostmortemTemplateWhatCanWeLearnFromTheseSituationsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Reflect on the issues from a blameless perspective, emphasizing the lessons learned rather than assigning fault.', '#DB70DB', '"', '🌱 What can we learn from these situations?', 'aGhostTeam', 'blamelessPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('safariPremortemTemplateGiraffePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What risks can we see from a long way off and pre-empt now?', '#FE975D', '!', '🦒 Giraffe', 'aGhostTeam', 'safariPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnDevelopmentTemplateObstaclesPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What do you see getting in this colleague’s way?', '#55C0CF', '"', 'Obstacles', 'aGhostTeam', '360ReviewFeedbackOnDevelopmentTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnDevelopmentTemplateChallengesPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'Assume you’re working with this colleague for the next 10 years. What behavior isn’t a big deal now, but will get challenging over that time?', '#ED4C86', '#', 'Challenges', 'aGhostTeam', '360ReviewFeedbackOnDevelopmentTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnProgressionTemplateRolesSkillsPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What should this colleague do more of or less of to grow professionally or better the company?', '#55C0CF', '!', 'Roles & Skills', 'aGhostTeam', '360ReviewFeedbackOnProgressionTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewFeedbackOnProgressionTemplatePeopleMattersPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'How has this colleague best helped develop others around them? How can they do better? What should they stop?', '#66BC8C', '#', 'People Matters', 'aGhostTeam', '360ReviewFeedbackOnProgressionTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('360ReviewOpenendedFeedbackTemplateQuestionsPrompt', '2024-10-21 20:55:18.539+00', '2024-10-21 20:55:18.539+00', NULL, 'What questions might you have about the work of the role(s) this colleague performs?', '#A06BD6', '%', 'Questions', 'aGhostTeam', '360ReviewOpenendedFeedbackTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('aChristmasCarolRetrospectiveTemplate:christmasPresentPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are you grateful for? Who has helped you? What processes, skills, or tools make work better? Share some kudos!', '#8EC7F1', '"', 'Christmas Present 🎄', 'aGhostTeam', 'aChristmasCarolRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('communicationRisksPremortemTemplateMisunderstandingsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What potential misunderstandings or misconceptions could cause problems?', '#FFCC63', '$', '🤯 Misunderstandings', 'aGhostTeam', 'communicationRisksPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('aChristmasCarolRetrospectiveTemplate:christmasPastPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s your biggest regret about the year? What do you wish you could have changed?', '#7272E5', '!', 'Christmas Past 👻', 'aGhostTeam', 'aChristmasCarolRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('agilePostmortemTemplateWhatAgilePrinciplesCanWeImproveUponForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Find areas where your team can strengthen their application of Agile methodologies.', '#66BC8C', '#', '🎯 What Agile principles can we improve upon for future projects?', 'aGhostTeam', 'agilePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('alwaysBeLearningRetrospectiveTemplate:thingsILearnedPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What have you learned as an individual or a team in the last period?', '#444258', '!', 'Things I learned 🎓', 'aGhostTeam', 'alwaysBeLearningRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('bestworstCaseScenarioPremortemTemplateBestCaseScenarioPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What does the best case scenario look like? Imagine your project''s ultimate success and the milestones that lead to it.', '#444258', '"', '🙌 Best case scenario', 'aGhostTeam', 'bestworstCaseScenarioPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('blamelessPostmortemTemplateWhatChallengesAroseDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Describe the difficulties encountered, focusing on the situation and the impact, not on individuals or their actions.', '#FE975D', '!', '📉 What challenges arose during the project?', 'aGhostTeam', 'blamelessPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('budgetReviewPostmortemTemplateWhereCanWeMakeAdjustmentsForBetterBudgetAllocationPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Determine opportunities to optimize spending and allocate resources more effectively.', '#7272E5', '#', '💼 Where can we make adjustments for better budget allocation?', 'aGhostTeam', 'budgetReviewPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('communicationRisksPremortemTemplateExternalCommunicationPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What communication issues might arise with stakeholders or clients?', '#66BC8C', '"', '💬 External communication', 'aGhostTeam', 'communicationRisksPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('controlRangePostmortemTemplateWhatWasBeyondOurControlPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Recognize external forces affecting the project but outside your team''s influence.', '#FE975D', '"', '🌪️ What was beyond our control?', 'aGhostTeam', 'controlRangePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('customerFeedbackAnalysisTemplateWhatsMissingForOurCustomersPrompt', '2024-10-21 20:55:18.197+00', '2024-10-21 20:55:18.197+00', NULL, 'Share verbatim comments and/or observations', '#A06BD6', '#', 'What’s missing for our customers?', 'aGhostTeam', 'customerFeedbackAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('diwaliRetrospectiveTemplate:diyasPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we need to guide us forward or help us find our way?', '#66BC8C', '!', 'Diyas', 'aGhostTeam', 'diwaliRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('dreamTeamRetrospectiveTemplate:practicesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What habits, practises, or processes helped the team work well together?', '#FD6157', '!', 'Practices ⚙️', 'aGhostTeam', 'dreamTeamRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('keepPrompt', '2024-10-21 20:54:29.205+00', '2024-10-21 20:54:29.205+00', NULL, 'What should we continue doing?', '#D9D916', '#', 'Keep', 'aGhostTeam', 'dropAddKeepImproveDAKITemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('easterRetrospectiveTemplateSeedsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What new processes would we like to cultivate? Is there something that faded away that we should bring back?', '#FE975D', '"', 'Seeds', 'aGhostTeam', 'easterRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptFullyCharged', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What energized you?', '#52CC52', '!', 'Fully Charged', 'aGhostTeam', 'energyLevelsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('engineeringPostmortemTemplateHowWellDidWeExecuteTheProjectAndOvercomeTechnicalChallengesPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess your team''s ability to manage the project and tackle technical obstacles.', '#8EC7F1', '"', '🔨 How well did we execute the project and overcome technical challenges?', 'aGhostTeam', 'engineeringPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('featureLaunchPostmortemTemplateWhatAspectsDidCustomersAppreciateTheMostPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Highlight the strengths and successful elements of the project from the customers'' perspective.', '#444258', '#', '🏆️ What aspects did customers appreciate the most?', 'aGhostTeam', 'featureLaunchPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('fortuneTellerPremortemTemplateCrystalBallPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What potential issues do we foresee arising during the project?', '#66BC8C', '!', '🔮 Crystal ball', 'aGhostTeam', 'fortuneTellerPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatLearn', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What did you learn?', '#5CA0E5', '"', 'Learned', 'aGhostTeam', 'fourLsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('gameShowPostmortemTemplateWhatWereTheKeyRoundsOfOurProjectGameShowPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Break down the project into distinct stages.', '#66BC8C', '!', '🎮 What were the key "rounds" of our project game show?', 'aGhostTeam', 'gameShowPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatHappy', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What are you happy about?', '#52CC52', '!', 'Glad', 'aGhostTeam', 'gladSadMadTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('glassHalfemptyPremortemTemplateGlassHalfFullPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What do we expect to go well?', '#7272E5', '!', '⏳ Glass half full', 'aGhostTeam', 'glassHalfemptyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('halloweenRetrospectiveTemplate:ghostsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Boo! What projects or issues caught us by surprise?', '#8EC7F1', '!', 'Ghosts 👻', 'aGhostTeam', 'halloweenRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('handsOnDeckActivityTemplate:navigatorPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are the things you want to avoid, either as a team or in your specific role?', '#7272E5', '#', 'Navigator 🧭', 'aGhostTeam', 'handsOnDeckActivityTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('heardSeenRespectedHSRTemplateHeardPrompt', '2024-10-21 20:54:28.766+00', '2024-10-21 20:54:28.766+00', NULL, 'Think about times or forums in which you felt your voice was not heard. What happened? How did it feel?', '#7340B5', '!', 'Heard', 'aGhostTeam', 'heardSeenRespectedHSRTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('herosJourneyTemplate:heroPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are the attitudes and characteristics that make our team heroic?', '#7272E5', '!', 'Hero', 'aGhostTeam', 'herosJourneyTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('highlightsLowlightsTemplate:highlightsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What was great or exceeded expectations?', '#FE975D', '!', 'Highlights 🙌 ', 'aGhostTeam', 'highlightsLowlightsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('holiRetrospectiveTemplateDancePrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What big wins make us want to dance? What moves or actions should we try next?', '#FFCC63', '#', 'Dance', 'aGhostTeam', 'holiRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hopesAndFearsTemplate:hopesPrompt-2', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do you hope for in the next period?', '#66BC8C', '!', 'Hopes 🙏', 'aGhostTeam', 'hopesAndFearsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hotAirBalloonTemplate:sandbagsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking back, what practices or processes are dragging us down, making us slow, or demoralizing us?', '#66BC8C', '"', 'Sandbags', 'aGhostTeam', 'hotAirBalloonTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('howLikelyToFailPremortemTemplateSomewhatLikelyPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues are we likely to face?', '#8EC7F1', '"', '🤔 Somewhat likely', 'aGhostTeam', 'howLikelyToFailPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iguanaCrocodileKomodoDragonPremortemTemplateCrocodilePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What significant and foreseeable threats does this project face?', '#FD6157', '"', '🐊 Crocodile', 'aGhostTeam', 'iguanaCrocodileKomodoDragonPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentImpactPostmortemTemplateWhatWasTheImpactOfTheIncidentPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'List the incidents that took place during the project and discuss their effects.', '#FFCC63', '!', '🔍 What was the impact of the incident?', 'aGhostTeam', 'incidentImpactPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('alwaysBeLearningRetrospectiveTemplate:thingsIWantToLearnPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are the priority things you want to learn as an individual or as a team in the next period?', '#66BC8C', '"', 'Things I want to learn 🧠', 'aGhostTeam', 'alwaysBeLearningRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('bestworstCaseScenarioPremortemTemplateWorstCaseScenarioPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What does the worst case scenario look like? Consider the most significant setbacks and obstacles your project could face.', '#DB70DB', '!', '🤦 Worst case scenario', 'aGhostTeam', 'bestworstCaseScenarioPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('diwaliRetrospectiveTemplate:ravanaPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What demons, projects, or problems are cursing us?', '#7272E5', '$', 'Ravana', 'aGhostTeam', 'diwaliRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('blamelessPostmortemTemplateWhatChangesCanWeMakeToPreventTheseIssuesInTheFuturePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Suggest improvements or preventive measures, keeping in mind the goal is to improve the process, not to blame people.', '#444258', '#', '🔧 What changes can we make to prevent these issues in the future?', 'aGhostTeam', 'blamelessPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('blindSpotPremortemTemplateVisiblePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What obvious threats should we mitigate?', '#7272E5', '!', '👁️ Visible', 'aGhostTeam', 'blindSpotPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('budgetReviewPostmortemTemplateWhatWereTheMajorCostDriversPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify factors that most impacted your project''s financial performance.', '#FFCC63', '"', '📊 What were the major cost drivers?', 'aGhostTeam', 'budgetReviewPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('communicationRisksPremortemTemplateInformationFlowPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues might hinder the flow of information between team members or stakeholders?', '#FD6157', '#', '📩 Information flow', 'aGhostTeam', 'communicationRisksPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('controlRangePostmortemTemplateWhatCanWeImproveInOurControlRangePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Determine areas within your control to adjust for future projects.', '#DB70DB', '#', '📈 What can we improve in our control range?', 'aGhostTeam', 'controlRangePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('diwaliRetrospectiveTemplate:rangoliPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What practices or processes are bringing positivity?', '#FD6157', '"', 'Rangoli', 'aGhostTeam', 'diwaliRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('improvePrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What should we improve or revise?', '#7373E5', '$', 'Improve', 'aGhostTeam', 'dropAddKeepImproveDAKITemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('easterRetrospectiveTemplateEasterEggsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What was hidden from sight or caught you by surprise? What did you learn or find out?', '#8EC7F1', '!', 'Easter Eggs', 'aGhostTeam', 'easterRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('featureLaunchPostmortemTemplateWhatChangesCanWeMakeBasedOnCustomerFeedbackPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Think of ways to address customer concerns and enhance your products or services.', '#66BC8C', '$', '🔄 What changes can we make based on customer feedback?', 'aGhostTeam', 'featureLaunchPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('fortuneTellerPremortemTemplateStarsAlignPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'How might these issues impact our project''s success or failure?', '#FD6157', '"', '🌟 Stars align', 'aGhostTeam', 'fortuneTellerPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatMissing', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What was missing?', '#E59545', '#', 'Lacked', 'aGhostTeam', 'fourLsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('gameShowPostmortemTemplateHowDidEachContestantContributeToTheGameShowsFinalePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Discuss each individual''s roles and actions.', '#FFCC63', '#', '🎉 How did each contestant contribute to the game show''s finale?', 'aGhostTeam', 'gameShowPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatImproved', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What could be improved?', '#D9D916', '"', 'Sad', 'aGhostTeam', 'gladSadMadTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('halloweenRetrospectiveTemplate:brainsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What did we learn? What do we need to learn?', '#DB70DB', '#', 'Brains 🧠', 'aGhostTeam', 'halloweenRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('handsOnDeckActivityTemplate:firstMatePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do you want to support closely? What work do you want to have a clear say in?', '#FFCC63', '"', 'First Mate ✋', 'aGhostTeam', 'handsOnDeckActivityTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('heardSeenRespectedHSRTemplateRespectedPrompt', '2024-10-21 20:54:28.766+00', '2024-10-21 20:54:28.766+00', NULL, 'Think about times or forums in which you felt you, your boundaries, or your contributions were not respected. What happened? How did it feel?', '#61B1EB', '#', 'Respected', 'aGhostTeam', 'heardSeenRespectedHSRTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('herosJourneyTemplate:guidePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What guidance or help do you need to be successful?', '#8EC7F1', '"', 'Guide', 'aGhostTeam', 'herosJourneyTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('holiRetrospectiveTemplateSweetsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'Who deserves something sweet, kudos, or a word of thanks?', '#7272E5', '$', 'Sweets', 'aGhostTeam', 'holiRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hotAirBalloonTemplate:stormCloudsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking ahead, what difficult or tricky things are in store for our team? What things could throw us off course or be dangerous?', '#FD6157', '#', 'Storm Clouds', 'aGhostTeam', 'hotAirBalloonTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('howLikelyToFailPremortemTemplatePossiblePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues could we possibly face?', '#FE975D', '#', '🤷 Possible', 'aGhostTeam', 'howLikelyToFailPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iguanaCrocodileKomodoDragonPremortemTemplateIguanaPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What minor issues can we quickly and easily resolve now?', '#66BC8C', '!', '🦎 Iguana', 'aGhostTeam', 'iguanaCrocodileKomodoDragonPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentImpactPostmortemTemplateWhatLessonsHaveWeLearnedFromThisIncidentPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Determine the key takeaways from each incident.', '#8EC7F1', '#', '💡 What lessons have we learned from this incident?', 'aGhostTeam', 'incidentImpactPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentResponsePostmortemTemplateWhatWasOurIncidentResponseStrategyAndHowWellDidItWorkPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Review your team''s actions and decisions in handling incidents.', '#DB70DB', '!', '⚠️ What was our incident response strategy, and how well did it work?', 'aGhostTeam', 'incidentResponsePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('midsummerRetrospectiveTemplateStrawberryCakePrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'Who deserves some kudos or a word of thanks?', '#7272E5', '$', 'Strawberry Cake', 'aGhostTeam', 'midsummerRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptRopes', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What helped us reach our goal?', '#52CC52', '!', 'Ropes 🧗', 'aGhostTeam', 'mountainClimberTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('movieDirectorPostmortemTemplate2WhatIngredientsDoWeNeedForABlockbusterSequelPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Reflect on elements that could make future projects even more successful.', '#444258', '$', '2️⃣ What ingredients do we need for a blockbuster sequel?', 'aGhostTeam', 'movieDirectorPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('newYearRetrospectiveTemplate:growthWisdomPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking back, how did you grow and what did you learn as an individual or as a team?', '#66BC8C', '!', 'Growth & Wisdom 🌱 ', 'aGhostTeam', 'newYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('obstacleCoursePremortemTemplateTwistsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What unexpected changes or surprises might require quick thinking and flexibility?', '#FE975D', '#', '🌪️ Twists', 'aGhostTeam', 'obstacleCoursePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postincidentReviewTemplateWhatCanWeLearnFromTheseIncidentsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Reflect on the lessons these incidents provided.', '#8EC7F1', '#', '🔍 What can we learn from these incidents?', 'aGhostTeam', 'postincidentReviewTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sWOTAnalysisTemplate:opportunitiesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Where can we improve or what can we take advantage of?', '#444258', '#', 'Opportunities', 'aGhostTeam', 'sWOTAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('budgetReviewPostmortemTemplateHowDidOurActualSpendingCompareToTheInitialBudgetPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Compare your project''s financial performance against the planned budget.', '#FD6157', '!', '💰 How did our actual spending compare to the initial budget?', 'aGhostTeam', 'budgetReviewPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('communicationRisksPremortemTemplateInternalCommunicationPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What communication issues might arise within the team?', '#444258', '!', '📣 Internal communication', 'aGhostTeam', 'communicationRisksPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('dreamTeamRetrospectiveTemplate:valuesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What values and teamwork principles make us successful', '#FFCC63', '"', 'Values 💜', 'aGhostTeam', 'dreamTeamRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('addPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What should we try or adopt?', '#E55C5C', '"', 'Add', 'aGhostTeam', 'dropAddKeepImproveDAKITemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('easterRetrospectiveTemplateChocolatePrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'Who deserves some kudos or a word of thanks?', '#444258', '$', 'Chocolate', 'aGhostTeam', 'easterRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptLowBattery', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What depleted you?', '#E55C5C', '"', 'Low Battery', 'aGhostTeam', 'energyLevelsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('engineeringPostmortemTemplateWhatNuggetsOfWisdomCanWeMineForFutureEngineeringProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify best practices, areas for improvement, and other insights to optimize future engineering projects.', '#FE975D', '#', '🤓 What nuggets of wisdom can we mine for future engineering projects?', 'aGhostTeam', 'engineeringPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('excitedAndWorriedPremortemTemplateWhatAreYouExcitedAboutPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, '', '#DB70DB', '!', '🤩 What are you excited about?', 'aGhostTeam', 'excitedAndWorriedPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('featureLaunchPostmortemTemplateWhatFeedbackDidWeReceiveFromCustomersPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Collect and categorize customer feedback from various channels.', '#FE975D', '!', '📣 What feedback did we receive from customers?', 'aGhostTeam', 'featureLaunchPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatHappen', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What did you want to happen?', '#AC73E5', '$', 'Longed for', 'aGhostTeam', 'fourLsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('gameShowPostmortemTemplateWhatWereTheWinsAndLossesDuringEachRoundPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify successes and challenges at each stage.', '#FD6157', '"', '🏆 What were the wins and losses during each round?', 'aGhostTeam', 'gameShowPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('halloweenRetrospectiveTemplate:candyPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Who deserves candy? What went well? Who do you want to give kudos to?', '#444258', '$', 'Candy 🍬', 'aGhostTeam', 'halloweenRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('handsOnDeckActivityTemplate:captainPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What things do you see yourself leading on? What things do you want to lead the team on? What do you want to take responsibility for?', '#FD6157', '!', 'Captain 🧑‍✈️', 'aGhostTeam', 'handsOnDeckActivityTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('highlightsLowlightsTemplate:kudosPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Who helped you or deserves some appreciation?', '#444258', '#', 'Kudos ❤️', 'aGhostTeam', 'highlightsLowlightsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('holiRetrospectiveTemplateColorsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What color represents our recent work? Why?', '#66BC8C', '!', 'Colors', 'aGhostTeam', 'holiRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hotAirBalloonTemplate:clearSkiesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking ahead, how could we avoid or manage threats and challenges? How could we push through them to reach clearer skies?', '#FFCC63', '$', 'Clear Skies', 'aGhostTeam', 'hotAirBalloonTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('howLikelyToFailPremortemTemplateHighlyLikelyPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues are we highly likely to face?', '#7272E5', '!', '💯 Highly likely', 'aGhostTeam', 'howLikelyToFailPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iguanaCrocodileKomodoDragonPremortemTemplateKomodoDragonPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What big, scary, and unpredictable challenges might we encounter?', '#FFCC63', '#', '🐉 Komodo Dragon', 'aGhostTeam', 'iguanaCrocodileKomodoDragonPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentImpactPostmortemTemplateWhatWasTheRootCausePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify the underlying causes of each incident.', '#7272E5', '"', '🌳 What was the root cause?', 'aGhostTeam', 'incidentImpactPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentResponsePostmortemTemplateWhatImprovementsCanWeMakeToOurIncidentResponseForFutureProjectsPro', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Develop strategies to improve your team''s incident readiness.', '#FD6157', '$', '📈 What improvements can we make to our incident response for future projects?', 'aGhostTeam', 'incidentResponsePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iTProjectPostmortemTemplateWhatGapsOrChallengesDidWeFaceInOurITInfrastructurePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Recognize any technology-related issues or shortcomings.', '#DB70DB', '"', '🔧 What gaps or challenges did we face in our IT infrastructure?', 'aGhostTeam', 'iTProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('keepProblemTryTemplate:problemPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s not going well?', '#66BC8C', '"', 'Problem', 'aGhostTeam', 'keepProblemTryTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('toDiscussPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What should we talk about? We''ll group related items into topics and vote on them to decide what to chat about', '#45E5E5', '!', 'To Discuss', 'aGhostTeam', 'leanCoffeeTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('lunarNewYearRetrospectiveTemplateHongbaoPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'Who deserves a red envelope with kudos and some words of appreciation?', '#8EC7F1', '!', 'Hongbao 🧧', 'aGhostTeam', 'lunarNewYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('madScientistPremortemTemplateInnovativeSolutionsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'How can we invent creative strategies to counter these threats?', '#7272E5', '#', '💡 Innovative solutions', 'aGhostTeam', 'madScientistPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('marieKondoRetrospectiveTemplate:whatSparksJoyPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What processes, tools, and skills are serving you well?', '#DB70DB', '!', 'What Sparks Joy?', 'aGhostTeam', 'marieKondoRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('midsummerRetrospectiveTemplateSchnappsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What’s been hard to swallow, admit, or realize about our work?', '#FD6157', '"', 'Schnapps', 'aGhostTeam', 'midsummerRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWeather', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'How did we feel about our work?', '#5CA0E5', '#', 'Weather 🌡️', 'aGhostTeam', 'mountainClimberTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('movieDirectorPostmortemTemplateHowDidEachCastMemberContributeToThePlotPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Discuss each team member''s roles and actions.', '#FE975D', '"', '🎥 How did each cast member contribute to the plot?', 'aGhostTeam', 'movieDirectorPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('newYearRetrospectiveTemplate:greatestHitsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking back, what were your or the team’s greatest accomplishments', '#FD6157', '"', 'Greatest Hits 🏆', 'aGhostTeam', 'newYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('obstacleCoursePremortemTemplatePitfallsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What hidden traps or pitfalls could cause setbacks, delays, or negative impacts on the project?', '#8EC7F1', '"', '🕳️ Pitfalls', 'aGhostTeam', 'obstacleCoursePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('original4Template:improvementsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What should we do differently next time?', '#7272E5', '#', 'Improvements ♻️ ', 'aGhostTeam', 'original4Template', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('controlRangePostmortemTemplateWhatWasWithinOurControlPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify factors your team could influence or manage.', '#8EC7F1', '!', '🎛️ What was within our control?', 'aGhostTeam', 'controlRangePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('customerFeedbackAnalysisTemplateWhatsWorkingForOurCustomersPrompt', '2024-10-21 20:55:18.197+00', '2024-10-21 20:55:18.197+00', NULL, 'Share verbatim comments and/or observations', '#55C0CF', '!', 'What’s working for our customers?', 'aGhostTeam', 'customerFeedbackAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('diwaliRetrospectiveTemplate:lakshmiPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we need to tidy or clean up? What processes or backlog items need purifying?', '#FFCC63', '#', 'Lakshmi', 'aGhostTeam', 'diwaliRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('saMoLoTemplate:lessOfPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we want to do less of?', '#8EC7F1', '#', 'Less of', 'aGhostTeam', 'saMoLoTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('dreamTeamRetrospectiveTemplate:absencePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What practices, processes or skills weren’t present in the team?', '#7272E5', '#', 'Absence 🤔', 'aGhostTeam', 'dreamTeamRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('dropPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What should we stop?', '#52CC52', '!', 'Drop', 'aGhostTeam', 'dropAddKeepImproveDAKITemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('easterRetrospectiveTemplateHopePrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What did you hope for? What are you hoping for next?', '#DB70DB', '#', 'Hope', 'aGhostTeam', 'easterRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptSprintEnergy', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What''s your energy level going into the next Sprint?', '#7373E5', '#', 'Sprint Energy', 'aGhostTeam', 'energyLevelsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('engineeringPostmortemTemplateDidOurProjectDesignAndPlanningMeetExpectationsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess how your project''s design and planning helped meet your engineering goals.', '#7272E5', '!', '📐 Did our project design and planning meet expectations?', 'aGhostTeam', 'engineeringPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('excitedAndWorriedPremortemTemplateWhatAreYouWorriedAboutPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, '', '#444258', '"', '😨 What are you worried about?', 'aGhostTeam', 'excitedAndWorriedPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('featureLaunchPostmortemTemplateWhatWereTheMostCommonCustomerPainPointsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify recurring issues and areas of dissatisfaction.', '#DB70DB', '"', '🎯 What were the most common customer pain points?', 'aGhostTeam', 'featureLaunchPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('fortuneTellerPremortemTemplateChangingFatePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What actions can we take now to alter the course of our project for the better?', '#FFCC63', '#', '✨ Changing fate', 'aGhostTeam', 'fortuneTellerPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatWell', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What went well?', '#52CC52', '!', 'Liked', 'aGhostTeam', 'fourLsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('gameShowPostmortemTemplateWhatGameRulesShouldWeModifyForTheNextSeasonPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Consider changes that could improve the process for future projects.', '#7272E5', '$', '🕹️ What game rules should we modify for the next season?', 'aGhostTeam', 'gameShowPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatAngry', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What are you angry or disappointed about?', '#E55C5C', '#', 'Mad', 'aGhostTeam', 'gladSadMadTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('glassHalfemptyPremortemTemplateGlassHalfEmptyPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What do we worry will go wrong?', '#8EC7F1', '"', '⌛ Glass half empty', 'aGhostTeam', 'glassHalfemptyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('halloweenRetrospectiveTemplate:zombiesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What feels slow? What are we dragging our feet on?', '#FE975D', '"', 'Zombies 🧟', 'aGhostTeam', 'halloweenRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('handsOnDeckActivityTemplate:deckScrubberPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are you happy to help out with, but would rather take a back seat on?', '#8EC7F1', '$', 'Deck Scrubber 🧼', 'aGhostTeam', 'handsOnDeckActivityTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('heardSeenRespectedHSRTemplateSeenPrompt', '2024-10-21 20:54:28.766+00', '2024-10-21 20:54:28.766+00', NULL, 'Think about times or forums in which you felt you were not seen or your efforts were not recognized. What happened? How did it feel?', '#F23B31', '"', 'Seen', 'aGhostTeam', 'heardSeenRespectedHSRTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('herosJourneyTemplate:treasurePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s your team’s end goal? What does success look like?', '#FE975D', '#', 'Treasure', 'aGhostTeam', 'herosJourneyTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('highlightsLowlightsTemplate:lowlightsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What didn’t go well or made us feel down?', '#DB70DB', '"', 'Lowlights 😫 ', 'aGhostTeam', 'highlightsLowlightsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('holiRetrospectiveTemplateMusicPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'Are we all dancing to the same rhythm? Where were we in sync? When did we fall out of sync?', '#FD6157', '"', 'Music', 'aGhostTeam', 'holiRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hopesAndFearsTemplate:fearsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are you worried about for the next period?', '#FD6157', '"', 'Fears 🧟 ', 'aGhostTeam', 'hopesAndFearsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('hotAirBalloonTemplate:hotAirPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking back, what practices or processes elevate our team and help us reach great new heights?', '#444258', '!', 'Hot Air', 'aGhostTeam', 'hotAirBalloonTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentImpactPostmortemTemplateWhatChangesCanWeMakeToPreventSimilarIncidentsInTheFuturePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Create plans to minimize the chances of recurrence.', '#FE975D', '$', '🔧 What changes can we make to prevent similar incidents in the future?', 'aGhostTeam', 'incidentImpactPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentResponsePostmortemTemplateWereOurIncidentResponsePlansAndProceduresEffectivePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Evaluate the usefulness of existing approaches and protocols.', '#66BC8C', '#', '🚨 Were our incident response plans and procedures effective?', 'aGhostTeam', 'incidentResponsePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iTProjectPostmortemTemplateHowCanWeEnhanceOurTechnologyStackForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Formulate strategies to upgrade your IT infrastructure and tools, considering the insights from this post-mortem.', '#444258', '#', '📈 How can we enhance our technology stack for future projects?', 'aGhostTeam', 'iTProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('keepProblemTryTemplate:keepPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What should we continue doing?', '#444258', '!', 'Keep', 'aGhostTeam', 'keepProblemTryTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('lunarNewYearRetrospectiveTemplateFirecrackerPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What caught us by surprise or gave us a fright?', '#DB70DB', '#', 'Firecracker 🧨', 'aGhostTeam', 'lunarNewYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('madScientistPremortemTemplateFreakAccidentsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What surprising challenges could throw our project off course?', '#FFCC63', '"', '🧪 Freak accidents', 'aGhostTeam', 'madScientistPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('marieKondoRetrospectiveTemplate:thankYouAndGoodbyePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do you want to stop doing, having, or using, or just stop from happening?', '#444258', '"', 'Thank you and Goodbye', 'aGhostTeam', 'marieKondoRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('midsummerRetrospectiveTemplateLongestDayPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What feels like it took too long or was never-ending?', '#FFCC63', '#', 'Longest Day', 'aGhostTeam', 'midsummerRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptBoulders', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What stood in our way?', '#AC73E5', '"', 'Boulders ⛰️', 'aGhostTeam', 'mountainClimberTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('movieDirectorPostmortemTemplateWhatWasThePlotOfOurProjectMoviePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Narrate the project''s journey, including pivotal events and plot twists.', '#8EC7F1', '!', '🎬 What was the plot of our project movie?', 'aGhostTeam', 'movieDirectorPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamCharterTemplateValuesPrompt', '2024-10-21 20:54:28.76+00', '2024-10-21 20:54:28.76+00', NULL, 'What values guide our work together and with others?', '#FD6157', '"', 'Values', 'aGhostTeam', 'teamCharterTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('incidentResponsePostmortemTemplateWhichAspectsOfOurResponseWereMostEffectiveAndWhichWereLessSuccessf', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify areas where your team excelled and those needing improvement.', '#444258', '"', '⛑️ Which aspects of our response were most effective, and which were less successful?', 'aGhostTeam', 'incidentResponsePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('iTProjectPostmortemTemplateWhichTechnologyToolsAndPlatformsWereMostBeneficialDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify the most valuable and effective components of your technology stack.', '#FE975D', '!', '💻 Which technology tools and platforms were most beneficial during the project?', 'aGhostTeam', 'iTProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('keepProblemTryTemplate:tryPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s the smallest next step we could take to resolve our problems?', '#FD6157', '#', 'Try', 'aGhostTeam', 'keepProblemTryTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('lunarNewYearRetrospectiveTemplateCoupletsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What important messages should we remember for guidance?', '#FE975D', '"', 'Couplets 🎊 ', 'aGhostTeam', 'lunarNewYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('madScientistPremortemTemplateCrazyExperimentsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What wild and unexpected risks might we face?', '#FD6157', '!', '⚗️ Crazy experiments', 'aGhostTeam', 'madScientistPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('marieKondoRetrospectiveTemplate:thingsToUpcyclePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What could serve you well if it was changed or improved?', '#66BC8C', '#', 'Things to Upcycle', 'aGhostTeam', 'marieKondoRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('midsummerRetrospectiveTemplateWreathsPrompt', '2024-10-21 20:55:06.962+00', '2024-10-21 20:55:06.962+00', NULL, 'What processes and practices are binding us together and making us stronger?', '#66BC8C', '!', 'Wreaths', 'aGhostTeam', 'midsummerRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptFirstAid', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What more do we need to reach our goals?', '#E55C5C', '$', 'First Aid ⛑️', 'aGhostTeam', 'mountainClimberTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('movieDirectorPostmortemTemplateWhatWereTheClimaxesAndPlotHolesInOurProjectMoviePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify key victories and hurdles.', '#DB70DB', '#', '🏔️ What were the climaxes and plot holes in our project movie?', 'aGhostTeam', 'movieDirectorPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('obstacleCoursePremortemTemplateTeamworkPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'How can we best support each other and collaborate to overcome these challenges and reach our goals?', '#DB70DB', '$', '🎽 Teamwork', 'aGhostTeam', 'obstacleCoursePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('original4Template:winsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What did we do well, that we should discuss so we don’t forget?', '#FD6157', '!', 'Wins 🏆', 'aGhostTeam', 'original4Template', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postincidentReviewTemplateWhatPreventiveMeasuresCanWePutInPlaceForSimilarIncidentsInTheFuturePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Develop strategies to minimize recurrence and enhance future responses.', '#FE975D', '$', '🛠️ What preventive measures can we put in place for similar incidents in the future?', 'aGhostTeam', 'postincidentReviewTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postmortemAnalysisTemplateWhatWorkedWellAndWhatDidntPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Highlight successes and areas that need improvement.', '#66BC8C', '#', '👍️ What worked well and what didn''t?', 'aGhostTeam', 'postmortemAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('processImprovementPostmortemTemplateWhatInnovationsOrCreativeSolutionsEmergedDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify any inventive methods or ideas that proved beneficial.', '#FD6157', '#', '🔬 What innovations or creative solutions emerged during the project?', 'aGhostTeam', 'processImprovementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('questionsCommentsConcernsTemplate:concernsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What worries do you have about this proposal, decision, or idea?', '#FFCC63', '#', 'Concerns 🧐', 'aGhostTeam', 'questionsCommentsConcernsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('remoteWorkPostmortemTemplateWhatWorkedWellInOurRemoteWorkEnvironmentPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Highlight the positive aspects of your remote work dynamics.', '#66BC8C', '!', '🌍 What worked well in our remote work environment?', 'aGhostTeam', 'remoteWorkPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('resourceAllocationPremortemTemplateToolsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Are there any gaps in our toolset or technology stack that could impact the project?', '#FE975D', '$', '🛠️ Tools', 'aGhostTeam', 'resourceAllocationPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('riskManagementPostmortemTemplateHowEffectiveWereOurRiskManagementEffortsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess the success of your team''s risk mitigation strategies.', '#444258', '"', '📊 How effective were our risk management efforts?', 'aGhostTeam', 'riskManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('roseThornBudTemplate:budPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are our opportunities for growth and improvement?', '#444258', '#', 'Bud', 'aGhostTeam', 'roseThornBudTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumSprintPremortemTemplateSprintReviewPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues could affect our ability to showcase our progress to stakeholders?', '#DB70DB', '$', '🚀 Sprint review', 'aGhostTeam', 'scrumSprintPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumValuesRetrospectiveTemplateFocusPrompt', '2024-10-21 20:54:28.762+00', '2024-10-21 20:54:28.762+00', NULL, 'A Scrum Team''s primary focus is on the work of the Sprint to make the best possible progress toward the sprint goal. What''s helping us focus? When have we struggled to stay focused?', '#FD6157', '"', 'Focus', 'aGhostTeam', 'scrumValuesRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:blackHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What was bad about the last sprint?', '#1C1C2152', '$', 'Black Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('softwareProjectPostmortemTemplateHowSmoothlyDidOurDeploymentAndMaintenanceProceduresGoPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Review the efficiency and success of your software deployment and maintenance.', '#FFCC63', '#', '🚀 How smoothly did our deployment and maintenance procedures go?', 'aGhostTeam', 'softwareProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('speedCarTemplate:enginePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s helping us move faster?', '#66BC8C', '!', 'Engine', 'aGhostTeam', 'speedCarTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderConcernsPremortemTemplateTeamConcernsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What concerns might our team members have about the project?', '#8EC7F1', '"', '👩‍💼 Team concerns', 'aGhostTeam', 'stakeholderConcernsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderSatisfactionPostmortemTemplateHowEffectiveWasOurCommunicationWithStakeholdersPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Evaluate the clarity, frequency, and impact of your communications with stakeholders.', '#FFCC63', '"', '📣 How effective was our communication with stakeholders?', 'aGhostTeam', 'stakeholderSatisfactionPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('starfishTemplate:moreOfPrompt', '2024-10-21 20:54:29.27+00', '2024-10-21 20:54:29.27+00', NULL, 'What are we not taking enough advantage of?', '#45E5E5', '#', 'More Of ➕', 'aGhostTeam', 'starfishTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatAdopt', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What new behaviors should we adopt?', '#52CC52', '!', 'Start', 'aGhostTeam', 'startStopContinueTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroPostmortemTemplateWhatOpportunitiesLieAheadForEachSuperheroPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Discuss ways to further leverage each team member''s talents.', '#DB70DB', '#', '💪 What opportunities lie ahead for each superhero?', 'aGhostTeam', 'superheroPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroRetrospectiveTemplate:gadgetsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What people, tools, or processes are most helpful?', '#DB70DB', '"', 'Gadgets', 'aGhostTeam', 'superheroRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('surprisedWorriedInspiredTemplate:worriedPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are you anxious about?', '#7272E5', '"', 'Worried', 'aGhostTeam', 'surprisedWorriedInspiredTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('newYearRetrospectiveTemplate:resolutionsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Looking ahead, how can we improve? What things can we work on or commit to for the future.', '#FFCC63', '#', 'Resolutions 🗓️', 'aGhostTeam', 'newYearRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('obstacleCoursePremortemTemplateHurdlesPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What barriers might we encounter that require us to change course or adapt our approach?', '#7272E5', '!', '🚧 Hurdles', 'aGhostTeam', 'obstacleCoursePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('original4Template:questionsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What still puzzles us?', '#8EC7F1', '$', 'Questions ❓', 'aGhostTeam', 'original4Template', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postincidentReviewTemplateWhatWereTheRootCausesAndContributingFactorsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify the underlying causes and other elements that played a role in the problems you faced.', '#7272E5', '"', '🌳 What were the root causes and contributing factors?', 'aGhostTeam', 'postincidentReviewTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postmortemAnalysisTemplateWhatCanWeLearnAndApplyToFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Create actionable plans from the insights the other questions revealed.', '#FD6157', '$', '🗒️ What can we learn and apply to future projects?', 'aGhostTeam', 'postmortemAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('processImprovementPostmortemTemplateWhatProcessesCouldBeImprovedPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Pinpoint areas where your project''s procedures faced challenges or fell short.', '#66BC8C', '"', '⚠️ What processes could be improved?', 'aGhostTeam', 'processImprovementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('remoteWorkPostmortemTemplateWhatStepsCanWeTakeToMakeRemoteWorkMoreSeamlessPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Brainstorm ways to enhance remote collaboration and streamline communication.', '#7272E5', '$', '🌐 What steps can we take to make remote work more seamless?', 'aGhostTeam', 'remoteWorkPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('resourceAllocationPremortemTemplatePeoplePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Are we lacking any essential skills or expertise for the project?', '#FFCC63', '!', '💼 People', 'aGhostTeam', 'resourceAllocationPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('riskManagementPostmortemTemplateHowCanWeImproveRiskManagementForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Define actions and procedures to enhance your team''s ability to navigate uncertainties.', '#FD6157', '$', '🔮 How can we improve risk management for future projects?', 'aGhostTeam', 'riskManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('risksAndPrecautionsPremortemTemplateRisksPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What are the biggest risks we could face during the project?', '#FD6157', '!', '💥 Risks', 'aGhostTeam', 'risksAndPrecautionsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('roseThornBudTemplate:rosePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What went well? Which of our current practices or skills are strong?', '#FE975D', '!', 'Rose', 'aGhostTeam', 'roseThornBudTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('safariPremortemTemplateCheetahPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What issues are hidden in plain sight, ready to pounce on us?', '#444258', '#', '🐅 Cheetah', 'aGhostTeam', 'safariPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatRisks', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What risks may the team encounter ahead?', '#E55C5C', '#', 'Risks', 'aGhostTeam', 'sailboatTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('saMoLoTemplate:sameOfPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we want to keep doing?', '#FFCC63', '!', 'Same of', 'aGhostTeam', 'saMoLoTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumRolesPremortemTemplateProductOwnerPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might the Product Owner face in managing the product backlog and aligning with stakeholders?', '#FD6157', '#', '📚 Product Owner', 'aGhostTeam', 'scrumRolesPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumSprintPremortemTemplateProductBacklogPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges could arise in maintaining a healthy and prioritized backlog?', '#7272E5', '!', '🎯 Product backlog', 'aGhostTeam', 'scrumSprintPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumValuesRetrospectiveTemplateRespectPrompt', '2024-10-21 20:54:28.762+00', '2024-10-21 20:54:28.762+00', NULL, 'Scrum Team members respect each other to be capable, independent people, and are respected as such by the people with whom they work. What practices help us practice respect and build psychological safety? Are there cases when we have struggled with this?', '#7272E5', '$', 'Respect', 'aGhostTeam', 'scrumValuesRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('simplePostmortemTemplateWhatActionsCanWeTakeToAddressTheseImprovementsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Outline actions to boost future projects.', '#FE975D', '#', '📝 What actions can we take to address these improvements?', 'aGhostTeam', 'simplePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:blueHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we want to achieve in this session?', '#61B1EB', '!', 'Blue Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:redHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s your overall feeling about the previous sprint?', '#D5211A', '&', 'Red Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('softwareProjectPostmortemTemplateHowSuccessfulWereOurTestingAndQualityAssuranceEffortsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Evaluate the thoroughness and accuracy of your testing and QA processes.', '#FD6157', '"', '🔎 How successful were our testing and quality assurance efforts?', 'aGhostTeam', 'softwareProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('speedCarTemplate:parachutePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What’s slowing us down?', '#FD6157', '"', 'Parachute', 'aGhostTeam', 'speedCarTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderConcernsPremortemTemplateExecutiveConcernsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What concerns might our executives have about the project?', '#7272E5', '!', '🤵 Executive concerns', 'aGhostTeam', 'stakeholderConcernsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderSatisfactionPostmortemTemplateWhatStepsCanWeTakeToImproveStakeholderEngagementInFuturePro', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Develop approaches to strengthen stakeholder relationships, improve communication, and align project outcomes with stakeholder expectations.', '#8EC7F1', '$', '🎯 What steps can we take to improve stakeholder engagement in future projects?', 'aGhostTeam', 'stakeholderSatisfactionPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('keepDoingPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What behaviors are working and adding value?', '#7373E5', '!', 'Keep Doing 🌀', 'aGhostTeam', 'starfishTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postincidentReviewTemplateWhatIncidentsOrIssuesDisruptedOurFlowPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'List the incidents that took place.', '#FFCC63', '!', '🚩 What incidents or issues disrupted our flow?', 'aGhostTeam', 'postincidentReviewTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postmortemAnalysisTemplateWhatWereOurProjectsObjectivesAndDidWeAchieveThemPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Re-examine your project goals and evaluate your performance against them.', '#DB70DB', '!', '🎯 What were our project''s objectives, and did we achieve them?', 'aGhostTeam', 'postmortemAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('processImprovementPostmortemTemplateHowCanWeOptimizeOurWorkflowsForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Develop strategies to enhance processes and adopt or update best practices.', '#FFCC63', '$', '📝 How can we optimize our workflows for future projects?', 'aGhostTeam', 'processImprovementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('questionsCommentsConcernsTemplate:questionsPrompt-2', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What isn’t clear about this proposal, decision, or idea? What needs further explanation?', '#66BC8C', '!', 'Questions ❓', 'aGhostTeam', 'questionsCommentsConcernsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('remoteWorkPostmortemTemplateWhatSpecificRemoteWorkChallengesDidWeFacePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Pinpoint the unique obstacles that emerged due to the distributed work setup.', '#FFCC63', '#', '💻 What specific remote work challenges did we face?', 'aGhostTeam', 'remoteWorkPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('resourceAllocationPremortemTemplateTimePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Are there any time constraints or scheduling conflicts that could hinder the project?', '#7272E5', '"', '⏳ Time', 'aGhostTeam', 'resourceAllocationPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('riskManagementPostmortemTemplateWhatUnexpectedRisksOrChallengesEmergedPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Explore unforeseen risks and their impact on the project.', '#66BC8C', '#', '🚧 What unexpected risks or challenges emerged?', 'aGhostTeam', 'riskManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamCharterTemplateResponsibilitiesPrompt', '2024-10-21 20:54:28.76+00', '2024-10-21 20:54:28.76+00', NULL, 'What is our team responsible for?', '#7272E5', '$', 'Responsibilities', 'aGhostTeam', 'teamCharterTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('risksAndPrecautionsPremortemTemplatePrecautionsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What precautions should we take now to mitigate these risks?', '#FFCC63', '"', '⛑️ Precautions', 'aGhostTeam', 'risksAndPrecautionsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('roseThornBudTemplate:thornPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What challenges or difficulties did we run into?', '#DB70DB', '"', 'Thorn', 'aGhostTeam', 'roseThornBudTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('safariPremortemTemplateElephantPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What concerns you that nobody else is discussing?', '#DB70DB', '"', '🐘 Elephant', 'aGhostTeam', 'safariPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatSlowing', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What’s slowing the team down in your journey?', '#D9D916', '"', 'Anchors', 'aGhostTeam', 'sailboatTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('saMoLoTemplate:moreOfPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we want to do more of?', '#7272E5', '"', 'More of', 'aGhostTeam', 'saMoLoTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumRolesPremortemTemplateDevelopersPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might the developers face in executing the project?', '#66BC8C', '"', '👨‍💻 Developers', 'aGhostTeam', 'scrumRolesPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumSprintPremortemTemplateSprintPlanningPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What obstacles might we face in effectively planning and executing sprints?', '#8EC7F1', '"', '📊 Sprint planning', 'aGhostTeam', 'scrumSprintPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumValuesRetrospectiveTemplateCommitmentPrompt', '2024-10-21 20:54:28.762+00', '2024-10-21 20:54:28.762+00', NULL, 'Scrum Teams are committed to achieving their goals and to supporting each other. What are some examples of us doing this well? In what cases have we struggled or failed to be committed?', '#66BC8C', '!', 'Commitment', 'aGhostTeam', 'scrumValuesRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:greenHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What things could improve for our next sprint?', '#66BC8C', '%', 'Green Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('softwareProjectPostmortemTemplateHowDidOurDevelopmentProcessPerformDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess the effectiveness and efficiency of your software development process.', '#66BC8C', '!', '👩‍💻 How did our development process perform during the project?', 'aGhostTeam', 'softwareProjectPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderConcernsPremortemTemplateClientConcernsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What concerns might our clients have about the project?', '#FE975D', '#', '🤝 Client concerns', 'aGhostTeam', 'stakeholderConcernsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderSatisfactionPostmortemTemplateHowAlignedWereOurProjectOutcomesWithStakeholderExpectations', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess the alignment between your team''s deliverables and stakeholder expectations.', '#FD6157', '!', '🤝 How aligned were our project outcomes with stakeholder expectations?', 'aGhostTeam', 'stakeholderSatisfactionPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stopPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What isn''t adding value or helping the team?', '#E55C5C', '$', 'Stop ⏹️', 'aGhostTeam', 'starfishTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatCease', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What existing behaviors should we cease doing?', '#E55C5C', '"', 'Stop', 'aGhostTeam', 'startStopContinueTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('successAndFailurePremortemTemplateWhatDoesFailureLookLikePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Consider the potential obstacles and challenges that could derail the project.', '#DB70DB', '"', '🚧 What does failure look like?', 'aGhostTeam', 'successAndFailurePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroPostmortemTemplateWhatUniqueSuperpowersDoesEachTeamMemberPossessPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Discover the unique talents of each individual.', '#8EC7F1', '!', '🦸 What unique superpowers does each team member possess?', 'aGhostTeam', 'superheroPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroRetrospectiveTemplate:rolePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Where do you fit into the team? How do you see your role interacting with others?', '#66BC8C', '$', 'Role', 'aGhostTeam', 'superheroRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('surprisedWorriedInspiredTemplate:surprisedPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What caught you off guard, positively or negatively?', '#FFCC63', '!', 'Surprised', 'aGhostTeam', 'surprisedWorriedInspiredTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sWOTAnalysisTemplate:weaknessesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What needs more work?', '#DB70DB', '"', 'Weaknesses', 'aGhostTeam', 'sWOTAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamCharterTemplateAchievementsPrompt', '2024-10-21 20:54:28.76+00', '2024-10-21 20:54:28.76+00', NULL, 'What are we setting out to achieve together? What differentiates us? How do we measure success?', '#FFCC63', '#', 'Achievements', 'aGhostTeam', 'teamCharterTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamEfficiencyPremortemTemplateWhereCouldWeGetStuckPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Anticipate potential bottlenecks or obstacles that may stall the project.', '#66BC8C', '"', '🚧 Where could we get stuck?', 'aGhostTeam', 'teamEfficiencyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamPerformancePostmortemTemplateHowCanWeImproveCollaborationForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Determine areas for growth and develop strategies to enhance teamwork.', '#8EC7F1', '#', '🤝 How can we improve collaboration for future projects?', 'aGhostTeam', 'teamPerformancePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamRetreatPlanningTemplate:fearsPrompt-2', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What concerns do you have about the retreat? What are you worried about?', '#8EC7F1', '"', 'Fears 🧟', 'aGhostTeam', 'teamRetreatPlanningTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('thanksgivingRetrospectiveTemplate:leftOnTheTablePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do we wish we’d left behind, or should leave behind from now on?', '#DB70DB', '#', 'Left on the Table 🐌', 'aGhostTeam', 'thanksgivingRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('postmortemAnalysisTemplateWhatChallengesOrObstaclesDidWeFacePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify the challenges that shaped your project.', '#444258', '"', '📉 What challenges or obstacles did we face?', 'aGhostTeam', 'postmortemAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('processImprovementPostmortemTemplateWhatProcessesWorkedWellDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Find the successful aspects of your project''s workflows and methodologies.', '#444258', '!', '🔄 What processes worked well during the project?', 'aGhostTeam', 'processImprovementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('questionsCommentsConcernsTemplate:commentsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What reactions do you have to this proposal, decision, or idea?', '#FD6157', '"', 'Comments 💬', 'aGhostTeam', 'questionsCommentsConcernsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('remoteWorkPostmortemTemplateWhereDidOurDigitalCommunicationFallFlatPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify areas where remote communication could be improved.', '#FD6157', '"', '📞 Where did our digital communication fall flat?', 'aGhostTeam', 'remoteWorkPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('resourceAllocationPremortemTemplateBudgetPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Are there any budget limitations or financial risks that could impact the project?', '#8EC7F1', '#', '💰 Budget', 'aGhostTeam', 'resourceAllocationPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('riskManagementPostmortemTemplateWhatRisksDidWeIdentifyAndHowDidWeManageThemPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Review the identified risks and your team''s risk mitigation strategies.', '#DB70DB', '!', '🎲 What risks did we identify, and how did we manage them?', 'aGhostTeam', 'riskManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('safariPremortemTemplateMonkeyPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What early warning signs could indicate something is going wrong?', '#66BC8C', '$', '🐒 Monkey', 'aGhostTeam', 'safariPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatHelpGoal', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What’s helping the team reach its goals?', '#52CC52', '!', 'Wind in the sails', 'aGhostTeam', 'sailboatTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumRolesPremortemTemplateScrumMasterPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might the Scrum Master face in facilitating the project?', '#444258', '!', '🏃 Scrum Master', 'aGhostTeam', 'scrumRolesPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumSprintPremortemTemplateRetrospectivesPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges could impact the effectiveness of our retrospectives and continuous improvement efforts?', '#FE975D', '#', '🔄 Retrospectives', 'aGhostTeam', 'scrumSprintPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumValuesRetrospectiveTemplateOpennessPrompt', '2024-10-21 20:54:28.762+00', '2024-10-21 20:54:28.762+00', NULL, 'Scrum Teams are open about their work and the challenges they face. How could we improve transparency in our work? What practices are helping us be more open about our work?', '#FFCC63', '#', 'Openness', 'aGhostTeam', 'scrumValuesRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('simplePostmortemTemplateWhatCouldBeImprovedForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify the project’s challenges and issues.', '#8EC7F1', '"', '❌ What could be improved for future projects?', 'aGhostTeam', 'simplePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:yellowHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What was good about the last sprint?', '#FFCC63', '#', 'Yellow Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderConcernsPremortemTemplateCommunityConcernsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What concerns might the broader community have about the project?', '#DB70DB', '$', '🌐 Community concerns', 'aGhostTeam', 'stakeholderConcernsPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('stakeholderSatisfactionPostmortemTemplateWhatChallengesDidWeEncounterInManagingStakeholderExpectatio', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify any misunderstandings or disconnects that arose between the team and stakeholders.', '#7272E5', '#', '🚩 What challenges did we encounter in managing stakeholder expectations?', 'aGhostTeam', 'stakeholderSatisfactionPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('starfishTemplate:lessOfPrompt', '2024-10-21 20:54:29.27+00', '2024-10-21 20:54:29.27+00', NULL, 'What are we over-doing or doing too much of?', '#D9D916', '"', 'Less Of ➖', 'aGhostTeam', 'starfishTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroPostmortemTemplateHowCanWeBetterAlignOurSuperpowersWithProjectObjectivesPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Consider how to match individual strengths with specific project goals.', '#444258', '$', '🎯 How can we better align our superpowers with project objectives?', 'aGhostTeam', 'superheroPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroRetrospectiveTemplate:superpowerPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are your strongest skills?', '#FE975D', '!', 'Superpower', 'aGhostTeam', 'superheroRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sWOTAnalysisTemplate:threatsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What could be negative or dangerous to us?', '#66BC8C', '$', 'Threats', 'aGhostTeam', 'sWOTAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamCharterTemplateMissionPrompt', '2024-10-21 20:54:28.76+00', '2024-10-21 20:54:28.76+00', NULL, 'What''s the overall mission of our team?', '#66BC8C', '!', 'Mission', 'aGhostTeam', 'teamCharterTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamEfficiencyPremortemTemplateWhatCausedUsToMissTheDeadlinePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Envision scenarios that could lead to missed deadlines and develop strategies to avoid them.', '#FFCC63', '$', '🎯 What caused us to miss the deadline?', 'aGhostTeam', 'teamEfficiencyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamPerformancePostmortemTemplateWhatCommunicationChallengesDidWeFacePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify any communication issues that arose and their impact on the project.', '#7272E5', '"', '🗣️ What communication challenges did we face?', 'aGhostTeam', 'teamPerformancePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamRetreatPlanningTemplate:hopesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What do you hope we will do together? What do you hope will come from our time together?', '#7272E5', '!', 'Hopes 🙏', 'aGhostTeam', 'teamRetreatPlanningTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('thanksgivingRetrospectiveTemplate:newTraditionsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What new things did we try or learn?', '#FE975D', '"', 'New Traditions 🍟', 'aGhostTeam', 'thanksgivingRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('threatLevelPremortemTemplateLowPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What low-risk issues should we expect? (Max. 5 minutes of discussion during the pre-mortem)', '#66BC8C', '#', '🟢 Low', 'aGhostTeam', 'threatLevelPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptHouseOfSticks', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What needs more work?', '#D5211A', '"', 'House of Sticks', 'aGhostTeam', 'threeLittlePigsTemplate', 'promptWhatCease') ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timelinePremortemTemplateMiddlePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might we face during the middle of the project? Reflect on possible hurdles like shifting deadlines, team fatigue, and evolving priorities.', '#66BC8C', '"', '🕰️ Middle', 'aGhostTeam', 'timelinePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeManagementPostmortemTemplateHowAccurateWereOurInitialTimeEstimatesPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Gauge the precision of your team''s time forecasts and compare them to the actual time invested in project tasks.', '#FD6157', '!', '⏱️ How accurate were our initial time estimates?', 'aGhostTeam', 'timeManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeTravelPostmortemTemplateHowWillChangesWeMakeNowImproveFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Consider how actions you take now will play out in future projects.', '#7272E5', '$', '🌈 How will changes we make now improve future projects?', 'aGhostTeam', 'timeTravelPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('uncertainWatersPremortemTemplateHiddenReefsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What unforeseen obstacles or issues could cause us to run aground?', '#8EC7F1', '!', '🌊 Hidden reefs', 'aGhostTeam', 'uncertainWatersPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('scrumValuesRetrospectiveTemplateCouragePrompt', '2024-10-21 20:54:28.762+00', '2024-10-21 20:54:28.762+00', NULL, 'Scrum Teams have the courage to do the right thing and to work on tough problems. Are there any times when we struggled to be courageous or didn''t do the right thing?', '#8EC7F1', '%', 'Courage', 'aGhostTeam', 'scrumValuesRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('simplePostmortemTemplateWhatWentWellDuringTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Highlight the successful aspects of the project.', '#7272E5', '!', '✅ What went well during the project?', 'aGhostTeam', 'simplePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sixThinkingHatsTemplate:whiteHatPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are the facts or information we have about the last sprint?', '#F8F7FC', '"', 'White Hat', 'aGhostTeam', 'sixThinkingHatsTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('startPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What new things should we explore or start doing?', '#52CC52', '%', 'Start ⏯️', 'aGhostTeam', 'starfishTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatKeep', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What current behaviors should we keep doing?', '#D9D916', '#', 'Continue', 'aGhostTeam', 'startStopContinueTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('successAndFailurePremortemTemplateWhatDoesSuccessLookLikePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Envision the end goal and the milestones that mark the path to success.', '#FE975D', '!', '🏆 What does success look like?', 'aGhostTeam', 'successAndFailurePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroPostmortemTemplateHowDidTheseSuperpowersDriveTheProjectForwardPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Analyze how individual strengths influenced the project''s outcome.', '#FE975D', '"', '💥 How did these superpowers drive the project forward?', 'aGhostTeam', 'superheroPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('superheroRetrospectiveTemplate:nemesisPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What makes your role more difficult?', '#444258', '#', 'Nemesis', 'aGhostTeam', 'superheroRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('surprisedWorriedInspiredTemplate:inspiredPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What has you energized for the future?', '#8EC7F1', '#', 'Inspired', 'aGhostTeam', 'surprisedWorriedInspiredTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('sWOTAnalysisTemplate:stengthsPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are we good at?', '#FE975D', '!', 'Strengths', 'aGhostTeam', 'sWOTAnalysisTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamEfficiencyPremortemTemplateWhatSlowedUsDownPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify processes or factors that could hinder your team''s progress.', '#444258', '!', '⏳ What slowed us down?', 'aGhostTeam', 'teamEfficiencyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('thanksgivingRetrospectiveTemplate:gratitudePrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are you thankful for?', '#444258', '$', 'Gratitude 🍰', 'aGhostTeam', 'thanksgivingRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('threatLevelPremortemTemplateElevatedPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What moderate issues would we run into that delay the project? (Warrants 10-20 minutes of discussion during the pre-mortem.)', '#FFCC63', '"', '🟡 Elevated', 'aGhostTeam', 'threatLevelPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptHouseOfBricks', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What is rock solid and working well?', '#66BC8C', '#', 'House of Bricks', 'aGhostTeam', 'threeLittlePigsTemplate', 'promptWhatKeep') ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timelinePremortemTemplateStartPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might we face at the beginning of the project? Consider potential obstacles such as team formation, initial planning, and resource allocation.', '#444258', '!', '📆 Start', 'aGhostTeam', 'timelinePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeManagementPostmortemTemplateWhatObstaclesImpactedOurTimeManagementPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Uncover the factors that caused delays or inefficiencies in the project and learn from them.', '#7272E5', '#', '🚧 What obstacles impacted our time management?', 'aGhostTeam', 'timeManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeTravelPostmortemTemplateIfWeCouldGoBackInTimeWhatWouldWeChangePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Discuss changes your team would make if given a second chance.', '#66BC8C', '!', '⌛ If we could go back in time, what would we change?', 'aGhostTeam', 'timeTravelPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('uncertainWatersPremortemTemplateSafeHarborsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'How can we best prepare to weather these challenges and uncertainties?', '#444258', '$', '🏝️ Safe harbors', 'aGhostTeam', 'uncertainWatersPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whatIfPremortemTemplateWhatIfInsertRiskPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Customize this question to address a specific risk.', '#FE975D', '!', 'What if [insert risk]', 'aGhostTeam', 'whatIfPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptRepeatingOurSuccess', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'How can we maintain/replicate our success in future?', '#E55CA0', '#', 'Repeating our success', 'aGhostTeam', 'winningStreakTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('wRAPTemplate:appreciationPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'Who made this sprint special or did exceptional work?', '#8EC7F1', '#', 'Appreciation', 'aGhostTeam', 'wRAPTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamEfficiencyPremortemTemplateWhereMightWeNeedExtraHelpPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Recognize areas where your team may require additional resources or expertise.', '#FD6157', '#', '🆘 Where might we need extra help?', 'aGhostTeam', 'teamEfficiencyPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamPerformancePostmortemTemplateHowDidOurTeamDynamicsImpactTheProjectPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Assess the effect of your team''s interpersonal relationships on the project.', '#FFCC63', '!', '👥 How did our team dynamics impact the project?', 'aGhostTeam', 'teamPerformancePostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('teamRetreatPlanningTemplate:projectProblemPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What project should we explore? What problem should we tackle together?', '#FE975D', '#', 'Project/Problem 💡', 'aGhostTeam', 'teamRetreatPlanningTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('thanksgivingRetrospectiveTemplate:oldFavoritesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What tried-and-true practices or habits are serving us well?', '#8EC7F1', '!', 'Old Favorites 🦃', 'aGhostTeam', 'thanksgivingRetrospectiveTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeManagementPostmortemTemplateWhatStrategiesCanWeImplementToImproveTimeManagementInFutureProjectsP', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Develop action plans to master time allocation and scheduling, boosting your team''s productivity and punctuality.', '#8EC7F1', '$', '⚙️ What strategies can we implement to improve time management in future projects?', 'aGhostTeam', 'timeManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeTravelPostmortemTemplateWhatDidWeLearnForFutureProjectsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Imagine how the lessons and insights gained from this project will improve future endeavors.', '#FD6157', '"', '🚀 What did we learn for future projects?', 'aGhostTeam', 'timeTravelPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('uncertainWatersPremortemTemplateAnchorsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What might hold us back, slow our progress, or hinder our efficiency?', '#DB70DB', '#', '⚓ Anchors', 'aGhostTeam', 'uncertainWatersPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whatIfPremortemTemplateWhatIfInsertChallengePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Adapt this question to tackle another unique challenge.', '#DB70DB', '"', 'What if [insert challenge]', 'aGhostTeam', 'whatIfPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whatWentWellPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What good things happened this sprint?', '#7373E5', '!', 'What went well 😄', 'aGhostTeam', 'whatWentWellTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whyDidTheProjectFailPremortemTemplateWhyDidTheProjectFailPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What could go wrong and prevent us meeting our goals? Try to focus on things that could reasonably put the project off track. ', '#8EC7F1', '!', '⁉️ Why did the project fail?', 'aGhostTeam', 'whyDidTheProjectFailPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptBigWins', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What are we proud of achieving?', '#52CC52', '!', 'Big wins', 'aGhostTeam', 'winningStreakTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatBlocking', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What’s blocking us from achieving our goals?', '#E55C5C', '"', 'Where did you get stuck?', 'aGhostTeam', 'workingStuckTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('wRAPTemplate:risksPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What risks or challenges lie ahead? What was risky about our work in the last period?', '#7272E5', '"', 'Risks', 'aGhostTeam', 'wRAPTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('threatLevelPremortemTemplateSeverePrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What severe issues could we run into that derail the project? (Requires a separate meeting or review.)', '#FD6157', '!', '🔴 Severe', 'aGhostTeam', 'threatLevelPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptHouseOfStraw', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What is at risk of breaking?', '#FFCC63', '!', 'House of Straw', 'aGhostTeam', 'threeLittlePigsTemplate', 'promptWhatAdopt') ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timelinePremortemTemplateEndPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What challenges might we face at the end of the project? Envision potential difficulties like last-minute changes, finalizing deliverables, and closing the project effectively.', '#FD6157', '#', '🏁 End', 'aGhostTeam', 'timelinePremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeManagementPostmortemTemplateWhichTasksTookLongerThanExpectedAndWhyPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Identify tasks that required more time than anticipated and discuss the reasons behind this.', '#FFCC63', '"', '📅 Which tasks took longer than expected, and why?', 'aGhostTeam', 'timeManagementPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('timeTravelPostmortemTemplateHowDidThisProjectShapeOurTeamsGrowthAndDevelopmentPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Imagine how this project impacts your team''s evolution.', '#FFCC63', '#', '🔍 How did this project shape our team''s growth and development?', 'aGhostTeam', 'timeTravelPostmortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('uncertainWatersPremortemTemplateStormsPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'What significant challenges or crises might we face during the project?', '#FE975D', '"', '🌀 Storms', 'aGhostTeam', 'uncertainWatersPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whatIfPremortemTemplateWhatIfInsertConcernPrompt', '2024-10-21 20:55:10.872+00', '2024-10-21 20:55:10.872+00', NULL, 'Tailor this question to explore an additional concern.', '#444258', '#', 'What if [insert concern]', 'aGhostTeam', 'whatIfPremortemTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('whatDidntGoWellPrompt', '2024-10-21 20:53:55.206+00', '2024-10-21 20:53:55.206+00', NULL, 'What didn''t go as planned or desired this sprint?', '#E55C5C', '"', 'What didn''t go well 😞', 'aGhostTeam', 'whatWentWellTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptTeamwork', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'What teamwork practices helped us reach our goals?', '#AC73E5', '"', 'Teamwork', 'aGhostTeam', 'winningStreakTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('wRAPTemplate:puzzlesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What unresolved questions do you have?', '#FE975D', '$', 'Puzzles', 'aGhostTeam', 'wRAPTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptKudos', '2024-10-21 20:53:55.199+00', '2024-10-21 20:53:55.199+00', NULL, 'Share the love! Give a shoutout to someone who did great work!', '#45E5E5', '$', 'Kudos', 'aGhostTeam', 'winningStreakTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('promptWhatHelps', '2016-06-01 00:00:00+00', '2016-06-01 00:00:00+00', NULL, 'What’s helping us make progress toward our goals?', '#52CC52', '!', 'What’s working?', 'aGhostTeam', 'workingStuckTemplate', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."ReflectPrompt" VALUES ('wRAPTemplate:wishesPrompt', '2022-01-28 00:00:00+00', '2024-10-21 20:54:28.757+00', NULL, 'What are your wishes for the team or your work? What would make work better?', '#FFCC63', '!', 'Wishes', 'aGhostTeam', 'wRAPTemplate', NULL) ON CONFLICT DO NOTHING;


--
-- TOC entry 4493 (class 0 OID 4219856)
-- Dependencies: 282
-- Data for Name: RetroReflection; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4494 (class 0 OID 4219867)
-- Dependencies: 283
-- Data for Name: RetroReflectionGroup; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4495 (class 0 OID 4219877)
-- Dependencies: 284
-- Data for Name: SAML; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4496 (class 0 OID 4219885)
-- Dependencies: 285
-- Data for Name: SAMLDomain; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4497 (class 0 OID 4219889)
-- Dependencies: 286
-- Data for Name: ScheduledJob; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4499 (class 0 OID 4219894)
-- Dependencies: 288
-- Data for Name: SlackAuth; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4500 (class 0 OID 4219902)
-- Dependencies: 289
-- Data for Name: SlackNotification; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4501 (class 0 OID 4219905)
-- Dependencies: 290
-- Data for Name: StripeQuantityMismatchLogging; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4503 (class 0 OID 4219913)
-- Dependencies: 292
-- Data for Name: SuggestedAction; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4504 (class 0 OID 4219918)
-- Dependencies: 293
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4505 (class 0 OID 4219928)
-- Dependencies: 294
-- Data for Name: TaskEstimate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4507 (class 0 OID 4219935)
-- Dependencies: 296
-- Data for Name: Team; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."Team" VALUES ('aGhostTeam', 'Parabol', '2016-06-01 00:00:00+00', 'aGhostUser', false, true, '{}', 'retrospective', 'enterprise', 'aGhostOrg', true, '2024-10-21 20:55:52.678+00', NULL, 0, false, NULL, '❤️') ON CONFLICT DO NOTHING;


--
-- TOC entry 4508 (class 0 OID 4219950)
-- Dependencies: 297
-- Data for Name: TeamInvitation; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4509 (class 0 OID 4219957)
-- Dependencies: 298
-- Data for Name: TeamMeetingTemplate; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4510 (class 0 OID 4219961)
-- Dependencies: 299
-- Data for Name: TeamMember; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4511 (class 0 OID 4219971)
-- Dependencies: 300
-- Data for Name: TeamMemberIntegrationAuth; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4512 (class 0 OID 4219979)
-- Dependencies: 301
-- Data for Name: TeamPromptResponse; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4514 (class 0 OID 4219988)
-- Dependencies: 303
-- Data for Name: TemplateDimension; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TemplateDimension" VALUES ('eeStoryPointsDimension', '2024-10-21 20:53:55.201+00', 'Story Points', '', 'aGhostTeam', '2024-10-21 20:53:55.201+00', 'estimatedEffortTemplate', 'fibonacciScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('moscowPriorityDimension', '2024-10-21 20:55:19.897+00', 'Priority? Must/Should/Could/Won’t Have', '', 'aGhostTeam', '2024-10-21 20:55:19.897+00', 'moscowPrioritizationTemplate', 'moscowScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('wsjfStoryPointsDimension', '2024-10-21 20:53:55.201+00', 'Story Points', '', 'aGhostTeam', '2024-10-21 20:53:55.201+00', 'wsjfTemplate', 'fibonacciScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('riceReachDimension', '2024-10-21 20:55:19.897+00', 'Reach', '', 'aGhostTeam', '2024-10-21 20:55:19.897+00', 'ricePrioritizationTemplate', 'fiveFingersScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('riceImpactDimension', '2024-10-21 20:55:19.897+00', 'Impact', '', 'aGhostTeam', '2024-10-21 20:55:19.897+00', 'ricePrioritizationTemplate', 'fiveFingersScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('wsjfStoryValueDimension', '2024-10-21 20:53:55.201+00', 'Story Value', '', 'aGhostTeam', '2024-10-21 20:53:55.201+00', 'wsjfTemplate', 'fibonacciScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('riceConfidenceDimension', '2024-10-21 20:55:19.897+00', 'Confidence', '', 'aGhostTeam', '2024-10-21 20:55:19.897+00', 'ricePrioritizationTemplate', 'fiveFingersScale', '"', NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateDimension" VALUES ('riceEffortDimension', '2024-10-21 20:55:19.897+00', 'Effort', '', 'aGhostTeam', '2024-10-21 20:55:19.897+00', 'ricePrioritizationTemplate', 'fiveFingersScale', '"', NULL) ON CONFLICT DO NOTHING;


--
-- TOC entry 4515 (class 0 OID 4219996)
-- Dependencies: 304
-- Data for Name: TemplateRef; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4516 (class 0 OID 4220002)
-- Dependencies: 305
-- Data for Name: TemplateScale; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TemplateScale" VALUES ('tshirtSizeScale', '2024-10-21 20:53:55.202+00', 'T-Shirt Sizes', 'aGhostTeam', '2024-10-21 20:55:54.606965+00', NULL, true, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScale" VALUES ('priorityScale', '2024-10-21 20:53:55.205+00', 'Priorities', 'aGhostTeam', '2024-10-21 20:55:54.606965+00', NULL, true, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScale" VALUES ('moscowScale', '2024-10-21 20:55:19.897+00', 'MoSCoW', 'aGhostTeam', '2024-10-21 20:55:54.606965+00', NULL, true, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScale" VALUES ('fibonacciScale', '2024-10-21 20:53:55.202+00', 'Fibonacci', 'aGhostTeam', '2024-10-21 20:55:54.606965+00', NULL, true, NULL) ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScale" VALUES ('fiveFingersScale', '2024-10-21 20:53:55.202+00', 'Five Fingers', 'aGhostTeam', '2024-10-21 20:55:54.606965+00', NULL, true, NULL) ON CONFLICT DO NOTHING;


--
-- TOC entry 4517 (class 0 OID 4220008)
-- Dependencies: 306
-- Data for Name: TemplateScaleRef; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4518 (class 0 OID 4220014)
-- Dependencies: 307
-- Data for Name: TemplateScaleValue; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."TemplateScaleValue" VALUES (1, 'tshirtSizeScale', '!', '#5CA0E5', 'XS') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (2, 'tshirtSizeScale', '"', '#5CA0E5', 'SM') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (3, 'tshirtSizeScale', '#', '#45E595', 'M') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (4, 'tshirtSizeScale', '$', '#E59545', 'L') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (5, 'tshirtSizeScale', '%', '#E59545', 'XL') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (6, 'tshirtSizeScale', '&', '#E55CA0', '?') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (7, 'tshirtSizeScale', '''', '#AC72E5', 'Pass') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (8, 'priorityScale', '!', '#DB70DB', '?') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (9, 'priorityScale', '"', '#329AE5', 'P0') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (10, 'priorityScale', '#', '#329AE5', 'P1') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (11, 'priorityScale', '$', '#66BC8C', 'P2') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (12, 'priorityScale', '%', '#66BC8C', 'P3') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (13, 'priorityScale', '&', '#FE975D', 'P4') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (14, 'priorityScale', '''', '#FE975D', 'P5') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (15, 'priorityScale', '(', '#A06BD6', 'Pass') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (16, 'moscowScale', '!', '#FD6157', 'M') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (17, 'moscowScale', '"', '#FE975D', 'S') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (18, 'moscowScale', '#', '#FFCC63', 'C') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (19, 'moscowScale', '$', '#C4CF66', 'W') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (20, 'moscowScale', '%', '#ED4C86', '?') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (21, 'moscowScale', '&', '#A06BD6', 'Pass') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (22, 'fibonacciScale', '!', '#5CA0E5', '1') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (23, 'fibonacciScale', '"', '#5CA0E5', '2') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (24, 'fibonacciScale', '#', '#45E595', '3') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (25, 'fibonacciScale', '$', '#45E595', '5') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (26, 'fibonacciScale', '%', '#45E595', '8') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (27, 'fibonacciScale', '&', '#E59545', '13') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (28, 'fibonacciScale', '''', '#E59545', '21') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (29, 'fibonacciScale', '(', '#E59545', '34') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (30, 'fibonacciScale', ')', '#E55CA0', '?') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (31, 'fibonacciScale', '*', '#AC72E5', 'Pass') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (32, 'fiveFingersScale', '!', '#5CA0E5', '1') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (33, 'fiveFingersScale', '"', '#5CA0E5', '2') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (34, 'fiveFingersScale', '#', '#45E595', '3') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (35, 'fiveFingersScale', '$', '#E59545', '4') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (36, 'fiveFingersScale', '%', '#E59545', '5') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (37, 'fiveFingersScale', '&', '#E55CA0', '?') ON CONFLICT DO NOTHING;
INSERT INTO public."TemplateScaleValue" VALUES (38, 'fiveFingersScale', '''', '#AC72E5', 'Pass') ON CONFLICT DO NOTHING;


--
-- TOC entry 4520 (class 0 OID 4220018)
-- Dependencies: 309
-- Data for Name: TimelineEvent; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- TOC entry 4521 (class 0 OID 4220027)
-- Dependencies: 310
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public."User" VALUES ('aGhostUser', 'love@parabol.co', '2016-06-01 00:00:00+00', '2024-10-21 20:55:55.595498+00', false, '2016-06-01 00:00:00+00', 'A Ghost', 'enterprise', 'https://action-files.parabol.co/production/build/v5.10.1/42342faa774f05b7626fa91ff8374e59.svg', '{aGhostTeam}', '{}', '{}', '{}', NULL, NULL, NULL, false, NULL, NULL, 0, false, DEFAULT, true, true, NULL, 2, 2, '{}') ON CONFLICT DO NOTHING;
INSERT INTO public."User" VALUES ('parabolAIUser', 'ai-user@parabol.co', '2024-10-21 20:55:52.969962+00', '2024-10-21 20:55:55.595498+00', false, '2024-10-21 20:55:52.969962+00', 'Parabol AI', 'starter', 'https://action-files.parabol.co/static/favicon-with-more-padding.jpeg', '{}', '{}', '{}', NULL, NULL, NULL, NULL, false, NULL, NULL, 0, false, DEFAULT, true, false, NULL, 2, 2, '{}') ON CONFLICT DO NOTHING;


--
-- TOC entry 4539 (class 0 OID 0)
-- Dependencies: 224
-- Name: AzureDevOpsDimensionFieldMap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AzureDevOpsDimensionFieldMap_id_seq"', 1, false);


--
-- TOC entry 4540 (class 0 OID 0)
-- Dependencies: 228
-- Name: DomainJoinRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."DomainJoinRequest_id_seq"', 1, false);


--
-- TOC entry 4541 (class 0 OID 0)
-- Dependencies: 230
-- Name: EmailVerification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EmailVerification_id_seq"', 1, false);


--
-- TOC entry 4542 (class 0 OID 0)
-- Dependencies: 232
-- Name: EmbeddingsJobQueue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EmbeddingsJobQueue_id_seq"', 1, false);


--
-- TOC entry 4543 (class 0 OID 0)
-- Dependencies: 234
-- Name: EmbeddingsMetadata_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."EmbeddingsMetadata_id_seq"', 99, true);


--
-- TOC entry 4544 (class 0 OID 0)
-- Dependencies: 236
-- Name: FailedAuthRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."FailedAuthRequest_id_seq"', 1, false);


--
-- TOC entry 4545 (class 0 OID 0)
-- Dependencies: 242
-- Name: GitHubDimensionFieldMap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GitHubDimensionFieldMap_id_seq"', 1, false);


--
-- TOC entry 4546 (class 0 OID 0)
-- Dependencies: 244
-- Name: GitLabDimensionFieldMap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GitLabDimensionFieldMap_id_seq"', 1, false);


--
-- TOC entry 4547 (class 0 OID 0)
-- Dependencies: 246
-- Name: Insight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Insight_id_seq"', 1, false);


--
-- TOC entry 4548 (class 0 OID 0)
-- Dependencies: 248
-- Name: IntegrationProvider_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."IntegrationProvider_id_seq"', 1, false);


--
-- TOC entry 4549 (class 0 OID 0)
-- Dependencies: 250
-- Name: IntegrationSearchQuery_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."IntegrationSearchQuery_id_seq"', 1, false);


--
-- TOC entry 4550 (class 0 OID 0)
-- Dependencies: 252
-- Name: JiraDimensionFieldMap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."JiraDimensionFieldMap_id_seq"', 1, false);


--
-- TOC entry 4551 (class 0 OID 0)
-- Dependencies: 254
-- Name: JiraServerDimensionFieldMap_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."JiraServerDimensionFieldMap_id_seq"', 1, false);


--
-- TOC entry 4552 (class 0 OID 0)
-- Dependencies: 258
-- Name: MeetingSeries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."MeetingSeries_id_seq"', 1, false);


--
-- TOC entry 4553 (class 0 OID 0)
-- Dependencies: 263
-- Name: NewFeature_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."NewFeature_id_seq"', 1, false);


--
-- TOC entry 4554 (class 0 OID 0)
-- Dependencies: 268
-- Name: OrganizationApprovedDomain_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrganizationApprovedDomain_id_seq"', 1, false);


--
-- TOC entry 4555 (class 0 OID 0)
-- Dependencies: 271
-- Name: OrganizationUserAudit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."OrganizationUserAudit_id_seq"', 1, false);


--
-- TOC entry 4556 (class 0 OID 0)
-- Dependencies: 273
-- Name: PasswordResetRequest_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PasswordResetRequest_id_seq"', 1, false);


--
-- TOC entry 4557 (class 0 OID 0)
-- Dependencies: 276
-- Name: PollOption_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PollOption_id_seq"', 1, false);


--
-- TOC entry 4558 (class 0 OID 0)
-- Dependencies: 277
-- Name: Poll_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Poll_id_seq"', 1, false);


--
-- TOC entry 4559 (class 0 OID 0)
-- Dependencies: 279
-- Name: PushInvitation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."PushInvitation_id_seq"', 1, false);


--
-- TOC entry 4560 (class 0 OID 0)
-- Dependencies: 287
-- Name: ScheduledJob_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ScheduledJob_id_seq"', 1, false);


--
-- TOC entry 4561 (class 0 OID 0)
-- Dependencies: 291
-- Name: StripeQuantityMismatchLogging_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."StripeQuantityMismatchLogging_id_seq"', 1, false);


--
-- TOC entry 4562 (class 0 OID 0)
-- Dependencies: 295
-- Name: TaskEstimate_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TaskEstimate_id_seq"', 1, false);


--
-- TOC entry 4563 (class 0 OID 0)
-- Dependencies: 302
-- Name: TeamPromptResponse_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TeamPromptResponse_id_seq"', 1, false);


--
-- TOC entry 4564 (class 0 OID 0)
-- Dependencies: 308
-- Name: TemplateScaleValue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TemplateScaleValue_id_seq"', 38, true);


--
-- TOC entry 3864 (class 2606 OID 4220061)
-- Name: AgendaItem AgendaItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "AgendaItem_pkey" PRIMARY KEY (id);


--
-- TOC entry 3869 (class 2606 OID 4220063)
-- Name: AtlassianAuth AtlassianAuth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AtlassianAuth"
    ADD CONSTRAINT "AtlassianAuth_pkey" PRIMARY KEY ("userId", "teamId");


--
-- TOC entry 3871 (class 2606 OID 4220065)
-- Name: AzureDevOpsDimensionFieldMap AzureDevOpsDimensionFieldMap_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AzureDevOpsDimensionFieldMap"
    ADD CONSTRAINT "AzureDevOpsDimensionFieldMap_id_key" UNIQUE (id);


--
-- TOC entry 3873 (class 2606 OID 4220067)
-- Name: AzureDevOpsDimensionFieldMap AzureDevOpsDimensionFieldMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AzureDevOpsDimensionFieldMap"
    ADD CONSTRAINT "AzureDevOpsDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "dimensionName", "instanceId", "projectKey", "workItemType");


--
-- TOC entry 3875 (class 2606 OID 4220069)
-- Name: Comment Comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "Comment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3880 (class 2606 OID 4220071)
-- Name: Discussion Discussion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "Discussion_pkey" PRIMARY KEY (id);


--
-- TOC entry 3887 (class 2606 OID 4220073)
-- Name: DomainJoinRequest DomainJoinRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DomainJoinRequest"
    ADD CONSTRAINT "DomainJoinRequest_pkey" PRIMARY KEY (id);


--
-- TOC entry 3889 (class 2606 OID 4220075)
-- Name: EmailVerification EmailVerification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmailVerification"
    ADD CONSTRAINT "EmailVerification_pkey" PRIMARY KEY (id);


--
-- TOC entry 3893 (class 2606 OID 4220077)
-- Name: EmbeddingsJobQueue EmbeddingsJobQueue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsJobQueue"
    ADD CONSTRAINT "EmbeddingsJobQueue_pkey" PRIMARY KEY (id);


--
-- TOC entry 3897 (class 2606 OID 4220079)
-- Name: EmbeddingsMetadata EmbeddingsMetadata_objectType_refId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsMetadata"
    ADD CONSTRAINT "EmbeddingsMetadata_objectType_refId_key" UNIQUE ("objectType", "refId");


--
-- TOC entry 3899 (class 2606 OID 4220081)
-- Name: EmbeddingsMetadata EmbeddingsMetadata_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsMetadata"
    ADD CONSTRAINT "EmbeddingsMetadata_pkey" PRIMARY KEY (id);


--
-- TOC entry 3904 (class 2606 OID 4220083)
-- Name: FailedAuthRequest FailedAuthRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FailedAuthRequest"
    ADD CONSTRAINT "FailedAuthRequest_pkey" PRIMARY KEY (id);


--
-- TOC entry 3908 (class 2606 OID 4220085)
-- Name: FeatureFlag FeatureFlag_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlag"
    ADD CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY (id);


--
-- TOC entry 3918 (class 2606 OID 4220087)
-- Name: FreemailDomain FreemailDomain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FreemailDomain"
    ADD CONSTRAINT "FreemailDomain_pkey" PRIMARY KEY (domain);


--
-- TOC entry 3920 (class 2606 OID 4220089)
-- Name: GitHubAuth GitHubAuth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubAuth"
    ADD CONSTRAINT "GitHubAuth_pkey" PRIMARY KEY ("userId", "teamId");


--
-- TOC entry 3922 (class 2606 OID 4220091)
-- Name: GitHubDimensionFieldMap GitHubDimensionFieldMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubDimensionFieldMap"
    ADD CONSTRAINT "GitHubDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "dimensionName", "nameWithOwner");


--
-- TOC entry 3924 (class 2606 OID 4220093)
-- Name: GitLabDimensionFieldMap GitLabDimensionFieldMap_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitLabDimensionFieldMap"
    ADD CONSTRAINT "GitLabDimensionFieldMap_id_key" UNIQUE (id);


--
-- TOC entry 3926 (class 2606 OID 4220095)
-- Name: GitLabDimensionFieldMap GitLabDimensionFieldMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitLabDimensionFieldMap"
    ADD CONSTRAINT "GitLabDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "dimensionName", "projectId", "providerId");


--
-- TOC entry 3928 (class 2606 OID 4220097)
-- Name: Insight Insight_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Insight"
    ADD CONSTRAINT "Insight_pkey" PRIMARY KEY (id);


--
-- TOC entry 3933 (class 2606 OID 4220099)
-- Name: IntegrationProvider IntegrationProvider_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationProvider"
    ADD CONSTRAINT "IntegrationProvider_pkey" PRIMARY KEY (id);


--
-- TOC entry 3938 (class 2606 OID 4220101)
-- Name: IntegrationSearchQuery IntegrationSearchQuery_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationSearchQuery"
    ADD CONSTRAINT "IntegrationSearchQuery_pkey" PRIMARY KEY (id);


--
-- TOC entry 3942 (class 2606 OID 4220103)
-- Name: JiraDimensionFieldMap JiraDimensionFieldMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraDimensionFieldMap"
    ADD CONSTRAINT "JiraDimensionFieldMap_pkey" PRIMARY KEY ("teamId", "cloudId", "projectKey", "issueType", "dimensionName");


--
-- TOC entry 3944 (class 2606 OID 4220105)
-- Name: JiraServerDimensionFieldMap JiraServerDimensionFieldMap_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraServerDimensionFieldMap"
    ADD CONSTRAINT "JiraServerDimensionFieldMap_id_key" UNIQUE (id);


--
-- TOC entry 3946 (class 2606 OID 4220107)
-- Name: JiraServerDimensionFieldMap JiraServerDimensionFieldMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraServerDimensionFieldMap"
    ADD CONSTRAINT "JiraServerDimensionFieldMap_pkey" PRIMARY KEY ("providerId", "teamId", "projectId", "issueType", "dimensionName");


--
-- TOC entry 3948 (class 2606 OID 4220109)
-- Name: MassInvitation MassInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MassInvitation"
    ADD CONSTRAINT "MassInvitation_pkey" PRIMARY KEY (id);


--
-- TOC entry 3952 (class 2606 OID 4220111)
-- Name: MeetingMember MeetingMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingMember"
    ADD CONSTRAINT "MeetingMember_pkey" PRIMARY KEY (id);


--
-- TOC entry 3957 (class 2606 OID 4220113)
-- Name: MeetingSeries MeetingSeries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSeries"
    ADD CONSTRAINT "MeetingSeries_pkey" PRIMARY KEY (id);


--
-- TOC entry 3959 (class 2606 OID 4220115)
-- Name: MeetingSettings MeetingSettings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSettings"
    ADD CONSTRAINT "MeetingSettings_pkey" PRIMARY KEY (id);


--
-- TOC entry 3961 (class 2606 OID 4220117)
-- Name: MeetingSettings MeetingSettings_teamId_meetingType_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSettings"
    ADD CONSTRAINT "MeetingSettings_teamId_meetingType_key" UNIQUE ("teamId", "meetingType");


--
-- TOC entry 3964 (class 2606 OID 4220119)
-- Name: MeetingTemplate MeetingTemplate_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingTemplate"
    ADD CONSTRAINT "MeetingTemplate_pkey" PRIMARY KEY (id);


--
-- TOC entry 3968 (class 2606 OID 4220121)
-- Name: NewFeature NewFeature_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewFeature"
    ADD CONSTRAINT "NewFeature_pkey" PRIMARY KEY (id);


--
-- TOC entry 3970 (class 2606 OID 4220123)
-- Name: NewMeeting NewMeeting_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "NewMeeting_pkey" PRIMARY KEY (id);


--
-- TOC entry 3978 (class 2606 OID 4220125)
-- Name: Notification Notification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "Notification_pkey" PRIMARY KEY (id);


--
-- TOC entry 3988 (class 2606 OID 4220127)
-- Name: OrganizationApprovedDomain OrganizationApprovedDomain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationApprovedDomain"
    ADD CONSTRAINT "OrganizationApprovedDomain_pkey" PRIMARY KEY (id);


--
-- TOC entry 3999 (class 2606 OID 4220129)
-- Name: OrganizationUserAudit OrganizationUserAudit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUserAudit"
    ADD CONSTRAINT "OrganizationUserAudit_pkey" PRIMARY KEY (id);


--
-- TOC entry 3992 (class 2606 OID 4220131)
-- Name: OrganizationUser OrganizationUser_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUser"
    ADD CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY (id);


--
-- TOC entry 3984 (class 2606 OID 4220133)
-- Name: Organization Organization_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Organization"
    ADD CONSTRAINT "Organization_pkey" PRIMARY KEY (id);


--
-- TOC entry 4002 (class 2606 OID 4220135)
-- Name: PasswordResetRequest PasswordResetRequest_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PasswordResetRequest"
    ADD CONSTRAINT "PasswordResetRequest_pkey" PRIMARY KEY (id);


--
-- TOC entry 4010 (class 2606 OID 4220137)
-- Name: PollOption PollOption_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PollOption"
    ADD CONSTRAINT "PollOption_pkey" PRIMARY KEY (id);


--
-- TOC entry 4007 (class 2606 OID 4220139)
-- Name: Poll Poll_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_pkey" PRIMARY KEY (id);


--
-- TOC entry 4013 (class 2606 OID 4220141)
-- Name: PushInvitation PushInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushInvitation"
    ADD CONSTRAINT "PushInvitation_pkey" PRIMARY KEY (id);


--
-- TOC entry 4017 (class 2606 OID 4220143)
-- Name: QueryMap QueryMap_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."QueryMap"
    ADD CONSTRAINT "QueryMap_pkey" PRIMARY KEY (id);


--
-- TOC entry 4019 (class 2606 OID 4220145)
-- Name: ReflectPrompt ReflectPrompt_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReflectPrompt"
    ADD CONSTRAINT "ReflectPrompt_pkey" PRIMARY KEY (id);


--
-- TOC entry 4030 (class 2606 OID 4220147)
-- Name: RetroReflectionGroup RetroReflectionGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflectionGroup"
    ADD CONSTRAINT "RetroReflectionGroup_pkey" PRIMARY KEY (id);


--
-- TOC entry 4024 (class 2606 OID 4220149)
-- Name: RetroReflection RetroReflection_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflection"
    ADD CONSTRAINT "RetroReflection_pkey" PRIMARY KEY (id);


--
-- TOC entry 4039 (class 2606 OID 4220151)
-- Name: SAMLDomain SAMLDomain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SAMLDomain"
    ADD CONSTRAINT "SAMLDomain_pkey" PRIMARY KEY (domain);


--
-- TOC entry 4034 (class 2606 OID 4220153)
-- Name: SAML SAML_orgId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SAML"
    ADD CONSTRAINT "SAML_orgId_key" UNIQUE ("orgId");


--
-- TOC entry 4036 (class 2606 OID 4220155)
-- Name: SAML SAML_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SAML"
    ADD CONSTRAINT "SAML_pkey" PRIMARY KEY (id);


--
-- TOC entry 4042 (class 2606 OID 4220157)
-- Name: ScheduledJob ScheduledJob_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScheduledJob"
    ADD CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY (id);


--
-- TOC entry 4047 (class 2606 OID 4220159)
-- Name: SlackAuth SlackAuth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackAuth"
    ADD CONSTRAINT "SlackAuth_pkey" PRIMARY KEY (id);


--
-- TOC entry 4049 (class 2606 OID 4220161)
-- Name: SlackAuth SlackAuth_teamId_userId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackAuth"
    ADD CONSTRAINT "SlackAuth_teamId_userId_key" UNIQUE ("teamId", "userId");


--
-- TOC entry 4053 (class 2606 OID 4220163)
-- Name: SlackNotification SlackNotification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackNotification"
    ADD CONSTRAINT "SlackNotification_pkey" PRIMARY KEY (id);


--
-- TOC entry 4055 (class 2606 OID 4220165)
-- Name: SlackNotification SlackNotification_teamId_userId_event_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackNotification"
    ADD CONSTRAINT "SlackNotification_teamId_userId_event_key" UNIQUE ("teamId", "userId", event);


--
-- TOC entry 4059 (class 2606 OID 4220167)
-- Name: SuggestedAction SuggestedAction_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SuggestedAction"
    ADD CONSTRAINT "SuggestedAction_pkey" PRIMARY KEY (id);


--
-- TOC entry 4061 (class 2606 OID 4220169)
-- Name: SuggestedAction SuggestedAction_userId_type_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SuggestedAction"
    ADD CONSTRAINT "SuggestedAction_userId_type_key" UNIQUE ("userId", type);


--
-- TOC entry 4065 (class 2606 OID 4220171)
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- TOC entry 4079 (class 2606 OID 4220173)
-- Name: TeamInvitation TeamInvitation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamInvitation"
    ADD CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY (id);


--
-- TOC entry 4084 (class 2606 OID 4220175)
-- Name: TeamMeetingTemplate TeamMeetingTemplate_teamId_templateId_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMeetingTemplate"
    ADD CONSTRAINT "TeamMeetingTemplate_teamId_templateId_key" UNIQUE ("teamId", "templateId");


--
-- TOC entry 4091 (class 2606 OID 4220177)
-- Name: TeamMemberIntegrationAuth TeamMemberIntegrationAuth_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMemberIntegrationAuth"
    ADD CONSTRAINT "TeamMemberIntegrationAuth_pkey" PRIMARY KEY ("userId", "teamId", service);


--
-- TOC entry 4087 (class 2606 OID 4220179)
-- Name: TeamMember TeamMember_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "TeamMember_pkey" PRIMARY KEY (id);


--
-- TOC entry 4095 (class 2606 OID 4220181)
-- Name: TeamPromptResponse TeamPromptResponse_meetingIdUserId_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamPromptResponse"
    ADD CONSTRAINT "TeamPromptResponse_meetingIdUserId_unique" UNIQUE ("meetingId", "userId");


--
-- TOC entry 4097 (class 2606 OID 4220183)
-- Name: TeamPromptResponse TeamPromptResponse_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamPromptResponse"
    ADD CONSTRAINT "TeamPromptResponse_pkey" PRIMARY KEY (id);


--
-- TOC entry 4076 (class 2606 OID 4220185)
-- Name: Team Team_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "Team_pkey" PRIMARY KEY (id);


--
-- TOC entry 4100 (class 2606 OID 4220187)
-- Name: TemplateDimension TemplateDimension_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateDimension"
    ADD CONSTRAINT "TemplateDimension_pkey" PRIMARY KEY (id);


--
-- TOC entry 4102 (class 2606 OID 4220189)
-- Name: TemplateDimension TemplateDimension_teamId_name_removedAt_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateDimension"
    ADD CONSTRAINT "TemplateDimension_teamId_name_removedAt_key" UNIQUE ("teamId", name, "removedAt");


--
-- TOC entry 4107 (class 2606 OID 4220191)
-- Name: TemplateRef TemplateRef_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateRef"
    ADD CONSTRAINT "TemplateRef_pkey" PRIMARY KEY (id);


--
-- TOC entry 4112 (class 2606 OID 4220193)
-- Name: TemplateScaleRef TemplateScaleRef_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScaleRef"
    ADD CONSTRAINT "TemplateScaleRef_pkey" PRIMARY KEY (id);


--
-- TOC entry 4114 (class 2606 OID 4220195)
-- Name: TemplateScaleValue TemplateScaleValue_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScaleValue"
    ADD CONSTRAINT "TemplateScaleValue_pkey" PRIMARY KEY (id);


--
-- TOC entry 4116 (class 2606 OID 4220197)
-- Name: TemplateScaleValue TemplateScaleValue_templateScaleId_label_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScaleValue"
    ADD CONSTRAINT "TemplateScaleValue_templateScaleId_label_key" UNIQUE ("templateScaleId", label);


--
-- TOC entry 4109 (class 2606 OID 4220199)
-- Name: TemplateScale TemplateScale_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScale"
    ADD CONSTRAINT "TemplateScale_pkey" PRIMARY KEY (id);


--
-- TOC entry 4119 (class 2606 OID 4220201)
-- Name: TimelineEvent TimelineEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimelineEvent"
    ADD CONSTRAINT "TimelineEvent_pkey" PRIMARY KEY (id);


--
-- TOC entry 4123 (class 2606 OID 4220203)
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- TOC entry 3910 (class 2606 OID 4220205)
-- Name: FeatureFlag unique_featureName_scope; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlag"
    ADD CONSTRAINT "unique_featureName_scope" UNIQUE ("featureName", scope);


--
-- TOC entry 3912 (class 2606 OID 4220207)
-- Name: FeatureFlagOwner unique_feature_flag_owner_org; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT unique_feature_flag_owner_org UNIQUE ("orgId", "featureFlagId");


--
-- TOC entry 3914 (class 2606 OID 4220209)
-- Name: FeatureFlagOwner unique_feature_flag_owner_team; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT unique_feature_flag_owner_team UNIQUE ("teamId", "featureFlagId");


--
-- TOC entry 3916 (class 2606 OID 4220211)
-- Name: FeatureFlagOwner unique_feature_flag_owner_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT unique_feature_flag_owner_user UNIQUE ("userId", "featureFlagId");


--
-- TOC entry 3997 (class 2606 OID 4220213)
-- Name: OrganizationUser unique_org_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUser"
    ADD CONSTRAINT unique_org_user UNIQUE ("orgId", "userId");


--
-- TOC entry 3936 (class 2606 OID 4220215)
-- Name: IntegrationProvider unique_per_team_and_org; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationProvider"
    ADD CONSTRAINT unique_per_team_and_org UNIQUE NULLS NOT DISTINCT ("orgId", "teamId", service, "authStrategy");


--
-- TOC entry 3885 (class 1259 OID 4220216)
-- Name: DomainJoinRequest_createdBy_domain_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "DomainJoinRequest_createdBy_domain_unique" ON public."DomainJoinRequest" USING btree ("createdBy", domain);


--
-- TOC entry 3865 (class 1259 OID 4220217)
-- Name: idx_AgendaItem_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_AgendaItem_meetingId" ON public."AgendaItem" USING btree ("meetingId");


--
-- TOC entry 3866 (class 1259 OID 4220218)
-- Name: idx_AgendaItem_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_AgendaItem_teamId" ON public."AgendaItem" USING btree ("teamId");


--
-- TOC entry 3867 (class 1259 OID 4220219)
-- Name: idx_AgendaItem_teamMemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_AgendaItem_teamMemberId" ON public."AgendaItem" USING btree ("teamMemberId");


--
-- TOC entry 3876 (class 1259 OID 4220220)
-- Name: idx_Comment_createdBy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Comment_createdBy" ON public."Comment" USING btree ("createdBy");


--
-- TOC entry 3877 (class 1259 OID 4220221)
-- Name: idx_Comment_discussionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Comment_discussionId" ON public."Comment" USING btree ("discussionId");


--
-- TOC entry 3878 (class 1259 OID 4220222)
-- Name: idx_Comment_threadParentId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Comment_threadParentId" ON public."Comment" USING btree ("threadParentId");


--
-- TOC entry 3881 (class 1259 OID 4220223)
-- Name: idx_Discussion_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Discussion_createdAt" ON public."Discussion" USING btree ("createdAt");


--
-- TOC entry 3882 (class 1259 OID 4221001)
-- Name: idx_Discussion_discussionTopicId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Discussion_discussionTopicId" ON public."Discussion" USING btree ("discussionTopicId");


--
-- TOC entry 3890 (class 1259 OID 4220224)
-- Name: idx_EmailVerification_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmailVerification_email" ON public."EmailVerification" USING btree (email);


--
-- TOC entry 3891 (class 1259 OID 4220225)
-- Name: idx_EmailVerification_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmailVerification_token" ON public."EmailVerification" USING btree (token);


--
-- TOC entry 3894 (class 1259 OID 4220226)
-- Name: idx_EmbeddingsJobQueue_priority; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmbeddingsJobQueue_priority" ON public."EmbeddingsJobQueue" USING btree (priority);


--
-- TOC entry 3895 (class 1259 OID 4220227)
-- Name: idx_EmbeddingsJobQueue_state; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmbeddingsJobQueue_state" ON public."EmbeddingsJobQueue" USING btree (state);


--
-- TOC entry 3900 (class 1259 OID 4220228)
-- Name: idx_EmbeddingsMetadata_objectType; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmbeddingsMetadata_objectType" ON public."EmbeddingsMetadata" USING btree ("objectType");


--
-- TOC entry 3901 (class 1259 OID 4220229)
-- Name: idx_EmbeddingsMetadata_refUpdatedAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmbeddingsMetadata_refUpdatedAt" ON public."EmbeddingsMetadata" USING btree ("refUpdatedAt");


--
-- TOC entry 3902 (class 1259 OID 4220230)
-- Name: idx_EmbeddingsMetadata_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_EmbeddingsMetadata_teamId" ON public."EmbeddingsMetadata" USING btree ("teamId");


--
-- TOC entry 3905 (class 1259 OID 4220231)
-- Name: idx_FailedAuthRequest_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_FailedAuthRequest_email" ON public."FailedAuthRequest" USING btree (email);


--
-- TOC entry 3906 (class 1259 OID 4220232)
-- Name: idx_FailedAuthRequest_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_FailedAuthRequest_ip" ON public."FailedAuthRequest" USING btree (ip);


--
-- TOC entry 3934 (class 1259 OID 4220233)
-- Name: idx_IntegrationProvider_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_IntegrationProvider_teamId" ON public."IntegrationProvider" USING btree ("teamId");


--
-- TOC entry 3949 (class 1259 OID 4220234)
-- Name: idx_MassInvitation_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MassInvitation_meetingId" ON public."MassInvitation" USING btree ("meetingId") WHERE ("meetingId" IS NOT NULL);


--
-- TOC entry 3950 (class 1259 OID 4220235)
-- Name: idx_MassInvitation_teamMemberId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MassInvitation_teamMemberId" ON public."MassInvitation" USING btree ("teamMemberId");


--
-- TOC entry 3953 (class 1259 OID 4220236)
-- Name: idx_MeetingMember_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingMember_meetingId" ON public."MeetingMember" USING btree ("meetingId");


--
-- TOC entry 3954 (class 1259 OID 4220237)
-- Name: idx_MeetingMember_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingMember_teamId" ON public."MeetingMember" USING btree ("teamId");


--
-- TOC entry 3955 (class 1259 OID 4220238)
-- Name: idx_MeetingMember_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingMember_userId" ON public."MeetingMember" USING btree ("userId");


--
-- TOC entry 3962 (class 1259 OID 4220239)
-- Name: idx_MeetingSettings_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingSettings_teamId" ON public."MeetingSettings" USING btree ("teamId");


--
-- TOC entry 3965 (class 1259 OID 4220240)
-- Name: idx_MeetingTemplate_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingTemplate_orgId" ON public."MeetingTemplate" USING btree ("orgId");


--
-- TOC entry 3966 (class 1259 OID 4220241)
-- Name: idx_MeetingTemplate_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_MeetingTemplate_teamId" ON public."MeetingTemplate" USING btree ("teamId");


--
-- TOC entry 3971 (class 1259 OID 4220242)
-- Name: idx_NewMeeting_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_createdAt" ON public."NewMeeting" USING btree ("createdAt");


--
-- TOC entry 3972 (class 1259 OID 4220243)
-- Name: idx_NewMeeting_facilitatorUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_facilitatorUserId" ON public."NewMeeting" USING btree ("facilitatorUserId");


--
-- TOC entry 3973 (class 1259 OID 4220244)
-- Name: idx_NewMeeting_meetingSeriesId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_meetingSeriesId" ON public."NewMeeting" USING btree ("meetingSeriesId") WHERE ("meetingSeriesId" IS NOT NULL);


--
-- TOC entry 3974 (class 1259 OID 4220245)
-- Name: idx_NewMeeting_scheduledEndTime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_scheduledEndTime" ON public."NewMeeting" USING btree ("scheduledEndTime") WHERE (("scheduledEndTime" IS NOT NULL) AND ("endedAt" IS NULL));


--
-- TOC entry 3975 (class 1259 OID 4220246)
-- Name: idx_NewMeeting_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_teamId" ON public."NewMeeting" USING btree ("teamId");


--
-- TOC entry 3976 (class 1259 OID 4220247)
-- Name: idx_NewMeeting_templateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_NewMeeting_templateId" ON public."NewMeeting" USING btree ("templateId") WHERE ("templateId" IS NOT NULL);


--
-- TOC entry 3979 (class 1259 OID 4220248)
-- Name: idx_Notification_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Notification_createdAt" ON public."Notification" USING btree ("createdAt");


--
-- TOC entry 3980 (class 1259 OID 4220249)
-- Name: idx_Notification_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Notification_orgId" ON public."Notification" USING btree ("orgId") WHERE ("orgId" IS NOT NULL);


--
-- TOC entry 3981 (class 1259 OID 4220250)
-- Name: idx_Notification_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Notification_teamId" ON public."Notification" USING btree ("teamId") WHERE ("teamId" IS NOT NULL);


--
-- TOC entry 3982 (class 1259 OID 4220251)
-- Name: idx_Notification_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Notification_userId" ON public."Notification" USING btree ("userId");


--
-- TOC entry 3989 (class 1259 OID 4220252)
-- Name: idx_OrganizationApprovedDomain_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_OrganizationApprovedDomain_domain" ON public."OrganizationApprovedDomain" USING btree (domain);


--
-- TOC entry 3990 (class 1259 OID 4220253)
-- Name: idx_OrganizationApprovedDomain_orgId_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idx_OrganizationApprovedDomain_orgId_domain" ON public."OrganizationApprovedDomain" USING btree ("orgId", domain, (("removedAt" IS NULL))) WHERE ("removedAt" IS NULL);


--
-- TOC entry 4000 (class 1259 OID 4220254)
-- Name: idx_OrganizationUserAudit_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_OrganizationUserAudit_orgId" ON public."OrganizationUserAudit" USING btree ("orgId");


--
-- TOC entry 3993 (class 1259 OID 4220255)
-- Name: idx_OrganizationUser_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_OrganizationUser_orgId" ON public."OrganizationUser" USING btree ("orgId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 3994 (class 1259 OID 4220256)
-- Name: idx_OrganizationUser_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_OrganizationUser_tier" ON public."OrganizationUser" USING btree (tier) WHERE (("removedAt" IS NULL) AND (inactive = false));


--
-- TOC entry 3995 (class 1259 OID 4220257)
-- Name: idx_OrganizationUser_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_OrganizationUser_userId" ON public."OrganizationUser" USING btree ("userId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 3985 (class 1259 OID 4220258)
-- Name: idx_Organization_activeDomain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Organization_activeDomain" ON public."Organization" USING btree ("activeDomain");


--
-- TOC entry 3986 (class 1259 OID 4220259)
-- Name: idx_Organization_tier; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Organization_tier" ON public."Organization" USING btree (tier);


--
-- TOC entry 4003 (class 1259 OID 4220260)
-- Name: idx_PasswordResetRequest_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PasswordResetRequest_email" ON public."PasswordResetRequest" USING btree (email);


--
-- TOC entry 4004 (class 1259 OID 4220261)
-- Name: idx_PasswordResetRequest_ip; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PasswordResetRequest_ip" ON public."PasswordResetRequest" USING btree (ip);


--
-- TOC entry 4005 (class 1259 OID 4220262)
-- Name: idx_PasswordResetRequest_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PasswordResetRequest_token" ON public."PasswordResetRequest" USING btree (token);


--
-- TOC entry 4011 (class 1259 OID 4220263)
-- Name: idx_PollOption_pollId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PollOption_pollId" ON public."PollOption" USING btree ("pollId");


--
-- TOC entry 4008 (class 1259 OID 4220264)
-- Name: idx_Poll_discussionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Poll_discussionId" ON public."Poll" USING btree ("discussionId");


--
-- TOC entry 4014 (class 1259 OID 4220265)
-- Name: idx_PushInvitation_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PushInvitation_teamId" ON public."PushInvitation" USING btree ("teamId");


--
-- TOC entry 4015 (class 1259 OID 4220266)
-- Name: idx_PushInvitation_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_PushInvitation_userId" ON public."PushInvitation" USING btree ("userId");


--
-- TOC entry 4020 (class 1259 OID 4220267)
-- Name: idx_ReflectPrompt_parentPromptId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ReflectPrompt_parentPromptId" ON public."ReflectPrompt" USING btree ("templateId");


--
-- TOC entry 4021 (class 1259 OID 4220268)
-- Name: idx_ReflectPrompt_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ReflectPrompt_teamId" ON public."ReflectPrompt" USING btree ("teamId");


--
-- TOC entry 4022 (class 1259 OID 4220269)
-- Name: idx_ReflectPrompt_templateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ReflectPrompt_templateId" ON public."ReflectPrompt" USING btree ("templateId");


--
-- TOC entry 4031 (class 1259 OID 4220270)
-- Name: idx_RetroReflectionGroup_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflectionGroup_meetingId" ON public."RetroReflectionGroup" USING btree ("meetingId");


--
-- TOC entry 4032 (class 1259 OID 4220271)
-- Name: idx_RetroReflectionGroup_promptId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflectionGroup_promptId" ON public."RetroReflectionGroup" USING btree ("promptId");


--
-- TOC entry 4025 (class 1259 OID 4220272)
-- Name: idx_RetroReflection_creatorId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflection_creatorId" ON public."RetroReflection" USING btree ("creatorId");


--
-- TOC entry 4026 (class 1259 OID 4220273)
-- Name: idx_RetroReflection_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflection_meetingId" ON public."RetroReflection" USING btree ("meetingId");


--
-- TOC entry 4027 (class 1259 OID 4220274)
-- Name: idx_RetroReflection_promptId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflection_promptId" ON public."RetroReflection" USING btree ("promptId");


--
-- TOC entry 4028 (class 1259 OID 4220275)
-- Name: idx_RetroReflection_reflectionGroupId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_RetroReflection_reflectionGroupId" ON public."RetroReflection" USING btree ("reflectionGroupId");


--
-- TOC entry 4040 (class 1259 OID 4220276)
-- Name: idx_SAMLDomain_samlId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SAMLDomain_samlId" ON public."SAMLDomain" USING btree ("samlId");


--
-- TOC entry 4037 (class 1259 OID 4220277)
-- Name: idx_SAML_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SAML_orgId" ON public."SAML" USING btree ("orgId");


--
-- TOC entry 4043 (class 1259 OID 4220278)
-- Name: idx_ScheduledJob_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ScheduledJob_orgId" ON public."ScheduledJob" USING btree ("orgId");


--
-- TOC entry 4044 (class 1259 OID 4220279)
-- Name: idx_ScheduledJob_runAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ScheduledJob_runAt" ON public."ScheduledJob" USING btree ("runAt");


--
-- TOC entry 4045 (class 1259 OID 4220280)
-- Name: idx_ScheduledJob_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_ScheduledJob_type" ON public."ScheduledJob" USING btree (type);


--
-- TOC entry 4050 (class 1259 OID 4220281)
-- Name: idx_SlackAuth_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SlackAuth_teamId" ON public."SlackAuth" USING btree ("teamId");


--
-- TOC entry 4051 (class 1259 OID 4220282)
-- Name: idx_SlackAuth_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SlackAuth_userId" ON public."SlackAuth" USING btree ("userId");


--
-- TOC entry 4056 (class 1259 OID 4220283)
-- Name: idx_SlackNotification_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SlackNotification_teamId" ON public."SlackNotification" USING btree ("teamId");


--
-- TOC entry 4057 (class 1259 OID 4220284)
-- Name: idx_SlackNotification_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SlackNotification_userId" ON public."SlackNotification" USING btree ("userId");


--
-- TOC entry 4062 (class 1259 OID 4220285)
-- Name: idx_SuggestedAction_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SuggestedAction_teamId" ON public."SuggestedAction" USING btree ("teamId");


--
-- TOC entry 4063 (class 1259 OID 4220286)
-- Name: idx_SuggestedAction_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_SuggestedAction_userId" ON public."SuggestedAction" USING btree ("userId");


--
-- TOC entry 4073 (class 1259 OID 4220287)
-- Name: idx_TaskEstimate_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TaskEstimate_meetingId" ON public."TaskEstimate" USING btree ("meetingId");


--
-- TOC entry 4074 (class 1259 OID 4220288)
-- Name: idx_TaskEstimate_taskId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TaskEstimate_taskId" ON public."TaskEstimate" USING btree ("taskId");


--
-- TOC entry 4066 (class 1259 OID 4220289)
-- Name: idx_Task_createdBy; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_createdBy" ON public."Task" USING btree ("createdBy");


--
-- TOC entry 4067 (class 1259 OID 4220290)
-- Name: idx_Task_discussionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_discussionId" ON public."Task" USING btree ("discussionId") WHERE ("discussionId" IS NOT NULL);


--
-- TOC entry 4068 (class 1259 OID 4220291)
-- Name: idx_Task_integrationHash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_integrationHash" ON public."Task" USING btree ("integrationHash") WHERE ("integrationHash" IS NOT NULL);


--
-- TOC entry 4069 (class 1259 OID 4220292)
-- Name: idx_Task_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_meetingId" ON public."Task" USING btree ("meetingId") WHERE ("meetingId" IS NOT NULL);


--
-- TOC entry 4070 (class 1259 OID 4220293)
-- Name: idx_Task_teamId_updatedAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_teamId_updatedAt" ON public."Task" USING btree ("teamId", "updatedAt" DESC);


--
-- TOC entry 4071 (class 1259 OID 4220294)
-- Name: idx_Task_threadParentId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_threadParentId" ON public."Task" USING btree ("threadParentId") WHERE ("threadParentId" IS NOT NULL);


--
-- TOC entry 4072 (class 1259 OID 4220295)
-- Name: idx_Task_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Task_userId" ON public."Task" USING btree ("userId") WHERE ("userId" IS NOT NULL);


--
-- TOC entry 4080 (class 1259 OID 4220296)
-- Name: idx_TeamInvitation_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamInvitation_email" ON public."TeamInvitation" USING btree (email);


--
-- TOC entry 4081 (class 1259 OID 4220297)
-- Name: idx_TeamInvitation_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamInvitation_teamId" ON public."TeamInvitation" USING btree ("teamId");


--
-- TOC entry 4082 (class 1259 OID 4220298)
-- Name: idx_TeamInvitation_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamInvitation_token" ON public."TeamInvitation" USING btree (token);


--
-- TOC entry 4085 (class 1259 OID 4220299)
-- Name: idx_TeamMeetingTemplate_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamMeetingTemplate_teamId" ON public."TeamMeetingTemplate" USING btree ("teamId");


--
-- TOC entry 4092 (class 1259 OID 4220300)
-- Name: idx_TeamMemberIntegrationAuths_providerId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamMemberIntegrationAuths_providerId" ON public."TeamMemberIntegrationAuth" USING btree ("providerId");


--
-- TOC entry 4093 (class 1259 OID 4220301)
-- Name: idx_TeamMemberIntegrationAuths_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamMemberIntegrationAuths_teamId" ON public."TeamMemberIntegrationAuth" USING btree ("teamId");


--
-- TOC entry 4088 (class 1259 OID 4220302)
-- Name: idx_TeamMember_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamMember_teamId" ON public."TeamMember" USING btree ("teamId") WHERE ("isNotRemoved" = true);


--
-- TOC entry 4089 (class 1259 OID 4220303)
-- Name: idx_TeamMember_userId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamMember_userId" ON public."TeamMember" USING btree ("userId") WHERE ("isNotRemoved" = true);


--
-- TOC entry 4098 (class 1259 OID 4220304)
-- Name: idx_TeamPromptResponse_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TeamPromptResponse_meetingId" ON public."TeamPromptResponse" USING btree ("meetingId");


--
-- TOC entry 4077 (class 1259 OID 4220305)
-- Name: idx_Team_orgId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Team_orgId" ON public."Team" USING btree ("orgId");


--
-- TOC entry 4103 (class 1259 OID 4220306)
-- Name: idx_TemplateDimension_scaleId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TemplateDimension_scaleId" ON public."TemplateDimension" USING btree ("scaleId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 4104 (class 1259 OID 4220307)
-- Name: idx_TemplateDimension_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TemplateDimension_teamId" ON public."TemplateDimension" USING btree ("teamId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 4105 (class 1259 OID 4220308)
-- Name: idx_TemplateDimension_templateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TemplateDimension_templateId" ON public."TemplateDimension" USING btree ("templateId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 4117 (class 1259 OID 4220309)
-- Name: idx_TemplateScaleValue_templateScaleId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TemplateScaleValue_templateScaleId" ON public."TemplateScaleValue" USING btree ("templateScaleId");


--
-- TOC entry 4110 (class 1259 OID 4220310)
-- Name: idx_TemplateScale_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TemplateScale_teamId" ON public."TemplateScale" USING btree ("teamId") WHERE ("removedAt" IS NULL);


--
-- TOC entry 3883 (class 1259 OID 4220311)
-- Name: idx_Thread_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Thread_meetingId" ON public."Discussion" USING btree ("meetingId");


--
-- TOC entry 3884 (class 1259 OID 4220312)
-- Name: idx_Thread_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_Thread_teamId" ON public."Discussion" USING btree ("teamId");


--
-- TOC entry 4120 (class 1259 OID 4220313)
-- Name: idx_TimelineEvent_meetingId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TimelineEvent_meetingId" ON public."TimelineEvent" USING btree ("meetingId");


--
-- TOC entry 4121 (class 1259 OID 4220314)
-- Name: idx_TimelineEvent_userId_createdAt; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_TimelineEvent_userId_createdAt" ON public."TimelineEvent" USING btree ("userId", "createdAt") WHERE ("isActive" = true);


--
-- TOC entry 4124 (class 1259 OID 4220315)
-- Name: idx_User_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_User_domain" ON public."User" USING btree (domain);


--
-- TOC entry 4125 (class 1259 OID 4220316)
-- Name: idx_User_email; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idx_User_email" ON public."User" USING btree (email);


--
-- TOC entry 3929 (class 1259 OID 4220317)
-- Name: idx_endDateTime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_endDateTime" ON public."Insight" USING btree ("endDateTime");


--
-- TOC entry 3930 (class 1259 OID 4220318)
-- Name: idx_startDateTime; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_startDateTime" ON public."Insight" USING btree ("startDateTime");


--
-- TOC entry 3931 (class 1259 OID 4220319)
-- Name: idx_teamId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_teamId" ON public."Insight" USING btree ("teamId");


--
-- TOC entry 3939 (class 1259 OID 4220320)
-- Name: integration_search_query_unique_not_null; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX integration_search_query_unique_not_null ON public."IntegrationSearchQuery" USING btree ("userId", "teamId", service, query, "providerId") WHERE ("providerId" IS NOT NULL);


--
-- TOC entry 3940 (class 1259 OID 4220321)
-- Name: integration_search_query_unique_null; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX integration_search_query_unique_null ON public."IntegrationSearchQuery" USING btree ("userId", "teamId", service, query) WHERE ("providerId" IS NULL);


--
-- TOC entry 4268 (class 2620 OID 4220322)
-- Name: NewMeeting check_meeting_overlap; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_meeting_overlap BEFORE INSERT ON public."NewMeeting" FOR EACH ROW EXECUTE FUNCTION public.prevent_meeting_overlap();


--
-- TOC entry 4255 (class 2620 OID 4220323)
-- Name: AgendaItem update_AgendaItem_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_AgendaItem_updatedAt" BEFORE UPDATE ON public."AgendaItem" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4256 (class 2620 OID 4220324)
-- Name: AtlassianAuth update_AtlassianAuth_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_AtlassianAuth_updatedAt" BEFORE UPDATE ON public."AtlassianAuth" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4257 (class 2620 OID 4220325)
-- Name: DomainJoinRequest update_DomainJoinRequest_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_DomainJoinRequest_updatedAt" BEFORE UPDATE ON public."DomainJoinRequest" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4258 (class 2620 OID 4220326)
-- Name: EmbeddingsJobQueue update_EmbeddingsJobQueue_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_EmbeddingsJobQueue_updatedAt" BEFORE UPDATE ON public."EmbeddingsJobQueue" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4259 (class 2620 OID 4220327)
-- Name: EmbeddingsMetadata update_EmbeddingsMetadata_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_EmbeddingsMetadata_updatedAt" BEFORE UPDATE ON public."EmbeddingsMetadata" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4260 (class 2620 OID 4220328)
-- Name: GitHubAuth update_GitHubAuth_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_GitHubAuth_updatedAt" BEFORE UPDATE ON public."GitHubAuth" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4261 (class 2620 OID 4220329)
-- Name: IntegrationProvider update_IntegrationProvider_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_IntegrationProvider_updatedAt" BEFORE UPDATE ON public."IntegrationProvider" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4262 (class 2620 OID 4220330)
-- Name: IntegrationSearchQuery update_IntegrationSearchQuery_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_IntegrationSearchQuery_updatedAt" BEFORE UPDATE ON public."IntegrationSearchQuery" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4263 (class 2620 OID 4220331)
-- Name: JiraDimensionFieldMap update_JiraDimensionFieldMap_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_JiraDimensionFieldMap_updatedAt" BEFORE UPDATE ON public."JiraDimensionFieldMap" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4264 (class 2620 OID 4220332)
-- Name: MeetingMember update_MeetingMember_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_MeetingMember_updatedAt" BEFORE UPDATE ON public."MeetingMember" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4265 (class 2620 OID 4220333)
-- Name: MeetingSeries update_MeetingSeries_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_MeetingSeries_updatedAt" BEFORE UPDATE ON public."MeetingSeries" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4266 (class 2620 OID 4220334)
-- Name: MeetingTemplate update_MeetingTemplate_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_MeetingTemplate_updatedAt" BEFORE UPDATE ON public."MeetingTemplate" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4273 (class 2620 OID 4220335)
-- Name: ReflectPrompt update_MeetingTemplate_updatedAt_from_ReflectPrompt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_MeetingTemplate_updatedAt_from_ReflectPrompt" AFTER INSERT OR DELETE OR UPDATE ON public."ReflectPrompt" FOR EACH ROW EXECUTE FUNCTION public."set_MeetingTemplate_updatedAt"();


--
-- TOC entry 4283 (class 2620 OID 4220336)
-- Name: TemplateDimension update_MeetingTemplate_updatedAt_from_TemplateDimension; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_MeetingTemplate_updatedAt_from_TemplateDimension" AFTER INSERT OR DELETE OR UPDATE ON public."TemplateDimension" FOR EACH ROW EXECUTE FUNCTION public."set_MeetingTemplate_updatedAt"();


--
-- TOC entry 4269 (class 2620 OID 4220337)
-- Name: NewMeeting update_NewMeeting_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_NewMeeting_updatedAt" BEFORE UPDATE ON public."NewMeeting" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4270 (class 2620 OID 4220338)
-- Name: Organization update_Organization_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_Organization_updatedAt" BEFORE UPDATE ON public."Organization" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4272 (class 2620 OID 4220339)
-- Name: PollOption update_PollOption_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_PollOption_updatedAt" BEFORE UPDATE ON public."PollOption" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4271 (class 2620 OID 4220340)
-- Name: Poll update_Poll_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_Poll_updatedAt" BEFORE UPDATE ON public."Poll" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4275 (class 2620 OID 4220341)
-- Name: RetroReflectionGroup update_RetroReflectionGroup_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_RetroReflectionGroup_updatedAt" BEFORE UPDATE ON public."RetroReflectionGroup" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4274 (class 2620 OID 4220342)
-- Name: RetroReflection update_RetroReflection_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_RetroReflection_updatedAt" BEFORE UPDATE ON public."RetroReflection" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4276 (class 2620 OID 4220343)
-- Name: SAML update_SAML_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_SAML_updatedAt" BEFORE UPDATE ON public."SAML" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4277 (class 2620 OID 4220344)
-- Name: SlackAuth update_SlackAuth_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_SlackAuth_updatedAt" BEFORE UPDATE ON public."SlackAuth" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4278 (class 2620 OID 4220345)
-- Name: Task update_Task_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_Task_updatedAt" BEFORE UPDATE ON public."Task" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4281 (class 2620 OID 4220346)
-- Name: TeamMemberIntegrationAuth update_TeamMemberIntegrationAuth_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TeamMemberIntegrationAuth_updatedAt" BEFORE UPDATE ON public."TeamMemberIntegrationAuth" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4280 (class 2620 OID 4220347)
-- Name: TeamMember update_TeamMember_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TeamMember_updatedAt" BEFORE UPDATE ON public."TeamMember" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4282 (class 2620 OID 4220348)
-- Name: TeamPromptResponse update_TeamPromptResponse_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TeamPromptResponse_updatedAt" BEFORE UPDATE ON public."TeamPromptResponse" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4279 (class 2620 OID 4220349)
-- Name: Team update_Team_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_Team_updatedAt" BEFORE UPDATE ON public."Team" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4284 (class 2620 OID 4220350)
-- Name: TemplateDimension update_TemplateDimension_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TemplateDimension_updatedAt" BEFORE UPDATE ON public."TemplateDimension" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4285 (class 2620 OID 4220351)
-- Name: TemplateScale update_TemplateDimension_updatedAt_from_TemplateScale; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TemplateDimension_updatedAt_from_TemplateScale" AFTER INSERT OR DELETE OR UPDATE ON public."TemplateScale" FOR EACH ROW EXECUTE FUNCTION public."set_TemplateDimension_updatedAt"();


--
-- TOC entry 4286 (class 2620 OID 4220352)
-- Name: TemplateScale update_TemplateScale_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TemplateScale_updatedAt" BEFORE UPDATE ON public."TemplateScale" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4287 (class 2620 OID 4220353)
-- Name: TemplateScaleValue update_TemplateScale_updatedAt_from_TemplateScaleValue; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_TemplateScale_updatedAt_from_TemplateScaleValue" AFTER INSERT OR DELETE OR UPDATE ON public."TemplateScaleValue" FOR EACH ROW EXECUTE FUNCTION public."set_TemplateScale_updatedAt"();


--
-- TOC entry 4288 (class 2620 OID 4220354)
-- Name: User update_User_updatedAt; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_User_updatedAt" BEFORE UPDATE ON public."User" FOR EACH ROW EXECUTE FUNCTION public."set_updatedAt"();


--
-- TOC entry 4267 (class 2620 OID 4220355)
-- Name: MeetingTemplate update_embedding_on_MeetingTemplate; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "update_embedding_on_MeetingTemplate" AFTER INSERT OR UPDATE ON public."MeetingTemplate" FOR EACH ROW EXECUTE FUNCTION public."updateEmbedding"();


--
-- TOC entry 4135 (class 2606 OID 4220356)
-- Name: DomainJoinRequest DomainJoinRequest_createdBy_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DomainJoinRequest"
    ADD CONSTRAINT "DomainJoinRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4137 (class 2606 OID 4220361)
-- Name: FeatureFlagOwner FeatureFlagOwner_featureFlagId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT "FeatureFlagOwner_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES public."FeatureFlag"(id) ON DELETE CASCADE;


--
-- TOC entry 4138 (class 2606 OID 4220366)
-- Name: FeatureFlagOwner FeatureFlagOwner_orgId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT "FeatureFlagOwner_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4139 (class 2606 OID 4220371)
-- Name: FeatureFlagOwner FeatureFlagOwner_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT "FeatureFlagOwner_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4140 (class 2606 OID 4220376)
-- Name: FeatureFlagOwner FeatureFlagOwner_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeatureFlagOwner"
    ADD CONSTRAINT "FeatureFlagOwner_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4164 (class 2606 OID 4220381)
-- Name: MeetingTemplateUserFavorite MeetingTemplateUserFavorite_templateId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingTemplateUserFavorite"
    ADD CONSTRAINT "MeetingTemplateUserFavorite_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES public."MeetingTemplate"(id) ON DELETE CASCADE;


--
-- TOC entry 4165 (class 2606 OID 4220386)
-- Name: MeetingTemplateUserFavorite MeetingTemplateUserFavorite_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingTemplateUserFavorite"
    ADD CONSTRAINT "MeetingTemplateUserFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4162 (class 2606 OID 4220391)
-- Name: MeetingTemplate MeetingTemplate_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingTemplate"
    ADD CONSTRAINT "MeetingTemplate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4198 (class 2606 OID 4220396)
-- Name: PollOption PollOption_pollId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PollOption"
    ADD CONSTRAINT "PollOption_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES public."Poll"(id) ON DELETE CASCADE;


--
-- TOC entry 4194 (class 2606 OID 4220401)
-- Name: Poll Poll_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id);


--
-- TOC entry 4195 (class 2606 OID 4220406)
-- Name: Poll Poll_discussionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id);


--
-- TOC entry 4196 (class 2606 OID 4220411)
-- Name: Poll Poll_teamId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "Poll_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES public."Team"(id);


--
-- TOC entry 4231 (class 2606 OID 4220416)
-- Name: TeamInvitation fk_acceptedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamInvitation"
    ADD CONSTRAINT "fk_acceptedBy" FOREIGN KEY ("acceptedBy") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4188 (class 2606 OID 4220421)
-- Name: OrganizationApprovedDomain fk_addedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationApprovedDomain"
    ADD CONSTRAINT "fk_addedByUserId" FOREIGN KEY ("addedByUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4171 (class 2606 OID 4220426)
-- Name: Notification fk_archivorUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_archivorUserId" FOREIGN KEY ("archivorUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4172 (class 2606 OID 4220431)
-- Name: Notification fk_authorId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_authorId" FOREIGN KEY ("authorId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4173 (class 2606 OID 4220436)
-- Name: Notification fk_changeAuthorId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_changeAuthorId" FOREIGN KEY ("changeAuthorId") REFERENCES public."TeamMember"(id) ON DELETE CASCADE;


--
-- TOC entry 4174 (class 2606 OID 4220441)
-- Name: Notification fk_commentId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_commentId" FOREIGN KEY ("commentId") REFERENCES public."Comment"(id) ON DELETE CASCADE;


--
-- TOC entry 4131 (class 2606 OID 4220446)
-- Name: Comment fk_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "fk_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4166 (class 2606 OID 4220451)
-- Name: NewMeeting fk_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "fk_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4220 (class 2606 OID 4220456)
-- Name: Task fk_createdBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_createdBy" FOREIGN KEY ("createdBy") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4204 (class 2606 OID 4220461)
-- Name: RetroReflection fk_creatorId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflection"
    ADD CONSTRAINT "fk_creatorId" FOREIGN KEY ("creatorId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4132 (class 2606 OID 4220466)
-- Name: Comment fk_discussionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Comment"
    ADD CONSTRAINT "fk_discussionId" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON DELETE CASCADE;


--
-- TOC entry 4221 (class 2606 OID 4220471)
-- Name: Task fk_discussionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_discussionId" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON DELETE SET NULL;


--
-- TOC entry 4175 (class 2606 OID 4220476)
-- Name: Notification fk_discussionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_discussionId" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON DELETE CASCADE;


--
-- TOC entry 4226 (class 2606 OID 4220481)
-- Name: TaskEstimate fk_discussionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskEstimate"
    ADD CONSTRAINT "fk_discussionId" FOREIGN KEY ("discussionId") REFERENCES public."Discussion"(id) ON DELETE CASCADE;


--
-- TOC entry 4176 (class 2606 OID 4220486)
-- Name: Notification fk_domainJoinRequestId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_domainJoinRequestId" FOREIGN KEY ("domainJoinRequestId") REFERENCES public."DomainJoinRequest"(id) ON DELETE CASCADE;


--
-- TOC entry 4222 (class 2606 OID 4220491)
-- Name: Task fk_doneMeetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_doneMeetingId" FOREIGN KEY ("doneMeetingId") REFERENCES public."NewMeeting"(id) ON DELETE SET NULL;


--
-- TOC entry 4136 (class 2606 OID 4220496)
-- Name: EmbeddingsJobQueue fk_embeddingsMetadataId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."EmbeddingsJobQueue"
    ADD CONSTRAINT "fk_embeddingsMetadataId" FOREIGN KEY ("embeddingsMetadataId") REFERENCES public."EmbeddingsMetadata"(id) ON DELETE SET NULL;


--
-- TOC entry 4177 (class 2606 OID 4220501)
-- Name: Notification fk_evictorUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_evictorUserId" FOREIGN KEY ("evictorUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4158 (class 2606 OID 4220506)
-- Name: MeetingSeries fk_facilitatorId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSeries"
    ADD CONSTRAINT "fk_facilitatorId" FOREIGN KEY ("facilitatorId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4167 (class 2606 OID 4220511)
-- Name: NewMeeting fk_facilitatorUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "fk_facilitatorUserId" FOREIGN KEY ("facilitatorUserId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4239 (class 2606 OID 4220516)
-- Name: TeamMemberIntegrationAuth fk_integrationProvider; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMemberIntegrationAuth"
    ADD CONSTRAINT "fk_integrationProvider" FOREIGN KEY ("providerId") REFERENCES public."IntegrationProvider"(id) ON DELETE CASCADE;


--
-- TOC entry 4148 (class 2606 OID 4220521)
-- Name: IntegrationSearchQuery fk_integrationProvider; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationSearchQuery"
    ADD CONSTRAINT "fk_integrationProvider" FOREIGN KEY ("providerId") REFERENCES public."IntegrationProvider"(id) ON DELETE CASCADE;


--
-- TOC entry 4178 (class 2606 OID 4220526)
-- Name: Notification fk_invitationId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_invitationId" FOREIGN KEY ("invitationId") REFERENCES public."TeamInvitation"(id) ON DELETE CASCADE;


--
-- TOC entry 4232 (class 2606 OID 4220531)
-- Name: TeamInvitation fk_invitedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamInvitation"
    ADD CONSTRAINT "fk_invitedBy" FOREIGN KEY ("invitedBy") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4210 (class 2606 OID 4220536)
-- Name: SAML fk_lastUpdatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SAML"
    ADD CONSTRAINT "fk_lastUpdatedBy" FOREIGN KEY ("lastUpdatedBy") REFERENCES public."User"(id) ON DELETE SET DEFAULT;


--
-- TOC entry 4155 (class 2606 OID 4220541)
-- Name: MeetingMember fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingMember"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4153 (class 2606 OID 4220546)
-- Name: MassInvitation fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MassInvitation"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4233 (class 2606 OID 4220551)
-- Name: TeamInvitation fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamInvitation"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4223 (class 2606 OID 4220556)
-- Name: Task fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE SET NULL;


--
-- TOC entry 4179 (class 2606 OID 4220561)
-- Name: Notification fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4133 (class 2606 OID 4220566)
-- Name: Discussion fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4197 (class 2606 OID 4220571)
-- Name: Poll fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Poll"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4205 (class 2606 OID 4220576)
-- Name: RetroReflection fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflection"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4208 (class 2606 OID 4220581)
-- Name: RetroReflectionGroup fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflectionGroup"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4212 (class 2606 OID 4220586)
-- Name: ScheduledJob fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScheduledJob"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4227 (class 2606 OID 4220591)
-- Name: TaskEstimate fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskEstimate"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4242 (class 2606 OID 4220596)
-- Name: TeamPromptResponse fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamPromptResponse"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4250 (class 2606 OID 4220601)
-- Name: TimelineEvent fk_meetingId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimelineEvent"
    ADD CONSTRAINT "fk_meetingId" FOREIGN KEY ("meetingId") REFERENCES public."NewMeeting"(id) ON DELETE CASCADE;


--
-- TOC entry 4168 (class 2606 OID 4220606)
-- Name: NewMeeting fk_meetingSeriesId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "fk_meetingSeriesId" FOREIGN KEY ("meetingSeriesId") REFERENCES public."MeetingSeries"(id) ON DELETE SET NULL;


--
-- TOC entry 4254 (class 2606 OID 4220611)
-- Name: User fk_newFeatureId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "fk_newFeatureId" FOREIGN KEY ("newFeatureId") REFERENCES public."NewFeature"(id) ON DELETE SET NULL;


--
-- TOC entry 4190 (class 2606 OID 4220616)
-- Name: OrganizationUser fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUser"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4180 (class 2606 OID 4220621)
-- Name: Notification fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4146 (class 2606 OID 4220626)
-- Name: IntegrationProvider fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationProvider"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4189 (class 2606 OID 4220631)
-- Name: OrganizationApprovedDomain fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationApprovedDomain"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4192 (class 2606 OID 4220636)
-- Name: OrganizationUserAudit fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUserAudit"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4213 (class 2606 OID 4220641)
-- Name: ScheduledJob fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ScheduledJob"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4230 (class 2606 OID 4220646)
-- Name: Team fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Team"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4251 (class 2606 OID 4220651)
-- Name: TimelineEvent fk_orgId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimelineEvent"
    ADD CONSTRAINT "fk_orgId" FOREIGN KEY ("orgId") REFERENCES public."Organization"(id) ON DELETE CASCADE;


--
-- TOC entry 4201 (class 2606 OID 4220656)
-- Name: ReflectPrompt fk_parentPromptId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReflectPrompt"
    ADD CONSTRAINT "fk_parentPromptId" FOREIGN KEY ("parentPromptId") REFERENCES public."ReflectPrompt"(id) ON DELETE SET NULL;


--
-- TOC entry 4247 (class 2606 OID 4220661)
-- Name: TemplateScale fk_parentScaleId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScale"
    ADD CONSTRAINT "fk_parentScaleId" FOREIGN KEY ("parentScaleId") REFERENCES public."TemplateScale"(id) ON DELETE SET NULL;


--
-- TOC entry 4163 (class 2606 OID 4220666)
-- Name: MeetingTemplate fk_parentTemplateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingTemplate"
    ADD CONSTRAINT "fk_parentTemplateId" FOREIGN KEY ("parentTemplateId") REFERENCES public."MeetingTemplate"(id) ON DELETE SET NULL;


--
-- TOC entry 4206 (class 2606 OID 4220671)
-- Name: RetroReflection fk_promptId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflection"
    ADD CONSTRAINT "fk_promptId" FOREIGN KEY ("promptId") REFERENCES public."ReflectPrompt"(id) ON DELETE CASCADE;


--
-- TOC entry 4209 (class 2606 OID 4220676)
-- Name: RetroReflectionGroup fk_promptId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflectionGroup"
    ADD CONSTRAINT "fk_promptId" FOREIGN KEY ("promptId") REFERENCES public."ReflectPrompt"(id) ON DELETE CASCADE;


--
-- TOC entry 4207 (class 2606 OID 4220681)
-- Name: RetroReflection fk_reflectionGroupId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RetroReflection"
    ADD CONSTRAINT "fk_reflectionGroupId" FOREIGN KEY ("reflectionGroupId") REFERENCES public."RetroReflectionGroup"(id) ON DELETE CASCADE;


--
-- TOC entry 4181 (class 2606 OID 4220686)
-- Name: Notification fk_requestCreatedBy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_requestCreatedBy" FOREIGN KEY ("requestCreatedBy") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4182 (class 2606 OID 4220691)
-- Name: Notification fk_responseId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_responseId" FOREIGN KEY ("responseId") REFERENCES public."TeamPromptResponse"(id) ON DELETE CASCADE;


--
-- TOC entry 4183 (class 2606 OID 4220696)
-- Name: Notification fk_retroReflectionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_retroReflectionId" FOREIGN KEY ("retroReflectionId") REFERENCES public."RetroReflection"(id) ON DELETE CASCADE;


--
-- TOC entry 4211 (class 2606 OID 4220701)
-- Name: SAMLDomain fk_samlId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SAMLDomain"
    ADD CONSTRAINT "fk_samlId" FOREIGN KEY ("samlId") REFERENCES public."SAML"(id) ON DELETE CASCADE;


--
-- TOC entry 4244 (class 2606 OID 4220706)
-- Name: TemplateDimension fk_scaleId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateDimension"
    ADD CONSTRAINT "fk_scaleId" FOREIGN KEY ("scaleId") REFERENCES public."TemplateScale"(id) ON DELETE CASCADE;


--
-- TOC entry 4160 (class 2606 OID 4220711)
-- Name: MeetingSettings fk_selectedTemplateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSettings"
    ADD CONSTRAINT "fk_selectedTemplateId" FOREIGN KEY ("selectedTemplateId") REFERENCES public."MeetingTemplate"(id) ON DELETE SET NULL;


--
-- TOC entry 4184 (class 2606 OID 4220716)
-- Name: Notification fk_senderUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_senderUserId" FOREIGN KEY ("senderUserId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4185 (class 2606 OID 4220721)
-- Name: Notification fk_taskId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_taskId" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON DELETE CASCADE;


--
-- TOC entry 4228 (class 2606 OID 4220726)
-- Name: TaskEstimate fk_taskId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskEstimate"
    ADD CONSTRAINT "fk_taskId" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON DELETE CASCADE;


--
-- TOC entry 4147 (class 2606 OID 4220731)
-- Name: IntegrationProvider fk_team; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationProvider"
    ADD CONSTRAINT fk_team FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4240 (class 2606 OID 4220736)
-- Name: TeamMemberIntegrationAuth fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMemberIntegrationAuth"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4159 (class 2606 OID 4220741)
-- Name: MeetingSeries fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSeries"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4235 (class 2606 OID 4220746)
-- Name: TeamMeetingTemplate fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMeetingTemplate"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4252 (class 2606 OID 4220751)
-- Name: TimelineEvent fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimelineEvent"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4237 (class 2606 OID 4220756)
-- Name: TeamMember fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4248 (class 2606 OID 4220761)
-- Name: TemplateScale fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScale"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4245 (class 2606 OID 4220766)
-- Name: TemplateDimension fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateDimension"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4218 (class 2606 OID 4220771)
-- Name: SuggestedAction fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SuggestedAction"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4161 (class 2606 OID 4220776)
-- Name: MeetingSettings fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingSettings"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4126 (class 2606 OID 4220781)
-- Name: AgendaItem fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4214 (class 2606 OID 4220786)
-- Name: SlackAuth fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackAuth"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4216 (class 2606 OID 4220791)
-- Name: SlackNotification fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackNotification"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4202 (class 2606 OID 4220796)
-- Name: ReflectPrompt fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReflectPrompt"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4199 (class 2606 OID 4220801)
-- Name: PushInvitation fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushInvitation"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE SET NULL;


--
-- TOC entry 4169 (class 2606 OID 4220806)
-- Name: NewMeeting fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4156 (class 2606 OID 4220811)
-- Name: MeetingMember fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingMember"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4234 (class 2606 OID 4220816)
-- Name: TeamInvitation fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamInvitation"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4224 (class 2606 OID 4220821)
-- Name: Task fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4186 (class 2606 OID 4220826)
-- Name: Notification fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4128 (class 2606 OID 4220831)
-- Name: AtlassianAuth fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AtlassianAuth"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4130 (class 2606 OID 4220836)
-- Name: AzureDevOpsDimensionFieldMap fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AzureDevOpsDimensionFieldMap"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4134 (class 2606 OID 4220841)
-- Name: Discussion fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Discussion"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4141 (class 2606 OID 4220846)
-- Name: GitHubAuth fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubAuth"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4143 (class 2606 OID 4220851)
-- Name: GitHubDimensionFieldMap fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubDimensionFieldMap"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4144 (class 2606 OID 4220856)
-- Name: GitLabDimensionFieldMap fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitLabDimensionFieldMap"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4145 (class 2606 OID 4220861)
-- Name: Insight fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Insight"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4149 (class 2606 OID 4220866)
-- Name: IntegrationSearchQuery fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationSearchQuery"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4151 (class 2606 OID 4220871)
-- Name: JiraDimensionFieldMap fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraDimensionFieldMap"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4152 (class 2606 OID 4220876)
-- Name: JiraServerDimensionFieldMap fk_teamId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."JiraServerDimensionFieldMap"
    ADD CONSTRAINT "fk_teamId" FOREIGN KEY ("teamId") REFERENCES public."Team"(id) ON DELETE CASCADE;


--
-- TOC entry 4127 (class 2606 OID 4220881)
-- Name: AgendaItem fk_teamMemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AgendaItem"
    ADD CONSTRAINT "fk_teamMemberId" FOREIGN KEY ("teamMemberId") REFERENCES public."TeamMember"(id) ON DELETE CASCADE;


--
-- TOC entry 4154 (class 2606 OID 4220886)
-- Name: MassInvitation fk_teamMemberId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MassInvitation"
    ADD CONSTRAINT "fk_teamMemberId" FOREIGN KEY ("teamMemberId") REFERENCES public."TeamMember"(id) ON DELETE CASCADE;


--
-- TOC entry 4236 (class 2606 OID 4220891)
-- Name: TeamMeetingTemplate fk_templateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMeetingTemplate"
    ADD CONSTRAINT "fk_templateId" FOREIGN KEY ("templateId") REFERENCES public."MeetingTemplate"(id) ON DELETE CASCADE;


--
-- TOC entry 4246 (class 2606 OID 4220896)
-- Name: TemplateDimension fk_templateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateDimension"
    ADD CONSTRAINT "fk_templateId" FOREIGN KEY ("templateId") REFERENCES public."MeetingTemplate"(id) ON DELETE CASCADE;


--
-- TOC entry 4203 (class 2606 OID 4220901)
-- Name: ReflectPrompt fk_templateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ReflectPrompt"
    ADD CONSTRAINT "fk_templateId" FOREIGN KEY ("templateId") REFERENCES public."MeetingTemplate"(id) ON DELETE CASCADE;


--
-- TOC entry 4170 (class 2606 OID 4220906)
-- Name: NewMeeting fk_templateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."NewMeeting"
    ADD CONSTRAINT "fk_templateId" FOREIGN KEY ("templateId") REFERENCES public."MeetingTemplate"(id) ON DELETE CASCADE;


--
-- TOC entry 4249 (class 2606 OID 4220911)
-- Name: TemplateScaleValue fk_templateScaleId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TemplateScaleValue"
    ADD CONSTRAINT "fk_templateScaleId" FOREIGN KEY ("templateScaleId") REFERENCES public."TemplateScale"(id) ON DELETE CASCADE;


--
-- TOC entry 4241 (class 2606 OID 4220916)
-- Name: TeamMemberIntegrationAuth fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMemberIntegrationAuth"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4243 (class 2606 OID 4220921)
-- Name: TeamPromptResponse fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamPromptResponse"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4150 (class 2606 OID 4220926)
-- Name: IntegrationSearchQuery fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."IntegrationSearchQuery"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4253 (class 2606 OID 4220931)
-- Name: TimelineEvent fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TimelineEvent"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4191 (class 2606 OID 4220936)
-- Name: OrganizationUser fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUser"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4238 (class 2606 OID 4220941)
-- Name: TeamMember fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TeamMember"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4219 (class 2606 OID 4220946)
-- Name: SuggestedAction fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SuggestedAction"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4215 (class 2606 OID 4220951)
-- Name: SlackAuth fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackAuth"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4217 (class 2606 OID 4220956)
-- Name: SlackNotification fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SlackNotification"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4200 (class 2606 OID 4220961)
-- Name: PushInvitation fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."PushInvitation"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4157 (class 2606 OID 4220966)
-- Name: MeetingMember fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MeetingMember"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4225 (class 2606 OID 4220971)
-- Name: Task fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE SET NULL;


--
-- TOC entry 4187 (class 2606 OID 4220976)
-- Name: Notification fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Notification"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4129 (class 2606 OID 4220981)
-- Name: AtlassianAuth fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AtlassianAuth"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4142 (class 2606 OID 4220986)
-- Name: GitHubAuth fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GitHubAuth"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4193 (class 2606 OID 4220991)
-- Name: OrganizationUserAudit fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."OrganizationUserAudit"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


--
-- TOC entry 4229 (class 2606 OID 4220996)
-- Name: TaskEstimate fk_userId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TaskEstimate"
    ADD CONSTRAINT "fk_userId" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON DELETE CASCADE;


-- Completed on 2025-01-08 21:44:58 UTC

--
-- PostgreSQL database dump complete
--
`
  if (FILE_STORE_PROVIDER !== 'local') {
    if (!CDN_BASE_URL)
      throw new Error('Missng Env: CDN_BASE_URL when FILE_STORE_PROVIDER is not "local"')
    const hostPath = CDN_BASE_URL.replace(/^\/+/, '')
    const stringToReplace = '/self-hosted/Organization/aGhostOrg/template/'
    const replacementStr = `https://${hostPath}/store/Organization/aGhostOrg/template/`
    backupScript = backupScript.replaceAll(stringToReplace, replacementStr)
  }

  await sql`${sql.raw(backupScript)}`.execute(db)
  // pg_dump nulls out the search_path by default (for security) we must set it back or else future queries will fail
  await sql`SELECT pg_catalog.set_config('search_path', 'public', false);`.execute(db)
}

export async function down(db: Kysely<any>): Promise<void> {}
