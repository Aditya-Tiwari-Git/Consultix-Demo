// ==================== Vendor Team Dashboard ====================
// Vendor interface for managing assigned tickets and providing resolutions

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = checkAuth();
    if (!currentUser) return;
    
    // Set user info in header
    document.getElementById('userName').textContent = currentUser.fullName;
    
    // Setup navigation
    setupNavigation();
    
    // Load default page (dashboard)
    loadPageContent('dashboard');
});

// Load page content based on navigation
function loadPageContent(page) {
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');
    
    switch(page) {
        case 'dashboard':
            pageTitle.textContent = 'Dashboard';
            loadDashboard();
            break;
        case 'assigned-tickets':
            pageTitle.textContent = 'Assigned Tickets';
            loadAssignedTickets();
            break;
        case 'analytics':
            pageTitle.textContent = 'Analytics';
            loadAnalytics();
            break;
    }
}

// Load dashboard view
function loadDashboard() {
    const currentUser = getCurrentUser();
    const stats = getTicketStats(currentUser.userId, 'vendor');
    const assignedTickets = getAssignedTickets(currentUser.userId).slice(0, 10);
    
    const html = `
        <div class="card-grid">
            <div class="card">
                <h3>Assigned Tickets</h3>
                <div class="card-value">${stats.total}</div>
                <div class="card-label">Total assigned to me</div>
            </div>
            <div class="card card-high">
                <h3>In Progress</h3>
                <div class="card-value">${stats.inProgress + stats.assignedToVendor}</div>
                <div class="card-label">Currently working on</div>
            </div>
            <div class="card card-medium">
                <h3>High Priority</h3>
                <div class="card-value">${stats.high}</div>
                <div class="card-label">Urgent attention needed</div>
            </div>
            <div class="card card-low">
                <h3>Resolved</h3>
                <div class="card-value">${stats.resolved}</div>
                <div class="card-label">Completed tickets</div>
            </div>
        </div>
        
        <div class="mb-3">
            <div class="sla-widget">
                <h3>My SLA Performance</h3>
                <div class="d-flex justify-between align-center mb-2">
                    <span>On Target: ${stats.slaPerformance}%</span>
                    ${getSLABadge(stats.slaPerformance >= 80)}
                </div>
                <div class="sla-bar">
                    <div class="sla-fill ${stats.slaPerformance >= 80 ? 'sla-on-target' : 'sla-breach'}" 
                         style="width: ${stats.slaPerformance}%"></div>
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
                    ${assignedTickets.map(ticket => createTicketRow(ticket)).join('')}
                    ${assignedTickets.length === 0 ? '<tr><td colspan="7" class="text-center">No tickets assigned</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Load assigned tickets
function loadAssignedTickets() {
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
                    ${tickets.map(ticket => createTicketRow(ticket)).join('')}
                    ${tickets.length === 0 ? '<tr><td colspan="7" class="text-center">No tickets assigned</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Load analytics
function loadAnalytics() {
    const currentUser = getCurrentUser();
    const stats = getTicketStats(currentUser.userId, 'vendor');
    
    const html = `
        <div class="card-grid">
            <div class="card">
                <h3>Total Tickets</h3>
                <div class="card-value">${stats.total}</div>
            </div>
            <div class="card card-high">
                <h3>Active</h3>
                <div class="card-value">${stats.assignedToVendor + stats.inProgress}</div>
            </div>
            <div class="card card-medium">
                <h3>Resolved</h3>
                <div class="card-value">${stats.resolved}</div>
            </div>
            <div class="card card-low">
                <h3>Closed</h3>
                <div class="card-value">${stats.closed}</div>
            </div>
        </div>
        
        <div class="card mt-3">
            <h3>Priority Breakdown</h3>
            <div class="mb-2">High Priority: ${stats.high} tickets</div>
            <div class="mb-2">Medium Priority: ${stats.medium} tickets</div>
            <div class="mb-2">Low Priority: ${stats.low} tickets</div>
        </div>
        
        <div class="card mt-3">
            <h3>SLA Performance</h3>
            <div class="sla-progress">
                <div class="d-flex justify-between align-center mb-2">
                    <span>Performance Rate: ${stats.slaPerformance}%</span>
                    ${getSLABadge(stats.slaPerformance >= 80)}
                </div>
                <div class="sla-bar">
                    <div class="sla-fill ${stats.slaPerformance >= 80 ? 'sla-on-target' : 'sla-breach'}" 
                         style="width: ${stats.slaPerformance}%"></div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// View ticket details with vendor actions
function viewTicketDetails(ticketId) {
    const ticket = getTicketById(ticketId);
    if (!ticket) {
        showToast('Ticket not found', 'error');
        return;
    }
    
    const slaInfo = calculateSLA(ticket);
    const currentUser = getCurrentUser();
    
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
                    <div class="info-value">${ticket.category} - ${ticket.subCategory}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Priority</div>
                    <div class="info-value">${getPriorityBadge(ticket.priority)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Created</div>
                    <div class="info-value">${formatDate(ticket.createdAt)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Impact / Urgency</div>
                    <div class="info-value">${ticket.impact} / ${ticket.urgency}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">SLA Progress</div>
                    <div class="info-value">${slaInfo.slaPercent}% (${slaInfo.elapsedMinutes}/${slaInfo.slaMinutes} min)</div>
                </div>
            </div>
            
            <div class="ticket-section">
                <h3>Description</h3>
                <p>${ticket.detailedDescription}</p>
            </div>
            
            ${ticket.comments && ticket.comments.length > 0 ? `
                <div class="ticket-section">
                    <h3>Activity Log</h3>
                    <div class="comments-list">
                        ${ticket.comments.map(comment => `
                            <div class="comment-item">
                                <div class="comment-header">
                                    <strong>${comment.author}</strong>
                                    <span>${formatDate(comment.timestamp)}</span>
                                </div>
                                <div>${comment.text}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${ticket.status === 'Assigned to Vendor' || ticket.status === 'In Progress' ? `
                <div class="ticket-section">
                    <h3>Actions</h3>
                    <div class="d-flex gap-2">
                        <button class="btn btn-primary" onclick="updateVendorStatus('${ticketId}', 'In Progress')">Start Work</button>
                        <button class="btn btn-success" onclick="showVendorResolveModal('${ticketId}')">Mark as Resolved</button>
                    </div>
                </div>
                
                <div class="ticket-section">
                    <h3>Add Work Update</h3>
                    <form onsubmit="addVendorComment('${ticketId}', event)">
                        <div class="form-group">
                            <textarea id="vendorNotes" rows="3" placeholder="Describe the work done or investigation progress..." required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Add Update</button>
                    </form>
                </div>
            ` : ''}
            
            ${ticket.resolutionNotes ? `
                <div class="ticket-section">
                    <h3>Resolution Notes</h3>
                    <p>${ticket.resolutionNotes}</p>
                </div>
            ` : ''}
            
            <button class="btn btn-secondary" onclick="loadPageContent('assigned-tickets')">Back to Assigned Tickets</button>
        </div>
        
        <!-- Vendor Resolve Modal -->
        <div id="vendorResolveModal" class="modal">
            <div class="modal-content">
                <h2>Mark as Vendor Resolved</h2>
                <p>Once marked as resolved, the ticket will be sent back to support team for verification.</p>
                <form onsubmit="handleVendorResolve('${ticketId}', event)">
                    <div class="form-group">
                        <label for="vendorResolutionNotes">Resolution Details</label>
                        <textarea id="vendorResolutionNotes" rows="4" required placeholder="Describe the solution implemented..."></textarea>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-success">Mark Resolved</button>
                        <button type="button" class="btn btn-secondary" onclick="closeModal('vendorResolveModal')">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
    document.getElementById('pageTitle').textContent = `Ticket ${ticketId}`;
}

// Update vendor ticket status
function updateVendorStatus(ticketId, status) {
    if (updateTicketStatus(ticketId, status)) {
        showToast(`Ticket status updated to ${status}`, 'success');
        viewTicketDetails(ticketId);
    }
}

// Add vendor comment
function addVendorComment(ticketId, e) {
    e.preventDefault();
    const notes = document.getElementById('vendorNotes').value;
    if (addTicketComment(ticketId, notes)) {
        showToast('Update added successfully', 'success');
        viewTicketDetails(ticketId);
    }
}

// Show vendor resolve modal
function showVendorResolveModal(ticketId) {
    showModal('vendorResolveModal');
}

// Handle vendor resolution
function handleVendorResolve(ticketId, e) {
    e.preventDefault();
    const notes = document.getElementById('vendorResolutionNotes').value;
    
    // Update resolution notes first
    updateResolutionNotes(ticketId, notes);
    
    // Then update status
    if (updateTicketStatus(ticketId, 'Resolved', notes)) {
        showToast('Ticket marked as resolved', 'success');
        closeModal('vendorResolveModal');
        loadPageContent('assigned-tickets');
    }
}
