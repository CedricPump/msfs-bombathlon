using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;

namespace PlaneExport
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
            if (isString)
            {
                reqId = DATA_REQUEST_ID.DataStruct;
            }
        }
    }
}
