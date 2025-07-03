import ApiService from './ApiService.js';

class AuthService extends ApiService {
    constructor() {
        super();
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api';
    }

    async registerStudent(userData) {
        try {
            console.log('Sending registration request:', {
                ...userData,
                password: '***'
            });

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

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const responseData = await response.json();
            console.log('Response data:', responseData);

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
            console.log('Sending registration request:', {
                ...userData,
                password: '***'
            });

            const requestBody = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username,
                password: userData.password,
                email: userData.email,
                clinicName: userData.clinicName
            };

            const response = await fetch(`${this.baseUrl}/Account/Register_Doctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const responseData = await response.json();
            console.log('Response data:', responseData);

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
            console.log('Sending registration request:', {
                ...userData,
                password: '***'
            });

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

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            const responseData = await response.json();
            console.log('Response data:', responseData);

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

    async login(username, password) {
        try {
            console.log('Attempting login with:', { userName: username });

            // Try admin login first
            const adminResponse = await fetch(`${this.baseUrl}/Admin/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                })
            });

            if (adminResponse.ok) {
                const adminData = await adminResponse.json();
                localStorage.setItem('token', adminData.tokens);
                const userData = {
                    userName: username,
                    roles: ['Admin'],
                    isAdmin: true
                };
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }

            // If admin login fails, try regular user login
            const userResponse = await fetch(`${this.baseUrl}/Account/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                })
            });

            if (!userResponse.ok) {
                const errorData = await userResponse.json();
                throw new Error(Array.isArray(errorData) ? errorData[0] : 'Invalid username or password');
            }

            const userData = await userResponse.json();
            localStorage.setItem('token', userData.tokens);

            // Determine user role based on response
            const roles = [];
            if (userData.roles) {
                roles.push(...userData.roles);
            } else {
                // If roles not provided, determine based on user type
                if (userData.isDoctor) roles.push('Doctor');
                else if (userData.isStudent) roles.push('Student');
            }

            const user = {
                userName: username,
                roles: roles,
                isAdmin: false
            };

            localStorage.setItem('user', JSON.stringify(user));
            return user;

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const user = this.getUser();
            const endpoint = user?.role === 'admin' ? '/Account/Logout' : '/Account/Logout_Copy';

            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const responseData = await response.json();
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    throw new Error(responseData.errors[0]);
                }
                throw new Error(responseData.message || 'Logout failed');
            }

            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local storage and redirect even if the server request fails
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'login.html';
        }
    }

    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    async getUserProfile() {
    const response = await fetch(`${this.baseUrl}/User/UserProfile`, {
        headers: { Authorization: `Bearer ${this.getToken()}` }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get user profile');
    }

    const data = await response.json();
    return data;
}


    async updateUserProfile(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/account/update-user-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getToken()}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    async deleteAccount() {
        try {
            const response = await fetch(`${this.baseUrl}/account/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete account');
            }

            this.logout();
        } catch (error) {
            console.error('Delete account error:', error);
            throw error;
        }
    }

    async forgotPassword(email) {
        try {
            const response = await fetch(`${this.baseUrl}/account/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to process forgot password request');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/account/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, newPassword })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to reset password');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }
}

export default AuthService;