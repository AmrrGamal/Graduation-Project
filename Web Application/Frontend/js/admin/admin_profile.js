// ✅ Check Doctor authentication
function checkDoctorAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token || !user.roles.includes("Admin")) {
    alert("🚫 Unauthorized access. Please login as a doctor.");
    window.location.href = "../login.html";
    return null;
  }

  return { user, token };
}



document.addEventListener("DOMContentLoaded", async function () {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("❌ Unauthorized. Please login.");
    window.location.href = "../login.html";
    return;
  }

  const form = document.getElementById("profileForm");

  // ✅ تحميل البيانات الحالية للدكتور
  try {
    const response = await fetch("http://aidentify-gradutionff.runasp.net/api/User/UserProfile", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to load profile");

    const data = await response.json();

    // ✅ ملء البيانات داخل الـ form
    document.getElementById("firstName").value = data.firstName;
    document.getElementById("lastName").value = data.lastName;
    document.getElementById("userName").value = data.userName;
    document.getElementById("email").value = data.email;


  } catch (error) {
    console.error(error);
    alert("❌ Failed to load profile data");
  }

  // ✅ تحديث البيانات عند الضغط على زر Update
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const updatedData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      userName: document.getElementById("userName").value.trim(),
      email: document.getElementById("email").value.trim(),

    };

    try {
      const response = await fetch("http://aidentify-gradutionff.runasp.net/api/User/UserProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error("Update failed");

      alert("✅ Profile updated successfully!");

    } catch (error) {
      console.error(error);
      alert("✅ Profile updated successfully!");
    }
  });
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
