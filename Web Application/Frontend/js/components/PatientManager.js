import UserService from '../api/UserService.js';
import RoleManager from '../utils/RoleManager.js';

class PatientManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.userService = new UserService();
        this.role = RoleManager.getRoleFromToken();

        if (this.role !== RoleManager.ROLES.DOCTOR) {
            this.showError('Access denied. This feature is only available for doctors.');
            return;
        }

        this.initialize();
    }

    async initialize() {
        try {
            const patients = await this.userService.getPatients();
            this.render(patients);
        } catch (error) {
            console.error('Failed to initialize patient manager:', error);
            this.showError('Failed to load patients');
        }
    }

    render(patients) {
        this.container.innerHTML = `
            <div class="patient-manager">
                <div class="patient-header">
                    <h2>Patient Management</h2>
                    <button class="add-patient-btn">Add New Patient</button>
                </div>

                <div class="patient-list">
                    ${this.renderPatientList(patients)}
                </div>

                <div class="patient-modal" style="display: none;">
                    <div class="modal-content">
                        <h3>Patient Details</h3>
                        <form id="patientForm">
                            <div class="form-group">
                                <label for="patientName">Name</label>
                                <input type="text" id="patientName" required>
                            </div>
                            <div class="form-group">
                                <label for="patientAge">Age</label>
                                <input type="number" id="patientAge" required>
                            </div>
                            <div class="form-group">
                                <label for="patientGender">Gender</label>
                                <select id="patientGender" required>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="patientNotes">Notes</label>
                                <textarea id="patientNotes"></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit">Save</button>
                                <button type="button" class="cancel-btn">Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderPatientList(patients) {
        if (!patients.length) {
            return '<p class="no-patients">No patients found. Add your first patient!</p>';
        }

        return `
            <div class="patients-grid">
                ${patients.map(patient => `
                    <div class="patient-card" data-patient-id="${patient.id}">
                        <div class="patient-info">
                            <h3>${patient.name}</h3>
                            <p>Age: ${patient.age}</p>
                            <p>Gender: ${patient.gender}</p>
                            <p>Last Visit: ${new Date(patient.lastVisit).toLocaleDateString()}</p>
                        </div>
                        <div class="patient-actions">
                            <button class="view-data-btn" data-patient-id="${patient.id}">
                                View Data
                            </button>
                            <button class="upload-data-btn" data-patient-id="${patient.id}">
                                Upload Data
                            </button>
                            <button class="edit-patient-btn" data-patient-id="${patient.id}">
                                Edit
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachEventListeners() {
        // Add new patient button
        const addPatientBtn = document.querySelector('.add-patient-btn');
        if (addPatientBtn) {
            addPatientBtn.addEventListener('click', () => this.showPatientModal());
        }

        // Patient form submission
        const patientForm = document.getElementById('patientForm');
        if (patientForm) {
            patientForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handlePatientSubmit();
            });
        }

        // Cancel button
        const cancelBtn = document.querySelector('.cancel-btn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.hidePatientModal());
        }

        // Patient action buttons
        document.querySelectorAll('.view-data-btn').forEach(btn => {
            btn.addEventListener('click', () => this.viewPatientData(btn.dataset.patientId));
        });

        document.querySelectorAll('.upload-data-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showUploadModal(btn.dataset.patientId));
        });

        document.querySelectorAll('.edit-patient-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editPatient(btn.dataset.patientId));
        });
    }

    showPatientModal(patientData = null) {
        const modal = document.querySelector('.patient-modal');
        const form = document.getElementById('patientForm');

        if (patientData) {
            form.patientName.value = patientData.name;
            form.patientAge.value = patientData.age;
            form.patientGender.value = patientData.gender;
            form.patientNotes.value = patientData.notes;
        } else {
            form.reset();
        }

        modal.style.display = 'block';
    }

    hidePatientModal() {
        const modal = document.querySelector('.patient-modal');
        modal.style.display = 'none';
    }

    async handlePatientSubmit() {
        const form = document.getElementById('patientForm');
        const patientData = {
            name: form.patientName.value,
            age: form.patientAge.value,
            gender: form.patientGender.value,
            notes: form.patientNotes.value
        };

        try {
            // If editing existing patient
            const patientId = form.dataset.patientId;
            if (patientId) {
                await this.userService.updatePatient(patientId, patientData);
            } else {
                // Adding new patient
                await this.userService.addPatient(patientData);
            }

            this.hidePatientModal();
            this.initialize(); // Refresh the list
            this.showSuccess('Patient saved successfully!');
        } catch (error) {
            console.error('Failed to save patient:', error);
            this.showError('Failed to save patient data');
        }
    }

    async viewPatientData(patientId) {
        try {
            const patientData = await this.userService.getPatientData(patientId);
            this.showPatientDataModal(patientData);
        } catch (error) {
            console.error('Failed to load patient data:', error);
            this.showError('Failed to load patient data');
        }
    }

    showPatientDataModal(patientData) {
        const modal = document.createElement('div');
        modal.className = 'data-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Patient Data</h3>
                <div class="data-content">
                    ${this.renderPatientData(patientData)}
                </div>
                <button class="close-btn">Close</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
    }

    renderPatientData(patientData) {
        return `
            <div class="data-section">
                <h4>X-Ray Images</h4>
                <div class="image-grid">
                    ${patientData.images.map(image => `
                        <div class="image-card">
                            <img src="${image.url}" alt="X-Ray">
                            <p>Date: ${new Date(image.date).toLocaleDateString()}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="data-section">
                <h4>Predictions</h4>
                <div class="predictions-list">
                    ${patientData.predictions.map(prediction => `
                        <div class="prediction-card">
                            <p>Type: ${prediction.type}</p>
                            <p>Result: ${prediction.result}</p>
                            <p>Date: ${new Date(prediction.date).toLocaleDateString()}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showUploadModal(patientId) {
        const modal = document.createElement('div');
        modal.className = 'upload-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Upload Patient Data</h3>
                <form id="uploadForm">
                    <div class="form-group">
                        <label for="dataType">Data Type</label>
                        <select id="dataType" required>
                            <option value="xray">X-Ray Image</option>
                            <option value="prediction">Prediction Result</option>
                            <option value="notes">Notes</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="dataFile">File</label>
                        <input type="file" id="dataFile" required>
                    </div>
                    <div class="form-actions">
                        <button type="submit">Upload</button>
                        <button type="button" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        const form = modal.querySelector('#uploadForm');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleDataUpload(patientId, form);
            modal.remove();
        });

        modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
    }

    async handleDataUpload(patientId, form) {
        const file = form.dataFile.files[0];
        const dataType = form.dataType.value;

        try {
            await this.userService.uploadPatientData(patientId, {
                type: dataType,
                file: file
            });
            this.showSuccess('Data uploaded successfully!');
            this.viewPatientData(patientId); // Refresh patient data view
        } catch (error) {
            console.error('Failed to upload data:', error);
            this.showError('Failed to upload data');
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.container.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        this.container.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 5000);
    }
}

export default PatientManager; 