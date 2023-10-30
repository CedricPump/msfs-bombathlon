using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Microsoft.FlightSimulator.SimConnect;

namespace PlaneExport
{
    class Aircraft
    {
        private SimConnect simconnect;
        private IntPtr m_hWnd = new IntPtr(0);
        public const int WM_USER_SIMCONNECT = 0x0402;
        private Dictionary<DATA_DEFINE_ID, DataDefinition> definitions = new Dictionary<DATA_DEFINE_ID, DataDefinition>();

        public string Model { get; private set; }
        public string Type { get; private set; }
        public string Title { get; private set; }
        public double maxFuel { get; private set; }
        public double Fuel { get; private set; }
        public double payloadCount { get; private set; }
        public string[] payloadNames { get; private set; } = new string[15];
        public double[] payloadWeights { get; private set; } = new double[15];
        public bool isSimConnectConnected { get; private set; } = false;
        public bool simDisabled { get; private set; } = true;


        public string toString()
        {
            return Model + ", " + Type + ", " + Title;
        }


        public Aircraft()
        {
            isSimConnectConnected = false;
            ConnectSimConnect();
        }

        private void InitSimConnect(SimConnect sender, SIMCONNECT_RECV_OPEN data)
        {
            Console.WriteLine("open: init ...");
            // Identity
            CreateDataDefinition("ATC MODEL", "", true);
            CreateDataDefinition("ATC TYPE", "", true);
            CreateDataDefinition("TITLE", "", true);
            // Fuel
            CreateDataDefinition("FUEL TOTAL CAPACITY", "gallons");
            CreateDataDefinition("FUEL TOTAL QUANTITY", "gallons");
            CreateDataDefinition("FUEL TOTAL QUANTITY WEIGHT", "pounds");
            // Payload
            CreateDataDefinition("PAYLOAD STATION COUNT", "number");
            CreateDataDefinition("PAYLOAD STATION NAME:1", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:2", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:3", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:4", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:5", "", true);

            CreateDataDefinition("PAYLOAD STATION NAME:6", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:7", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:8", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:9", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:10", "", true);

            CreateDataDefinition("PAYLOAD STATION NAME:11", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:12", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:13", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:14", "", true);
            CreateDataDefinition("PAYLOAD STATION NAME:15", "", true);
            // Action
            CreateDataDefinition("SIM DISABLED", "Bool");

            Console.WriteLine("init done");
        }

        private DataDefinition CreateDataDefinition(string name, string unit = "", bool isString = false)
        {
            DataDefinition def = new DataDefinition(name, unit, isString);
            RegisterDataDefinition(def);
            definitions.Add(def.defId, def);
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
            try
            {
                // The constructor is similar to SimConnect_Open in the native API
                Console.WriteLine("Conneting to Sim");
                simconnect = new SimConnect("Simconnect - Simvar test", m_hWnd, WM_USER_SIMCONNECT, null, 0);
                simconnect.OnRecvOpen += new SimConnect.RecvOpenEventHandler(InitSimConnect);
                simconnect.OnRecvQuit += new SimConnect.RecvQuitEventHandler(OnRecvQuit);
                simconnect.OnRecvException += new SimConnect.RecvExceptionEventHandler(OnRecvException);
                simconnect.OnRecvSimobjectDataBytype += new SimConnect.RecvSimobjectDataBytypeEventHandler(OnRecvSimobjectDataBytype);
                Console.WriteLine("Connected");
                isSimConnectConnected = true;
                return simconnect;
            }
            catch (COMException ex)
            {
                Console.WriteLine("Unable to connect, Check if MSFS is running!");
                simconnect = null;
                isSimConnectConnected = false;
                return null;
            }
        }

        public void Update()
        {
            if (simconnect != null)
            {
                simconnect.ReceiveMessage();
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

                    // Payloads
                    case "PAYLOAD STATION NAME:1":
                        {
                            payloadNames[0] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:2":
                        {
                            payloadNames[1] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:3":
                        {
                            payloadNames[2] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:4":
                        {
                            payloadNames[3] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:5":
                        {
                            payloadNames[4] = result.sValue;
                            break;
                        }

                    case "PAYLOAD STATION NAME:6":
                        {
                            payloadNames[5] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:7":
                        {
                            payloadNames[6] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:8":
                        {
                            payloadNames[7] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:9":
                        {
                            payloadNames[8] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:10":
                        {
                            payloadNames[9] = result.sValue;
                            break;
                        }

                    case "PAYLOAD STATION NAME:11":
                        {
                            payloadNames[10] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:12":
                        {
                            payloadNames[11] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:13":
                        {
                            payloadNames[12] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:14":
                        {
                            payloadNames[13] = result.sValue;
                            break;
                        }
                    case "PAYLOAD STATION NAME:15":
                        {
                            payloadNames[14] = result.sValue;
                            break;
                        }

                    case "PAYLOAD STATION WEIGHT:1":
                        {
                            payloadWeights[0] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:2":
                        {
                            payloadWeights[1] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:3":
                        {
                            payloadWeights[2] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:4":
                        {
                            payloadWeights[3] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:5":
                        {
                            payloadWeights[4] = double.Parse(result.sValue);
                            break;
                        }

                    case "PAYLOAD STATION WEIGHT:6":
                        {
                            payloadWeights[5] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:7":
                        {
                            payloadWeights[6] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:8":
                        {
                            payloadWeights[7] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:9":
                        {
                            payloadWeights[8] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:10":
                        {
                            payloadWeights[9] = double.Parse(result.sValue);
                            break;
                        }

                    case "PAYLOAD STATION WEIGHT:11":
                        {
                            payloadWeights[10] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:12":
                        {
                            payloadWeights[11] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:13":
                        {
                            payloadWeights[12] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:14":
                        {
                            payloadWeights[13] = double.Parse(result.sValue);
                            break;
                        }
                    case "PAYLOAD STATION WEIGHT:15":
                        {
                            payloadWeights[14] = double.Parse(result.sValue);
                            break;
                        }
                }
            }
            else
            {
                //Console.WriteLine("SimConnect " + def.dname + " value: " + data.dwData[0]);
                switch (def.dname)
                {
                    case "FUEL TOTAL CAPACITY":
                        {
                            maxFuel = (double)data.dwData[0];
                            break;
                        }
                    case "PAYLOAD STATION COUNT":
                        {
                            payloadCount = (double)data.dwData[0];
                            break;
                        }
                    case "FUEL TOTAL QUANTITY":
                        {
                            Fuel = (double)data.dwData[0];
                            break;
                        }
                    case "SIM DISABLED":
                        {
                            simDisabled = (double)data.dwData[0] > 0;
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
