// js/pages/adminPage.js (optional: rename file if it’s for Admin)

// ✅ Import the authentication service
import AuthService from './AuthService.js';

// ✅ Create an instance of the auth service
const authService = new AuthService();

// ✅ Check if the user is authenticated
if (!authService.isAuthenticated()) {
    // If not logged in → redirect to login
    window.location.href = '../login.html';
}

// ✅ Get user data from localStorage
const user = authService.getUser();
// Normalize roles to lowercase for easier comparison
const roles = user?.roles?.map(r => r.toLowerCase()) || [];

// ✅ Check if the user has the "admin" role
if (!roles.includes('student')) {
    // If not an admin → redirect to login
    window.location.href = '../login.html';
    console.log('user:', user);
    console.log('roles:', roles);
}

// ✅ Verify token validity by calling the server
(async () => {
    try {
        // If the token is invalid, this will throw an error
        await authService.getUserProfile();
    } catch (error) {
        // On error (e.g. expired token), log out and redirect
        await authService.logout();
        window.location.href = '../login.html';
        console.error('Invalid token', error);
    }

    // Token is valid
    console.log('Token valid.');
})();


// 🎯 Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "../login.html";
      return;
    }

    try {
      await fetch("http://aidentify-gradutionff.runasp.net/api/Account/Logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html";
  });
}
