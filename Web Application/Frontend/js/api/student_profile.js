// ✅ Check Student Authentication
function checkStudentAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token || !user.roles.includes("Student")) {
    alert("🚫 Unauthorized access. Please login as a student.");
    window.location.href = "../login.html";
    return null;
  }

  return { user, token };
}

document.addEventListener("DOMContentLoaded", async function () {
  const auth = checkStudentAuth();
  if (!auth) return;
  const { token } = auth;

  const form = document.getElementById("profileForm");

  // ✅ Load student profile data
  try {
    const res = await fetch("http://aidentify-gradutionff.runasp.net/api/User/UserProfile", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error("Failed to load profile");

    const data = await res.json();
    console.log("👤 Student profile data received:", data);

    document.querySelector("h3.text-white").textContent = `Welcome ${data.firstName}`;

    // ✅ Fill the form with profile data
    document.getElementById("firstName").value = data.firstName || "";
    document.getElementById("lastName").value = data.lastName || "";
    document.getElementById("userName").value = data.userName || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("university").value = data.university || "";

    // ✅ Set level radio button
    if (data.level) {
      const levelRadio = document.querySelector(`input[name="level"][value="Level ${data.level}"]`);
      if (levelRadio) levelRadio.checked = true;
    }

  } catch (err) {
    console.error(err);
    alert("❌ Failed to load profile data");

  }

  // ✅ Update profile
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const selectedLevel = document.querySelector('input[name="level"]:checked');
    if (!selectedLevel) {
      alert("❗ Please select your level");
      return;
    }

    const updatedData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      userName: document.getElementById("userName").value.trim(),
      email: document.getElementById("email").value.trim(),
      university: document.getElementById("university").value.trim(),
      level: parseInt(selectedLevel.value.replace("Level ", ""))
    };

    try {
      const res = await fetch("http://aidentify-gradutionff.runasp.net/api/User/UserProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) throw new Error("Failed to update");

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update profile");
    }
  });
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
