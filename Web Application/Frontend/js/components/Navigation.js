import AuthService from '../api/AuthService.js';
import RoleManager from '../utils/RoleManager.js';

class Navigation {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.authService = new AuthService();
        this.role = RoleManager.getRoleFromToken();
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <nav class="main-nav">
                <div class="nav-brand">
                    <a href="index.html">Dental AI Platform</a>
                </div>
                <div class="nav-links">
                    ${this.renderNavLinks()}
                </div>
                <div class="nav-user">
                    <span class="user-role">${this.role}</span>
                    <button class="logout-btn">Logout</button>
                </div>
            </nav>
        `;

        this.attachEventListeners();
    }

    renderNavLinks() {
        const links = [];

        // Common links for all authenticated users
        links.push(`<a href="prediction.html">Predictions</a>`);
        links.push(`<a href="subscription.html">Subscription</a>`);

        // Role-specific links
        if (this.role === RoleManager.ROLES.DOCTOR) {
            links.push(`<a href="patient.html">Patients</a>`);
        }

        if (this.role === RoleManager.ROLES.STUDENT) {
            links.push(`<a href="quiz.html">Quizzes</a>`);
        }

        if (this.role === RoleManager.ROLES.ADMIN) {
            links.push(`<a href="admin.html">Admin Panel</a>`);
        }

        return links.join('');
    }

    attachEventListeners() {
        const logoutBtn = this.container.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
    }

    async handleLogout() {
        try {
            await this.authService.logout();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }
}

export default Navigation; 