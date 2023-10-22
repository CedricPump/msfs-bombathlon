using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bombatlon
{
    public class Telemetrie
    {
        [JsonProperty("lat")]
        public double Latitude { get; set; }
        [JsonProperty("long")]
        public double Longitude { get; set; }
        [JsonProperty("alt")]
        public double Altitude { get; set; }
        [JsonProperty("ground_speed")]
        public double GroundSpeed { get; set; }
        [JsonProperty("heading")]
        public double Heading { get; set; }
        [JsonProperty("vx")]
        public double vX { get; set; }
        [JsonProperty("vy")]
        public double vY { get; set; }
        [JsonProperty("vz")]
        public double vZ { get; set; }
    }
}
