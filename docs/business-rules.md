# Serenity Plus Business Rules

## BR-001: User Onboarding Flow
**Description**: New users must complete a 4-step onboarding process before accessing the main app.

**Acceptance Criteria**:
- [ ] Users without `userId` in localStorage are redirected to `/welcome`
- [ ] Welcome screen shows different content for invited vs non-invited users
- [ ] Nickname screen validates 2-20 characters, letters/numbers/spaces only
- [ ] Meditation frequency screen defaults to "5 times per week"
- [ ] Meditation length screen defaults to "30 minutes"
- [ ] All onboarding data is stored in localStorage and database
- [ ] Users are redirected to homepage after completing onboarding

## BR-002: Invitation System
**Description**: Users can invite meditation partners via shareable links and QR codes.

**Acceptance Criteria**:
- [ ] Invite links are generated with unique codes
- [ ] QR codes are generated for invite links
- [ ] Invited users see inviter's name and profile picture on welcome screen
- [ ] Invitation acceptance creates a partnership
- [ ] Partnerships combine weekly goals from both users
- [ ] Invite links expire after 7 days

## BR-003: Partnership Management
**Description**: Users can have meditation partnerships with accountability features.

**Acceptance Criteria**:
- [ ] Users can have multiple partnerships
- [ ] Partnership creation requires valid invite code
- [ ] Weekly goals are combined from both partners
- [ ] Partnership data includes sit counts and scores
- [ ] Partnerships track current week progress

## BR-004: Meditation Tracking
**Description**: Users track their meditation sessions with partner accountability.

**Acceptance Criteria**:
- [ ] Users can log meditation sessions
- [ ] Sessions are tracked per week
- [ ] Progress is visible to partners
- [ ] Weekly goals are enforced
- [ ] Scores are calculated based on consistency

## BR-005: PWA Functionality
**Description**: The app works as a Progressive Web App with mobile installation.

**Acceptance Criteria**:
- [ ] App can be installed on mobile devices
- [ ] Service worker is registered and active
- [ ] Manifest file provides app metadata
- [ ] App works offline (basic functionality)
- [ ] Push notifications are supported

## BR-006: User Interface Standards
**Description**: Consistent UI/UX across all screens.

**Acceptance Criteria**:
- [ ] Serenity+ logo is visible on all screens
- [ ] Meditation icons are randomly assigned to users
- [ ] Dropdowns have proper styling and positioning
- [ ] Contextual text appears on relevant screens
- [ ] Mobile-responsive design

## BR-007: Data Persistence
**Description**: User data is properly stored and retrieved.

**Acceptance Criteria**:
- [ ] User data is stored in database
- [ ] LocalStorage is used for temporary data
- [ ] Data persists across browser sessions
- [ ] Database schema supports all features
- [ ] Data validation prevents corruption

## BR-008: Error Handling
**Description**: Graceful error handling throughout the app.

**Acceptance Criteria**:
- [ ] Network errors are handled gracefully
- [ ] Invalid data is rejected with clear messages
- [ ] Loading states are shown during operations
- [ ] Error messages are user-friendly
- [ ] App doesn't crash on unexpected input

## BR-009: Security
**Description**: Basic security measures are implemented.

**Acceptance Criteria**:
- [ ] User data is validated before storage
- [ ] Invite codes are unique and secure
- [ ] No sensitive data in client-side code
- [ ] API endpoints validate input
- [ ] Database queries are safe from injection

## BR-010: Performance
**Description**: App performs well on mobile and desktop.

**Acceptance Criteria**:
- [ ] Page load times under 3 seconds
- [ ] Smooth animations and transitions
- [ ] Efficient database queries
- [ ] Optimized images and assets
- [ ] Minimal bundle size


