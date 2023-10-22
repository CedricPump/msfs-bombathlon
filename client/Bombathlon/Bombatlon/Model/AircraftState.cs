using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bombatlon.Model
{
    public class AircraftState
    {
        public bool EngineOn { get; set; }
        public bool ParkingBrake { get; set; }
        public string Airport { get; set; }
        public bool OnGround { get; set; }
        public double Fuel { get; set; }
    }
}
