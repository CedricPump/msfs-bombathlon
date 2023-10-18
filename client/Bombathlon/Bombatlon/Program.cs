using System;
using Microsoft.FlightSimulator.SimConnect;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text.Json;
using Bombatlon;

namespace Bombathlon
{
    class Program
    {
        static void Main(string[] args)
        {
            BombathlonApiService api = new BombathlonApiService();
            Aircraft aircraft = new Aircraft(); while (!aircraft.isInit)
            {
                aircraft.Update();
                System.Threading.Thread.Sleep(50);
            }

            DateTime lastSent = DateTime.Now;
            TimeSpan dataSendIntervall = TimeSpan.FromMilliseconds(3000);
            int refreshIntervall = 250;


            aircraft.AddBombs(new Dictionary<int, Bomb>
            {
                { 5, new Bomb{
                        Name = "Dummy",
                        weight = 375
                    } 
                },
                { 6, new Bomb{
                        Name = "Dummy",
                        weight = 375
                    } 
                }
            }); ;

            while (true)
            {
                try
                {
                    aircraft.Update();
                    if (aircraft.isSimConnectConnected && !aircraft.simDisabled)
                    {
                        //Console.WriteLine(JsonSerializer.Serialize(aircraft));
                        if((DateTime.Now - lastSent) > dataSendIntervall)
                        {
                            api.sendFlightData(aircraft);
                            lastSent = DateTime.Now;
                        }
                        
                    }
                } catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
                System.Threading.Thread.Sleep(refreshIntervall);
            };
        }
    }
}


