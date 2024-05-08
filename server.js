require('dotenv').config()
const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
// this lets our application to use json from the body that gets passed to it via post request
app.use(express.json())

const posts = [
    {
        username: 'Christian',
        title: "Post 1"
    },
    {
        username: 'Jennifer',
        title: "Post 2"
    }
]

app.get('/posts', authenticateToken, (req, res) => {
    // res.json(posts)
    // we only want to show posts of the user
    res.json(posts.filter(post => post.username === req.user.name))
})

// authServer handles this 
/* app.post('/login', (req, res) => {
    // Authenticate User here

    // Implementation of jwt
    const username = req.body.username
    const user = { name: username }
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
    res.json({ accessToken: accessToken })
}) */

// middleware to auth our token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401)
    // if we have the token, we check it with jwt
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err) //res.sendStatus(403)
        req.user = user
        next()
    })
}

app.listen(3000)