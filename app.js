
const express = require('express')
const bodyParser = require('body-parser') 
const app = express()
const graphqlHttp = require('express-graphql')
const  { buildSchema } = require('graphql')

const products = []



// Body Parser
app.use(bodyParser.json())

// GraphQL
app.use('/graphql', graphqlHttp({

    schema: buildSchema(`

        type Product {
            _id: ID!
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        input ProductInput {
            name: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            products: [Product!]!
        }

        type RootMutation {
            createProduct(productInput: ProductInput): Product
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),
    rootValue: {

        products: () => products,

        createProduct: args => {
            const product = {
                _id: Math.random().toString(),
                name: args.productInput.name,
                description: args.productInput.description,
                price: +args.productInput.price,
                date: new Date().toISOString()
            }
            products.push(product)
            return product
        }

    },
    graphiql: true

}))

// Server Listen
app.listen(3000)