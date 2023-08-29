using System;
using Microsoft.FlightSimulator.SimConnect;
using System.Runtime.InteropServices;
using System.Collections.Generic;
using System.Text.Json;

namespace Bombathlon
{
    enum DATA_DEFINE_ID
    {
        NULL
    };
    enum DATA_REQUEST_ID
    {
        NULL,
        DataStruct
    };

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi, Pack = 1)]
    struct DataStruct
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 256)]
        public String sValue;
    };

    class Program
    {
        static void Main(string[] args)
        {
            Aircraft aircraft = new Aircraft();

            while (true)
            {
                aircraft.Update();
                Console.WriteLine(aircraft.toString());
                Console.WriteLine(JsonSerializer.Serialize(aircraft));
                System.Threading.Thread.Sleep(3000);
            };
        }

    }

    class DataDefinition
    {
        private static uint define_counter = 1;
        private static uint request_counter = 2;

        public string dname = "";
        public string dunit = "";
        public DATA_DEFINE_ID defId = DATA_DEFINE_ID.NULL;
        public DATA_REQUEST_ID reqId = DATA_REQUEST_ID.NULL;
        public bool isString = false;

        public DataDefinition(string _dname, string _dunit, bool _isString)
        {
            dname = _dname;
            dunit = _dunit;
            defId = (DATA_DEFINE_ID)define_counter++;
            reqId = (DATA_REQUEST_ID)request_counter++;
            isString = _isString;
            if(isString)
            {
                reqId = DATA_REQUEST_ID.DataStruct;
            }
        }
    }

    class Aircraft
    {
        private SimConnect simconnect;
        private IntPtr m_hWnd = new IntPtr(0);
        public const int WM_USER_SIMCONNECT = 0x0402;
        private Dictionary<DATA_DEFINE_ID,DataDefinition> definitions = new Dictionary<DATA_DEFINE_ID,DataDefinition>();

        public string Model { get; private set; }
        public double Altitude { get; private set; }
        public double Latitude { get; private set; }
        public double Longitude { get; private set; }
        public double GroundSpeed { get; private set; }
        public double Heading { get; private set; }
        public double vX { get; private set; }
        public double vY { get; private set; }
        public double vZ { get; private set; }
        public bool isOnRundway { get; private set; }
        public bool isOnGround { get; private set; }
        public bool isEngineOn { get; private set; }
        public bool isParkingBreak { get; private set; }
        public double Fuel { get; private set; }


        public string toString() 
        {
            return Model + " [" + Latitude + "," + Longitude + "," + Altitude + "] " + GroundSpeed + "knts " + Heading + "° "; 
        }



        public Aircraft()
        {
            try
            { 
                ConnectSimConnect();
            }
            catch (COMException ex)
            {
                Console.WriteLine("Unable to connect: " + ex.Message + "Check if MSFS is running!");
            }

        }

        private void InitSimConnect(SimConnect sender, SIMCONNECT_RECV_OPEN data)
        {
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
            //CreateDataDefinition("SIM SPEED", "");
            // State
            CreateDataDefinition("ENG COMBUSTION", "Bool");
            CreateDataDefinition("BRAKE PARKING POSITION", "Bool");
            //CreateDataDefinition("EGEAR POSITION", "Bool");
            CreateDataDefinition("GEAR IS ON GROUND", "Bool");
            CreateDataDefinition("ON ANY RUNWAY", "Bool");
            // Fuel
            CreateDataDefinition("FUEL TOTAL QUANTITY WEIGHT", "pounds");
            // Action
            CreateDataDefinition("SMOKE ENABLE", "Bool");

            Console.WriteLine("init done");
        }

        private DataDefinition CreateDataDefinition(string name, string unit = "", bool isString = false)
        {
            DataDefinition def = new DataDefinition(name, unit, isString);
            RegisterDataDefinition(def);
            definitions.Add(def.defId,def);
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

        private SimConnect ConnectSimConnect() 
        {
            /// The constructor is similar to SimConnect_Open in the native API
            simconnect = new SimConnect("Simconnect - Simvar test", m_hWnd, WM_USER_SIMCONNECT, null, 0);
            simconnect.OnRecvOpen += new SimConnect.RecvOpenEventHandler(InitSimConnect);
            simconnect.OnRecvQuit += new SimConnect.RecvQuitEventHandler(OnRecvQuit);
            simconnect.OnRecvException += new SimConnect.RecvExceptionEventHandler(OnRecvException);
            simconnect.OnRecvSimobjectDataBytype += new SimConnect.RecvSimobjectDataBytypeEventHandler(OnRecvSimobjectDataBytype);
            Console.WriteLine("Connected");
            return simconnect;
        }

        public void Update() 
        {
            simconnect.ReceiveMessage();
            foreach (int i in definitions.Keys)
            {
                simconnect.RequestDataOnSimObjectType(definitions[(DATA_DEFINE_ID)i].reqId, definitions[(DATA_DEFINE_ID)i].defId, 0, SIMCONNECT_SIMOBJECT_TYPE.USER);
            }
        }

        public void setValue(DataDefinition def, double value)
        {
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
                }
            }
            else
            {
                Console.WriteLine("SimConnect " + def.dname + " value: " + data.dwData[0]);
                switch (def.dname)
                {
                    case "PLANE ALTITUDE":
                        {
                            Altitude = (double) data.dwData[0];
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
                            isOnRundway = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "GEAR IS ON GROUND":
                        {
                            isOnGround = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "ENG COMBUSTION":
                        {
                            isEngineOn = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "BRAKE PARKING POSITION":
                        {
                            isParkingBreak = (double)data.dwData[0] > 0;
                            break;
                        }
                    case "SMOKE ENABLE":
                        {

                            if ((double)data.dwData[0] > 0)
                            {
                                Console.WriteLine("SMOKE");
                                setValue(def, 0.0);
                            }
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
            Console.WriteLine("SimConnect quit");
        }

    }
}


