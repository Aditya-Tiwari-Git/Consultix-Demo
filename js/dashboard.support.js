// ==================== Support Team Dashboard ====================
// Support team interface for ticket management, assignment, and resolution

// Initialize dashboard
document.addEventListener("DOMContentLoaded", function () {
  const currentUser = checkAuth();
  if (!currentUser) return;

  // Set user info in header
  document.getElementById("userName").textContent = currentUser.fullName;

  // Setup navigation
  setupNavigation();

  // Load default page (dashboard)
  loadPageContent("dashboard");
});

// Load page content based on navigation
function loadPageContent(page) {
  const contentArea = document.getElementById("contentArea");
  const pageTitle = document.getElementById("pageTitle");

  switch (page) {
    case "dashboard":
      pageTitle.textContent = "Ticket Overview";
      loadDashboard();
      break;
    case "ticket-queue":
      pageTitle.textContent = "Ticket Queue";
      loadTicketQueue();
      break;
    case "assigned-to-me":
      pageTitle.textContent = "Assigned to Me";
      loadAssignedToMe();
      break;
    case "team-view":
      pageTitle.textContent = "Team View";
      loadTeamView();
      break;
    case "analytics":
      pageTitle.textContent = "Analytics";
      loadAnalytics();
      break;
  }
}

// Load dashboard view
function loadDashboard() {
  const currentUser = getCurrentUser();
  const allStats = getTicketStats();
  const myStats = getTicketStats(currentUser.userId, "support");
  const assignedTickets = getAssignedTickets(currentUser.userId).slice(0, 10);

  const html = `
        <div class="card-grid">
            <div class="card card-high">
                <h3>High Priority</h3>
                <div class="card-value">${allStats.high}</div>
                <div class="card-label">Total high priority tickets</div>
            </div>
            <div class="card card-medium">
                <h3>Medium Priority</h3>
                <div class="card-value">${allStats.medium}</div>
                <div class="card-label">Total medium priority tickets</div>
            </div>
            <div class="card card-low">
                <h3>Low Priority</h3>
                <div class="card-value">${allStats.low}</div>
                <div class="card-label">Total low priority tickets</div>
            </div>
            <div class="card">
                <h3>Assigned to Me</h3>
                <div class="card-value">${myStats.total}</div>
                <div class="card-label">Currently assigned</div>
            </div>
        </div>
        
        <div class="mb-3">
            <div class="sla-widget">
                <h3>SLA Performance</h3>
                <div class="d-flex justify-between align-center mb-2">
                    <span>On Target: ${allStats.slaPerformance}%</span>
                    ${getSLABadge(allStats.slaPerformance >= 80)}
                </div>
                <div class="sla-bar">
                    <div class="sla-fill ${
                      allStats.slaPerformance >= 80
                        ? "sla-on-target"
                        : "sla-breach"
                    }" 
                         style="width: ${allStats.slaPerformance}%"></div>
                </div>
            </div>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h2>My Assigned Tickets</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>SLA</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${assignedTickets
                      .map((ticket) => createTicketRow(ticket))
                      .join("")}
                    ${
                      assignedTickets.length === 0
                        ? '<tr><td colspan="7" class="text-center">No tickets assigned</td></tr>'
                        : ""
                    }
                </tbody>
            </table>
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
}

// Load ticket queue
function loadTicketQueue() {
  const tickets = getAllTickets()
    .filter((t) => t.assignmentGroup === "Support Team")
    .reverse();

  const html = `
        <div class="table-container">
            <div class="table-header">
                <h2>Support Team Ticket Queue</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Assigned To</th>
                        <th>SLA</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets
                      .map(
                        (ticket) => `
                        <tr onclick="viewTicketDetails('${ticket.ticketId}')">
                            <td>${ticket.ticketId}</td>
                            <td>${ticket.shortDescription}</td>
                            <td>${ticket.category}</td>
                            <td>${getPriorityBadge(ticket.priority)}</td>
                            <td>${getStatusBadge(ticket.status)}</td>
                            <td>${ticket.assignedTo || "Unassigned"}</td>
                            <td>${getSLABadge(
                              calculateSLA(ticket).onTarget
                            )}</td>
                            <td>${formatDate(ticket.createdAt)}</td>
                        </tr>
                    `
                      )
                      .join("")}
                    ${
                      tickets.length === 0
                        ? '<tr><td colspan="8" class="text-center">No tickets in queue</td></tr>'
                        : ""
                    }
                </tbody>
            </table>
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
}

