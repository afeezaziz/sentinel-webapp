-- ==========================================
-- 1. ENABLE EXTENSIONS
-- ==========================================
create extension if not exists "postgis";
create extension if not exists "vector";

-- ==========================================
-- 2. CREATE TABLES
-- ==========================================

-- A. Organizations (Tenants)
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subscription_tier text default 'tier1' check (subscription_tier in ('tier1', 'tier2', 'tier3')),
  created_at timestamptz default now()
);

-- B. User Profiles (Extends Supabase Auth)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  organization_id uuid references public.organizations(id),
  full_name text,
  role text default 'engineer' check (role in ('admin', 'engineer', 'field_tech')),
  created_at timestamptz default now()
);

-- C. Assets (Pipelines)
create table public.assets (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  name text not null,
  description text,
  -- Geometry: Stores the pipeline route (LineString) in WGS84 (SRID 4326)
  geom geometry(LineString, 4326),
  -- Static Design Parameters (JSONB for flexibility)
  -- Ex: { "maop": 1000, "material": "X65", "diameter_in": 24, "install_year": 1995 }
  design_specs jsonb default '{}'::jsonb,
  -- Current aggregated risk state
  current_risk_matrix_pos text default 'A1', -- e.g., 'E5'
  created_at timestamptz default now()
);

-- D. Risks (Alerts / Anomalies)
create table public.risks (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  asset_id uuid references public.assets(id) on delete cascade,
  -- Type of risk detected
  risk_type text check (risk_type in ('TPA', 'SUBSIDENCE', 'VEGETATION', 'CLASS_CHANGE', 'EROSION')),
  -- Predictive Risk Score (0.0 to 10.0)
  pirs_score float default 0.0,
  -- Workflow Status
  status text default 'OPEN' check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'FALSE_POSITIVE')),
  -- Location of the specific anomaly (Point or Polygon)
  geom geometry(Geometry, 4326),
  -- Evidence URLs (from Storage)
  image_before_url text,
  image_after_url text,
  description text,
  detected_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- E. Documents (Knowledge Base / RAG)
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  asset_id uuid references public.assets(id) on delete cascade,
  filename text not null,
  file_url text not null,
  doc_type text check (doc_type in ('INSPECTION', 'MAINTENANCE', 'DESIGN', 'SOIL_SURVEY', 'OTHER')),
  -- Extracted metadata from the file (e.g., {"inspection_date": "2023-01-01"})
  extracted_metadata jsonb default '{}'::jsonb,
  -- Vector embedding for search (1536 dimensions for OpenAI text-embedding-3-small)
  embedding vector(1536),
  -- The raw text content chunk (for context retrieval)
  content_chunk text,
  created_at timestamptz default now()
);

-- F. Reports (Generated PDFs)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  organization_id uuid references public.organizations(id) not null,
  title text not null,
  report_type text check (report_type in ('INCIDENT', 'MONTHLY_SUMMARY', 'RBI_ANALYSIS')),
  file_url text,
  status text default 'GENERATING' check (status in ('GENERATING', 'READY', 'FAILED')),
  created_at timestamptz default now()
);

-- ==========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ==========================================
-- This ensures users can ONLY access data from their own organization.

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.assets enable row level security;
alter table public.risks enable row level security;
alter table public.documents enable row level security;
alter table public.reports enable row level security;

-- ==========================================
-- 4. RLS POLICIES
-- ==========================================

-- Helper function to get current user's org_id
create or replace function get_user_org_id()
returns uuid as $$
  select organization_id from public.users where id = auth.uid();
$$ language sql security definer;

-- A. Assets Policy
create policy "Users can view their org assets"
on public.assets for select
using (organization_id = get_user_org_id());

create policy "Admins can insert/update their org assets"
on public.assets for all
using (organization_id = get_user_org_id());

-- B. Risks Policy
create policy "Users can view their org risks"
on public.risks for select
using (organization_id = get_user_org_id());

create policy "Users can update their org risks"
on public.risks for update
using (organization_id = get_user_org_id());

-- C. Documents Policy
create policy "Users can view their org documents"
on public.documents for select
using (organization_id = get_user_org_id());

create policy "Users can insert their org documents"
on public.documents for insert
with check (organization_id = get_user_org_id());

-- D. Reports Policy
create policy "Users can view their org reports"
on public.reports for select
using (organization_id = get_user_org_id());

-- E. Users Policy (Users can see profiles in same org)
create policy "Users can view profiles in same org"
on public.users for select
using (organization_id = get_user_org_id());

-- ==========================================
-- 5. AUTOMATION (Triggers)
-- ==========================================

-- Trigger: When a new Auth User is created, create a profile in public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, organization_id, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    (new.raw_user_meta_data->>'organization_id')::uuid, -- Expects org_id passed in metadata
    'engineer' -- Default role
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 6. INDEXES (Performance)
-- ==========================================
-- Spatial Index for fast geo-queries
create index assets_geom_idx on public.assets using gist (geom);
create index risks_geom_idx on public.risks using gist (geom);

-- Vector Index for fast RAG search (IVFFlat)
-- Note: Requires some data to work well, creating placeholder
-- create index on public.documents using ivfflat (embedding vector_cosine_ops) with (lists = 100);