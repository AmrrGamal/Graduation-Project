class RegisterManager {
    constructor() {
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api';
        this.initialize();
    }

    initialize() {
        // Add password visibility toggle functionality
        document.querySelectorAll('.eye-icon').forEach(icon => {
            icon.addEventListener('click', function () {
                const passwordInput = this.previousElementSibling;
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);

                // Toggle eye icon
                this.classList.toggle('bx-hide');
                this.classList.toggle('bx-show');
            });
        });

        // Handle role selection
        const roleOptions = document.querySelectorAll('.role-option');
        const studentFields = document.getElementById('studentFields');
        const doctorFields = document.getElementById('doctorFields');

        roleOptions.forEach(option => {
            option.addEventListener('click', function () {
                // Remove selected class from all options
                roleOptions.forEach(opt => opt.classList.remove('selected'));

                // Add selected class to clicked option
                this.classList.add('selected');

                // Show/hide role-specific fields
                const role = this.dataset.role;
                studentFields.classList.toggle('active', role === 'student');
                doctorFields.classList.toggle('active', role === 'doctor');
            });
        });

        // Handle form submission
        document.getElementById('registerForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleRegistration(e);
        });

        // Password validation requirements
        const passwordRequirements = {
            length: { regex: /.{6,}/, text: 'Be at least 6 characters long' },
            uppercase: { regex: /[A-Z]/, text: 'Contain at least one uppercase letter' },
            lowercase: { regex: /[a-z]/, text: 'Contain at least one lowercase letter' },
            number: { regex: /[0-9]/, text: 'Contain at least one number' },
            special: { regex: /[!@#$%^&*(),.?":{}|<>]/, text: 'Contain at least one special character (!@#$%^&* etc.)' }
        };

        // Function to validate password
        function validatePassword(password) {
            const results = {};
            for (const [key, requirement] of Object.entries(passwordRequirements)) {
                results[key] = requirement.regex.test(password);
            }
            return results;
        }

        // Function to update password requirements UI
        function updatePasswordRequirements(password) {
            const requirementsList = document.getElementById('passwordRequirements');
            if (!requirementsList) return;

            const results = validatePassword(password);

            requirementsList.innerHTML = '';
            for (const [key, requirement] of Object.entries(passwordRequirements)) {
                const li = document.createElement('li');
                li.className = results[key] ? 'requirement-met' : 'requirement-not-met';
                li.innerHTML = `
                    <span class="requirement-icon">${results[key] ? '✓' : '✗'}</span>
                    <span class="requirement-text">${requirement.text}</span>
                `;
                requirementsList.appendChild(li);
            }
        }

        // Function to check if all password requirements are met
        function areAllRequirementsMet(password) {
            const results = validatePassword(password);
            return Object.values(results).every(result => result);
        }

        // Add event listener for password input
        document.addEventListener('DOMContentLoaded', function () {
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                passwordInput.addEventListener('input', function () {
                    updatePasswordRequirements(this.value);
                });
            }
        });
    }

    async handleRegistration(e) {
        const selectedRole = document.querySelector('.role-option.selected');
        if (!selectedRole) {
            this.showError('Please select a role');
            return;
        }

        const role = selectedRole.dataset.role;
        const formData = {
            firstName: document.getElementById('firstName').value.trim(),
            lastName: document.getElementById('lastName').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            role: role
        };

        // Validate password
        if (!this.validatePassword(formData.password)) {
            this.showError('Password does not meet the requirements');
            return;
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }

        // Add role-specific data
        if (role === 'student') {
            formData.university = document.getElementById('university').value.trim();
            formData.level = document.getElementById('level').value;
        } else if (role === 'doctor') {
            formData.clinicName = document.getElementById('clinicName').value.trim();
            formData.specialization = document.getElementById('specialization').value.trim();
        }

        try {
            const submitButton = document.querySelector('.submit-btn');
            submitButton.disabled = true;
            submitButton.textContent = 'Creating Account...';

            let response;
            switch (role) {
                case 'student':
                    response = await this.registerStudent(formData);
                    break;
                case 'doctor':
                    response = await this.registerDoctor(formData);
                    break;
                case 'admin':
                    response = await this.registerAdmin(formData);
                    break;
                default:
                    throw new Error('Invalid role selected');
            }

            console.log('Registration successful:', response);
            this.showSuccess('Account created successfully! Redirecting to login...');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } catch (error) {
            console.error('Registration error:', error);
            this.showError(error.message || 'Registration failed. Please try again.');
            submitButton.disabled = false;
            submitButton.textContent = 'Create Account';
        }
    }

    async registerStudent(userData) {
        try {
            const requestBody = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                password: userData.password,
                email: userData.email,
                university: userData.university,
                level: parseInt(userData.level)
            };

            const response = await fetch(`${this.baseUrl}/Account/Register_Student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    throw new Error(responseData.errors[0]);
                }
                throw new Error(responseData.message || 'Registration failed');
            }

            return responseData;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async registerDoctor(userData) {
        try {
            const requestBody = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                password: userData.password,
                email: userData.email,
                clinicName: userData.clinicName,
                specialization: userData.specialization
            };

            const response = await fetch(`${this.baseUrl}/Account/Register_Doctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    throw new Error(responseData.errors[0]);
                }
                throw new Error(responseData.message || 'Registration failed');
            }

            return responseData;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    async registerAdmin(userData) {
        try {
            const requestBody = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                password: userData.password,
                email: userData.email
            };

            const response = await fetch(`${this.baseUrl}/Account/Register_Admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    throw new Error(responseData.errors[0]);
                }
                throw new Error(responseData.message || 'Registration failed');
            }

            return responseData;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    validatePassword(password) {
        const requirements = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*]/.test(password)
        };

        return Object.values(requirements).every(Boolean);
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
    }

    showSuccess(message) {
        const successDiv = document.getElementById('successMessage');
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        document.getElementById('errorMessage').style.display = 'none';
    }
}

// Initialize the register manager when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterManager();
});

