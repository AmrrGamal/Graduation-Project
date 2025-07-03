document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  const form = document.getElementById("profileForm");
  if (!form) return;

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
      clinicName: document.getElementById("clinicName")?.value.trim() || "", // optional
      university: document.getElementById("university").value.trim(),
      level: parseInt(selectedLevel.value.replace("Level ", ""))
    };

    try {
      const res = await fetch("http://aidentify-gradutionff.runasp.net/api/User/UpdateUserProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) throw new Error("Update failed");
      alert("✅ Profile updated successfully!");

    } catch (err) {
      console.error("❌ Update error:", err);
      alert("❌ Failed to update profile.");
    }
  });
});
