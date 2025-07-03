class AuthService {
    constructor(apiUrl) {
      this.apiUrl = apiUrl;
      this.tokenKey = 'authToken';
    }

    async login(userName, password) {
      const payload = { userName, password };

      try {
        const response = await fetch(`${this.apiUrl}/Account/Login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.title || 'Login failed');
        }

        const data = await response.json();
        this.saveToken(data.token);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }

    saveToken(token) {
      localStorage.setItem(this.tokenKey, token);
    }

    getToken() {
      return localStorage.getItem(this.tokenKey);
    }

    logout() {
      localStorage.removeItem(this.tokenKey);
    }

    isAuthenticated() {
      return !!this.getToken();
    }
  }
