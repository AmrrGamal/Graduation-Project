import UserService from '../api/UserService.js';
import RoleManager from '../utils/RoleManager.js';

class SubscriptionManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.userService = new UserService();
        this.role = RoleManager.getRoleFromToken();
        this.initialize();
    }

    async initialize() {
        try {
            const [plans, currentSubscription] = await Promise.all([
                this.userService.getAvailablePlans(),
                this.userService.getCurrentSubscription()
            ]);
            this.render(plans, currentSubscription);
        } catch (error) {
            console.error('Failed to initialize subscription manager:', error);
            this.showError('Failed to load subscription information');
        }
    }

    render(plans, currentSubscription) {
        this.container.innerHTML = `
            <div class="subscription-container">
                <div class="current-subscription">
                    <h2>Current Subscription</h2>
                    ${this.renderCurrentSubscription(currentSubscription)}
                </div>

                <div class="available-plans">
                    <h2>Available Plans</h2>
                    <div class="plans-grid">
                        ${this.renderPlans(plans, currentSubscription)}
                    </div>
                </div>
            </div>
        `;

        this.attachEventListeners();
    }

    renderCurrentSubscription(subscription) {
        if (!subscription) {
            return `
                <div class="no-subscription">
                    <p>You don't have an active subscription.</p>
                    <p>Please select a plan below to subscribe.</p>
                </div>
            `;
        }

        return `
            <div class="subscription-card">
                <h3>${subscription.planName}</h3>
                <p>Status: ${subscription.status}</p>
                <p>Start Date: ${new Date(subscription.startDate).toLocaleDateString()}</p>
                <p>End Date: ${new Date(subscription.endDate).toLocaleDateString()}</p>
                <p>Features:</p>
                <ul>
                    ${subscription.features.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        `;
    }

    renderPlans(plans, currentSubscription) {
        return plans.map(plan => `
            <div class="plan-card ${plan.id === currentSubscription?.planId ? 'current-plan' : ''}">
                <h3>${plan.name}</h3>
                <div class="plan-price">$${plan.price}/month</div>
                <div class="plan-features">
                    <h4>Features:</h4>
                    <ul>
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
                ${this.renderPlanActions(plan, currentSubscription)}
            </div>
        `).join('');
    }

    renderPlanActions(plan, currentSubscription) {
        if (plan.id === currentSubscription?.planId) {
            return '<button class="plan-btn current" disabled>Current Plan</button>';
        }

        if (currentSubscription) {
            const daysInCurrentPlan = this.calculateDaysInPlan(currentSubscription.startDate);
            const priceDifference = plan.price - currentSubscription.price;

            return `
                <button class="plan-btn" data-plan-id="${plan.id}" data-action="upgrade">
                    ${daysInCurrentPlan > 10 ? 'Subscribe' : 'Upgrade'}
                </button>
                ${daysInCurrentPlan <= 10 ? `
                    <div class="price-difference">
                        ${priceDifference > 0 ?
                        `Additional cost: $${priceDifference}` :
                        `Refund: $${Math.abs(priceDifference)}`}
                    </div>
                ` : ''}
            `;
        }

        return `
            <button class="plan-btn" data-plan-id="${plan.id}" data-action="subscribe">
                Subscribe
            </button>
        `;
    }

    attachEventListeners() {
        const planButtons = document.querySelectorAll('.plan-btn:not(.current)');
        planButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const planId = button.dataset.planId;
                const action = button.dataset.action;

                try {
                    if (action === 'upgrade') {
                        await this.handleUpgrade(planId);
                    } else {
                        await this.handleSubscribe(planId);
                    }
                } catch (error) {
                    console.error('Subscription action failed:', error);
                    this.showError('Failed to process subscription. Please try again.');
                }
            });
        });
    }

    async handleSubscribe(planId) {
        try {
            const response = await this.userService.subscribeToPlan(planId);
            if (response.success) {
                this.showSuccess('Successfully subscribed to the plan!');
                this.initialize(); // Refresh the view
            }
        } catch (error) {
            throw error;
        }
    }

    async handleUpgrade(planId) {
        try {
            const response = await this.userService.updateSubscription(planId);
            if (response.success) {
                this.showSuccess('Successfully upgraded your subscription!');
                this.initialize(); // Refresh the view
            }
        } catch (error) {
            throw error;
        }
    }

    calculateDaysInPlan(startDate) {
        const start = new Date(startDate);
        const now = new Date();
        const diffTime = Math.abs(now - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

export default SubscriptionManager; 