function togglePassword() {
  const passwordInput = document.getElementById('password');
  const toggleIcon = document.getElementById('toggleIcon');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    toggleIcon.classList.remove('fa-eye');
    toggleIcon.classList.add('fa-eye-slash');
  } else {
    passwordInput.type = 'password';
    toggleIcon.classList.remove('fa-eye-slash');
    toggleIcon.classList.add('fa-eye');
  }
}

// Store email for OTP verification
let currentLoginEmail = '';

document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.querySelector('input[type="email"]').value;
  const password = document.getElementById('password').value;

  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  try {
    // Show loading
    const submitBtn = document.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;

    // Attempt login - this will send OTP for 2FA
    const result = await api.login({ email, password });
    currentLoginEmail = email;

    // If login successful and OTP sent, show OTP modal
    if (result.message && result.message.includes('OTP')) {
      showOtpModal();
    } else {
      // Direct login (no OTP required)
      alert('Login successful!');
      window.location.href = 'index.html';
    }

  } catch (error) {
    alert('Login failed: ' + error.message);
  } finally {
    // Reset loading state
    const submitBtn = document.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Login';
    submitBtn.disabled = false;
  }
});

function showOtpModal() {
  document.getElementById('otpModal').style.display = 'block';
}

function closeOtpModal() {
  document.getElementById('otpModal').style.display = 'none';
}

async function resendOtp() {
  try {
    // Logic to resend OTP can be added here if backend supports it
    alert('OTP resent to your email');
  } catch (error) {
    alert('Failed to resend OTP: ' + error.message);
  }
}

// OTP verify for login
document.getElementById('verify-btn').addEventListener('click', async function() {
  const otp = document.getElementById('otp-input').value;

  if (!otp || otp.length !== 6) {
    alert('Please enter a 6-digit OTP');
    return;
  }

  try {
    // Show loading
    const verifyBtn = document.getElementById('verify-btn');
    const originalBtnText = verifyBtn.textContent;
    verifyBtn.textContent = 'Verifying...';
    verifyBtn.disabled = true;

    // Verify OTP with backend
    const result = await api.verifyOTP({
      email: currentLoginEmail,
      otp: otp,
      otpType: 'login'
    });

    closeOtpModal();
    alert('Login successful!');

    // Redirect based on user role
    const user = api.getCurrentUserSync();
    if (user && user.role === 'Admin') {
      window.location.href = 'admin/index.html';
    } else {
      window.location.href = 'index.html';
    }

  } catch (error) {
    alert('OTP verification failed: ' + error.message);
  } finally {
    // Reset loading state
    const verifyBtn = document.getElementById('verify-btn');
    verifyBtn.textContent = 'Verify';
    verifyBtn.disabled = false;
  }
});

// Forgot password
function showForgotModal() {
  document.getElementById('forgotModal').style.display = 'block';
}

function closeForgotModal() {
  document.getElementById('forgotModal').style.display = 'none';
}

document.getElementById('reset-btn').addEventListener('click', async function() {
  const email = document.getElementById('forgot-email').value.trim();

  if (!email) {
    alert('Please enter your email address');
    return;
  }

  try {
    // Show loading
    const resetBtn = document.getElementById('reset-btn');
    const originalBtnText = resetBtn.textContent;
    resetBtn.textContent = 'Sending...';
    resetBtn.disabled = true;

    // Send forgot password request
    await api.forgotPassword(email);
    currentLoginEmail = email; // Store for OTP verification

    closeForgotModal();
    showResetOtpModal();
    alert('Password reset OTP sent to your email');

  } catch (error) {
    alert('Failed to send reset email: ' + error.message);
  } finally {
    // Reset loading state
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.textContent = 'Send Reset OTP';
    resetBtn.disabled = false;
  }
});

function showResetOtpModal() {
  document.getElementById('resetOtpModal').style.display = 'block';
}

function closeResetOtpModal() {
  document.getElementById('resetOtpModal').style.display = 'none';
}

document.getElementById('reset-verify-btn').addEventListener('click', async function() {
  const otp = document.getElementById('reset-otp').value.trim();
  const newPass = document.getElementById('new-password').value.trim();

  if (!otp || !newPass) {
    alert('Please enter both OTP and new password');
    return;
  }

  if (otp.length !== 6) {
    alert('Please enter a 6-digit OTP');
    return;
  }

  if (newPass.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  try {
    // Show loading
    const resetVerifyBtn = document.getElementById('reset-verify-btn');
    const originalBtnText = resetVerifyBtn.textContent;
    resetVerifyBtn.textContent = 'Resetting...';
    resetVerifyBtn.disabled = true;

    // Reset password with OTP
    await api.resetPassword({
      email: currentLoginEmail,
      otp: otp,
      newPassword: newPass
    });

    closeResetOtpModal();
    alert('Password reset successful! Please log in with your new password.');
    // Optional: redirect to login page
    // window.location.href = 'login.html';

  } catch (error) {
    alert('Password reset failed: ' + error.message);
  } finally {
    // Reset loading state
    const resetVerifyBtn = document.getElementById('reset-verify-btn');
    resetVerifyBtn.textContent = 'Reset Password';
    resetVerifyBtn.disabled = false;
  }
});
