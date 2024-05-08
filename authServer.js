// authServer handles authentication only
// login, logout and refresh tokens

require('dotenv').config()
const express = require('express')
const app = express()

const jwt = require('jsonwebtoken')
// this lets our application to use json from the body that gets passed to it via post request
app.use(express.json())

// for learning purpose we store it locally in a variable but we should have it saved in the app database
let refreshTokens = []

app.post('/token', (req, res) => {
    const refreshToken = req.body.token
    if (refreshToken == null) return res.sendStatus(401)
    if (!refreshTokens.includes(refreshToken)) return res.status(403).send(refreshTokens.includes(refreshToken))
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err)
        const accessToken = generateAccessToken({ name: user.name })
        res.json({ accessToken: accessToken })
    })
})

app.post('/login', (req, res) => {
    // Authenticate User here ###
    // Implementation of jwt
    const username = req.body.username
    const user = { name: username }

    // without refresh token whoever has access to the accessToken will be forever and it's gonna be difficult to manage auths this way
    // the solution is giving a short duration to accessToken and then have a refreshToken to refresh the accessToken
    const accessToken = generateAccessToken(user)
    // we are gonna reset manually our refreshTokens and not set expiresIn
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    console.log(refreshTokens)
    res.json({ accessToken: accessToken, refreshToken: refreshToken })
})

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

function generateAccessToken(user) {
    // 15s for testing, 10-15 minutes is the rule
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20s' })
}

app.listen(4000)