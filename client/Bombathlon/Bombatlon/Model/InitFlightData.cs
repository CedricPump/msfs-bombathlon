using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bombatlon.Model
{
    public class InitFlightData
    {
        public Ident Ident { get; set; }
        public Telemetrie Telemetrie { get; set; }
        public AircraftState State { get; set; }
    }
}
