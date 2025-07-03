import ApiService from './ApiService.js';

class PredictionService {
    constructor() {
        this.apiService = new ApiService();
        this.baseUrl = 'http://aidentify-gradutionff.runasp.net/api';
    }

    async predictGender(imageData) {
        try {
            const response = await fetch(`${this.baseUrl}/models/predict-gender`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imageData })
            });

            if (!response.ok) {
                throw new Error('Failed to predict gender');
            }

            return await response.json();
        } catch (error) {
            console.error('Gender prediction error:', error);
            throw error;
        }
    }

    async predictAge(imageData) {
        try {
            const response = await fetch(`${this.baseUrl}/models/predict-age`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imageData })
            });

            if (!response.ok) {
                throw new Error('Failed to predict age');
            }

            return await response.json();
        } catch (error) {
            console.error('Age prediction error:', error);
            throw error;
        }
    }

    async predictDisease(imageData) {
        try {
            const response = await fetch(`${this.baseUrl}/models/predict-disease`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imageData })
            });

            if (!response.ok) {
                throw new Error('Failed to predict disease');
            }

            return await response.json();
        } catch (error) {
            console.error('Disease prediction error:', error);
            throw error;
        }
    }

    async predictTeeth(imageData) {
        try {
            const response = await fetch(`${this.baseUrl}/models/predict-teeth`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ imageData })
            });

            if (!response.ok) {
                throw new Error('Failed to predict teeth');
            }

            return await response.json();
        } catch (error) {
            console.error('Teeth prediction error:', error);
            throw error;
        }
    }

    async getAvailableModels() {
        try {
            const response = await fetch(`${this.baseUrl}/models/available-models`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get available models');
            }

            return await response.json();
        } catch (error) {
            console.error('Get available models error:', error);
            throw error;
        }
    }

    async getPredictionLimits() {
        try {
            const response = await fetch(`${this.baseUrl}/subscription/access-subscription`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiService.getToken()}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get prediction limits');
            }

            return await response.json();
        } catch (error) {
            console.error('Get prediction limits error:', error);
            throw error;
        }
    }
}

export default PredictionService; 