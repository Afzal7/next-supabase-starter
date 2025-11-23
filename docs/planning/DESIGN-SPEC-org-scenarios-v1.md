# DESIGN-SPEC-org-scenarios-v4.md

## SECTION 1: USER JOURNEYS

### Journey: First Login Without Organization
Entry: User completes login, redirected to dashboard
Context: New or returning user with no organization membership, wants to get started

STEP 1: Dashboard Landing
  User sees: Welcome header "Welcome to [App Name]", subtitle "Get started by creating your first organization or joining an existing one", prominent "Create Organization" button, secondary "Join via Invitation" link, sidebar with platform navigation (Profile, Settings available), workspace section hidden or shows "No organization selected"
  User does: Clicks "Create Organization"
  System responds: Opens create organization modal

  States:
    Empty: Clean dashboard with onboarding content
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Create Organization Modal
  User sees: Modal with title "Create Organization", name input labeled "Organization Name" with placeholder "My Organization", slug input labeled "Slug" with placeholder "my-organization" (auto-generated from name), description textarea labeled "Description (optional)" with placeholder "Brief description of your organization", type select labeled "Type" with options "Personal", "Team", "Enterprise" (default "Team"), primary blue "Create Organization" button, secondary gray "Cancel" button
  User does: Fills required fields (name, slug), submits
  System responds: Loading spinner on button, form fields disabled, success green toast "Organization created successfully", modal closes, dashboard refreshes with new org context

  States:
    Empty: Form ready with auto-generated slug, all fields enabled
    Loading: Button shows "Creating..." with spinner, all form fields disabled
    Error: Red text below name field "Organization name is required", below slug field "This slug is already taken. Please choose a different one."
    Success: Modal closes, org becomes active, dashboard shows org context

EXIT:
  User sees: Dashboard with active organization context, workspace sidebar appears, breadcrumb shows organization name
  User knows: Organization created and active, can now access org-dependent features

### Journey: Joining Organization via Invitation
Entry: User clicks invitation link from email
Context: Invited to join an organization

STEP 1: Invitation Landing Page
  User sees: Centered card with organization logo (default building icon if none), title "You've been invited to join [Org Name]", subtitle "Invited by [Inviter Name]", role badge "Role: [Role]", description paragraph "[Org Description]", green "Accept Invitation" button, red "Decline" button
  User does: Clicks "Accept Invitation"
  System responds: If not logged in, redirects to login with message "Please sign in to accept this invitation", return URL preserved; after login, shows invitation page again

  States:
    Empty: Invitation details displayed, buttons enabled
    Loading: Buttons show "Processing..." with spinners, disabled
    Error: Red banner at top "This invitation is invalid or has expired. Please request a new invitation from the organization admin." with "Request New Invitation" button
    Success: Green banner "Successfully joined [Org Name] as [Role]"

DECISION POINT:
  If user not logged in → Redirect to login page with "Please sign in to accept this invitation" message, return URL preserved
  If user already member of an organization → Show red banner "You can only be a member of one organization. Leave your current organization first to accept this invitation." with "Go to Settings" button

STEP 2: Post-Accept Redirect
  User sees: Dashboard with new organization active, success banner "Welcome to [org name]!"
  User does: Can immediately access org features
  System responds: Org context activated, workspace sidebar appears

EXIT:
  User sees: Full dashboard with active organization
  User knows: Joined and can use all org features

### Journey: Attempting to Join When Already in Organization
Entry: User clicks invitation link from email, already has an organization membership
Context: Wants to join another organization but is limited to one

STEP 1: Invitation Landing Page
  User sees: Card with organization name/logo, "You've been invited by [inviter name]", role offered, organization description, accept/reject buttons, red banner "You can only be a member of one organization. Leave your current organization first to accept this invitation." with "Go to Settings" button
  User does: Clicks "Go to Settings"
  System responds: Redirects to organization settings page

  States:
    Empty: Invitation details displayed with error banner
    Loading: N/A
    Error: Banner as described
    Success: N/A

