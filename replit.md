# Bank Ticketing System

## Overview

This is a ServiceNow-inspired ticketing system for banking support operations. The application is a client-side single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. It simulates a full ticketing workflow with role-based access control, ticket creation and management, SLA tracking, and assignment workflows. All data is stored in browser localStorage - there is no backend server or database.

The system supports three distinct user roles:
- **End Users (Customers)**: Create and track support tickets
- **Support Team**: Manage incoming tickets, assign to vendors, track SLA compliance
- **Vendor Team**: Resolve tickets assigned by support team

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: Pure vanilla JavaScript, HTML5, CSS3 - no frameworks or build tools required.

**Page Structure**: Multi-page application with role-specific dashboards:
- `index.html` - Landing page
- `login.html` / `register.html` - Authentication pages
- `dashboard-user.html` - Customer dashboard
- `dashboard-support.html` - Support team dashboard
- `dashboard-vendor.html` - Vendor dashboard

**JavaScript Modules** (loaded via `<script>` tags):
- `data.js` - Hardcoded initial data and data structures
- `auth.js` - Authentication logic, user validation, OTP/MFA simulation
- `ui.js` - Shared UI utilities (modals, toasts, date formatting)
- `tickets.js` - Ticket CRUD operations, SLA calculations, assignment logic
- `dashboard.user.js` - Customer dashboard controller
- `dashboard.support.js` - Support dashboard controller
- `dashboard.vendor.js` - Vendor dashboard controller

**Design Pattern**: Each dashboard JavaScript file follows a similar pattern:
1. DOMContentLoaded initialization
2. Auth check and redirect
3. Navigation setup
4. Page content rendering based on sidebar selection
5. Event delegation for dynamic content

**State Management**: All application state is stored in browser localStorage with these keys:
- `users` - Array of user objects
- `tickets` - Array of ticket objects
- `currentUser` - Currently logged-in user object
- `categories` - Category/subcategory mappings
- `slaRules` - SLA time limits by priority
- `knowledgeBase` - Search suggestions for common issues

### Authentication & Authorization

**User ID Format Validation**: Regex patterns enforce role-based ID formats:
- Customers: `Cust####` (e.g., Cust1001)
- Support: `Emp###` (e.g., Emp101)
- Vendor: `Ven####` (e.g., Ven2001)

**Two-Factor Authentication**: Simulated OTP/MFA flow for demo purposes:
1. User enters credentials
2. System validates user ID format and password
3. Modal presents choice of OTP (SMS) or MFA Authenticator
4. Demo code is generated and displayed on screen
5. User must enter displayed code to complete login

**Session Management**: CurrentUser object stored in localStorage. Each protected page checks for currentUser on load and redirects to login if missing.

**Role-Based Routing**: After successful auth, users are redirected to their role-specific dashboard based on user.role property.

### Ticket Management System

**Ticket Lifecycle States**:
- New → Open → In Progress → Pending → Resolved → Closed
- Cancelled (alternate terminal state)

**Assignment Workflow**:
1. Customer creates ticket
2. Automatically assigned to "Support Team" group
3. Support member can self-assign or assign to specific support user
4. Support can escalate to "Vendor Team" group
5. Vendor resolves and returns to support
6. Support closes ticket

**SLA Tracking**: Each ticket has an SLA deadline based on priority:
- High: 4 hours (240 minutes)
- Medium: 24 hours (1440 minutes)
- Low: 72 hours (4320 minutes)

SLA percentage is calculated in real-time: `(elapsed_time / sla_deadline) × 100`
- Green badge: ≤100% (on target)
- Red badge: >100% (SLA breach)

**Ticket Fields** (ServiceNow-inspired):
- ticketId (auto-generated, e.g., TKT-1001)
- createdBy, createdAt
- category, subCategory
- shortDescription, detailedDescription
- priority, impact, urgency
- status
- assignmentGroup, assignedTo
- comments (array of comment objects)
- attachments (array of filenames - simulated)
- slaMinutes, resolutionTime
- watchers (array of user IDs)

**Search Functionality**: Knowledge base provides autocomplete suggestions based on keywords. Matches against predefined common issues.

### UI Components & Styling

**CSS Architecture**: Single `styles.css` file with logical sections:
- Global resets and variables
- Landing page styles
- Authentication pages
- Dashboard layout (sidebar + main content)
- Card components
- Table components
- Badge components (status, priority, SLA)
- Modal dialogs
- Toast notifications
- Form elements

**Responsive Design**: Card-grid layout adapts to screen size. Sidebar collapses on mobile (implementation would require media queries).

**Component System**: Reusable CSS classes:
- `.badge-*` for status indicators (high, medium, low, new, open, resolved, etc.)
- `.card` for dashboard widgets
- `.table-container` for data tables
- `.modal` for overlay dialogs

**Color Scheme**: Purple gradient theme (`#667eea` to `#764ba2`) for branding, with semantic colors for status badges (green for success, red for urgent, yellow for pending, etc.).

## External Dependencies

**None** - This is a completely standalone application with zero external dependencies. No frameworks, libraries, CDNs, or backend services are used.

**Data Persistence**: Browser localStorage API is the only "database". Data persists across sessions but is isolated to the browser/device.

**Initial Data Loading**: `data.js` includes an `initializeData()` function that populates localStorage with demo users, categories, SLA rules, and sample tickets on first run.

**Demo Credentials** (hardcoded in data.js):
- Customer: Cust1001 / Cust@123
- Support: Emp101 / Emp@123
- Vendor: Ven2001 / Ven@123

**File Upload Simulation**: Attachment functionality displays filenames but does not actually store file contents - files are simulated as metadata only.