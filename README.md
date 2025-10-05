# 🏦 Bank Support Portal - ServiceNow-like Ticketing System

A complete, responsive ticketing system built with pure vanilla HTML, CSS, and JavaScript - no frameworks or backend required!

## 🚀 Quick Start

### Demo Credentials

| Role | User ID | Password | Dashboard |
|------|---------|----------|-----------|
| **Customer** | `Cust1001` | `Cust@123` | Create & track tickets |
| **Support** | `Emp101` | `Emp@123` | Manage & assign tickets |
| **Vendor** | `Ven2001` | `Ven@123` | Resolve assigned tickets |

### How to Use

1. **Access the application** - Already running on port 5000
2. **Click Login** from the landing page
3. **Select your role** from the dropdown
4. **Enter credentials** using the demo accounts above
5. **Complete 2FA** - A demo code will appear on screen (just copy and paste it)
6. **Start using the system!**

## 🔐 Two-Factor Authentication (Demo)

After entering credentials, you'll choose an authentication method:
- **OTP (SMS)**: Receive a simulated code
- **MFA Authenticator**: Time-based code simulation

**The demo code will be displayed in a blue box on your screen** - simply enter it to complete login.

## 🎯 Complete Test Flow

### End-to-End Ticket Workflow

1. **Login as Customer** (`Cust1001`)
   - Go to "Create New Ticket"
   - Category: `Cards` → Sub-Category: `Debit Card Blocked`
   - Description: "My ATM card is blocked"
   - Priority: `High`
   - Submit ticket
   - ✅ Ticket auto-assigned to Support Team

2. **Login as Support** (`Emp101`)
   - View ticket in "Assigned to Me"
   - Click "Mark In Progress"
   - Add work notes: "Checking card status"
   - Click "Reassign to Vendor"
   - Select: `Ven2001`
   - ✅ Ticket assigned to Vendor Team

3. **Login as Vendor** (`Ven2001`)
   - View ticket in "Assigned Tickets"
   - Click "Start Work"
   - Add update: "Unblocked card and reset PIN"
   - Click "Mark as Resolved"
   - Resolution: "Card successfully unblocked"
   - ✅ Ticket resolved and sent back to Support

4. **Verify as Support** (`Emp101`)
   - View resolved ticket
   - Check resolution notes
   - ✅ Can close ticket if satisfied

## 📊 SLA Tracking

### How SLA Works

**Formula:** `SLA% = (Elapsed Time / Allowed Time) × 100`

**SLA Rules:**
- 🔴 **High Priority**: 4 hours (240 minutes)
- 🟡 **Medium Priority**: 24 hours (1440 minutes)
- 🟢 **Low Priority**: 72 hours (4320 minutes)

**Status Indicators:**
- ✅ **On Target**: SLA ≤ 100% (Green badge)
- ❌ **Breach**: SLA > 100% (Red badge)

### Example
- High priority ticket created at 10:00 AM
- Resolved at 1:00 PM (3 hours = 180 minutes)
- SLA: (180 / 240) × 100 = **75% - On Target** ✅

## 🎨 Features

### For Customers (End Users)
- ✅ Create support tickets with detailed information
- ✅ View all their tickets and status
- ✅ Search tickets and knowledge base
- ✅ Track ticket progress in real-time

### For Support Team
- ✅ View all tickets in queue
- ✅ Assign tickets to themselves or team members
- ✅ Reassign complex issues to vendor team
- ✅ Add work notes and comments
- ✅ Resolve and close tickets
- ✅ Monitor SLA performance
- ✅ View team workload

### For Vendor Team
- ✅ View tickets assigned to them
- ✅ Update work progress
- ✅ Add resolution details
- ✅ Mark tickets as resolved
- ✅ Track personal SLA performance

## 📁 Project Structure

```
/
├── index.html                 # Landing page
├── login.html                 # Login with 2FA
├── register.html              # User registration
├── dashboard-user.html        # Customer dashboard
├── dashboard-support.html     # Support dashboard
├── dashboard-vendor.html      # Vendor dashboard
├── css/
│   └── styles.css            # All styling
├── js/
│   ├── data.js               # Hardcoded initial data
│   ├── auth.js               # Authentication & 2FA
│   ├── ui.js                 # UI helpers (modals, toasts)
│   ├── tickets.js            # Ticket management & SLA
│   ├── dashboard.user.js     # Customer features
│   ├── dashboard.support.js  # Support features
│   └── dashboard.vendor.js   # Vendor features
└── replit.md                 # System documentation
```

## 🔧 Technical Details

### Technology Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Storage**: Browser localStorage
- **Dependencies**: None - 100% vanilla code
- **Server**: Python HTTP server (for demo)

### User ID Formats
Each role has a specific ID format enforced by regex:
- **Customer**: `Cust####` (e.g., Cust1001, Cust2345)
- **Support**: `Emp###` (e.g., Emp101, Emp999)
- **Vendor**: `Ven####` (e.g., Ven2001, Ven3456)

### Data Persistence
- All data stored in browser localStorage
- Initial demo data loaded from `data.js`
- Survives page refreshes
- Isolated per browser/device

### Ticket Fields (ServiceNow-inspired)
- Ticket ID (auto-generated)
- Category & Sub-Category
- Short & Detailed Description
- Priority (High/Medium/Low)
- Impact & Urgency
- Status (New → In Progress → Assigned to Vendor → Resolved → Closed)
- Assignment Group & Assigned To
- Comments/Activity Log
- Attachments (metadata only)
- SLA tracking
- Resolution notes & time

## 🔍 Search & Knowledge Base

The system includes:
- **Live search** across all ticket fields
- **Knowledge base suggestions** for common issues
- **Auto-complete** as you type
- **Category filtering**

Pre-loaded KB articles include:
- How to unblock debit card
- Reset internet banking password
- Check account balance
- Report lost/stolen card
- UPI transaction issues
- And more...

## 📱 Responsive Design

- Works on desktop, tablet, and mobile
- Adaptive sidebar navigation
- Responsive card grids
- Mobile-friendly tables
- Touch-friendly buttons

## 🎨 UI Design

Inspired by ServiceNow with:
- Clean, modern interface
- Purple gradient branding (#667eea to #764ba2)
- Color-coded priority badges
- Status indicators
- SLA performance widgets
- Modal dialogs
- Toast notifications

## ✨ Key Features

### Auto-Assignment
- New tickets automatically assigned to Support Team
- Round-robin distribution for load balancing
- Assigns to support member with least open tickets

### Ticket Workflow
```
Customer Creates → Auto-Assign to Support → Support Works
                                          ↓
                                   Reassign to Vendor
                                          ↓
                                   Vendor Resolves
                                          ↓
                                   Support Verifies & Closes
```

### SLA Dashboard Widget
- Real-time SLA calculation
- Visual progress bars
- Performance percentage
- On Target/Breach indicators

## 🧪 Testing Tips

1. **Test different priorities** to see SLA differences
2. **Create multiple tickets** to test round-robin assignment
3. **Use search feature** to find tickets quickly
4. **Check SLA widgets** on dashboards
5. **Test complete workflow** from creation to closure
6. **Try registering new users** with correct ID formats

## 📚 Additional Resources

- See `replit.md` for detailed system architecture
- All code is fully commented for easy understanding
- No external dependencies required
- Works 100% offline

## 🎉 Ready to Use!

The application is **already running** on port 5000. Just access it through your browser and start testing with the demo credentials above!

---

**Built with ❤️ using pure vanilla JavaScript - No frameworks, no complexity, just clean code!**
