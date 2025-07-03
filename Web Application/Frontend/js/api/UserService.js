import ApiService from './ApiService.js';

class UserService extends ApiService {
    constructor() {
        super();
        this.token = localStorage.getItem('token');
    }

    // Get user profile
    async getProfile() {
        try {
            const response = await this.get('/user/profile', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to get user profile:', error);
            throw error;
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const response = await this.put('/user/profile', profileData, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to update profile:', error);
            throw error;
        }
    }

    // Get available subscription plans
    async getAvailablePlans() {
        try {
            const response = await this.get('/subscription/plans', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to get subscription plans:', error);
            throw error;
        }
    }

    // Subscribe to a plan
    async subscribeToPlan(planId) {
        try {
            const response = await this.post('/subscription/subscribe', {
                planId
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to subscribe to plan:', error);
            throw error;
        }
    }

    // Get current subscription
    async getCurrentSubscription() {
        try {
            const response = await this.get('/subscription/current', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to get current subscription:', error);
            throw error;
        }
    }

    // Update subscription
    async updateSubscription(newPlanId) {
        try {
            const response = await this.put('/subscription/update', {
                newPlanId
            }, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to update subscription:', error);
            throw error;
        }
    }

    // Get user's patients (for doctors)
    async getPatients() {
        try {
            const response = await this.get('/user/patients', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to get patients:', error);
            throw error;
        }
    }

    // Upload patient data (for doctors)
    async uploadPatientData(patientId, data) {
        try {
            const response = await this.post(`/user/patients/${patientId}/data`, data, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to upload patient data:', error);
            throw error;
        }
    }

    // Get quiz scores (for students)
    async getQuizScores() {
        try {
            const response = await this.get('/user/quiz-scores', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            return response;
        } catch (error) {
            console.error('Failed to get quiz scores:', error);
            throw error;
        }
    }
}

export default UserService; 