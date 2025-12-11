-- ==========================================
-- UPDATED RLS POLICIES FOR ADMIN ACCESS
-- ==========================================
-- This allows admin users to see all organizations and users
-- while regular users only see their own organization data

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can insert/update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view profiles in same org" ON public.users;

-- ==========================================
-- ORGANIZATIONS TABLE POLICIES
-- ==========================================

-- Admin users can view all organizations
CREATE POLICY "Admin users can view all organizations"
ON public.organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can only view their own organization
CREATE POLICY "Users can view their own organization"
ON public.organizations FOR SELECT
USING (
  id = (
    SELECT organization_id FROM public.users
    WHERE id = auth.uid()
  )
);

-- Admin users can manage all organizations
CREATE POLICY "Admin users can manage all organizations"
ON public.organizations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users cannot modify organizations (no INSERT/UPDATE policy)

-- ==========================================
-- USERS TABLE POLICIES
-- ==========================================

-- Admin users can view all users
CREATE POLICY "Admin users can view all users"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Non-admin users can view users in their organization
CREATE POLICY "Users can view users in same organization"
ON public.users FOR SELECT
USING (
  organization_id = (
    SELECT organization_id FROM public.users
    WHERE id = auth.uid()
  )
);

-- Admin users can manage all users
CREATE POLICY "Admin users can manage all users"
ON public.users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
    AND u.role = 'admin'
  )
);

-- Non-admin users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (id = auth.uid());

-- ==========================================
-- ASSETS TABLE POLICIES (Updated)
-- ==========================================

-- Admin users can view all assets
CREATE POLICY "Admin users can view all assets"
ON public.assets FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can view their org assets
CREATE POLICY "Users can view their org assets"
ON public.assets FOR SELECT
USING (organization_id = get_user_org_id());

-- Admin users can manage all assets
CREATE POLICY "Admin users can manage all assets"
ON public.assets FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can insert/update their org assets
CREATE POLICY "Users can insert/update their org assets"
ON public.assets FOR ALL
USING (organization_id = get_user_org_id());

-- ==========================================
-- RISKS TABLE POLICIES (Updated)
-- ==========================================

-- Admin users can view all risks
CREATE POLICY "Admin users can view all risks"
ON public.risks FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can view their org risks
CREATE POLICY "Users can view their org risks"
ON public.risks FOR SELECT
USING (organization_id = get_user_org_id());

-- Admin users can manage all risks
CREATE POLICY "Admin users can manage all risks"
ON public.risks FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can update their org risks
CREATE POLICY "Users can update their org risks"
ON public.risks FOR UPDATE
USING (organization_id = get_user_org_id());

-- ==========================================
-- DOCUMENTS TABLE POLICIES (Updated)
-- ==========================================

-- Admin users can view all documents
CREATE POLICY "Admin users can view all documents"
ON public.documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can view their org documents
CREATE POLICY "Users can view their org documents"
ON public.documents FOR SELECT
USING (organization_id = get_user_org_id());

-- Admin users can manage all documents
CREATE POLICY "Admin users can manage all documents"
ON public.documents FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can insert their org documents
CREATE POLICY "Users can insert their org documents"
ON public.documents FOR INSERT
WITH CHECK (organization_id = get_user_org_id());

-- ==========================================
-- REPORTS TABLE POLICIES (Updated)
-- ==========================================

-- Admin users can view all reports
CREATE POLICY "Admin users can view all reports"
ON public.reports FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Non-admin users can view their org reports
CREATE POLICY "Users can view their org reports"
ON public.reports FOR SELECT
USING (organization_id = get_user_org_id());

-- Admin users can manage all reports
CREATE POLICY "Admin users can manage all reports"
ON public.reports FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- ==========================================
-- SUMMARY OF NEW BEHAVIOR:
-- ==========================================
-- ADMIN USERS (role = 'admin'):
-- - Can see ALL organizations
-- - Can see ALL users across all organizations
-- - Can see ALL assets, risks, documents, reports
-- - Full CRUD permissions on all data
--
-- REGULAR USERS (role = 'engineer'/'field_tech'):
-- - Can only see their own organization
-- - Can only see users in their organization
-- - Can only see/modify data in their organization
-- - Standard CRUD permissions within their org