const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./utils/message')
const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')
let app = express()
let server = http.createServer(app)
let io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    //alerts all new clients of joining
    socket.emit('newMessage', generateMessage('Admin', "Welcome to the chat app!"));

    //alert every other user of new user joining other than the new user
    socket.broadcast.emit('newMessage', generateMessage('Admin', "New user joined!"));

    //server listening 
    socket.on('createMessage', (message, callback) => {
        io.emit('newMessage', generateMessage(message.from, message.text))
        callback()
    });

    //server listening to client event -- emit message to other users and generate message
    socket.on('createLocationMessage', (coords) => {
        io.emit('newLocationMessage', generateLocationMessage('Admin', coords.latitude, coords.longitude))
    })

    socket.on('disconnect', () => {
        console.log('Sever disconnected from the client!');
    })
})

server.listen(port, () => {
    console.log(`Server live on ${port}`);
})

