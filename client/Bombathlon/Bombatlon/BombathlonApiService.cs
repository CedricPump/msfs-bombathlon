using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bombatlon
{
    class BombathlonApiService
    {
        private string host = "localhost";
        private int port = 8000;
        private string baseUrl = "";
        private string email = "";
        private string password = "";
        private string sessionToken = "";
        private string refreshToken = "";
        private string credentialsFilePath = "./credentials.txt";

        public BombathlonApiService()
        {
            baseUrl = "http://" + host + ":" + port + "/api";
            loadLoginCredentials();
            login();
        }

        private void loadLoginCredentials()
        {
            // Load login credentials from file if available
            if (File.Exists(credentialsFilePath))
            {
                try
                {
                    string[] credentials = File.ReadAllLines(credentialsFilePath);
                    if (credentials.Length == 2)
                    {
                        email = credentials[0];
                        password = credentials[1];
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error loading credentials: " + ex.Message);
                }
            }

            // If email or password is missing, ask the user for input
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
            {
                readLoginCredentials();
            }
        }

        private void readLoginCredentials()
        {
            Console.WriteLine("Please enter your email: ");
            email = Console.ReadLine();
            Console.WriteLine("Please enter your password: ");
            password = Console.ReadLine();

            // Ask the user if they want to save the credentials in clear text
            Console.WriteLine("Warning: saving loging credentsials stores password in clear text. This might be unsafe.");
            Console.WriteLine("Do you want to save the credentials anyway? (yes/no)");
            string saveCredentials = Console.ReadLine();
            if (saveCredentials.Equals("yes", StringComparison.OrdinalIgnoreCase) || saveCredentials.Equals("y", StringComparison.OrdinalIgnoreCase))
            {
                saveLoginCredentials();
            }
        }

        private void saveLoginCredentials()
        {
            try
            {
                // Save login credentials to the file
                File.WriteAllText(credentialsFilePath, email + Environment.NewLine + password);
                Console.WriteLine("Credentials saved successfully.");
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error saving credentials: " + ex.Message);
            }
        }

        private void login()
        {
            try
            {
                // Login to <baseUrl>/user/login with body: {"email": <email>, "password": <password>}
                var loginData = new { email, password };
                var loginJson = JsonSerializer.Serialize(loginData);
                var content = new StringContent(loginJson, Encoding.UTF8, "application/json");

                using (var httpClient = new HttpClient())
                {
                    var response = httpClient.PostAsync($"{baseUrl}/user/login", content).Result;

                    if (response.IsSuccessStatusCode)
                    {
                        var responseContent = response.Content.ReadAsStringAsync().Result;
                        var tokens = JsonSerializer.Deserialize<TokenResponse>(responseContent);
                        if (tokens != null)
                        {
                            sessionToken = tokens.AccessToken;
                            refreshToken = tokens.RefreshToken;
                            Console.WriteLine("Login successful.");
                        }
                        else
                        {
                            Console.WriteLine("Failed to parse tokens.");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Login failed. Status code: " + response.StatusCode);
                        if (response.StatusCode == System.Net.HttpStatusCode.Unauthorized)
                        {
                            Console.WriteLine("Login Unauthorized. Please check credentials: ");
                            readLoginCredentials();
                            login();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error during login: " + ex.Message);
            }
        }


        public async Task<bool> sendFlightData(Aircraft aircraft)
        {
            if (string.IsNullOrEmpty(sessionToken))
            {
                login();
            }

            if (string.IsNullOrEmpty(sessionToken))
            {
                Console.WriteLine("Unable to send flight data without a valid session token.");
                return false;
            }

            try
            {
                string flightData = JsonSerializer.Serialize(aircraft);

                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {sessionToken}");
                    var content = new StringContent(flightData, Encoding.UTF8, "application/json");

                    var response = await httpClient.PostAsync($"{baseUrl}/flight/data", content);

                    if (response.IsSuccessStatusCode)
                    {
                        Console.WriteLine("Flight data sent successfully.");
                        return true;
                    }
                    else
                    {
                        Console.WriteLine("Failed to send flight data. Status code: " + response.StatusCode);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending flight data: " + ex.Message);
            }

            return false;
        }
    }

    class TokenResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
    }
}
