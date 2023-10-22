using System;
using Microsoft.FlightSimulator.SimConnect;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text.Json;
using Bombatlon;
using static Bombatlon.BombathlonApiService;

namespace Bombathlon
{
    class Program
    {
        static void Main(string[] args)
        {
            Controller controller = new Controller();
            controller.Run();
        }


    }
}


