// API Configuration
const API_URL = '/api';

// Authentication helpers
const auth = {
    getToken() {
        return localStorage.getItem('token');
    },
    
    setToken(token) {
        localStorage.setItem('token', token);
    },
    
    getUserInfo() {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    },
    
    setUserInfo(userInfo) {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    },
    
    isAuthenticated() {
        return !!this.getToken();
    },
    
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        window.location.href = '/login.html';
    },
    
    isAdmin() {
        const userInfo = this.getUserInfo();
        return userInfo && userInfo.role === 'ADMIN';
    }
};

// API request helper
async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = auth.getToken();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token && !endpoint.includes('/auth/')) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            auth.logout();
            return;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Show/hide loading spinner
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="spinner"></div>';
    }
}

function hideLoading() {
    const spinners = document.querySelectorAll('.spinner');
    spinners.forEach(spinner => spinner.remove());
}

// Show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

// Format date/time
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    // Backend UTC gönderiyor ama timezone bilgisi yok, Z ekleyerek UTC olduğunu belirtiyoruz
    const dateWithTimezone = dateString.includes('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateWithTimezone);
    return date.toLocaleString('tr-TR');
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    // Backend UTC gönderiyor ama timezone bilgisi yok, Z ekleyerek UTC olduğunu belirtiyoruz
    const dateWithTimezone = dateString.includes('Z') ? dateString : dateString + 'Z';
    const date = new Date(dateWithTimezone);
    return date.toLocaleDateString('tr-TR');
}

// Format numbers
function formatNumber(num, decimals = 2) {
    if (num === null || num === undefined) return 'N/A';
    return parseFloat(num).toFixed(decimals);
}

// Device status badge
function getStatusBadge(status) {
    const badges = {
        'ACTIVE': 'success',
        'INACTIVE': 'secondary',
        'MAINTENANCE': 'warning',
        'OFFLINE': 'danger'
    };
    return `<span class="badge badge-${badges[status] || 'secondary'}">${status}</span>`;
}

// Alert severity badge
function getSeverityBadge(severity) {
    const badges = {
        'INFO': 'info',
        'WARNING': 'warning',
        'CRITICAL': 'danger'
    };
    return `<span class="badge badge-${badges[severity] || 'info'}">${severity}</span>`;
}

// Command status badge
function getCommandStatusBadge(status) {
    const badges = {
        'PENDING': 'warning',
        'SENT': 'info',
        'ACK': 'success',
        'FAILED': 'danger',
        'EXPIRED': 'secondary'
    };
    return `<span class="badge badge-${badges[status] || 'secondary'}">${status}</span>`;
}

// Protected route check
function checkAuth() {
    if (!auth.isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Update navbar with user info
function updateNavbar() {
    const userInfo = auth.getUserInfo();
    if (userInfo) {
        const navLinks = document.querySelector('.nav-links');
        if (navLinks) {
            navLinks.innerHTML = `
                <li><a href="/app/dashboard.html">Dashboard</a></li>
                <li><a href="/app/profile.html">${userInfo.name || userInfo.email}</a></li>
                ${userInfo.role === 'ADMIN' ? '<li><a href="/app/admin.html">Admin</a></li>' : ''}
                <li><a href="#" onclick="auth.logout(); return false;">Logout</a></li>
            `;
        }
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Check if on protected page
    const isProtectedPage = window.location.pathname.includes('/app/');
    
    if (isProtectedPage) {
        if (!checkAuth()) return;
        updateNavbar();
    }
});