EXIT:
  User sees: Organization settings page with leave option
  User knows: Must leave current org to join new one

### Journey: Accessing Organization-Independent Features
Entry: User in dashboard, any organization context
Context: User needs to access personal settings or app preferences

STEP 1: Platform Navigation
  User sees: Sidebar platform section with Profile, Settings links (always available), Invitations link (personal invitations)
  User does: Clicks Profile or Settings
  System responds: Navigates to page, content loads independently of org context

  States:
    Empty: Page content displayed
    Loading: Skeleton loading
    Error: Error banner with retry
    Success: Full page content

STEP 2: Profile/Settings Page
  User sees: Form fields for user preferences, account settings, app configuration (theme, notifications, etc.)
  User does: Makes changes, saves
  System responds: Loading, success toast, changes applied globally

  States:
    Empty: Current settings displayed
    Loading: Save button shows "Saving..." with spinner
    Error: Red text below fields for validation errors
    Success: Green toast "Settings saved"

EXIT:
  User sees: Updated settings applied, can continue using app
  User knows: Personal preferences updated, independent of organization context

### Journey: Leaving the Organization
Entry: User in organization settings, wants to leave membership
Context: User wants to remove membership, returning to no-org state

STEP 1: Organization Settings
  User sees: Organization settings page with red "Leave Organization" button at bottom, above it warning text in red "This action cannot be undone. You'll lose access to all organization resources and return to no organization state."
  User does: Clicks "Leave Organization"
  System responds: Opens confirmation modal

  States:
    Empty: Settings page displayed, button enabled
    Loading: N/A
    Error: N/A
    Success: N/A

STEP 2: Confirmation Modal
  User sees: Modal with title "Leave Organization", warning text "Are you sure you want to leave [Org Name]? You'll lose access to all its resources and data.", red "Leave Organization" button, gray "Cancel" button
  User does: Clicks "Leave Organization"
  System responds: Loading, success message, redirects to dashboard

  States:
    Empty: Modal displayed, buttons enabled
    Loading: Button shows "Leaving..." with spinner, buttons disabled
    Error: Red text in modal "Cannot leave organization: you are the only owner. Transfer ownership to another member first." with "Transfer Ownership" button
    Success: Modal closes, green toast "You have left [Org Name]", redirect to dashboard, return to no-org onboarding

EXIT:
  User sees: Dashboard with onboarding prompt, no workspace sidebar
  User knows: Left organization, back to initial state

## SECTION 2: BEHAVIORS & REQUIREMENTS

REQ-1: Organization Context Management
When user: Creates or joins first organization
System shall: Update all UI elements to reflect new active organization context
Why: Ensures consistent experience across all features

Acceptance Criteria:
  Given user creates first org, When creation succeeds, Then org becomes active, workspace sidebar appears with sections "Members", "Groups", "Invitations", "Settings"
  Given user joins org via invitation, When acceptance succeeds, Then org becomes active, dashboard shows org context with success banner "Welcome to [Org Name]!"
  Given org context activated, When dashboard loads, Then sidebar workspace shows org's sections, breadcrumb shows "Home > [Org Name]", main content shows org's data

Test: Create/join org, verify all UI updates immediately

REQ-2: Feature Access Gating
When user: Views interface without active organization
System shall: Show specific prompts for org-dependent features, disable/hide org-required actions with clear messaging
Why: Guides users to create or join organizations before accessing dependent features

Acceptance Criteria:
  Given no active org, When user views dashboard, Then show card with building icon, title "Create your first organization", description "Start collaborating by creating an organization", primary blue "Create Organization" button, secondary "Join via Invitation" link
  Given no active org, When user tries org-dependent nav, Then show tooltip "Create an organization first" on hover, link disabled with gray color and no pointer cursor
  Given no active org, When user accesses org page URL, Then redirect to dashboard with red banner "Please create or join an organization first" and "Create Organization" button
  Given no active org, When user clicks disabled nav, Then show modal "Organization Required" with title "Organization Required", message "This feature requires an active organization. Create one to get started.", "Create Organization" button, "Join via Invitation" link
  Given org created, When user views dashboard, Then show org overview card with org name, description, member count "X members", instead of prompt

