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
  const yearlevelGroup = document.getElementById('yearlevel-group');
  const yearlevelSelect = document.getElementById('yearlevel-select');
  if (role === 'Student') {
    programGroup.style.display = 'block';
    programSelect.required = true;
    yearlevelGroup.style.display = 'block';
    yearlevelSelect.required = true;
  } else {
    programGroup.style.display = 'none';
    programSelect.required = false;
    yearlevelGroup.style.display = 'none';
    yearlevelSelect.required = false;
  }
});

// Add event listener to form
document.querySelector('form').addEventListener('submit', async function(e) {
  e.preventDefault();

  // Get form data
  const formData = new FormData(this);
  const userData = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    role: formData.get('role'),
    program: formData.get('program') || null,
    yearLevel: formData.get('yearLevel') || null
  };

  console.log('User data to send:', userData);

  try {
    const response = await api.register(userData);
    if (response.success) {
      alert(response.message);
      window.location.href = 'login.html';
    } else {
      alert(response.message);
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert(`Registration failed: ${error.message}`);
  }
});
