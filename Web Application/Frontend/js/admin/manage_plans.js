// ✅ Check Admin authentication
function checkAdminAuth() {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!user || !token || !user.roles.includes("Admin")) {
    alert("🚫 Unauthorized access. Please login as an admin.");
    window.location.href = "../login.html";
    return null;
  }

  return { user, token };
}

// API Base URL
const API_BASE_URL = "http://aidentify-gradutionff.runasp.net/api";

document.addEventListener("DOMContentLoaded", async function () {
  const auth = checkAdminAuth();
  if (!auth) return;

  const { token } = auth;

  // Initialize modals
  const addPlanModal = new bootstrap.Modal(document.getElementById('addPlanModal'));
  const editPlanModal = new bootstrap.Modal(document.getElementById('editPlanModal'));

  // Add Plan button click handler
  document.querySelector('.btn-primary').addEventListener('click', () => {
    document.getElementById('addPlanForm').reset();
    addPlanModal.show();
  });

  // Load plans on page load
  await loadPlans();

  // Function to load plans
  async function loadPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/plan`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to fetch plans");

      const data = await response.json();
      const tableBody = document.querySelector("#plansTableBody");
      tableBody.innerHTML = "";


data.forEach((plan) => {
    const row = document.createElement("tr");
    // Check if this is a temporary plan (has "Temp" in its ID)
    const isTempPlan = plan.id.includes("Temp");

    row.innerHTML = `
        <td>${plan.id}</td>
        <td>${plan.planName}</td>
        <td>${plan.duration} months</td>
        <td>${plan.maxScans}</td>
        <td>${plan.maxPatients}</td>
        <td>$${Math.round(parseFloat(plan.price || 0))}</td>
        <td>
            ${!isTempPlan ? `
                <img src="../css/images/edit.png" width="28" height="28" class="editBtn" data-id="${plan.id}" style="cursor: pointer;">
                <img src="../css/images/delete.png" width="28" height="28" class="deleteBtn" data-id="${plan.id}" style="cursor: pointer;">
            ` : ''}
        </td>
    `;
    tableBody.appendChild(row);
});

      // Add event listeners for edit and delete buttons
      attachEventListeners();
    } catch (error) {
      console.error(error);
      alert("❌ Failed to load plans");
    }
  }

  // Function to attach event listeners
  function attachEventListeners() {
    // Delete Plan
    document.querySelectorAll(".deleteBtn").forEach(button => {
      button.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");
        if (!confirm("❗ Are you sure you want to delete this plan?")) return;

        try {
          const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error("Delete failed");

          alert("🗑 Plan deleted successfully!");
          await loadPlans(); // Reload plans instead of page reload
        } catch (err) {
          console.error(err);
          alert("❌ Error deleting plan");
        }
      });
    });

    // Edit Plan
    document.querySelectorAll(".editBtn").forEach(button => {
      button.addEventListener("click", async function () {
        const id = this.getAttribute("data-id");
        try {
          const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });

          if (!response.ok) throw new Error("Failed to fetch plan details");

          const plan = await response.json();

          document.getElementById("editPlanId").value = plan.id;
          document.getElementById("editPlanName").value = plan.planName;
          document.getElementById("editPlanDuration").value = plan.duration;
          document.getElementById("editMaxScans").value = plan.maxScans;
          document.getElementById("editMaxPatients").value = plan.maxPatients;
          document.getElementById("editPlanPrice").value = plan.price;

          editPlanModal.show();
        } catch (err) {
          console.error(err);
          alert("❌ Error loading plan details");
        }
      });
    });
  }

  // Add Plan Form Submission
  document.getElementById("addPlanForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const planData = {
      planName: document.getElementById("addPlanName").value.trim(),
      duration: parseInt(document.getElementById("addPlanDuration").value),
      maxScans: parseInt(document.getElementById("addMaxScans").value),
      maxPatients: parseInt(document.getElementById("addMaxPatients").value),
      price: parseFloat(document.getElementById("addPlanPrice").value)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) throw new Error("Add failed");

      alert("✅ Plan added successfully!");
      document.getElementById("addPlanForm").reset();
      addPlanModal.hide();
      await loadPlans(); // Reload plans instead of page reload
    } catch (err) {
      console.error(err);
      alert("❌ Error adding plan");
    }
  });

  // Edit Plan Form Submission
  document.getElementById("editPlanForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("editPlanId").value;
    const planData = {
      planName: document.getElementById("editPlanName").value.trim(),
      duration: parseInt(document.getElementById("editPlanDuration").value),
      maxScans: parseInt(document.getElementById("editMaxScans").value),
      maxPatients: parseInt(document.getElementById("editMaxPatients").value),
      price: parseFloat(document.getElementById("editPlanPrice").value)
    };

    try {
      const response = await fetch(`${API_BASE_URL}/plan/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(planData)
      });

      if (!response.ok) throw new Error("Update failed");

      alert("✅ Plan updated successfully!");
      editPlanModal.hide();
      await loadPlans(); // Reload plans instead of page reload
    } catch (err) {
      console.error(err);
      alert("❌ Error updating plan");
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
