import {type Kysely, sql} from 'kysely'

// `any` is required here since migrations should be frozen in time. alternatively, keep a "snapshot" db interface.
export async function up(db: Kysely<any>): Promise<void> {
  // Removed team members and org users still counted toward page access, and the org trigger's
  // `!=` against a NULL removedAt never fired, so leaving a team or org never revoked page access
  await sql`
CREATE OR REPLACE FUNCTION "updatePageAccess"(
  "_userIds" VARCHAR[],
  "_pageIds" INT[]
) RETURNS VOID AS $$
BEGIN
  WITH
    effective_roles AS (
      SELECT "userId", "pageId", MIN(role) AS "strongestRole"
      FROM (
        SELECT pua."userId", pua."pageId", pua.role
        FROM "PageUserAccess" pua
        WHERE pua."userId" = ANY("_userIds") AND pua."pageId" = ANY("_pageIds")

        UNION ALL

        SELECT tm."userId", pta."pageId", pta.role
        FROM "PageTeamAccess" pta
        JOIN "TeamMember" tm ON pta."teamId" = tm."teamId" AND tm."isNotRemoved" = TRUE
        WHERE tm."userId" = ANY("_userIds") AND pta."pageId" = ANY("_pageIds")

        UNION ALL

        SELECT ou."userId", poa."pageId", poa.role
        FROM "PageOrganizationAccess" poa
        JOIN "OrganizationUser" ou ON poa."orgId" = ou."orgId" AND ou."removedAt" IS NULL
        WHERE ou."userId" = ANY("_userIds") AND poa."pageId" = ANY("_pageIds")
      ) combined
      GROUP BY "userId", "pageId"
    ),
    existing_access AS (
      SELECT "userId", "pageId", role AS "currentRole"
      FROM "PageAccess"
      WHERE "userId" = ANY("_userIds") AND "pageId" = ANY("_pageIds")
    ),
    to_upsert AS (
      SELECT er."userId", er."pageId", er."strongestRole"
      FROM effective_roles er
      LEFT JOIN existing_access ea ON ea."userId" = er."userId" AND ea."pageId" = er."pageId"
      WHERE ea."currentRole" IS DISTINCT FROM er."strongestRole"
    ),
    to_delete AS (
      SELECT ea."userId", ea."pageId"
      FROM existing_access ea
      LEFT JOIN effective_roles er ON er."userId" = ea."userId" AND er."pageId" = ea."pageId"
      WHERE er."userId" IS NULL
    ),
    upserted AS (
      INSERT INTO "PageAccess" ("userId", "pageId", role)
      SELECT "userId", "pageId", "strongestRole" FROM to_upsert
      ON CONFLICT ("userId", "pageId") DO UPDATE
      SET role = EXCLUDED.role
      WHERE "PageAccess".role IS DISTINCT FROM EXCLUDED.role
    )
  DELETE FROM "PageAccess"
  USING to_delete td
  WHERE "PageAccess"."userId" = td."userId"
    AND "PageAccess"."pageId" = td."pageId";

  PERFORM "maybeMarkPrivate"("_pageIds");
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "updateOrgPageAccessByOrgUser"()
RETURNS TRIGGER AS $$
DECLARE
  "_pageIds" INT[];
  "_userId" VARCHAR := COALESCE(NEW."userId", OLD."userId");
BEGIN
  IF TG_OP != 'UPDATE' OR NEW."removedAt" IS DISTINCT FROM OLD."removedAt" THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO "PageAccess" ("pageId", role, "userId")
      SELECT "pageId", role, "_userId"
      FROM "PageOrganizationAccess"
      WHERE "orgId" = NEW."orgId"
      ON CONFLICT ("userId", "pageId") DO UPDATE
      SET role = EXCLUDED.role
      WHERE "PageAccess".role > EXCLUDED.role;
    ELSE
      SELECT ARRAY(
        SELECT "pageId" FROM "PageOrganizationAccess" WHERE "orgId" = COALESCE(NEW."orgId", OLD."orgId")
      ) INTO "_pageIds";
      PERFORM "updatePageAccess"(ARRAY["_userId"], "_pageIds");
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`.execute(db)

  await sql`
    SELECT "updatePageAccess"(
      ARRAY[tm."userId"]::VARCHAR[],
      ARRAY(SELECT pta."pageId" FROM "PageTeamAccess" pta WHERE pta."teamId" = tm."teamId")
    )
    FROM "TeamMember" tm
    WHERE tm."isNotRemoved" = FALSE
      AND EXISTS (SELECT 1 FROM "PageTeamAccess" pta WHERE pta."teamId" = tm."teamId")
  `.execute(db)
  await sql`
    SELECT "updatePageAccess"(
      ARRAY[ou."userId"]::VARCHAR[],
      ARRAY(SELECT poa."pageId" FROM "PageOrganizationAccess" poa WHERE poa."orgId" = ou."orgId")
    )
    FROM "OrganizationUser" ou
    WHERE ou."removedAt" IS NOT NULL
      AND EXISTS (SELECT 1 FROM "PageOrganizationAccess" poa WHERE poa."orgId" = ou."orgId")
  `.execute(db)
}

export async function down(): Promise<void> {}
