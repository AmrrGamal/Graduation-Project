// predict_age.js

// Handle form submission for age prediction
document.getElementById('ageForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const fileInput = document.getElementById('upload');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = '❗ Please select an image first!';
        return;
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    // ✅ Get token
    const token = localStorage.getItem("token");
    if (!token) {
        resultDiv.innerHTML = '🚫 Unauthorized. Please log in first.';
        return;
    }

    try {
        resultDiv.innerHTML = '⏳ Analyzing...';

        const response = await fetch('http://aidentify-gradutionff.runasp.net/api/Models/predict_age', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Add token here
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const age = data.predictedAge?.trim().toLowerCase(); // Expected: 'child' or 'adult'

        if (age === 'child') {
            resultDiv.innerHTML = `
                <div class="d-flex align-items-center" id="Child">
                    <span class="me-2">The Age Is:</span>
                    <img src="../css/images/models/child.png" width="40" height="40" alt="Child Avatar">
                    <span class="ms-2">Child</span>
                </div>
            `;
        } else if (age === 'adult') {
            resultDiv.innerHTML = `
                <div class="d-flex align-items-center" id="Adult">
                    <span class="me-2">The Age Is:</span>
                    <img src="../css/images/models/adult.png" width="40" height="40" alt="Adult Avatar">
                    <span class="ms-2">Adult</span>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `⚠️ Unexpected result: ${age}`;
        }

    } catch (error) {
        resultDiv.innerHTML = `❌ Error: ${error.message}`;
        console.error('Prediction error:', error);
    }
});

// Handle image preview on upload
function updateImage(event) {
    const uploadedImage = document.getElementById('uploadedImage');
    if (event.target.files && event.target.files[0]) {
        uploadedImage.src = URL.createObjectURL(event.target.files[0]);
    }
}

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
