using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using Bombatlon.Model;
using Microsoft.FlightSimulator.SimConnect;

namespace Bombatlon
{
    abstract class Aircraft
    {
        public bool isInit = false;
        private SimConnect simconnect;
        private IntPtr m_hWnd = new IntPtr(0);
        public const int WM_USER_SIMCONNECT = 0x0402;
        private Dictionary<DATA_DEFINE_ID, DataDefinition> definitions = new Dictionary<DATA_DEFINE_ID, DataDefinition>();
        private Dictionary<string, DataDefinition> definitions_by_string = new Dictionary<string, DataDefinition>();

        // Payload
        public double PayloadCount { get; private set; }
        public double[] PayloadWeight { get; private set; } = new double[16];
        // Ident
        public string Model { get; private set; }
        public string Type { get; private set; }
        public string Title { get; private set; }
        // Position
        public double Altitude { get; private set; }
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }
        public double Heading { get; private set; }
        // Movement
        public double GroundSpeed { get; private set; }
        public double vX { get; private set; }
        public double vY { get; private set; }
        public double vZ { get; private set; }
        // State
        public bool IsOnRundway { get; private set; }
        public bool IsOnGround { get; private set; }
        public bool IsEngineOn { get; private set; }
        public bool IsParkingBreak { get; private set; }
        public double Fuel { get; private set; }
        public string Airport { get; private set; }
        // Sim
        public bool IsSimConnectConnected { get; private set; } = false;
        public bool SimDisabled { get; private set; } = true;
        // AntiCheat
        public bool CrashEnabled { get; private set; } = true;
        public bool IsSlew { get; private set; } = true;
        public int TimeAcceleration { get; private set; } = 1;





        public string toString()
        {
            return Model + " [" + Latitude + "," + Longitude + "," + Altitude + "] " + GroundSpeed + "knts " + Heading + "° ";
        }

        enum GROUP_ID
        {
            GROUP_A,
        };

        public enum EVENTS
        {
            SimStart,
            SimStop,
            Crashed,
            AircraftLoaded,
            FlightLoaded,
            LANDING_LIGHTS_TOGGLE,
            PARKING_BRAKES,
            PARKING_BRAKE_SET,
            SMOKE_OFF,
            SMOKE_ON,
            SMOKE_SET,
            SMOKE_TOGGLE,
            TOW_PLANE_RELEASE,
            HORN_TRIGGER,
            PAUSE_TOGGLE,
            PAUSE_ON,
            PAUSE_OFF,
            SIM_RATE,
            SIM_RATE_DECR,
            SIM_RATE_INCR,
            SIM_RATE_SET
        };

        public static EVENTS[] SystemEvents = new EVENTS[] {
            EVENTS.SimStart,
            EVENTS.SimStop,
            EVENTS.Crashed,
            EVENTS.AircraftLoaded,
            EVENTS.FlightLoaded
        };


        public Aircraft()
        {
            IsSimConnectConnected = false;
            ConnectSimConnect();
        }

        public Telemetrie GetTelemetrie()
        {
            return new Telemetrie
            {
                Latitude = this.Latitude,
                Longitude = this.Longitude,
                Altitude = this.Altitude,
                GroundSpeed = this.GroundSpeed,
                Heading = this.Heading,
                vX = this.vX,
                vY = this.vY,
                vZ = this.vZ
            };
        }

        public Ident GetIdent()
        {
            return new Ident
            {
                Model = this.Model,
                Title = this.Title,
                Type = this.Type,
            };
        }

        public AircraftState GetState()
        {
            return new AircraftState
            {
                EngineOn = this.IsEngineOn,
                Fuel = this.Fuel,
                ParkingBrake = this.IsParkingBreak
            };
        }

        private void InitSimConnect(SimConnect sender, SIMCONNECT_RECV_OPEN data)
        {
            definitions = new Dictionary<DATA_DEFINE_ID, DataDefinition>();
            definitions_by_string = new Dictionary<string, DataDefinition>();

            Console.WriteLine("open: init ...");
            // Identity
            CreateDataDefinition("ATC MODEL", "", true);
            CreateDataDefinition("ATC TYPE", "", true);
            CreateDataDefinition("TITLE", "", true);
            // Position
            CreateDataDefinition("PLANE ALTITUDE", "feet");
            CreateDataDefinition("PLANE LATITUDE", "radians");
            CreateDataDefinition("PLANE LONGITUDE", "radians");
            // Orientation
            CreateDataDefinition("PLANE BANK DEGREES", "radians");
            CreateDataDefinition("PLANE PITCH DEGREES", "radians");
            CreateDataDefinition("PLANE HEADING DEGREES TRUE", "radians");
            CreateDataDefinition("PLANE HEADING DEGREES MAGNETIC", "radians");
            // Speed
            CreateDataDefinition("GROUND VELOCITY", "knots");
            CreateDataDefinition("AIRSPEED INDICATED", "knots");
            CreateDataDefinition("AIRSPEED TRUE", "knots");
            CreateDataDefinition("VERTICAL SPEED", "feet per second");
            CreateDataDefinition("VELOCITY WORLD X", "meter per second");
            CreateDataDefinition("VELOCITY WORLD Y", "meter per second");
            CreateDataDefinition("VELOCITY WORLD Z", "meter per second");
            // Anti-Cheat
            CreateDataDefinition("REALISM CRASH DETECTION", "");
            CreateDataDefinition("IS SLEW ACTIVE", "");
            // State
            CreateDataDefinition("ENG COMBUSTION", "Bool");
            CreateDataDefinition("BRAKE PARKING POSITION", "Bool");
            CreateDataDefinition("GEAR IS ON GROUND", "Bool");
            CreateDataDefinition("SIM ON GROUND", "Bool");
            CreateDataDefinition("ON ANY RUNWAY", "Bool");
            CreateDataDefinition("NAV LOC AIRPORT IDENT", "", true);
            // Fuel
            CreateDataDefinition("FUEL TOTAL QUANTITY WEIGHT", "pounds");
            // Action
            CreateDataDefinition("SMOKE ENABLE", "Bool");
            CreateDataDefinition("SIM DISABLED", "Bool");
            // Payload
            CreateDataDefinition("PAYLOAD STATION COUNT", "number");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:0", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:1", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:2", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:3", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:4", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:5", "lbs");

