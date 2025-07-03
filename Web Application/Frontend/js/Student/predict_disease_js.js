document.getElementById("upload").addEventListener("change", function(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById("before-image").src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        alert("Please upload a valid image.");
    }
});

document.getElementById('diseaseform').addEventListener('submit', async function(event) {
    event.preventDefault();

    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    const resultImage = document.getElementById('after-image');
    const token = localStorage.getItem("token");

    if (!token) {
        alert("🚫 Unauthorized. Please login first.");
        return;
    }

    if (!file) {
        alert("❗ Please select an image file first.");
        return;
    }

    const formData = new FormData();
    formData.append('File', file); // ✅ Must match API

    try {
        const response = await fetch('http://aidentify-gradutionff.runasp.net/api/Models/predict_Disease', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`HTTP error ${response.status}: ${text}`);
        }

        const data = await response.json();
        if (data.imageBase64) {
            resultImage.src = `data:image/jpeg;base64,${data.imageBase64}`;
        } else {
            alert("⚠️ Prediction succeeded but no image was returned.");
        }

    } catch (error) {
        console.error('❌ Failed to analyze disease:', error);
        alert(`❌ Failed to analyze disease: ${error.message}`);
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
