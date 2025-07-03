// predict_gender.js

document.getElementById('genderForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('upload');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = '❗ Please select an image first!';
        return;
    }

    const formData = new FormData();
    formData.append('File', fileInput.files[0]);

    const token = localStorage.getItem("token");
    if (!token) {
        resultDiv.innerHTML = '🚫 Unauthorized. Please log in first.';
        return;
    }

    try {
        resultDiv.innerHTML = '⏳ Analyzing...';

        const response = await fetch('http://aidentify-gradutionff.runasp.net/api/Models/predict_Gender', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const gender = data.predictedGender?.trim().toLowerCase();

        if (gender === 'male') {
            resultDiv.innerHTML = `
                <div class="d-flex align-items-center" id="male">
                    <span class="me-2">The Gender Is:</span>
                    <img src="../css/images/models/male-user.png" width="40" height="40" alt="Male Avatar">
                    <span class="ms-2">Male</span>
                </div>
            `;
        } else if (gender === 'female') {
            resultDiv.innerHTML = `
                <div class="d-flex align-items-center" id="female">
                    <span class="me-2">The Gender Is:</span>
                    <img src="../css/images/models/woman-avatar.png" width="40" height="40" alt="Female Avatar">
                    <span class="ms-2">Female</span>
                </div>
            `;
        } else {
            resultDiv.innerHTML = `⚠️ Unexpected result: ${gender}`;
        }

    } catch (error) {
        console.error('Prediction error:', error);
        resultDiv.innerHTML = `❌ Error: ${error.message}`;
    }
});

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
