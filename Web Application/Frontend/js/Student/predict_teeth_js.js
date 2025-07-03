// predict_teeth.js

// Function to handle the teeth prediction response
function handleTeethPredictionResponse(data) {
    const resultDiv = document.getElementById('result');

    // Check if the prediction result is valid
    if (data && data.predictionResult) {
        const prediction = data.predictionResult;

        resultDiv.innerHTML = `
            <div class="alert alert-success">
                <strong>Total Teeth Predicted:</strong> ${prediction.total_teeth}<br>
                <strong>Incisors:</strong> ${prediction.incisors}<br>
                <strong>Canines:</strong> ${prediction.canines}<br>
                <strong>Premolars:</strong> ${prediction.premolars}<br>
                <strong>Molars:</strong> ${prediction.molars}<br>
                <strong>Missing Teeth:</strong> ${prediction.missing_teeth}<br>
                <strong>Message:</strong> ${prediction.message}
            </div>
        `;
    } else {
        resultDiv.innerHTML = `
            <div class="alert alert-warning">
                ⚠️ Unexpected or missing prediction result.
            </div>
        `;
    }
}

// Function to update the image preview when a new image is uploaded
function updateImage(event) {
    const uploadedImage = document.getElementById('uploadedImage');
    if (event.target.files && event.target.files[0]) {
        uploadedImage.src = URL.createObjectURL(event.target.files[0]);
    }
}

// Handle form submission for teeth prediction
document.getElementById('TeethForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const fileInput = document.getElementById('upload');
    const resultDiv = document.getElementById('result');

    if (!fileInput.files || fileInput.files.length === 0) {
        resultDiv.innerHTML = '❗ Please select an image first!';
        return;
    }

    const formData = new FormData();
    formData.append('File', fileInput.files[0]);

    // ✅ Get token from localStorage
    const token = localStorage.getItem("token");
    if (!token) {
        resultDiv.innerHTML = '🚫 Unauthorized. Please log in first.';
        return;
    }

    try {
        resultDiv.innerHTML = '⏳ Analyzing...';

        const response = await fetch('http://aidentify-gradutionff.runasp.net/api/Models/predict_Teeth', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ Add token
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Teeth Prediction Response:', data);

        handleTeethPredictionResponse(data);

    } catch (error) {
        resultDiv.innerHTML = `❌ Error: ${error.message}`;
        console.error('Teeth Prediction Error:', error);
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
