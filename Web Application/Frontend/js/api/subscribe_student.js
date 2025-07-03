// ✅ Check Student authentication
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
  const container = document.getElementById("cardScrollContainer");

  // Create element for subscription status message
  const statusMessage = document.createElement("div");
  statusMessage.className = "text-center mb-4 fw-bold fs-5";
  document.getElementById("subscription-plans").prepend(statusMessage);

  // ✅ 1. Check student subscription status
  try {
    const res = await fetch("http://aidentify-gradutionff.runasp.net/api/subscription/user", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("No subscription found");

    const subscription = await res.json();

    if (subscription.status === "Avalable") {
      statusMessage.innerHTML = `<h5 class="text-success">✅ You are subscribed until: <strong>${new Date(subscription.endDate).toLocaleDateString()}</strong></h5>`;
    } else {
      statusMessage.innerHTML = `<span class="text-danger">⚠️ Your subscription is inactive. Please renew or select a plan.</span>`;
    }
  } catch (err) {
    statusMessage.innerHTML = `<span class="text-warning">⚠️ You are not subscribed yet. Choose a plan below.</span>`;
  }

  // ✅ 2. Load available student plans
  try {
    const response = await fetch("http://aidentify-gradutionff.runasp.net/api/plan/students", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Failed to fetch plans");

    const plans = await response.json();
    container.innerHTML = "";

    plans.forEach((plan) => {
      const card = document.createElement("div");
      card.className = "plan-card flex-shrink-0";

      card.innerHTML = `
        <div class="card-inner d-flex flex-column bg-white shadow text-center p-4 h-100">
          <div class="mb-3">
            <i class="bi bi-bookmark-star fa-3x text-primary"></i>
          </div>
          <h5 class="fw-bold mb-2">${plan.planName}</h5>
          <h4 class="fw-bold text-dark mb-3">$${plan.price} <span class="fs-6 text-muted">/month</span></h4>
          <ul class="list-unstyled text-start small mb-4">
            <li>🕒 Duration: ${plan.duration} Month${plan.duration > 1 ? "s" : ""}</li>
            <li>🦷 Max Scans: ${plan.maxScans === -1 ? "Unlimited" : plan.maxScans}</li>
            <li>🧑‍🤝‍🧑 Max Patients: ${plan.maxPatients === -1 ? "Unlimited" : plan.maxPatients}</li>
          </ul>
          <button class="btn custom-btn w-100 mt-auto subscribe-btn" data-id="${plan.planId}">Subscribe Now</button>
        </div>
      `;

      container.appendChild(card);
    });

    // ✅ 3. Handle subscription when clicking a button
    document.querySelectorAll(".subscribe-btn").forEach((btn) => {
      btn.addEventListener("click", async function () {
        const planId = btn.getAttribute("data-id");

        try {
          const res = await fetch("http://aidentify-gradutionff.runasp.net/api/subscription/new", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planId }),
          });

          if (!res.ok) throw new Error("Subscription failed");

          alert("✅ Subscription successful!");
          location.reload();
        } catch (error) {
          console.error(error);
          alert("❌ Failed to subscribe to this plan.");
        }
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p class='text-danger'>❌ Failed to load plans.</p>";
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