// Load assigned to me view
function loadAssignedToMe() {
  const currentUser = getCurrentUser();
  const tickets = getAssignedTickets(currentUser.userId).reverse();

  const html = `
        <div class="table-container">
            <div class="table-header">
                <h2>Tickets Assigned to Me</h2>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Ticket ID</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>SLA</th>
                        <th>Created</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.map((ticket) => createTicketRow(ticket)).join("")}
                    ${
                      tickets.length === 0
                        ? '<tr><td colspan="7" class="text-center">No tickets assigned</td></tr>'
                        : ""
                    }
                </tbody>
            </table>
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
}

// Load team view
function loadTeamView() {
  const assignmentGroups = JSON.parse(localStorage.getItem("assignmentGroups"));
  const supportTeam = assignmentGroups["Support Team"];
  const tickets = getAllTickets();

  const teamStats = supportTeam.map((member) => {
    const memberTickets = tickets.filter((t) => t.assignedTo === member);
    return {
      member,
      total: memberTickets.length,
      open: memberTickets.filter(
        (t) => t.status !== "Closed" && t.status !== "Resolved"
      ).length,
      high: memberTickets.filter(
        (t) => t.priority === "High" && t.status !== "Closed"
      ).length,
    };
  });

  const html = `
        <div class="card-grid">
            ${teamStats
              .map(
                (stat) => `
                <div class="card">
                    <h3>${stat.member}</h3>
                    <div class="card-value">${stat.total}</div>
                    <div class="card-label">Total: ${stat.total} | Open: ${stat.open} | High: ${stat.high}</div>
                </div>
            `
              )
              .join("")}
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
}

