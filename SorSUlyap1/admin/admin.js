// Password toggle function (used in login, signup)
function togglePassword() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    const toggleIcon = document.getElementById('toggleIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleIcon.className = 'fas fa-eye';
    }
}

// Form event listeners

// Admin Signup
const adminSignupForm = document.getElementById('admin-signup-form');
if (adminSignupForm) {
    adminSignupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        alert('Admin account created successfully!');
        window.location.href = 'login.html';
    });
}

// Admin Login


// Forgot Password
const forgotForm = document.querySelector('.forgot-container form');
if (forgotForm) {
    forgotForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('If an account with that email exists, we have sent you a password reset link.');
    });
}

// Announcement Post Form
const postForm = document.getElementById('postForm');
if (postForm) {
    postForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Post created successfully!');
    });
}

// Event Form
const eventForm = document.getElementById('eventForm');
if (eventForm) {
    eventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Event added successfully!');
    });
}

// Settings Form
const settingsForm = document.getElementById('settingsForm');
if (settingsForm) {
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Settings saved successfully!');
    });
}

// Notification Form
const notificationForm = document.getElementById('notificationForm');
if (notificationForm) {
    notificationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Notification sent successfully!');
    });
}
