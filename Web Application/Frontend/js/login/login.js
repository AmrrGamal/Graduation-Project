import AuthService from '../api/AuthService.js';
import RoleManager from '../utils/RoleManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const authService = new AuthService();
  const loginForm = document.querySelector('.form.login form');
  const signupForm = document.querySelector('.form.signup form');
  const loginLink = document.querySelector('.link.login-link');
  const signupLink = document.querySelector('.link.signup-link');
  const forms = document.querySelector('.forms');

  // Check if user is already logged in
  if (authService.isAuthenticated()) {
    const role = RoleManager.getRoleFromToken();
    if (role) {
      RoleManager.redirectToRoleHome(role);
    }
  }

  // Toggle between login and signup forms
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    forms.classList.add('show-signup');
  });

  loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    forms.classList.remove('show-signup');
  });

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.querySelector('input[type="email"]').value;
    const password = loginForm.querySelector('input[type="password"]').value;

    try {
      const response = await authService.login(email, password);
      if (response.token) {
        const role = RoleManager.getRoleFromToken();
        if (role) {
          RoleManager.redirectToRoleHome(role);
        } else {
          alert('Invalid user role. Please contact support.');
        }
      }
    } catch (error) {
      alert('Login failed. Please check your credentials.');
      console.error('Login error:', error);
    }
  });

  // Handle signup form submission
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = signupForm.querySelector('input[type="email"]').value;
    const password = signupForm.querySelector('input[type="password"]').value;
    const confirmPassword = signupForm.querySelectorAll('input[type="password"]')[1].value;

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const userData = {
        email,
        password,
        role: RoleManager.ROLES.STUDENT // Default role for new registrations
      };

      const response = await authService.register(userData);
      if (response.success) {
        alert('Registration successful! Please login.');
        forms.classList.remove('show-signup');
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
      console.error('Registration error:', error);
    }
  });

  // Password visibility toggle
  const eyeIcons = document.querySelectorAll('.eye-icon');
  eyeIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const passwordInput = icon.parentElement.querySelector('input');
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('bx-hide');
        icon.classList.add('bx-show');
      } else {
        passwordInput.type = 'password';
        icon.classList.remove('bx-show');
        icon.classList.add('bx-hide');
      }
    });
  });
});
