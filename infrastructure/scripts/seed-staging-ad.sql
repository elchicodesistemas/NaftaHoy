-- Exclusivo para staging. Se corta antes de escribir si se apunta por error a otra base.
DO $$
BEGIN
  IF current_database() <> 'naftahoy_staging' THEN
    RAISE EXCEPTION 'Este seed solo puede ejecutarse en naftahoy_staging (base actual: %)', current_database();
  END IF;
END
$$;

INSERT INTO "Advertiser" ("id", "name", "active")
VALUES ('00000000-0000-4000-8000-000000000001', 'Anunciante de prueba — STAGING', true)
ON CONFLICT ("id") DO UPDATE SET "name" = EXCLUDED."name", "active" = true;

INSERT INTO "Campaign" ("id", "advertiserId", "name", "startsAt", "endsAt", "active")
VALUES (
  '00000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001',
  'Campaña de prueba — STAGING',
  NOW() - INTERVAL '1 minute',
  NULL,
  true
)
ON CONFLICT ("id") DO UPDATE
  SET "startsAt" = EXCLUDED."startsAt", "endsAt" = NULL, "active" = true;

INSERT INTO "Ad" ("id", "campaignId", "name", "imageUrl", "destinationUrl", "placement", "active")
VALUES (
  '00000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000002',
  'Publicidad de prueba — STAGING',
  NULL,
  'https://naftahoy.com/staging/',
  'home-top',
  true
)
ON CONFLICT ("id") DO UPDATE
  SET "name" = EXCLUDED."name", "imageUrl" = NULL,
      "destinationUrl" = EXCLUDED."destinationUrl", "placement" = EXCLUDED."placement", "active" = true;
