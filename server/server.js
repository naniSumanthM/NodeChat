const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')
let app = express()
let server = http.createServer(app)
let io = socketIO(server)

app.use(express.static(publicPath))

io.on('connection', (socket) => {
    console.log('New client connected!');

    //new Email emitted by the server
    socket.emit('newEmail', {
        from: "maddirsh@yahoo.com",
        text: "Test from server",
        createdAt: "today"
    })

    //Server listening to createEmail event triggered from the client
    socket.on('createEmail', (newEmail) => {
        console.log(newEmail);
    })

    //Server emitting the newMessage
    socket.emit('newMessage', {
        from: "admin",
        text: "Message from server admin",
        createdAt: "Today"
    })

    //Server listening to createMessage event triggered from the client
    socket.on('createMessage', (message) => {
        console.log(message);
    })

    socket.on('disconnect', () => {
        console.log('Sever disconnected from the client!');
    })
})

server.listen(port, () => {
    console.log(`Server live on ${port}`);
})

