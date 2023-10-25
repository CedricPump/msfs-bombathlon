using Bombatlon.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bombatlon
{
    class Controller
    {
        BombathlonApiService api;
        Plane plane;
        TimeSpan dataSendIntervall;
        int idlerefreshIntervall = 5000;
        int refreshIntervall = 250;

        public Controller()
        {
            this.api = new BombathlonApiService(OnCommandCallback);
            this.plane = new Plane(OnPlaneEventCallback);
            this.dataSendIntervall = TimeSpan.FromMilliseconds(3000);    
        }

        public void Run()
        {
            DateTime lastSent = DateTime.Now;
            while (true)
            {
                try
                {
                    plane.Update();
                    if (plane.IsSimConnectConnected && !plane.SimDisabled)
                    {
                        // Console.WriteLine(JsonSerializer.Serialize(plane));
                        if ((DateTime.Now - lastSent) > dataSendIntervall)
                        {
                            if ( true ) //(!plane.IsOnGround || plane.GroundSpeed > 0.05) && !plane.SimDisabled)
                            {
                                PlaneEvent evt = new PlaneEvent
                                {
                                    Event = "TELEMETRIE",
                                    Parameter = plane.GetTelemetrie()
                                };

                                OnPlaneEventCallback(evt);
                                lastSent = DateTime.Now;
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
                int intervall = this.plane.IsSimConnectConnected ? this.refreshIntervall : this.idlerefreshIntervall;
                System.Threading.Thread.Sleep(intervall);
            };
        }

        public void OnCommandCallback(Command command)
        {
            Console.WriteLine($"OnCommandCallback: {command.Type}");
            switch (command.Type)
            {
                case "REQUEST_INIT":
                    {
                        PlaneEvent evt = new PlaneEvent
                        {
                            Event = "INIT_FLIGHT",
                            Parameter = new InitFlightData
                            {
                                Telemetrie = this.plane.GetTelemetrie(),
                                Ident = this.plane.GetIdent(),
                                State = this.plane.GetState(),
                            },
                        };
                        OnPlaneEventCallback(evt);
                        break;
                    }
                case "SET_BOMBS":
                    {
                        Console.WriteLine(command.Parameters);
                        Dictionary<int, Bomb> bombs = JsonSerializer.Deserialize<Dictionary<int, Bomb>>(command.Parameters);
                        plane.SetBombs(bombs);
                        break;
                    }
                case "ERROR":
                    {
                        Console.Error.WriteLine($"{command.Type} {command.Parameters}");
                        break;
                    }
                case "AKN":
                    {
                        break;
                    }
                default:
                    {
                        Console.WriteLine(command.Type);
                        break;
                    }
            }
        }

        public void OnPlaneEventCallback(PlaneEvent evt)
        {
            Console.WriteLine(evt.ToString());
            string msg = JsonSerializer.Serialize<PlaneEvent>(evt);
            Console.WriteLine(msg);
            this.api.sendData(msg);
        }
    }
}
