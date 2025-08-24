class CustomerApp {
    constructor() {
        this.API_BASE_URL = 'http://localhost:5000';
        this.currentToken = localStorage.getItem('authToken') || '';
        this.currentUser = null;
        
        this.initializeApp();
    }

    initializeApp() {
        this.setupEventListeners();
        this.checkAuthStatus();
        this.testApiConnection();
    }

    setupEventListeners() {
        // Auth tabs
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAuthTab(e.target.dataset.tab);
            });
        });

        // App tabs
        document.querySelectorAll('.app-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchAppTab(e.target.dataset.tab);
            });
        });

        // Forms
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        
        // Buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        document.getElementById('refreshProfileBtn').addEventListener('click', () => this.loadProfile());
        document.getElementById('loadUsersBtn').addEventListener('click', () => this.loadAllUsers());
    }

    switchAuthTab(tabName) {
        // Update tabs
        document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.auth-tab[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabName}-form`).classList.add('active');
    }

    switchAppTab(tabName) {
        // Update tabs
        document.querySelectorAll('.app-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`.app-tab[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.app-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    async testApiConnection() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/`);
            if (response.ok) {
                this.updateApiStatus('connected');
            } else {
                this.updateApiStatus('error');
            }
        } catch (error) {
            this.updateApiStatus('error');
            this.showMessage('Cannot connect to backend API. Make sure Flask server is running on http://localhost:5000', 'error');
        }
    }

    updateApiStatus(status) {
        const apiStatus = document.getElementById('apiStatus');
        switch(status) {
            case 'connected':
                apiStatus.textContent = 'API: Connected ✅';
                apiStatus.style.color = 'green';
                break;
            case 'error':
                apiStatus.textContent = 'API: Disconnected ❌';
                apiStatus.style.color = 'red';
                break;
        }
    }

    updateAuthStatus() {
        const authStatus = document.getElementById('authStatus');
        if (this.currentToken) {
            authStatus.textContent = 'Auth: Logged in ✅';
            authStatus.style.color = 'green';
            document.getElementById('app-section').classList.remove('hidden');
            document.querySelector('.auth-section').classList.add('hidden');
        } else {
            authStatus.textContent = 'Auth: Not logged in ❌';
            authStatus.style.color = 'red';
            document.getElementById('app-section').classList.add('hidden');
            document.querySelector('.auth-section').classList.remove('hidden');
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch(`${this.API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentToken = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', this.currentToken);
                
                this.showMessage('Login successful!', 'success');
                this.updateAuthStatus();
                this.updateUserInterface();
                this.loadProfile();
                
                // Clear form
                document.getElementById('loginForm').reset();
            } else {
                this.showMessage(data.message || 'Login failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;

        try {
            const response = await fetch(`${this.API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.currentToken = data.token;
                this.currentUser = data.user;
                localStorage.setItem('authToken', this.currentToken);
                
                this.showMessage('Registration successful! You are now logged in.', 'success');
                this.updateAuthStatus();
                this.updateUserInterface();
                this.loadProfile();
                
                // Clear form and switch to login tab
                document.getElementById('registerForm').reset();
                this.switchAuthTab('login');
            } else {
                this.showMessage(data.message || 'Registration failed', 'error');
            }
        } catch (error) {
            this.showMessage('Network error. Please check your connection and try again.', 'error');
        }
    }

    handleLogout() {
        this.currentToken = '';
        this.currentUser = null;
        localStorage.removeItem('authToken');
        
        this.showMessage('Logged out successfully', 'info');
        this.updateAuthStatus();
        this.updateUserInterface();
    }

    async loadProfile() {
        if (!this.currentToken) return;

        try {
            const response = await fetch(`${this.API_BASE_URL}/profile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.currentToken}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                this.displayProfile(data.user);
                this.showMessage('Profile loaded successfully', 'success');
            } else {
                this.showMessage(data.message || 'Failed to load profile', 'error');
                if (response.status === 401) {
                    this.handleLogout();
                }
            }
        } catch (error) {
            this.showMessage('Network error while loading profile', 'error');
        }
    }

    async loadAllUsers() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/users`);
            const data = await response.json();

            if (response.ok) {
                this.displayUsers(data.users);
                this.showMessage(`Loaded ${data.users.length} users`, 'success');
            } else {
                this.showMessage(data.message || 'Failed to load users', 'error');
            }
        } catch (error) {
            this.showMessage('Network error while loading users', 'error');
        }
    }

    displayProfile(user) {
        document.getElementById('profileId').textContent = user.id;
        document.getElementById('profileUsername').textContent = user.username;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileJoined').textContent = new Date(user.created_at).toLocaleDateString();
    }

    displayUsers(users) {
        const usersList = document.getElementById('usersList');
        
        if (users.length === 0) {
            usersList.innerHTML = '<p>No users found</p>';
            return;
        }

        usersList.innerHTML = users.map(user => `
            <div class="user-card">
                <p><strong>ID:</strong> ${user.id}</p>
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
            </div>
        `).join('');
    }

    updateUserInterface() {
        if (this.currentUser) {
            document.getElementById('userName').textContent = this.currentUser.username;
        }
    }

    checkAuthStatus() {
        if (this.currentToken) {
            // Try to validate token by loading profile
            this.loadProfile().catch(() => {
                // Token is invalid, clear it
                this.handleLogout();
            });
        }
        this.updateAuthStatus();
    }

    showMessage(message, type = 'info') {
        const messageEl = document.getElementById('statusMessage');
        messageEl.textContent = message;
        messageEl.className = `status-message ${type}`;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, 5000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CustomerApp();
});