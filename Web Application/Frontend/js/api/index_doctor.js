// js/pages/doctorPage.js
import AuthService from '../api/AuthService.js';

// Create an instance of the authentication service
const authService = new AuthService();

// ✅ Check if the user is authenticated
if (!authService.isAuthenticated()) {
    // If not authenticated → redirect to login
    window.location.href = '../login.html';
}

// ✅ Get user data from localStorage
const user = authService.getUser();
// Convert user roles to lowercase for easier comparison
const roles = user?.roles?.map(r => r.toLowerCase()) || [];

// ✅ Check if the user has the "doctor" role
if (!roles.includes('doctor')) {
    // If not a doctor → redirect to login
    window.location.href = '../login.html';
    console.log('user:', user);
    console.log('roles:', roles);
}

// ✅ Check token validity by calling the server
(async () => {
    try {
        // If the token is invalid, getUserProfile() will throw an error
        await authService.getUserProfile();
    } catch (error) {
        // On error (e.g., session expired), log out and redirect to login
        await authService.logout();
        window.location.href = '../login.html';
        console.error('Invalid token', error);
    }

    // If token is valid → log a success message
    console.log('Token valid.');
})();

// 🎯 Add scroll effect to the navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled'); // Add effect
    } else {
        navbar.classList.remove('scrolled'); // Remove effect
    }
});