REQ-3: First-Time User Onboarding
When user: Logs in without organizations
System shall: Provide clear next steps with prominent CTAs and progressive guidance
Why: Reduces friction for new users getting started

Acceptance Criteria:
  Given first login no org, When dashboard loads, Then show hero section with large "Welcome to [App Name]!" title, subtitle "Get started by creating your first organization", primary blue "Create Organization" button, secondary gray "Join via Invitation" link
  Given first login no org, When sidebar loads, Then platform nav (Profile, Settings) available, workspace section hidden or shows grayed text "Get started by creating an organization"
  Given org created, When dashboard refreshes, Then onboarding content replaced with org overview card showing org name, type, member count

REQ-4: Invitation Handling
When user: Receives organization invitation
System shall: Handle invitations appropriately based on user's current org status
Why: Ensures smooth onboarding for invited users

Acceptance Criteria:
  Given invitation link, no org, When user accepts, Then org becomes active, dashboard shows org context with success banner "Welcome to [Org Name]!"
  Given invitation link, has org, When user clicks, Then show red banner "You can only be a member of one organization. Leave your current organization first to accept this invitation." with "Go to Settings" button
  Given invitation expired, When user clicks, Then show red banner "This invitation has expired. Please request a new invitation from the organization admin." with "Request New Invitation" button
  Given invitation for existing member, When user clicks, Then show yellow banner "You're already a member of this organization."

REQ-5: Single Organization Enforcement
When user: Attempts to join organization while already a member
System shall: Block the action with clear error message and guidance to leave current org
Why: Enforces the single-organization-per-user business rule

Acceptance Criteria:
  Given user has org, When attempts to accept invitation, Then show red banner "You can only be a member of one organization. Leave your current organization first." with "Go to Settings" button
  Given user clicks "Go to Settings", When redirected, Then show organization settings page with "Leave Organization" option
  Given user leaves org, When returns to invitation, Then allow acceptance as normal

Test: Accept invitation while in org, verify error and redirect flow

REQ-6: Organization Leaving
When user: Leaves their organization
System shall: Remove membership and return to no-org state with onboarding
Why: Allows users to change organizations or exit org-based features

Acceptance Criteria:
  Given user in org settings, When clicks "Leave Organization", Then show confirmation modal with warning "This action cannot be undone. You'll lose access to all organization resources."
  Given user confirms leave, When processing, Then show loading, then green toast "You have left [Org Name]", redirect to dashboard with onboarding prompt
  Given leaving as only owner, When attempts, Then show error "Cannot leave organization: you are the only owner. Transfer ownership to another member first." with "Transfer Ownership" button

## SECTION 3: BUSINESS RULES

Rule: Single Organization Membership
If user attempts to join organization when already a member → Show red error "You can only be a member of one organization. Leave your current organization first."
Why: Enforces single-org-per-user constraint

Rule: Permission Inheritance
If user joins organization → Permissions set based on user's role in the organization
Why: Ensures security and appropriate access controls

Rule: Organization Creation Validation
If user creates organization → Auto-set as active, validate unique slug, ensure user has no existing membership
Why: Maintains data integrity and single-org rule

Rule: Context Persistence
If user has organization → Persist active organization in localStorage, restore on next login
Why: Maintains user context across sessions

Rule: Feature Dependency Classification
If feature requires organization context → Classify as org-dependent (groups management, members, org-specific invitations, org settings) or org-independent (user profile, app settings, personal invitations)
Why: Clear separation of functionality and access requirements

Rule: Organization Leaving Logic
If user leaves organization → Enter no-org state, allow creating/joining new org; prevent leaving if user is only owner
Why: Enables org changes while preventing orphaned organizations

Rule: Invitation Types
If invitation sent → All invitations are organization-specific, requiring acceptance into particular org
Why: Maintains clear org boundaries and membership control

## SECTION 4: DESIGN CONSTRAINTS

