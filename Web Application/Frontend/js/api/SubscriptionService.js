import ApiService from './ApiService.js';

class SubscriptionService {
    constructor() {
        this.apiService = new ApiService();
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api';
    }

    async getSubscriptionPlans() {
        try {
            const response = await fetch(`${this.baseUrl}/plan/get-all-plans`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get subscription plans');
            }

            return await response.json();
        } catch (error) {
            console.error('Get subscription plans error:', error);
            throw error;
        }
    }

    async getPlanById(planId) {
        try {
            const response = await fetch(`${this.baseUrl}/plan/get-plan-by-id/${planId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get plan details');
            }

            return await response.json();
        } catch (error) {
            console.error('Get plan details error:', error);
            throw error;
        }
    }

    async subscribeFirstTime(planId, paymentDetails) {
        try {
            const response = await fetch(`${this.baseUrl}/subscription/subscribe-first-time`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    planId,
                    ...paymentDetails
                })
            });

            if (!response.ok) {
                throw new Error('Failed to subscribe');
            }

            return await response.json();
        } catch (error) {
            console.error('Subscribe error:', error);
            throw error;
        }
    }

    async renewSubscription(planId, paymentDetails) {
        try {
            const response = await fetch(`${this.baseUrl}/subscription/renew-subscription`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    planId,
                    ...paymentDetails
                })
            });

            if (!response.ok) {
                throw new Error('Failed to renew subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Renew subscription error:', error);
            throw error;
        }
    }

    async getCurrentSubscription() {
        try {
            const response = await fetch(`${this.baseUrl}/subscription/access-subscription`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get current subscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Get current subscription error:', error);
            throw error;
        }
    }

    async getPendingPayments() {
        try {
            const response = await fetch(`${this.baseUrl}/payment/fetch-pending-payments`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get pending payments');
            }

            return await response.json();
        } catch (error) {
            console.error('Get pending payments error:', error);
            throw error;
        }
    }

    async approvePayment(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/payment/approve-payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ paymentId })
            });

            if (!response.ok) {
                throw new Error('Failed to approve payment');
            }

            return await response.json();
        } catch (error) {
            console.error('Approve payment error:', error);
            throw error;
        }
    }

    async rejectPayment(paymentId) {
        try {
            const response = await fetch(`${this.baseUrl}/payment/reject-payment`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ paymentId })
            });

            if (!response.ok) {
                throw new Error('Failed to reject payment');
            }

            return await response.json();
        } catch (error) {
            console.error('Reject payment error:', error);
            throw error;
        }
    }
}

export default SubscriptionService; 