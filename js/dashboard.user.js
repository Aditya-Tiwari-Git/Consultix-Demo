// ==================== End User Dashboard ====================
// Customer-facing dashboard with ticket creation and management

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
        case 'my-tickets':
            pageTitle.textContent = 'My Tickets';
            loadMyTickets();
            break;
        case 'create-ticket':
            pageTitle.textContent = 'Create New Ticket';
            loadCreateTicket();
            break;
        case 'search':
            pageTitle.textContent = 'Search';
            loadSearch();
            break;
    }
}

// Load dashboard view
function loadDashboard() {
    const currentUser = getCurrentUser();
    const stats = getTicketStats(currentUser.userId, 'enduser');
    const recentTickets = getTicketsForUser(currentUser.userId).slice(-5).reverse();
    
    const html = `
        <div class="card-grid">
            <div class="card">
                <h3>Total Tickets</h3>
                <div class="card-value">${stats.total}</div>
            </div>
            <div class="card card-high">
                <h3>Open Tickets</h3>
                <div class="card-value">${stats.new + stats.inProgress}</div>
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
        
        <div class="mb-3">
            <button class="btn btn-primary" onclick="loadPageContent('create-ticket')">
                ➕ Create New Ticket
            </button>
        </div>
        
        <div class="table-container">
            <div class="table-header">
                <h2>Recent Tickets</h2>
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
                    ${recentTickets.map(ticket => createTicketRow(ticket)).join('')}
                    ${recentTickets.length === 0 ? '<tr><td colspan="7" class="text-center">No tickets found</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Load my tickets view
function loadMyTickets() {
    const currentUser = getCurrentUser();
    const tickets = getTicketsForUser(currentUser.userId).reverse();
    
    const html = `
        <div class="table-container">
            <div class="table-header">
                <h2>My Tickets</h2>
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
                    ${tickets.length === 0 ? '<tr><td colspan="7" class="text-center">No tickets found</td></tr>' : ''}
                </tbody>
            </table>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Load create ticket form
function loadCreateTicket() {
    const categories = JSON.parse(localStorage.getItem('categories'));
    
    const html = `
        <div class="card">
            <form id="createTicketForm" onsubmit="handleCreateTicket(event)">
                <div class="form-group">
                    <label for="category">Category *</label>
                    <select id="category" required onchange="updateSubCategories()">
                        <option value="">Select category...</option>
                        ${Object.keys(categories).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="subCategory">Sub-Category *</label>
                    <select id="subCategory" required>
                        <option value="">Select sub-category...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="shortDescription">Short Description *</label>
                    <input type="text" id="shortDescription" required placeholder="Brief description of the issue">
                </div>
                
                <div class="form-group">
                    <label for="detailedDescription">Detailed Description *</label>
                    <textarea id="detailedDescription" rows="4" required placeholder="Provide detailed information about your issue"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="priority">Priority *</label>
                    <select id="priority" required>
                        <option value="">Select priority...</option>
                        <option value="Low">Low - Minor issue, no immediate impact</option>
                        <option value="Medium">Medium - Moderate impact, workaround available</option>
                        <option value="High">High - Critical issue, immediate attention needed</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="impact">Impact</label>
                    <select id="impact">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="urgency">Urgency</label>
                    <select id="urgency">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="attachments">Attachments (optional)</label>
                    <input type="file" id="attachments" multiple>
                    <small class="form-hint">Note: Files are for demo only, metadata will be stored</small>
                </div>
                
                <button type="submit" class="btn btn-primary">Submit Ticket</button>
                <button type="button" class="btn btn-secondary" onclick="loadPageContent('dashboard')">Cancel</button>
            </form>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Update subcategories based on category selection
function updateSubCategories() {
    const category = document.getElementById('category').value;
    const subCategorySelect = document.getElementById('subCategory');
    const categories = JSON.parse(localStorage.getItem('categories'));
    
    subCategorySelect.innerHTML = '<option value="">Select sub-category...</option>';
    
    if (category && categories[category]) {
        categories[category].forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat;
            option.textContent = subCat;
            subCategorySelect.appendChild(option);
        });
    }
}

// Handle ticket creation
function handleCreateTicket(e) {
    e.preventDefault();
    
    const files = document.getElementById('attachments').files;
    const attachments = [];
    
    // Store file metadata only
    for (let i = 0; i < files.length; i++) {
        attachments.push({
            name: files[i].name,
            size: files[i].size,
            type: files[i].type
        });
    }
    
    const ticketData = {
        category: document.getElementById('category').value,
        subCategory: document.getElementById('subCategory').value,
        shortDescription: document.getElementById('shortDescription').value,
        detailedDescription: document.getElementById('detailedDescription').value,
        priority: document.getElementById('priority').value,
        impact: document.getElementById('impact').value,
        urgency: document.getElementById('urgency').value,
        attachments: attachments
    };
    
    const ticket = createTicket(ticketData);
    showToast('Ticket created successfully!', 'success');
    
    // Show ticket details
    setTimeout(() => {
        viewTicketDetails(ticket.ticketId);
    }, 500);
}

// Load search view
function loadSearch() {
    const html = `
        <div class="card mb-3">
            <div class="search-container">
                <input type="text" 
                       id="searchInput" 
                       class="search-input" 
                       placeholder="Search tickets or browse knowledge base..." 
                       oninput="handleSearch()">
                <div id="searchSuggestions" class="suggestions-list" style="display:none;"></div>
            </div>
        </div>
        
        <div id="searchResults"></div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
}

// Handle search input
function handleSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const suggestionsDiv = document.getElementById('searchSuggestions');
    const resultsDiv = document.getElementById('searchResults');
    
    if (query.length < 2) {
        suggestionsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
        return;
    }
    
    // Get KB suggestions
    const kbSuggestions = getKBSuggestions(query);
    
    // Get ticket search results
    const ticketResults = searchTickets(query);
    
    // Show KB suggestions
    if (kbSuggestions.length > 0) {
        suggestionsDiv.innerHTML = kbSuggestions.map(item => `
            <div class="suggestion-item">
                <strong>${item.title}</strong><br>
                <small>Category: ${item.category}</small>
            </div>
        `).join('');
        suggestionsDiv.style.display = 'block';
    } else {
        suggestionsDiv.style.display = 'none';
    }
    
    // Show ticket results
    if (ticketResults.length > 0) {
        resultsDiv.innerHTML = `
            <div class="table-container">
                <div class="table-header">
                    <h2>Search Results (${ticketResults.length} tickets found)</h2>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ticketResults.map(ticket => createTicketRow(ticket)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } else if (query.length >= 2) {
        resultsDiv.innerHTML = '<p class="text-center">No tickets found matching your search.</p>';
    }
}

// View ticket details
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
                    <div class="info-label">Category</div>
                    <div class="info-value">${ticket.category}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Sub-Category</div>
                    <div class="info-value">${ticket.subCategory}</div>
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
                    <div class="info-label">Assigned To</div>
                    <div class="info-value">${ticket.assignedTo || 'Unassigned'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">SLA Progress</div>
                    <div class="info-value">${slaInfo.slaPercent}%</div>
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
            
            ${ticket.resolutionNotes ? `
                <div class="ticket-section">
                    <h3>Resolution Notes</h3>
                    <p>${ticket.resolutionNotes}</p>
                </div>
            ` : ''}
            
            <button class="btn btn-secondary" onclick="loadPageContent('my-tickets')">Back to My Tickets</button>
        </div>
    `;
    
    document.getElementById('contentArea').innerHTML = html;
    document.getElementById('pageTitle').textContent = `Ticket ${ticketId}`;
}