**Accessibility (WCAG 2.1 AA - mandatory):**
- All interactive elements keyboard navigable (Tab, Arrow, Enter keys)
- Screen reader compatible (semantic HTML, ARIA labels like aria-label, aria-describedby)
- Color contrast: Text 4.5:1 minimum, UI components 3:1 minimum
- Focus indicators: 2px solid visible outline on focus
- Touch targets: Minimum 44px height/width for buttons, 48px recommended
- Error messages: Associated with inputs using aria-describedby

**Device Support:**
- iOS 15+, Android 11+, Chrome/Firefox/Safari 100+
- Responsive breakpoints: Mobile (375px), Tablet (768px), Desktop (1440px)
- Touch interactions: Swipe gestures for navigation, tap for actions

**Performance:**
- Page load: Initial content visible <3s
- Button response: Visual feedback within 100ms
- Loading states: Show for operations >200ms
- Error display: Message appears within 100ms
- Context switch: Complete within 500ms with loading indicator
- Invitation processing: Handle within 1s for immediate feedback

**Psychology Principles Applied:**
- Cognitive Load: Single org context reduces complexity (Miller's Law)
- Familiarity: Standard modal patterns for creation, clear visual hierarchy (Jakob's Law)
- Feedback: Immediate visual confirmation for all actions (Doherty Threshold <400ms)
- Progressive Disclosure: Workspace sections appear only with active org

**Configurable UI:**
- Entity names: Use config.entityName ("Organization") and entityNamePlural ("Organizations")
- Limits: Display current/max counts (e.g., "2/5 organizations used")
- Roles: Use config.defaultRoles for dropdowns and displays
- Features: Conditionally show/hide based on config.features

## SECTION 5: ACCEPTANCE CRITERIA

Design passes when:

For each user journey:
  [ ] User can complete from entry to exit without confusion
  [ ] Each decision point has obvious visual cues (buttons, links clearly labeled)
  [ ] All error states show specific, actionable error messages with recovery steps
  [ ] Next action is always clear (no dead ends, obvious CTAs)

For each requirement:
  [ ] Observable UI behavior exactly matches specification (text, colors, layout)
  [ ] Error recovery path is one-click (retry buttons, clear instructions)
  [ ] Feedback is immediate (<100ms visual, <400ms functional)

Accessibility:
  [ ] All interactive elements reachable via Tab key in logical order
  [ ] Focus visible on every interactive element (2px outline)
  [ ] Screen reader can describe all content (test with NVDA/JAWS/VoiceOver)
  [ ] Color contrast passes WAVE or Axe DevTools checker
  [ ] Touch targets meet 44px minimum on mobile
  [ ] Organization switcher has aria-expanded, aria-selected for active org

Performance:
  [ ] No operation completes without loading state if >200ms
  [ ] Buttons respond visually within perceived instant time
  [ ] Page loads show content within 3 seconds
  [ ] Organization switch completes within 500ms
  [ ] Invitation acceptance processes within 1s

Organization Scenarios:
  [ ] First login without org shows onboarding prompt, no workspace sidebar
  [ ] Creating/joining org activates context, shows workspace sections
  [ ] Single-org users have no switcher, context is always the one org
  [ ] Org-independent features (Profile, Settings) always accessible regardless of org context
  [ ] Org-dependent features show appropriate prompts when no active org
  [ ] Leaving org returns to no-org state with onboarding
  [ ] Invitations block acceptance if already in org, guide to leave first
  [ ] Organization context persists across sessions

Testing:
  - Designer walkthrough: Complete each org scenario without hesitation, noting any unclear steps
  - Accessibility check: Tab through modals and forms, verify focus indicators, test with screen reader, check aria attributes
  - Performance check: Time org creation/join/leave and invitation processing, verify loading states appear appropriately
  - Config check: Mock different org types, verify UI adapts
  - Error check: Trigger org creation/join/leave failures, verify messages and recovery
  - Persistence check: Create/join org, refresh page, verify active org restored
  - Edge case check: Leave org, verify return to no-org state; accept invitation while in org, verify block and redirect flow