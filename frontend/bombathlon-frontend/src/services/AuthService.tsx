import axios from 'axios';

interface User {
    id: string;
    username: string;
    email: string;
}

class AuthService {
    private readonly API_URL = 'http://localhost:8000/api'; // Replace with your API URL
    private readonly STORAGE_KEY = 'accessToken';

    async login(email: string, password: string): Promise<boolean> {
        const body = {
            "email": email,
            "password": password
        }
        // Send a POST request to your backend login endpoint
        console.log(`${this.API_URL}/users/login ${JSON.stringify(body)}`)
        try {
            let response = await axios
                .post(`${this.API_URL}/user/login`, body);
            console.log(`res ${JSON.stringify(response)}`)
            const accessToken = response.data.accessToken;

            if (accessToken) {
                // Successful login
                localStorage.setItem(this.STORAGE_KEY, accessToken);
                return true;
            }

            // Failed login
            return false;
        } catch (e) {
            return false;
        }
    }

    logout(): void {
        // Send a POST request to your backend logout endpoint
        // axios.post(`${this.API_URL}/logout`);

        // Clear the authentication token
        localStorage.removeItem(this.STORAGE_KEY);
    }

    isAuthenticated(): boolean {
        // Check if the user is authenticated based on the presence of the authentication token
        return !!localStorage.getItem(this.STORAGE_KEY);
    }

    getCurrentUser(): Promise<User | null> {
        const authToken = localStorage.getItem(this.STORAGE_KEY);

        if (!authToken) {
            return Promise.resolve(null);
        }

        // Send a GET request to your backend to fetch the current user's information
        return axios
            .get(`${this.API_URL}/user`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            })
            .then((response) => response.data)
            .catch(() => null);
    }

    getAccessToken() {
        return localStorage.getItem(this.STORAGE_KEY)
    }
}

const authService = new AuthService();
export default authService;
