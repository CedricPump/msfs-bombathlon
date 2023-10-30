using Bombatlon.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Bombatlon
{
    internal class Plane : Aircraft
    {
        private EVENTS bombReleaseEvent = EVENTS.SMOKE_TOGGLE;
        private Dictionary<int, Bomb> bombs = new Dictionary<int, Bomb>();
        public delegate void PlaneEventCallBack(PlaneEvent planeEvent);
        private PlaneEventCallBack callBack = null;

        public Plane(PlaneEventCallBack callback)
        {
            this.callBack = callback;
        }

        public void SetBombs(Dictionary<int, Bomb> bombs)
        {
            foreach (int key in bombs.Keys)
            {
                var station = "PAYLOAD STATION WEIGHT:" + key;
                setValue(station, bombs[key].weight);
            }
            this.bombs = bombs;
        }

        Bomb DropBomb()
        {
            if (bombs.Keys.Count > 0)
            {
                Console.WriteLine("Bomb Drop!");
                Console.WriteLine(this.toString());
                // todo Send Event

                // remove Bomb
                int key = this.bombs.Keys.First();
                Bomb bomb = this.bombs[key];
                string station = "PAYLOAD STATION WEIGHT:" + key;
                setValue(station, 0);
                this.bombs.Remove(key);
                Console.WriteLine($"Dropping {bomb.Name} from {station}");
                return bomb;
            }
            else
            {
                Console.WriteLine($"Out of Bombs");
                return null;
            }
        }

        public override void OnEvent(EVENTS recEvent)
        {

            if (recEvent == bombReleaseEvent)
            {
                Bomb bomb = DropBomb();
                if (bomb == null)
                {
                    return;
                }

                var parameter = new BombDropData
                {
                    bomb = bomb,
                    telemetrie = this.GetTelemetrie()
                };

                this.callBack(new PlaneEvent
                {
                    Event = "BOMB_DROP",
                    Parameter = parameter
                }
                );

                switch (recEvent)
                {
                    case EVENTS.SimStart:
                        {
                           
                            this.callBack(new PlaneEvent
                            {
                                Event = "START",
                                Parameter = new InitFlightData
                                {
                                    Ident = this.GetIdent(),
                                    State = this.GetState(),
                                    Telemetrie = this.GetTelemetrie()
                                }
                            });
                            
                            break;
                        }
                    case EVENTS.SimStop:
                        {
                            this.callBack(new PlaneEvent
                            {
                                Event = EVENTS.SimStop.ToString(),
                                Parameter = new object[0]
                            });
                            break;
                        }
                    default:
                        {
                            break;
                        }
                }
            }
        }

        public override void OnQuit()
        {
            this.callBack(new PlaneEvent
            {
                Event = "QUIT",
                Parameter = new object[0]
            });
            //System.Environment.Exit(0);
        }
    }
    
}
