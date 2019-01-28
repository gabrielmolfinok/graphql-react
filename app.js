
const express = require('express')
const bodyParser = require('body-parser') 
const app = express()
const graphqlHttp = require('express-graphql')
const  { buildSchema } = require('graphql')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Product = require('./models/product')
const User = require('./models/user')




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

        type User {
            _id: ID!
            email: String!
            password: String
        }

        input UserInput {
            email: String!
            password: String
        }

        type RootQuery {
            products: [Product!]!
        }

        type RootMutation {
            createProduct(productInput: ProductInput): Product
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }

    `),
    rootValue: {

        products: () => {

            return Product
                .find()
                .then( products => {
                    return products.map( product => {
                        return { ...product._doc, _id: product.id }
                    } )
                } )
                .catch( err => console.log(err) )

        },

        createProduct: args => {

            const product = new Product({
                name: args.productInput.name,
                description: args.productInput.description,
                price: +args.productInput.price,
                date: new Date(args.productInput.date),
                creator: "5c4e52573c3f8c1e1050e97f"
            })

            let createdProduct

            return product
                .save()
                .then( res => {
                    createdProduct = { ...res._doc, _id: res.id }
                    return User.findById("5c4e52573c3f8c1e1050e97f")
                } )
                .then( user => {
                    if (!user) {
                        throw new Error('User does not exists')
                    }
                    user.createdProducts.push(product)
                    return user.save()
                } )
                .then( res => createdProduct )
                .catch( err => {
                    console.log(err)
                    throw err
                } )
        
        },

        createUser: args => {

            return User.findOne({ email: args.userInput.email })
                .then( user => {

                    if (user) {
                        throw new Error('User already exists.')
                    }

                    return bcrypt.hash( args.userInput.password, 12 )

                } )
                .then( hashedPassword => {

                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    })

                    return user.save()

                } )
                .then( res => {

                    return { ...res._doc, password: null, _id: res.id }

                } )
                .catch( err => { throw err } )



        }

    },
    graphiql: true

}))

// MongoDB
mongoose.connect(
    `mongodb+srv://${ process.env.MONGO_USER }:${ process.env.MONGO_PASSWORD }@cluster0-xoog3.gcp.mongodb.net/${ process.env.MONGO_DB }?retryWrites=true`, { useNewUrlParser: true })
    .then( () => app.listen(3000, null, null, () => {
        console.log('Corriendo en 3000')
    }) )
    .catch( err => console.log(err) )
