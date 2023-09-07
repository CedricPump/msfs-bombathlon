export const typeDefs = `#graphql
type User {
    id: ID!,
    name: String!,
    email: String!,
    currentAirport: String,
    squadron: Squadron,
}
type Squadron {
    id: ID!
    name: String!
    owner: User!
    score: Int
    airports: [String]
    aircraftTypes: [Aircraft]
    members: [User]
}
type Flight {
    user: User!
    position: Position
    aircraft: Aircraft
}
type Aircraft {
    AircraftName: String
    DisplayName: String
    Manufacturer: String
    Developer: String
    ATCModel: String
    ATCType: String
    Title: String
    TitleRegex: String
    PylonsCount: Int
    maxFuel: Float
    Pylons: [Pylon]
}
type Pylon {
    payloadIndex: Int
    payloadName: String
    loadouts: [Loadout]
}
type Loadout {
    bombType: BombType
    bombCount: Int
    payloadWeight: Float
    isObject: Boolean
    isFuel: Boolean
}
type BombType {
    name: ID!
    guidance: String!
    weight: Float!
    effectiveRadius: Float!
    tnt: Float!
    drag: Float!
}
type Position {
    latitude: Float!
    longitude: Float!
    altitude: Float!
    heading: Float
    bank: Float
    pitch: Float
    speed: Float
    velocityX: Float
    velocityY: Float
    velocityZ: Float
}
type Airport {
    ident: ID!
    name: String
    is_military: Boolean
    latitude: Float
    longitude: Float
    altitude: Float
    rating: Int
    rw_heading: Float
    rw_length: Float
}
type Query {
    users: [User]
    user(id: ID): User
    squadron(id: ID!): Squadron
    squadronInviteToken(expiration: Int): String
}
type Mutation {
    createUser(name: String!, email: String!, password: String!): User
    createSquadron(name: String): Squadron
    joinSquadron(inviteToken: String!): Squadron
    leaveSquadron: Boolean
}
`