// Load analytics
function loadAnalytics() {
  const stats = getTicketStats();

  const html = `
        <div class="card-grid">
            <div class="card">
                <h3>Total Tickets</h3>
                <div class="card-value">${stats.total}</div>
            </div>
            <div class="card card-high">
                <h3>New</h3>
                <div class="card-value">${stats.new}</div>
            </div>
            <div class="card card-medium">
                <h3>In Progress</h3>
                <div class="card-value">${stats.inProgress}</div>
            </div>
            <div class="card card-low">
                <h3>Resolved</h3>
                <div class="card-value">${stats.resolved + stats.closed}</div>
            </div>
        </div>
        
        <div class="card mt-3">
            <h3>Priority Distribution</h3>
            <div class="mb-2">High Priority: ${stats.high} tickets</div>
            <div class="mb-2">Medium Priority: ${stats.medium} tickets</div>
            <div class="mb-2">Low Priority: ${stats.low} tickets</div>
        </div>
        
        <div class="card mt-3">
            <h3>SLA Performance</h3>
            <div class="sla-progress">
                <div class="d-flex justify-between align-center mb-2">
                    <span>Overall Performance: ${stats.slaPerformance}%</span>
                    ${getSLABadge(stats.slaPerformance >= 80)}
                </div>
                <div class="sla-bar">
                    <div class="sla-fill ${
                      stats.slaPerformance >= 80
                        ? "sla-on-target"
                        : "sla-breach"
                    }" 
                         style="width: ${stats.slaPerformance}%"></div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
}

// View ticket details with support actions
function viewTicketDetails(ticketId) {
  const ticket = getTicketById(ticketId);
  if (!ticket) {
    showToast("Ticket not found", "error");
    return;
  }

  const slaInfo = calculateSLA(ticket);
  const currentUser = getCurrentUser();
  const assignmentGroups = JSON.parse(localStorage.getItem("assignmentGroups"));
  const vendorTeam = assignmentGroups["Vendor Team"];

  const html = `
        <div class="ticket-details">
            <div class="ticket-header">
                <div>
                    <h2>${ticket.ticketId}</h2>
                    <p>${ticket.shortDescription}</p>
                </div>
                <div>
                    ${getStatusBadge(ticket.status)}
                    ${getSLABadge(slaInfo.onTarget)}
                </div>
            </div>
            
            <div class="ticket-info-grid">
                <div class="info-item">
                    <div class="info-label">Created By</div>
                    <div class="info-value">${ticket.createdBy}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Category</div>
                    <div class="info-value">${ticket.category} - ${
    ticket.subCategory
  }</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Priority</div>
                    <div class="info-value">${getPriorityBadge(
                      ticket.priority
                    )}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Created</div>
                    <div class="info-value">${formatDate(
                      ticket.createdAt
                    )}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Assigned To</div>
                    <div class="info-value">${
                      ticket.assignedTo || "Unassigned"
                    }</div>
                </div>
                <div class="info-item">
                    <div class="info-label">SLA Progress</div>
                    <div class="info-value">${slaInfo.slaPercent}% (${
    slaInfo.elapsedMinutes
  }/${slaInfo.slaMinutes} min)</div>
                </div>
            </div>
            
            <div class="ticket-section">
                <h3>Description</h3>
                <p>${ticket.detailedDescription}</p>
            </div>
            
            ${
              ticket.comments && ticket.comments.length > 0
                ? `
                <div class="ticket-section">
                    <h3>Activity Log</h3>
                    <div class="comments-list">
                        ${ticket.comments
                          .map(
                            (comment) => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <strong>${comment.author}</strong>
                                    <span>${formatDate(
                                      comment.timestamp
                                    )}</span>
                                </div>
                                <div>${comment.text}</div>
                            </div>
                        `
                          )
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }
            
            ${
              ticket.status !== "Closed" && ticket.status !== "Resolved"
                ? `
                <div class="ticket-section">
                    <h3>Actions</h3>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary" onclick="updateStatus('${ticketId}', 'In Progress')">Mark In Progress</button>
                        <button class="btn btn-warning" onclick="showReassignModal('${ticketId}')">Reassign to Vendor</button>
                        <button class="btn btn-success" onclick="showResolveModal('${ticketId}')">Resolve Ticket</button>
                    </div>
                </div>
                
                <div class="ticket-section">
                    <h3>Add Work Notes</h3>
                    <form onsubmit="addComment('${ticketId}', event)">
                        <div class="form-group">
                            <textarea id="workNotes" rows="3" placeholder="Add notes about your work..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Comment</button>
                    </form>
                </div>
            `
                : ""
            }
            
            ${
              ticket.resolutionNotes
                ? `
                <div class="ticket-section">
                    <h3>Resolution Notes</h3>
                    <p>${ticket.resolutionNotes}</p>
                </div>
            `
                : ""
            }
            
            <button class="btn btn-secondary" onclick="loadPageContent('ticket-queue')">Back to Queue</button>
        </div>
        
        <!-- Reassign Modal -->
        <div id="reassignModal" class="modal">
            <div class="modal-content">
                <h2>Reassign to Vendor</h2>
                <form onsubmit="handleReassign('${ticketId}', event)">
                    <div class="form-group">
                        <label for="vendorSelect">Select Vendor</label>
                        <select id="vendorSelect" required>
                            <option value="">Choose vendor...</option>
                            ${vendorTeam
                              .map(
                                (vendor) =>
                                  `<option value="${vendor}">${vendor}</option>`
                              )
                              .join("")}
                        </select>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-primary">Reassign</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal('reassignModal')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Resolve Modal -->
        <div id="resolveModal" class="modal">
            <div class="modal-content">
                <h2>Resolve Ticket</h2>
                <form onsubmit="handleResolve('${ticketId}', event)">
                    <div class="form-group">
                        <label for="resolutionNotes">Resolution Notes</label>
                        <textarea id="resolutionNotes" rows="4" required placeholder="Describe how the issue was resolved..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-success">Resolve & Close</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal('resolveModal')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

  document.getElementById("contentArea").innerHTML = html;
  document.getElementById("pageTitle").textContent = `Ticket ${ticketId}`;
}

// Update ticket status
function updateStatus(ticketId, status) {
  if (updateTicketStatus(ticketId, status)) {
    showToast(`Ticket status updated to ${status}`, "success");
    viewTicketDetails(ticketId);
  }
}

// Add comment to ticket
function addComment(ticketId, e) {
  e.preventDefault();
  const notes = document.getElementById("workNotes").value;
  if (addTicketComment(ticketId, notes)) {
    showToast("Comment added successfully", "success");
    viewTicketDetails(ticketId);
  }
}

// Show reassign modal
function showReassignModal(ticketId) {
  showModal("reassignModal");
}

// Handle reassignment
function handleReassign(ticketId, e) {
  e.preventDefault();
  const vendorId = document.getElementById("vendorSelect").value;

  if (reassignToVendor(ticketId, vendorId)) {
    showToast(`Ticket reassigned to ${vendorId}`, "success");
    closeModal("reassignModal");
    viewTicketDetails(ticketId);
  }
}

// Show resolve modal
function showResolveModal(ticketId) {
  showModal("resolveModal");
}

// Handle ticket resolution
function handleResolve(ticketId, e) {
  e.preventDefault();
  const notes = document.getElementById("resolutionNotes").value;

  if (updateTicketStatus(ticketId, "Resolved", notes)) {
    showToast("Ticket resolved successfully", "success");
    closeModal("resolveModal");
    loadPageContent("ticket-queue");
  }
}
