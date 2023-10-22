using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Bombatlon
{
    public class PlaneEvent
    {
        [JsonProperty("event")]
        public string Event { get; set; }
        [JsonProperty("parameter")]
        public object Parameter { get; set; }

        public string ToString()
        {
            return $"{this.Event} {this.Parameter}";
        }
    }
}
