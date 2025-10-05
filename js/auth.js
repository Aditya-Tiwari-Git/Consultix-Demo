// ==================== Authentication System ====================
// Handle login, registration, OTP/MFA simulation, and role-based validation

// User ID validation patterns
const USER_ID_PATTERNS = {
    enduser: /^Cust\d{4}$/,
    support: /^Emp\d{3}$/,
    vendor: /^Ven\d{4}$/
};

// Temporary storage for auth flow
let tempAuthUser = null;
let tempAuthCode = null;

// Handle Registration
function handleRegister(e) {
    e.preventDefault();
    
    const roleType = document.getElementById('roleType').value;
    const userId = document.getElementById('userId').value.trim();
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validate role selection
    if (!roleType) {
        showToast('Please select a role', 'error');
        return;
    }
    
    // Validate User ID format
    if (!USER_ID_PATTERNS[roleType].test(userId)) {
        showToast('Invalid User ID format for selected role', 'error');
        return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.find(u => u.userId === userId)) {
        showToast('User ID already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        userId,
        password,
        role: roleType,
        fullName,
        email
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showToast('Registration successful! Please login.', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const roleType = document.getElementById('roleType').value;
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    
    // Validate role selection
    if (!roleType) {
        showToast('Please select a role', 'error');
        return;
    }
    
    // Validate User ID format
    if (!USER_ID_PATTERNS[roleType].test(userId)) {
        showToast('Invalid User ID format for selected role', 'error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.userId === userId && u.role === roleType);
    
    if (!user) {
        showToast('User not found', 'error');
        return;
    }
    
    if (user.password !== password) {
        showToast('Incorrect password', 'error');
        return;
    }
    
    // Store user temporarily for 2FA
    tempAuthUser = user;
    
    // Show authentication method selection
    showModal('authModal');
}

// Select authentication method (OTP or MFA)
function selectAuthMethod(method) {
    document.getElementById('authMethodSelection').style.display = 'none';
    document.getElementById('authCodeInput').style.display = 'block';
    
    // Generate demo code (6 digits)
    tempAuthCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Display demo code to user
    const demoDisplay = document.getElementById('demoCodeDisplay');
    if (method === 'otp') {
        demoDisplay.innerHTML = `
            <p><strong>DEMO MODE:</strong> OTP sent to your registered mobile</p>
            <p>Use this code: <strong>${tempAuthCode}</strong></p>
        `;
    } else {
        demoDisplay.innerHTML = `
            <p><strong>DEMO MODE:</strong> MFA Authenticator Code</p>
            <p>Use this code: <strong>${tempAuthCode}</strong></p>
        `;
    }
}

// Verify authentication code
function verifyAuthCode() {
    const enteredCode = document.getElementById('authCode').value.trim();
    
    if (enteredCode === tempAuthCode) {
        // Authentication successful
        localStorage.setItem('currentUser', JSON.stringify(tempAuthUser));
        showToast('Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            switch(tempAuthUser.role) {
                case 'enduser':
                    window.location.href = 'dashboard-user.html';
                    break;
                case 'support':
                    window.location.href = 'dashboard-support.html';
                    break;
                case 'vendor':
                    window.location.href = 'dashboard-vendor.html';
                    break;
            }
        }, 500);
    } else {
        showToast('Invalid authentication code', 'error');
    }
}

// Close authentication modal
function closeAuthModal() {
    closeModal('authModal');
    document.getElementById('authMethodSelection').style.display = 'block';
    document.getElementById('authCodeInput').style.display = 'none';
    document.getElementById('authCode').value = '';
    tempAuthUser = null;
    tempAuthCode = null;
}
