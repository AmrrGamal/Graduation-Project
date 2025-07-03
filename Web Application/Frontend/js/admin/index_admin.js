document.addEventListener('DOMContentLoaded', () => {
    const authService = new AuthService('http://aidentify-gradutionff.runasp.net/api');

    if (!authService.isAuthenticated()) {
      alert('You must be logged in to access this page.');
      window.location.href = 'login.html';
      return;
    }

    // Proceed with fetching protected resources using authService.getToken()
  });


  // ✅ Logout functionality
document.getElementById("logoutBtn").addEventListener("click", async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "../login.html";
    return;
  }

  try {
    const res = await fetch("http://aidentify-gradutionff.runasp.net/api/Account/Logout", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Logout failed");

  } catch (err) {
    console.error("Error during logout:", err);
  }

  // Clear localStorage and redirect to login
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../login.html";
});
