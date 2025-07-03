import PredictionService from '../api/PredictionService.js';
import RoleManager from '../utils/RoleManager.js';

class PredictionInterface {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.predictionService = new PredictionService();
        this.role = RoleManager.getRoleFromToken();
        this.availableModels = [];
        this.predictionLimits = null;
        this.initialize();
    }

    async initialize() {
        try {
            // Get available models and limits
            [this.availableModels, this.predictionLimits] = await Promise.all([
                this.predictionService.getAvailableModels(),
                this.predictionService.getPredictionLimits()
            ]);
            this.render();
        } catch (error) {
            console.error('Failed to initialize prediction interface:', error);
            this.showError('Failed to load prediction features');
        }
    }

    render() {
        this.container.innerHTML = `
            <div class="prediction-container">
                <div class="upload-section">
                    <h2>Upload X-Ray Image</h2>
                    <div class="upload-area" id="uploadArea">
                        <input type="file" id="imageInput" accept="image/*" style="display: none;">
                        <div class="upload-placeholder">
                            <i class="bx bx-upload"></i>
                            <p>Click to upload X-Ray image</p>
                        </div>
                        <img id="previewImage" style="display: none; max-width: 100%;">
                    </div>
                </div>

                <div class="prediction-options">
                    <h2>Select Prediction Type</h2>
                    <div class="prediction-buttons">
                        ${this.renderPredictionButtons()}
                    </div>
                </div>

                <div class="results-section" style="display: none;">
                    <h2>Prediction Results</h2>
                    <div id="predictionResults"></div>
                </div>

                <div class="limits-section">
                    <h3>Your Usage Limits</h3>
                    <div id="usageLimits"></div>
                </div>
            </div>
        `;

        this.attachEventListeners();
        this.updateUsageLimits();
    }

    renderPredictionButtons() {
        const buttons = [];

        if (RoleManager.canAccess(this.role, RoleManager.FEATURES.PREDICT_TEETH)) {
            buttons.push(`
                <button class="prediction-btn" data-type="teeth">
                    Predict Teeth Number
                </button>
            `);
        }

        if (RoleManager.canAccess(this.role, RoleManager.FEATURES.PREDICT_DISEASE)) {
            buttons.push(`
                <button class="prediction-btn" data-type="disease">
                    Predict Disease
                </button>
            `);
        }

        if (RoleManager.canAccess(this.role, RoleManager.FEATURES.PREDICT_GENDER)) {
            buttons.push(`
                <button class="prediction-btn" data-type="gender">
                    Predict Gender
                </button>
            `);
        }

        if (RoleManager.canAccess(this.role, RoleManager.FEATURES.PREDICT_AGE)) {
            buttons.push(`
                <button class="prediction-btn" data-type="age">
                    Predict Age
                </button>
            `);
        }

        return buttons.join('');
    }

    attachEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const imageInput = document.getElementById('imageInput');
        const predictionButtons = document.querySelectorAll('.prediction-btn');

        uploadArea.addEventListener('click', () => imageInput.click());

        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
            }
        });

        predictionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const predictionType = button.dataset.type;
                this.handlePrediction(predictionType);
            });
        });
    }

    async handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImage = document.getElementById('previewImage');
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            document.querySelector('.upload-placeholder').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }

    async handlePrediction(predictionType) {
        const imageInput = document.getElementById('imageInput');
        if (!imageInput.files[0]) {
            this.showError('Please upload an image first');
            return;
        }

        try {
            const imageData = await this.getImageData(imageInput.files[0]);
            let result;

            switch (predictionType) {
                case 'teeth':
                    result = await this.predictionService.predictTeethNumber(imageData);
                    break;
                case 'disease':
                    result = await this.predictionService.predictDisease(imageData);
                    break;
                case 'gender':
                    result = await this.predictionService.predictGender(imageData);
                    break;
                case 'age':
                    result = await this.predictionService.predictAge(imageData);
                    break;
            }

            this.displayResults(result, predictionType);
            this.updateUsageLimits();
        } catch (error) {
            console.error('Prediction failed:', error);
            this.showError('Prediction failed. Please try again.');
        }
    }

    async getImageData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    displayResults(result, predictionType) {
        const resultsSection = document.querySelector('.results-section');
        const resultsDiv = document.getElementById('predictionResults');

        resultsSection.style.display = 'block';

        let resultHtml = '<div class="result-card">';
        switch (predictionType) {
            case 'teeth':
                resultHtml += `<h3>Predicted Number of Teeth: ${result.number}</h3>`;
                break;
            case 'disease':
                resultHtml += `
                    <h3>Disease Prediction</h3>
                    <p>Detected Disease: ${result.disease}</p>
                    <p>Confidence: ${result.confidence}%</p>
                `;
                break;
            case 'gender':
                resultHtml += `
                    <h3>Gender Prediction</h3>
                    <p>Predicted Gender: ${result.gender}</p>
                    <p>Confidence: ${result.confidence}%</p>
                `;
                break;
            case 'age':
                resultHtml += `
                    <h3>Age Prediction</h3>
                    <p>Predicted Age Range: ${result.ageRange}</p>
                    <p>Confidence: ${result.confidence}%</p>
                `;
                break;
        }
        resultHtml += '</div>';

        resultsDiv.innerHTML = resultHtml;
    }

    updateUsageLimits() {
        const limitsDiv = document.getElementById('usageLimits');
        if (!this.predictionLimits) return;

        limitsDiv.innerHTML = `
            <div class="limits-card">
                <p>Remaining Predictions: ${this.predictionLimits.remaining}</p>
                <p>Total Predictions: ${this.predictionLimits.total}</p>
                <p>Reset Date: ${new Date(this.predictionLimits.resetDate).toLocaleDateString()}</p>
            </div>
        `;
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

export default PredictionInterface; 