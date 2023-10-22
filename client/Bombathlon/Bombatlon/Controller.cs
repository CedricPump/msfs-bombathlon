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
                            if ((!plane.IsOnGround || plane.GroundSpeed > 0.05) && !plane.SimDisabled)
                            {
                                PlaneEvent evt = new PlaneEvent
                                {
                                    Event = "TELEMETRIE",
                                    Parameter = plane.GetTelemetrie()
                                };
                                this.plane.SetBombs(new Dictionary<int, Bomb> { {2, new Bomb{
                                    count = 0, Name = "Dummy", weight = 375
                                } },
                                {3, new Bomb{
                                    count = 0, Name = "Dummy", weight = 375
                                } }});

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
            switch (command.command)
            {
                case "SETBOMBS":
                    {
                        Dictionary<int, Bomb> bombs = JsonSerializer.Deserialize<Dictionary<int, Bomb>>(command.parameters[0]);
                        plane.SetBombs(bombs);
                        break;
                    }
                case "AKN":
                    {
                        break;
                    }
                default:
                    {
                        Console.WriteLine(command.command);
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