            CreateDataDefinition("PAYLOAD STATION WEIGHT:6", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:7", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:8", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:9", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:10", "lbs");

            CreateDataDefinition("PAYLOAD STATION WEIGHT:11", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:12", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:13", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:14", "lbs");
            CreateDataDefinition("PAYLOAD STATION WEIGHT:15", "lbs");

            RegiserDefinitions();

            this.isInit = true;
            Console.WriteLine("init done");
        }

        private void RegiserDefinitions()
        {
            foreach (DataDefinition def in definitions.Values)
            {
                RegisterDataDefinition(def);
            }
        }

        private DataDefinition CreateDataDefinition(string name, string unit = "", bool isString = false)
        {
            DataDefinition def = new DataDefinition(name, unit, isString);
            this.definitions.Add(def.defId, def);
            this.definitions_by_string.Add(name, def);
            return def;
        }

        private void RegisterDataDefinition(DataDefinition def)
        {
            if (def.isString)
            {
                simconnect.AddToDataDefinition(def.defId, def.dname, "", SIMCONNECT_DATATYPE.STRING256, 0.0f, SimConnect.SIMCONNECT_UNUSED);
                simconnect.RegisterDataDefineStruct<DataStruct>(def.defId);
                simconnect.RequestDataOnSimObjectType(def.reqId, def.defId, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
            }
            else
            {
                simconnect.AddToDataDefinition(def.defId, def.dname, def.dunit, SIMCONNECT_DATATYPE.FLOAT64, 0.0f, SimConnect.SIMCONNECT_UNUSED);
                simconnect.RegisterDataDefineStruct<double>(def.defId);
                simconnect.RequestDataOnSimObjectType(def.reqId, def.defId, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
            }
        }

        private DataDefinition getDefinitionByName(string name) 
        {
            DataDefinition def = definitions_by_string[name];
            return def;
        }

        private SimConnect ConnectSimConnect()
        {
            try
            {
                // The constructor is similar to SimConnect_Open in the native API
                Console.WriteLine("Conneting to Sim");
                simconnect = new SimConnect("Simconnect - Simvar test", m_hWnd, WM_USER_SIMCONNECT, null, 0);
                simconnect.OnRecvOpen += new SimConnect.RecvOpenEventHandler(InitSimConnect);
                simconnect.OnRecvQuit += new SimConnect.RecvQuitEventHandler(OnRecvQuit);
                simconnect.OnRecvException += new SimConnect.RecvExceptionEventHandler(OnRecvException);
                simconnect.OnRecvSimobjectDataBytype += new SimConnect.RecvSimobjectDataBytypeEventHandler(OnRecvSimobjectDataBytype);
                simconnect.OnRecvEvent += new SimConnect.RecvEventEventHandler(simconnect_OnRecvEvent);

                foreach (EVENTS entry in Enum.GetValues(typeof(EVENTS)))
                {
                    
                    if(Array.IndexOf(SystemEvents, entry) >= 0)
                    {
                        //Console.WriteLine($"sys: {entry}");
                        simconnect.SubscribeToSystemEvent(entry, entry.ToString());
                    }
                    else 
                    {
                        //Console.WriteLine($"client: {entry}");
                        simconnect.MapClientEventToSimEvent(entry, entry.ToString());
                        simconnect.AddClientEventToNotificationGroup(GROUP_ID.GROUP_A, entry, false);
                    }
                    

                }

                // set Group Priority
                simconnect.SetNotificationGroupPriority(GROUP_ID.GROUP_A, SimConnect.SIMCONNECT_GROUP_PRIORITY_HIGHEST);

                Console.WriteLine("Connected");
                IsSimConnectConnected = true;
                return simconnect;
            }
            catch (COMException ex)
            {
                Console.WriteLine("Unable to connect, Check if MSFS is running!");
                simconnect = null;
                IsSimConnectConnected = false;
                return null;
            }
        }

        public void Update()
        {
            if (simconnect != null)
            {
                simconnect.ReceiveMessage();
                simconnect.ReceiveDispatch(new SignalProcDelegate(MyDispatchProcA));
                foreach (int i in definitions.Keys)
                {
                    simconnect.RequestDataOnSimObjectType(definitions[(DATA_DEFINE_ID)i].reqId, definitions[(DATA_DEFINE_ID)i].defId, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
                }
            }
            else
            {
                ConnectSimConnect();
            }
        }

        void simconnect_OnRecvEvent(SimConnect sender, SIMCONNECT_RECV_EVENT recEvent)
        {
            EVENTS ReceivedEvent = (EVENTS)recEvent.uEventID;
            Console.WriteLine(ReceivedEvent);

            OnEvent(ReceivedEvent);
        }

        public abstract void OnEvent(EVENTS recEvent);

        public abstract void OnQuit();

        private void MyDispatchProcA(SIMCONNECT_RECV pData, uint cData)
        {
            Console.WriteLine("MyDispatchProcA "+pData+" "+cData);
        }

        public void setValue(string name, double value)
        {
            Console.WriteLine($"setting {name}: {value}");
            DataDefinition def = getDefinitionByName(name);
            simconnect.SetDataOnSimObject(def.defId, SimConnect.SIMCONNECT_OBJECT_ID_USER, SIMCONNECT_DATA_SET_FLAG.DEFAULT, value);
        }

        private void OnRecvSimobjectDataBytype(SimConnect sender, SIMCONNECT_RECV_SIMOBJECT_DATA_BYTYPE data)
        {
            DataDefinition def = definitions[(DATA_DEFINE_ID)data.dwDefineID];
            if (def.isString)
            {
                DataStruct result = (DataStruct)data.dwData[0];
                //Console.WriteLine("SimConnect " + def.dname + " value: " + result.sValue);
                switch (def.dname)
                {
                    case "ATC MODEL":
                        {
                            Model = result.sValue;
                            break;
                        }
                    case "ATC TYPE":
                        {
                            Type = result.sValue;
                            break;
                        }
                    case "TITLE":
                        {
                            Title = result.sValue;
                            break;
                        }
                    case "NAV_LOC_AIRPORT_IDENT":
                        {
                            Console.WriteLine(result.sValue);
                            Airport = result.sValue;
                            break;
                        }
                }
            }
            else
            {
                //Console.WriteLine("SimConnect " + def.dname + " value: " + data.dwData[0]);
                switch (def.dname)
                {
                    case "PLANE ALTITUDE":
                        {
                            Altitude = (double)data.dwData[0];
                            break;
                        }
                    case "PLANE LATITUDE":
                        {
                            Latitude = (double)data.dwData[0];
                            break;
                        }
                    case "PLANE LONGITUDE":
                        {
                            Longitude = (double)data.dwData[0];
                            break;
                        }
                    case "PLANE HEADING DEGREES TRUE":
                        {
                            Heading = (double)data.dwData[0];
                            break;
                        }
                    case "GROUND VELOCITY":
                        {
                            GroundSpeed = (double)data.dwData[0];
                            break;
                        }
                    case "VELOCITY WORLD X":
                        {
                            vX = (double)data.dwData[0];
                            break;
                        }
                    case "VELOCITY WORLD Y":
                        {
                            vY = (double)data.dwData[0];
                            break;
                        }
                    case "VELOCITY WORLD Z":
                        {
                            vZ = (double)data.dwData[0];
                            break;
                        }
                    case "ON ANY RUNWAY":
                        {
                            IsOnRundway = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "SIM ON GROUND":
                        {
                            IsOnGround = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "ENG COMBUSTION":
                        {
                            IsEngineOn = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "SIM DISABLED":
                        {
                            SimDisabled = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "BRAKE PARKING POSITION":
                        {
                            IsParkingBreak = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "PAYLOAD STATION COUNT":
                        {
                            PayloadCount = (double)data.dwData[0];
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:1":
                        {
                            PayloadWeight[1] = (double)data.dwData[0];
                            break;
                        }
                    case "FUEL TOTAL QUANTITY":
                        {
                            Fuel = (double)data.dwData[0];
                            break;
                        }
                    case "REALISM CRASH DETECTION":
                        {
                            CrashEnabled = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "IS SLEW ACTIVE":
                        {
                            IsSlew = (double)data.dwData[0] > 0;
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
            }
        }

        private void OnRecvException(SimConnect sender, SIMCONNECT_RECV_EXCEPTION data)
        {
            Console.WriteLine("SimConnect exception: " + data.dwException + " " + data.dwIndex);
        }

        private void OnRecvQuit(SimConnect sender, SIMCONNECT_RECV data)
        {
            simconnect.Dispose();
            simconnect = null;
            IsSimConnectConnected = false;
            SimDisabled = false;
            Console.WriteLine("SimConnect quit");
            this.OnQuit();
        }

    }
}
