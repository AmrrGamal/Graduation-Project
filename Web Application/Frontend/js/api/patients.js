// ✅ Check Doctor authentication 
function checkDoctorAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token || !user.roles.includes("Doctor")) {
    alert("🚫 Unauthorized access. Please login as a doctor.");
    window.location.href = "../login.html";
    return null;
  }

  return { user, token };
}

document.addEventListener("DOMContentLoaded", async function () {
  const auth = checkDoctorAuth();
  if (!auth) return;

  const { token } = auth;

  try {
    const response = await fetch("http://aidentify-gradutionff.runasp.net/api/Patient", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error("Failed to fetch patients");

    const data = await response.json();
    const tableBody = document.querySelector("#patientsTable tbody");
    tableBody.innerHTML = "";

    data.forEach((patient, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${patient.patientName}</td>
        <td>${patient.age}</td>
        <td>${patient.gender}</td>
        <td>
          <img src="../css/images/edit.png" width="28" height="28" class="editBtn" data-id="${patient.id}" style="cursor: pointer;">
        </td>
        <td>
          <img src="../css/images/delete.png" width="28" height="28" class="deleteBtn" data-id="${patient.id}" style="cursor: pointer;">
        </td>
      `;

      tableBody.appendChild(row);
    });

    // ✅ Delete Patient
    document.querySelectorAll(".deleteBtn").forEach(button => {
      button.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");

        if (!confirm("❗ Are you sure you want to delete this patient?")) return;

        try {
          const response = await fetch(`http://aidentify-gradutionff.runasp.net/api/Patient/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error("Delete failed");

          alert("🗑️ Patient deleted successfully!");
          location.reload();
        } catch (err) {
          console.error(err);
          alert("❌ Error deleting patient");
        }
      });
    });

    // ✅ Show Edit Modal
    document.querySelectorAll(".editBtn").forEach(button => {
      button.addEventListener("click", function () {
        const row = this.closest("tr");
        const id = this.getAttribute("data-id");
        const name = row.children[1].textContent;
        const age = row.children[2].textContent;
        const gender = row.children[3].textContent;

        document.getElementById("editPatientId").value = id;
        document.getElementById("editPatientName").value = name;
        document.getElementById("editAge").value = age;
        document.getElementById("editGender").value = gender;

        const editModal = new bootstrap.Modal(document.getElementById("EditPatientModal"));
        editModal.show();
      });
    });

  } catch (error) {
    console.error(error);
    alert("❌ Failed to load patients");
  }

  // ✅ Add Form Submission
  document.getElementById("addPatientForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("addPatientName").value.trim();
    const age = document.getElementById("addAge").value;
    const gender = document.getElementById("addGender").value;

    try {
      const response = await fetch("http://aidentify-gradutionff.runasp.net/api/Patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ patientName: name, age, gender })
      });

      if (!response.ok) throw new Error("Add failed");

      alert("✅ Patient added successfully!");
      document.getElementById("addPatientForm").reset();
      bootstrap.Modal.getInstance(document.getElementById("AddNewPatient")).hide();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Error adding patient");
    }
  });

  // ✅ Edit Form Submission
  document.getElementById("editPatientForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editPatientId").value;
    const name = document.getElementById("editPatientName").value.trim();
    const age = document.getElementById("editAge").value;
    const gender = document.getElementById("editGender").value;

    try {
      const response = await fetch(`http://aidentify-gradutionff.runasp.net/api/Patient/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ patientName: name, age, gender })
      });

      if (!response.ok) throw new Error("Update failed");

      alert("✅ Patient updated successfully!");
      bootstrap.Modal.getInstance(document.getElementById("EditPatientModal")).hide();
      location.reload();
    } catch (err) {
      console.error(err);
      alert("❌ Error updating patient");
    }
  });
});
