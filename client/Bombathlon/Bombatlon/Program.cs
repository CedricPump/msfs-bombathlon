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
            Aircraft aircraft = new Aircraft();

            while (true)
            {
                try
                {
                    aircraft.Update();
                    if (aircraft.isSimConnectConnected && !aircraft.simDisabled)
                    {
                        Console.WriteLine(JsonSerializer.Serialize(aircraft));
                        api.sendFlightData(aircraft);
                    }
                } catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                }
                System.Threading.Thread.Sleep(3000);
            };
        }

    }






}


