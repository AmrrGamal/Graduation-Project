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
  const container = document.getElementById("cardScrollContainer");

  try {
    const response = await fetch("http://aidentify-gradutionff.runasp.net/api/plan/doctors");
    if (!response.ok) throw new Error("Failed to fetch plans");

    const plans = await response.json();
    container.innerHTML = ""; // مسح الكروت القديمة

    plans.forEach(plan => {
      const card = document.createElement("div");
      card.className = "plan-card flex-shrink-0";

      card.innerHTML = `
        <div class="card-inner d-flex flex-column bg-white shadow text-center p-4 h-100">
          <div class="mb-3">
            <i class="bi bi-gem fa-3x text-primary"></i>
          </div>
          <h5 class="fw-bold mb-2">${plan.planName}</h5>
          <h4 class="fw-bold text-dark mb-3">$${plan.price} <span class="fs-6 text-muted">/month</span></h4>
          <ul class="list-unstyled text-start small mb-4">
            <li>🕒 Duration: ${plan.duration} Month${plan.duration > 1 ? "s" : ""}</li>
            <li>🦷 Max Scans: ${plan.maxScans === -1 ? "Unlimited" : plan.maxScans}</li>
            <li>🧑‍🤝‍🧑 Max Patients: ${plan.maxPatients === -1 ? "Unlimited" : plan.maxPatients}</li>
          </ul>
          <a href="#" class="btn custom-btn w-100 mt-auto">Subscribe Now</a>
        </div>
      `;

      container.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='text-danger'>❌ Failed to load plans.</p>";
  }
});
