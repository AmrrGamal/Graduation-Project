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

async function fetchAndRenderQuizzes() {
  const token = localStorage.getItem("token");
  const container = document.getElementById("quizButtonsContainer");

  try {
    const res = await fetch("http://aidentify-gradutionff.runasp.net/api/quiz", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Failed to load quizzes");
    const quizzes = await res.json();
    container.innerHTML = "";

    quizzes.forEach((quiz) => {
      const btn = document.createElement("button");
      btn.className = "btn";
      btn.style.cssText = "background-color: #13547a; border-color: #13547a; color: white; margin: 10px;";
      btn.innerText = `Attend ${quiz.id}`;
      btn.onclick = () => loadQuizQuestions(quiz.id);
      container.appendChild(btn);
    });
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    container.innerHTML = `<p class="text-danger">❌ Unable to load quizzes.</p>`;
  }
}

const quizQuestionMap = {
  "quiz-1": ["question-3"],
  "quiz-2": ["question-4", "question-6"]
};

async function loadQuizQuestions(quizId) {
  const quizForm = document.getElementById("quizForm");
  const questionsContainer = document.getElementById("questionsContainer");
  const resultDiv = document.getElementById("result");
  const quizTitle = document.getElementById("quizTitle");

  quizForm.style.display = "block";
  questionsContainer.innerHTML = "";
  resultDiv.textContent = "";
  quizTitle.style.display = "block";
  quizTitle.textContent = `Quiz ID: ${quizId}`;

  const questionIds = quizQuestionMap[quizId] || [];

  if (questionIds.length === 0) {
    questionsContainer.innerHTML = `<p class="text-warning">⚠️ No questions found in this quiz.</p>`;
    return;
  }

  const quizQuestions = [];

  for (const questionId of questionIds) {
    try {
      const qRes = await fetch(`http://aidentify-gradutionff.runasp.net/api/question/${questionId}`);
      if (!qRes.ok) throw new Error(`❌ Failed to load question ${questionId}`);
      const question = await qRes.json();
      quizQuestions.push(question);
    } catch (error) {
      console.warn(error.message);
    }
  }

  if (quizQuestions.length === 0) {
    questionsContainer.innerHTML = `<p class="text-danger">❌ Failed to load any questions.</p>`;
    return;
  }

  window.quizQuestionCount = quizQuestions.length;
  window.currentQuizId = quizId;

  quizQuestions.forEach((q, index) => {
    const qHtml = `
      <div class="mb-4">
        <label class="form-label fw-bold">${index + 1}. ${q.theQuestion}</label>
        ${q.options.map((opt, i) => `
          <div class="form-check">
            <input class="form-check-input" type="radio" name="q${index}" value="${opt}" id="q${index}_${i}">
            <label class="form-check-label" for="q${index}_${i}">${opt}</label>
          </div>
        `).join('')}
      </div>
    `;
    questionsContainer.insertAdjacentHTML("beforeend", qHtml);
  });

  // Show delete button
  const deleteBtn = document.getElementById("deleteQuizBtn");
  if (deleteBtn) deleteBtn.style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", () => {
  const auth = checkStudentAuth();
  if (!auth) return;

  fetchAndRenderQuizzes();

  document.getElementById("submitQuizBtn").addEventListener("click", async () => {
    const quizForm = document.getElementById("quizForm");
    const resultDiv = document.getElementById("result");
    const token = localStorage.getItem("token");
    const quizId = window.currentQuizId;

    const selectedAnswers = [];
    let allAnswered = true;

    for (let i = 0; i < window.quizQuestionCount; i++) {
      const selected = quizForm.querySelector(`input[name="q${i}"]:checked`);
      if (selected) {
        selectedAnswers.push(selected.value);
      } else {
        allAnswered = false;
        break;
      }
    }

    if (!allAnswered) {
      alert("❗ Please answer all questions.");
      return;
    }

    try {
      const res = await fetch(`http://aidentify-gradutionff.runasp.net/api/quizAttempt/start/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(selectedAnswers)
      });

      const msg = await res.text();
      if (!res.ok) throw new Error(`Submission failed. Message: ${msg}`);

      const pointsMatch = msg.match(/points:\s*(\d+)/i);
      const points = pointsMatch ? parseInt(pointsMatch[1]) : 0;

      resultDiv.innerHTML = `
        ✅ Quiz Submitted Successfully!<br>
        <strong>Your Score: ${points} point${points !== 1 ? 's' : ''}</strong>
      `;
    } catch (err) {
      console.error("Submission error:", err);
      resultDiv.textContent = `❌ ${err.message}`;
    }
  });

  document.getElementById("deleteQuizBtn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    const quizId = window.currentQuizId;

    try {
      const res = await fetch("http://aidentify-gradutionff.runasp.net/api/quizAttempt/student", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const attempts = await res.json();
      const attempt = attempts.find(a => a.quizId === quizId);

      if (!attempt) {
        alert("❌ No quiz attempt found to delete.");
        return;
      }

      const deleteRes = await fetch(`http://aidentify-gradutionff.runasp.net/api/quizAttempt/${attempt.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      const message = await deleteRes.text();

      if (!deleteRes.ok) throw new Error(message);

      alert(`🗑️ ${message}`);
      document.getElementById("result").textContent = "";
      document.getElementById("quizForm").style.display = "none";
      document.getElementById("quizTitle").style.display = "none";
    } catch (error) {
      alert("❌ Error deleting attempt: " + error.message);
    }
  });
});

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");

    try {
      await fetch("http://aidentify-gradutionff.runasp.net/api/Account/Logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.warn("Logout failed silently:", err);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "../login.html";
  });
}
