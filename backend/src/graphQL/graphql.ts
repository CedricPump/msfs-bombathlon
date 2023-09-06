// graphql.ts

import { gql } from 'apollo-server-express';
import {GraphQLError} from "graphql/error";

const typeDefs = gql`
    type Query {
        hello: String
    }
`;
const resolvers = {
    Query: {
        hello: (_: any, __: any, context: any) => {
            // Now you can access the context here
            const user = context.user;

            if (!user) {
                throw new GraphQLError('User is not authenticated', {
                    extensions: {
                        code: 'UNAUTHENTICATED',
                        http: { status: 401 },
                    }
                });
            }

            return `Hello ${context.user}, World!`;
        }
    },
};

export { typeDefs, resolvers }