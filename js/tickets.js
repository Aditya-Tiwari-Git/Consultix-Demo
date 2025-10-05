// ==================== Ticket Management System ====================
// CRUD operations, assignment logic, and SLA calculations

// Calculate SLA for a ticket
function calculateSLA(ticket) {
    const now = new Date();
    const createdAt = new Date(ticket.createdAt);
    const slaMinutes = ticket.slaMinutes;
    
    let elapsedMinutes;
    
    // If ticket is resolved/closed, use resolution time
    if (ticket.resolutionTime) {
        const resolutionTime = new Date(ticket.resolutionTime);
        elapsedMinutes = Math.floor((resolutionTime - createdAt) / (1000 * 60));
    } else {
        // If ticket is still open, use current time
        elapsedMinutes = Math.floor((now - createdAt) / (1000 * 60));
    }
    
    // Calculate SLA percentage
    const slaPercent = (elapsedMinutes / slaMinutes) * 100;
    const onTarget = slaPercent <= 100;
    
    return {
        elapsedMinutes,
        slaMinutes,
        slaPercent: Math.round(slaPercent),
        onTarget
    };
}

// Create new ticket
function createTicket(ticketData) {
    const currentUser = getCurrentUser();
    const slaRules = JSON.parse(localStorage.getItem('slaRules'));
    
    const ticket = {
        ticketId: generateTicketId(),
        createdBy: currentUser.userId,
        createdAt: new Date().toISOString(),
        category: ticketData.category,
        subCategory: ticketData.subCategory,
        shortDescription: ticketData.shortDescription,
        detailedDescription: ticketData.detailedDescription,
        priority: ticketData.priority,
        impact: ticketData.impact,
        urgency: ticketData.urgency,
        assignmentGroup: 'Support Team',
        assignedTo: assignToSupport(), // Auto-assign to support
        attachments: ticketData.attachments || [],
        status: 'New',
        slaMinutes: slaRules[ticketData.priority],
        resolutionNotes: '',
        resolutionTime: null,
        comments: []
    };
    
    saveTicket(ticket);
    return ticket;
}

// Auto-assign to support team (simple round-robin)
function assignToSupport() {
    const assignmentGroups = JSON.parse(localStorage.getItem('assignmentGroups'));
    const supportTeam = assignmentGroups['Support Team'];
    const tickets = getAllTickets();
    
    // Count tickets assigned to each support member
    const assignmentCount = {};
    supportTeam.forEach(member => {
        assignmentCount[member] = tickets.filter(t => t.assignedTo === member && t.status !== 'Closed').length;
    });
    
    // Find member with least assignments
    let minCount = Infinity;
    let selectedMember = supportTeam[0];
    
    for (const member in assignmentCount) {
        if (assignmentCount[member] < minCount) {
            minCount = assignmentCount[member];
            selectedMember = member;
        }
    }
    
    return selectedMember;
}

// Update ticket status
function updateTicketStatus(ticketId, newStatus, notes = '') {
    const ticket = getTicketById(ticketId);
    if (!ticket) return false;
    
    const currentUser = getCurrentUser();
    ticket.status = newStatus;
    
    // Add comment about status change
    if (!ticket.comments) ticket.comments = [];
    ticket.comments.push({
        author: currentUser.userId,
        timestamp: new Date().toISOString(),
        text: `Status changed to: ${newStatus}${notes ? ' - ' + notes : ''}`
    });
    
    // If resolved or closed, set resolution time
    if (newStatus === 'Resolved' || newStatus === 'Closed') {
        ticket.resolutionTime = new Date().toISOString();
        if (notes) {
            ticket.resolutionNotes = notes;
        }
    }
    
    saveTicket(ticket);
    return true;
}

// Reassign ticket to vendor
function reassignToVendor(ticketId, vendorId) {
    const ticket = getTicketById(ticketId);
    if (!ticket) return false;
    
    const currentUser = getCurrentUser();
    ticket.assignmentGroup = 'Vendor Team';
    ticket.assignedTo = vendorId;
    ticket.status = 'Assigned to Vendor';
    
    // Add comment about reassignment
    if (!ticket.comments) ticket.comments = [];
    ticket.comments.push({
        author: currentUser.userId,
        timestamp: new Date().toISOString(),
        text: `Reassigned to vendor: ${vendorId}`
    });
    
    saveTicket(ticket);
    return true;
}

// Add comment to ticket
function addTicketComment(ticketId, commentText) {
    const ticket = getTicketById(ticketId);
    if (!ticket) return false;
    
    const currentUser = getCurrentUser();
    
    if (!ticket.comments) ticket.comments = [];
    ticket.comments.push({
        author: currentUser.userId,
        timestamp: new Date().toISOString(),
        text: commentText
    });
    
    saveTicket(ticket);
    return true;
}

// Update ticket resolution notes
function updateResolutionNotes(ticketId, notes) {
    const ticket = getTicketById(ticketId);
    if (!ticket) return false;
    
    ticket.resolutionNotes = notes;
    saveTicket(ticket);
    return true;
}

// Search tickets
function searchTickets(query) {
    const tickets = getAllTickets();
    const lowerQuery = query.toLowerCase();
    
    return tickets.filter(ticket => 
        ticket.shortDescription.toLowerCase().includes(lowerQuery) ||
        ticket.detailedDescription.toLowerCase().includes(lowerQuery) ||
        ticket.category.toLowerCase().includes(lowerQuery) ||
        ticket.subCategory.toLowerCase().includes(lowerQuery) ||
        ticket.ticketId.toLowerCase().includes(lowerQuery)
    );
}

// Get knowledge base suggestions
function getKBSuggestions(query) {
    const kb = JSON.parse(localStorage.getItem('knowledgeBase') || '[]');
    const lowerQuery = query.toLowerCase();
    
    return kb.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
}

// Get ticket statistics
function getTicketStats(userId = null, role = null) {
    const tickets = getAllTickets();
    let filteredTickets = tickets;
    
    // Filter by user/role
    if (userId && role === 'enduser') {
        filteredTickets = tickets.filter(t => t.createdBy === userId);
    } else if (userId && (role === 'support' || role === 'vendor')) {
        filteredTickets = tickets.filter(t => t.assignedTo === userId);
    }
    
    const stats = {
        total: filteredTickets.length,
        new: filteredTickets.filter(t => t.status === 'New').length,
        inProgress: filteredTickets.filter(t => t.status === 'In Progress').length,
        assignedToVendor: filteredTickets.filter(t => t.status === 'Assigned to Vendor').length,
        resolved: filteredTickets.filter(t => t.status === 'Resolved').length,
        closed: filteredTickets.filter(t => t.status === 'Closed').length,
        high: filteredTickets.filter(t => t.priority === 'High').length,
        medium: filteredTickets.filter(t => t.priority === 'Medium').length,
        low: filteredTickets.filter(t => t.priority === 'Low').length
    };
    
    // Calculate SLA performance
    const resolvedTickets = filteredTickets.filter(t => t.resolutionTime);
    const onTargetTickets = resolvedTickets.filter(t => {
        const slaInfo = calculateSLA(t);
        return slaInfo.onTarget;
    });
    
    stats.slaPerformance = resolvedTickets.length > 0 
        ? Math.round((onTargetTickets.length / resolvedTickets.length) * 100) 
        : 100;
    
    return stats;
}
