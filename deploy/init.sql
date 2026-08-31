-- CaseVault seed data for demo / testing
-- Run: docker compose exec backend psql -U postgres -d casevault -f /docker-entrypoint-initdb.d/02-seed.sql

-- Insert a default organization
INSERT INTO organizations (id, name, slug) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Demo Law Firm',
    'demo-law-firm'
);

-- Insert a demo user (attorney)
INSERT INTO users (id, organization_id, email, name, role) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'admin@demolaw.example',
    'Jane Attorney',
    'admin'
);

-- Insert a demo matter
INSERT INTO matters (id, organization_id, name, description, status) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Smith v. Acme Corp',
    'Employment discrimination — initial filing',
    'active'
);

-- Add user to matter
INSERT INTO matter_memberships (id, matter_id, user_id, role) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',  -- matter_id
    '00000000-0000-0000-0000-000000000001',  -- user_id
    'editor'
);
