using System;
using System.IO;
using System.Net.Http;
using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace Bombatlon
{
    class BombathlonApiService
    {
        private string host = "localhost";
        private int port = 8000;
        private string baseUrl = "";
        private string WebSocketUrl = "";
        private string email = "";
        private string password = "";
        private string userId = "";
        private TokenResponse token = null;
        private string refreshToken = "";
        private string credentialsFilePath = "./credentials.txt";
        private ClientWebSocket webSocket;
        public delegate void CommandReveivedCallBack(Command command);
        private CommandReveivedCallBack callBack = null;

        public BombathlonApiService(CommandReveivedCallBack callBack)
        {
            this.callBack = callBack;
            this.baseUrl = $"http://{host}:{port}/api";
            this.WebSocketUrl = $"ws://{host}:{port}/ws";

            Console.WriteLine($"load login credentials");
            loadLoginCredentials();
            Console.WriteLine($"login");
            login();
            Console.WriteLine($"connect WebSocket");
            connectWebsocketAsync();
        }

        private async Task connectWebsocketAsync()
        {
            Console.WriteLine($"connecting WS {WebSocketUrl}");
            this.webSocket = new ClientWebSocket();
            {
                try
                {
                    webSocket.Options.SetRequestHeader("Authorization", $"Bearer {token.accessToken}");

                    // Connect to the WebSocket server
                    await this.webSocket.ConnectAsync(new Uri(WebSocketUrl), CancellationToken.None);

                    // Start a separate thread to receive messages
                    var receiveTask = ReceiveWS();
                    Console.WriteLine($"connected WS");

                    // Wait for the receive task to complete
                    await receiveTask;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception WS: {ex.Message}");
                }
            }
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
                            token = tokens;
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

        private async Task SendMessageWS(string message)
        {
            byte[] buffer = Encoding.UTF8.GetBytes(message);
            await this.webSocket.SendAsync(new ArraySegment<byte>(buffer), WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task SendMessageHTTP(string message)
        {
            try
            {
                using (var httpClient = new HttpClient())
                {
                    httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {token.accessToken}");
                    var content = new StringContent(message, Encoding.UTF8, "application/json");

                    var response = await httpClient.PostAsync($"{baseUrl}/flight/data", content);

                    if (response.IsSuccessStatusCode)
                    {
                        return;
                    }
                    else
                    {
                        Console.WriteLine("Failed to send data. Status code: " + response.StatusCode);
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error sending data: " + ex.Message);
            }
        }

        private async Task ReceiveWS()
        {
            byte[] buffer = new byte[1024];
            while (this.webSocket.State == WebSocketState.Open)
            {
                WebSocketReceiveResult result = await this.webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string receivedMessage = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    //Console.WriteLine($"Received message: {receivedMessage}");
                    try
                    {
                        Console.WriteLine($"WS: {receivedMessage}");
                        Command cmd = JsonSerializer.Deserialize<Command>(receivedMessage);
                        this.callBack(cmd);
                    } 
                    catch (Exception e)
                    {
                        Console.WriteLine($"Could not parse command: {receivedMessage}");
                    }
                }
                else if (result.MessageType == WebSocketMessageType.Close)
                {
                    Console.WriteLine("WebSocket closed by the server.");
                    break;
                }
            }
        }


        public async Task<bool> sendData(string data)
        {
            try
            {
                if (string.IsNullOrEmpty(token.accessToken))
                {
                    login();
                }
            }
            catch (Exception ex)
            {
                //Console.WriteLine("can't login " + ex.Message);
            }

            if (string.IsNullOrEmpty(token.accessToken))
            {
                Console.WriteLine("Unable to send flight data without a valid session token.");
                return false;
            }
            Console.WriteLine(data);
            SendMessageWS(data);

            return false;
        }

        public async Task closeAsync()
        {
            // Close the WebSocket connection
            await this.webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "disconnecting", CancellationToken.None);
        }
    }

    class TokenResponse
    {
        public string accessToken { get; set; }
        public string refreshToken { get; set; }
        public string accessTokenExpiration { get; set; }
        public string refreshTokenExpiration { get; set; }
        public string userUUID { get; set; }
        public string userName { get; set; }

    }
}
