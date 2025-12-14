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

// Role selection to show program for students
document.getElementById('role-select').addEventListener('change', function() {
  const role = this.value;
  const programGroup = document.getElementById('program-group');
  const programSelect = document.getElementById('program-select');
  if (role === 'student') {
    programGroup.style.display = 'block';
    programSelect.required = true;
  } else {
    programGroup.style.display = 'none';
    programSelect.required = false;
  }
});

// Add event listener to form
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();
  // Simulate sending form data to backend and OTP
  showOtpModal();
});

function showOtpModal() {
  document.getElementById('otpModal').style.display = 'block';
}

function closeOtpModal() {
  document.getElementById('otpModal').style.display = 'none';
}

function resendOtp() {
  // Simulate resend
  alert('OTP resent to your email');
}

// Event listener for verify button
document.getElementById('verify-btn').addEventListener('click', function() {
  const otp = document.getElementById('otp-input').value;
  if (otp === '123456') { // Simulate backend verification
    closeOtpModal();
    alert('Signup successful!');
    // Redirect to login
    window.location.href = 'login.html';
  } else {
    alert('Invalid OTP. Please try again.');
  }
});
