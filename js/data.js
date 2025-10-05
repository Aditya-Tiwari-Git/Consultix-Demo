// ==================== Initial Hardcoded Data ====================
// This file contains all the initial data for the ticketing system

// Hardcoded users (one per role for demo)
const INITIAL_USERS = [
  {
    userId: "Cust1001",
    password: "Cust@123",
    role: "enduser",
    fullName: "John",
    email: "john.customer@bank.com",
  },
  {
    userId: "Emp101",
    password: "Emp@123",
    role: "support",
    fullName: "Sarah",
    email: "sarah.support@bank.com",
  },
  {
    userId: "Ven2001",
    password: "Ven@123",
    role: "vendor",
    fullName: "Mike",
    email: "mike.vendor@bank.com",
  },
];

// SLA Rules (in minutes)
const SLA_RULES = {
  High: 4 * 60, // 4 hours
  Medium: 24 * 60, // 24 hours
  Low: 72 * 60, // 72 hours
};

// Categories and Subcategories
const CATEGORIES = {
  Cards: [
    "Debit Card Blocked",
    "Credit Card Issue",
    "Card Activation",
    "Lost/Stolen Card",
  ],
  Account: [
    "Balance Inquiry",
    "Account Locked",
    "Transaction Dispute",
    "Statement Request",
  ],
  Loans: [
    "Loan Application",
    "EMI Issue",
    "Loan Closure",
    "Interest Rate Query",
  ],
  "Digital Banking": [
    "Mobile App Issue",
    "Internet Banking",
    "UPI Problem",
    "Password Reset",
  ],
  General: ["Branch Services", "Feedback", "Complaint", "Other"],
};

// Knowledge Base / Common Issues for Search Suggestions
const KNOWLEDGE_BASE = [
  {
    title: "How to unblock debit card",
    category: "Cards",
    keywords: ["debit", "block", "card", "atm"],
  },
  {
    title: "Reset internet banking password",
    category: "Digital Banking",
    keywords: ["password", "reset", "internet", "banking", "login"],
  },
  {
    title: "Check account balance",
    category: "Account",
    keywords: ["balance", "account", "check", "inquiry"],
  },
  {
    title: "Report lost or stolen card",
    category: "Cards",
    keywords: ["lost", "stolen", "card", "report"],
  },
  {
    title: "UPI transaction failed",
    category: "Digital Banking",
    keywords: ["upi", "transaction", "failed", "payment"],
  },
  {
    title: "Loan EMI payment issue",
    category: "Loans",
    keywords: ["loan", "emi", "payment", "issue"],
  },
  {
    title: "Mobile app not working",
    category: "Digital Banking",
    keywords: ["mobile", "app", "not working", "crash"],
  },
  {
    title: "Transaction dispute resolution",
    category: "Account",
    keywords: ["transaction", "dispute", "wrong", "charge"],
  },
];

// Sample Initial Tickets
const INITIAL_TICKETS = [
  {
    ticketId: "TKT-001",
    createdBy: "Cust1001",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    category: "Cards",
    subCategory: "Debit Card Blocked",
    shortDescription: "Unable to withdraw cash from ATM",
    detailedDescription:
      "My debit card is blocked after 3 wrong PIN attempts. Need urgent help to unblock.",
    priority: "High",
    impact: "High",
    urgency: "High",
    assignmentGroup: "Support Team",
    assignedTo: "Emp101",
    attachments: [],
    status: "In Progress",
    slaMinutes: SLA_RULES.High,
    resolutionNotes: "Verifying customer details",
    resolutionTime: null,
    comments: [
      {
        author: "Emp101",
        timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        text: "Ticket assigned. Checking card status.",
      },
    ],
  },
  {
    ticketId: "TKT-002",
    createdBy: "Cust1001",
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(), // 10 hours ago
    category: "Digital Banking",
    subCategory: "Internet Banking",
    shortDescription: "Cannot login to internet banking",
    detailedDescription:
      "Getting error message when trying to login to internet banking portal.",
    priority: "Medium",
    impact: "Medium",
    urgency: "Medium",
    assignmentGroup: "Vendor Team",
    assignedTo: "Ven2001",
    attachments: [],
    status: "Assigned to Vendor",
    slaMinutes: SLA_RULES.Medium,
    resolutionNotes: "Password reset link sent",
    resolutionTime: null,
    comments: [
      {
        author: "Emp101",
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
        text: "Reassigned to vendor team for technical investigation.",
      },
    ],
  },
];

// Assignment Groups and Team Members
const ASSIGNMENT_GROUPS = {
  "Support Team": ["Emp101", "Emp102", "Emp103"],
  "Vendor Team": ["Ven2001", "Ven2002"],
};

// Initialize localStorage with hardcoded data if not already present
function initializeData() {
  // Initialize users if not present
  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(INITIAL_USERS));
  }

  // Initialize tickets if not present
  if (!localStorage.getItem("tickets")) {
    localStorage.setItem("tickets", JSON.stringify(INITIAL_TICKETS));
  }

  // Always set SLA rules and categories (they don't change)
  localStorage.setItem("slaRules", JSON.stringify(SLA_RULES));
  localStorage.setItem("categories", JSON.stringify(CATEGORIES));
  localStorage.setItem("knowledgeBase", JSON.stringify(KNOWLEDGE_BASE));
  localStorage.setItem("assignmentGroups", JSON.stringify(ASSIGNMENT_GROUPS));
}

// Call initialization on load
initializeData();
