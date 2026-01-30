// auth.js - Updated with Password Reset Logic
import { supabase } from './supabase-client.js';

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', function () {
    initializeAuth();
});

// --- INITIALIZATION ---
function initializeAuth() {
    setupTabSwitching();
    setupFormHandlers();
    setupPasswordToggle();
    setupSocialLogin();
    setupValidation();
    setupPasswordReset(); // <-- ADDED THIS LINE to activate the link
}

// --- SETUP FUNCTIONS ---

/**
 * Attaches click event listeners to the tab buttons.
 */
function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            switchTab(tabName);
        });
    });
}

/**
 * Attaches submit event listeners to the login and registration forms.
 */
function setupFormHandlers() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

/**
 * Attaches click listeners to the password visibility toggle buttons.
 */
function setupPasswordToggle() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    toggleButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const input = button.closest('.form-group').querySelector('input');
            togglePassword(input);
        });
    });
}

/**
 * Attaches click listeners to social login buttons.
 */
function setupSocialLogin() {
    const googleBtns = document.querySelectorAll('.google-btn');
    googleBtns.forEach(btn => {
        btn.addEventListener('click', handleGoogleLogin);
    });
}

/**
 * Attaches validation listeners to required form fields.
 */
function setupValidation() {
    const inputs = document.querySelectorAll('input[required], select[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// vvv THIS ENTIRE FUNCTION IS NEW vvv
/**
 * Sets up the listener for the "Forgot Password" link.
 */
function setupPasswordReset() {
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = prompt("Please enter your email address to reset your password:");

            if (email) {
                // This tells Supabase to send a reset email.
                // It also tells Supabase where to send the user AFTER they click the email link.
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: 'http://127.0.0.1:5500/reset-password.html', // IMPORTANT: Change this URL if yours is different
                });

                if (error) {
                    showNotification('Error: ' + error.message, 'error');
                } else {
                    showNotification('Password reset email sent! Please check your inbox.', 'success');
                }
            }
        });
    }
}


// --- CORE AUTHENTICATION FUNCTIONS ---

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = e.target.querySelector('.submit-btn');

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        showNotification('Error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
    } else {
        showNotification('Login successful! Redirecting...', 'success');
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 1000);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    if (!validateRegistrationForm()) return;

    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const firstName = document.getElementById('first-name').value;
    const lastName = document.getElementById('last-name').value;
    const submitBtn = e.target.querySelector('.submit-btn');
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            }
        }
    });

    if (error) {
        showNotification('Error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    } else {
        showNotification('Success! Please check your email for a confirmation link.', 'success');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
    }
}

async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        showNotification('Error: ' + error.message, 'error');
    }
}

async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error('Error logging out:', error);
        showNotification('Logout failed. Please try again.', 'error');
    } else {
        window.location.href = 'login.html';
    }
}


// --- UI AND UTILITY FUNCTIONS ---

function switchTab(tabName) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const targetButton = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);

    tabButtons.forEach(btn => btn.classList.remove('active'));
    loginForm.classList.remove('active');
    registerForm.classList.remove('active');

    if (targetButton) {
        targetButton.classList.add('active');
    }
    if (tabName === 'login') {
        loginForm.classList.add('active');
    } else {
        registerForm.classList.add('active');
    }
}

function togglePassword(inputElement) {
    const toggleBtn = inputElement.parentElement.querySelector('.toggle-password');
    const icon = toggleBtn.querySelector('i');
    if (inputElement.type === 'password') {
        inputElement.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        inputElement.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function validateRegistrationForm() {
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.querySelector('input[name="terms"]:checked');

    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return false;
    }
    if (!terms) {
        showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
        return false;
    }
    return true;
}

function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;

    clearFieldError(e);
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    if (fieldName === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }

    if (fieldName === 'password' && value) {
        if (value.length < 6) {
            isValid = false;
            errorMessage = 'Password must be at least 6 characters long';
        }
    }

    if (fieldName === 'confirmPassword' && value) {
        const password = document.getElementById('register-password').value;
        if (value !== password) {
            isValid = false;
            errorMessage = 'Passwords do not match';
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    field.parentElement.appendChild(errorElement);
}

function clearFieldError(e) {
    const field = e.target;
    field.classList.remove('error');
    const errorElement = field.parentElement.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <i class="${iconMap[type]}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        minWidth: '300px',
        maxWidth: '500px',
        animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

function getNotificationColor(type) {
    const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    return colors[type] || colors.info;
}

const notificationStyles = `
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
`;
const styleElement = document.createElement('style');
styleElement.textContent = notificationStyles;
document.head.appendChild(styleElement);

