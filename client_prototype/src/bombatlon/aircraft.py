import geopy
import geopy.distance
from SimConnect import *
from pydantic import BaseModel

# https://docs.flightsimulator.com/html/Programming_Tools/SimVars/Aircraft_SimVars/Aircraft_Misc_Variables.htmhttps://docs.flightsimulator.com/html/Programming_Tools/SimVars/Aircraft_SimVars/Aircraft_Misc_Variables.htm
ALTITUDE_KEY = "PLANE_ALTITUDE"
ALTITUDE_AGL_KEY = "PLANE_ALT_ABOVE_GROUND"
LATITUDE_KEY = "PLANE_LATITUDE"
LONGITUDE_KEY = "PLANE_LONGITUDE"
VERTICAL_SPEED_KEY = "VERTICAL_SPEED"
GROUND_SPEED_KEY = "GROUND_VELOCITY"
HEADING_KEY = "PLANE_HEADING_DEGREES_TRUE"
ON_ANY_RUNWAY_KEY = "ON_ANY_RUNWAY"
AIRCRAFT_TITLE_KEY = "TITLE"

class Aircraft:
    lat: float
    long: float
    point: geopy.Point

    def __init__(self):
        self.sm = None
        self.aq = None
        self.ae = None
        self.alt = 0.0      # in m
        self.alt_agl = 0.0  # in m
        self.lat = 0.0
        self.long = 0.0
        self.hdg = 0.0
        self.vs = 0.0
        self.gs = 0.0       # in m/S
        self.point = geopy.Point(0, 0, 0)
        self.bomb_detect = None
        self.bomb_release = None

    def connect(self):
        self.sm = SimConnect()
        self.aq = AircraftRequests(self.sm, _time=500)
        self.ae = AircraftEvents(self.sm)

        # PITOT_HEAT_TOGGLE
        self.bomb_release = self.ae.find("SMOKE_ON")
        self.bomb_reset = self.ae.find("SMOKE_OFF")

    def update(self):
        if self.aq is None:
            self.connect()

        self.alt = self.aq.get(ALTITUDE_KEY)/3.28084
        self.alt_agl = self.aq.get(ALTITUDE_AGL_KEY)/3.28084
        self.lat = self.aq.get(LATITUDE_KEY)
        self.long = self.aq.get(LONGITUDE_KEY)
        self.vs = self.aq.get(VERTICAL_SPEED_KEY)
        self.gs = self.aq.get(GROUND_SPEED_KEY) * 1.852  # * 0.51444
        self.hdg = self.aq.get(HEADING_KEY) / 6.28319 * 360
        self.point = geopy.Point(self.lat, self.long, self.alt/1000)

        # PITOT_HEAT
        smoke = self.aq.get("SMOKE_ENABLE")
        if smoke > 0:
            self.bomb_detect = True
            print("Bomb!")
            # self.bomb_reset()
        else:
            self.bomb_detect = False

        # "PAYLOAD STATION NAME"

        self.ae.find("PAYLOAD_STATION_4")(2000)
        print(self.aq.get("PAYLOAD_STATION_WEIGHT:1"))

    def setPylon(self, index, weight):
        self.ae.find("PAYLOAD_STATION_WEIGHT:{index}")(weight)
        print(self.aq.get(f"PAYLOAD_STATION_WEIGHT:{index}"))
        return
