import Navigation from './Navigation.js';
import AuthService from '../api/AuthService.js';

class BaseLayout {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.authService = new AuthService();
        this.checkAuthentication();
    }

    checkAuthentication() {
        if (!this.authService.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }
    }

    render(content) {
        this.container.innerHTML = `
            <div class="base-layout">
                <div id="navigation"></div>
                <main class="main-content">
                    ${content}
                </main>
            </div>
        `;

        // Initialize navigation
        new Navigation('navigation');
    }
}

export default BaseLayout; 