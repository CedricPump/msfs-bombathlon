import axios from 'axios';
import authService from './AuthService'; // Import your authentication service

interface User {
    id: string;
    username: string;
    email: string;
}

class ApiService {
    private readonly API_URL = 'http://localhost:8000/api'; // Replace with your API URL

    public async register(name: string, email: string, password: string): Promise<boolean> {
        const body = {
            "username": name,
            "email": email,
            "password": password
        };

        try {
            const response = await axios.post(`${this.API_URL}/user/register`, body, {
                headers: {
                    Authorization: `Bearer ${authService.getAccessToken()}`, // Include the access token in the request headers
                },
            });

            if (response.status === 201) {
                return true;
            }

            // Failed register
            return false;
        } catch (error) {
            return false;
        }
    }

    public async getCurrentUser(): Promise<User | null> {
        try {
            const response = await axios.get(`${this.API_URL}/user/current-user`, {
                headers: {
                    Authorization: `Bearer ${authService.getAccessToken()}`, // Include the access token in the request headers
                },
            });

            if (response.status === 200) {
                // User data was fetched successfully
                return response.data as User;
            } else {
                // User data request failed
                return null;
            }
        } catch (error) {
            // An error occurred while fetching user data
            console.error('Error fetching current user data:', error);
            return null;
        }
    }
}

const apiService = new ApiService();

export default apiService;
