// ==================== UI Helper Functions ====================
// Shared UI utilities for modals, toasts, and common components

// Show toast notification
function showToast(message, type = "info") {
  // Create toast container if it doesn't exist
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Add to container
  container.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Show modal
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("show");
  }
}

// Close modal
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("show");
  }
}

// Format date to readable string
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Calculate time difference in minutes
function getMinutesDifference(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / (1000 * 60));
}

// Get priority badge HTML
function getPriorityBadge(priority) {
  const lowerPriority = priority.toLowerCase();
  return `<span class="badge badge-${lowerPriority}">${priority}</span>`;
}

// Get status badge HTML
function getStatusBadge(status) {
  const statusClass = status.toLowerCase().replace(/\s+/g, "-");
  return `<span class="badge badge-${statusClass}">${status}</span>`;
}

// Get SLA badge HTML
function getSLABadge(isOnTarget) {
  const badgeClass = isOnTarget ? "badge-on-target" : "badge-breach";
  const text = isOnTarget ? "On Target" : "Breach";
  return `<span class="badge ${badgeClass}">${text}</span>`;
}

// Create ticket table row
function createTicketRow(ticket) {
  const slaInfo = calculateSLA(ticket);
  return `
        <tr onclick="viewTicketDetails('${ticket.ticketId}')">
            <td>${ticket.ticketId}</td>
            <td>${ticket.shortDescription}</td>
            <td>${ticket.category}</td>
            <td>${getPriorityBadge(ticket.priority)}</td>
            <td>${getStatusBadge(ticket.status)}</td>
            <td>${getSLABadge(slaInfo.onTarget)}</td>
            <td>${formatDate(ticket.createdAt)}</td>
        </tr>
    `;
}

// Logout function
function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

// Check authentication
function checkAuth() {
  const currentUser = localStorage.getItem("currentUser");
  if (!currentUser) {
    window.location.href = "login.html";
    return null;
  }
  return JSON.parse(currentUser);
}

// Get current user
function getCurrentUser() {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
}

// Navigation handling for dashboard pages
function setupNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();

      // Remove active class from all items
      navItems.forEach((nav) => nav.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");

      // Get page name from data attribute
      const page = this.getAttribute("data-page");

      // Load page content based on role
      if (typeof loadPageContent === "function") {
        loadPageContent(page);
      }
    });
  });
}

// Generate unique ticket ID
function generateTicketId() {
  const tickets = JSON.parse(localStorage.getItem("tickets") || "[]");
  const lastId =
    tickets.length > 0
      ? Math.max(...tickets.map((t) => parseInt(t.ticketId.split("-")[1])))
      : 0;
  return `TKT-${String(lastId + 1).padStart(8, "0")}`;
}

// Get all tickets
function getAllTickets() {
  return JSON.parse(localStorage.getItem("tickets") || "[]");
}

// Get tickets for user
function getTicketsForUser(userId) {
  const tickets = getAllTickets();
  return tickets.filter((t) => t.createdBy === userId);
}

// Get assigned tickets
function getAssignedTickets(userId) {
  const tickets = getAllTickets();
  return tickets.filter((t) => t.assignedTo === userId);
}

// Save ticket
function saveTicket(ticket) {
  const tickets = getAllTickets();
  const index = tickets.findIndex((t) => t.ticketId === ticket.ticketId);

  if (index >= 0) {
    tickets[index] = ticket;
  } else {
    tickets.push(ticket);
  }

  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// Get ticket by ID
function getTicketById(ticketId) {
  const tickets = getAllTickets();
  return tickets.find((t) => t.ticketId === ticketId);
}
