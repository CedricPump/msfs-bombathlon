using System;
using Microsoft.FlightSimulator.SimConnect;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text.Json;
using PlaneExport;
using System.IO;

namespace PlaneExport
{
    class Program
    {
        static void Main(string[] args)
        {
            string logFilePath = ".\\aircraft.log";
            Aircraft aircraft = new Aircraft();
            AircraftEntry entry = new AircraftEntry();
            string oldIdentity = "";

            while (true)
            {
                try
                {
                    aircraft.Update();
                    if (aircraft.isSimConnectConnected && !aircraft.simDisabled)
                    {
                        string identity = aircraft.Model + aircraft.Type + aircraft.Title;
                        if(identity != oldIdentity)
                        {
                            entry.DisplayName = aircraft.Title;
                            entry.AircrafName = aircraft.Title;
                            entry.Title = aircraft.Title;
                            entry.TitleRegex = aircraft.Title;
                            entry.ATCType = aircraft.Type;
                            entry.ATCModel = aircraft.Model;
                            entry.maxFuel = aircraft.Fuel;
                            entry.PylonsCount = (uint) Math.Round(aircraft.payloadCount, 0, MidpointRounding.AwayFromZero);
                            entry.Pylons = new Pylon[entry.PylonsCount];
                            for (int i = 0; i < entry.PylonsCount; i++)
                            {
                                entry.Pylons[i] = new Pylon();
                                entry.Pylons[i].payloadWeight = aircraft.payloadWeights[i];
                                entry.Pylons[i].payloadIndex = (uint) i+1;
                                entry.Pylons[i].payloadName = aircraft.payloadNames[i];
                            }
                            string jsonEntry = JsonSerializer.Serialize(entry, new JsonSerializerOptions
                            {
                                WriteIndented = true,
                            });

                            Console.WriteLine(jsonEntry);

                            // Append the JSON entry to the log file
                            File.AppendAllText($".\\PlaneTypes\\PlaneType_{aircraft.Title}.json", jsonEntry + Environment.NewLine);


                        }
                        //Console.WriteLine(identity);
                        oldIdentity = identity;
                        System.Threading.Thread.Sleep(300);
                    }
                    else
                    {
                        System.Threading.Thread.Sleep(5000);
                    }
                } catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                    System.Threading.Thread.Sleep(5000);
                }
            };
        }
    }

    class AircraftEntry
    {
        public string DisplayName { get; set; } = "";
        public string AircrafName { get; set; } = "";
        public string Manufaturer { get; set; } = "";
        public string Developer { get; set; } = "";
        public string ATCModel { get; set; } = "";
        public string ATCType { get; set; } = "";
        public string Title { get; set; } = "";
        public string TitleRegex { get; set; } = "";
        public double maxFuel { get; set; } = 0.0; // in gallons
        public uint PylonsCount { get; set; } = 0;
        public Pylon[] Pylons { get; set; } = new Pylon[0];
    }

    class Pylon
    {
        public uint payloadIndex { get; set; }

        public double payloadWeight { get; set; } = 0.0;
        public string payloadName { get; set; } = "";
        public string[] loadouts { get; set; } = new string[0];
    }
}


