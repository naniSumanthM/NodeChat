const path = require('path')
const http = require('http')
const express = require('express')
const socketIO = require('socket.io')

const { generateMessage, generateLocationMessage } = require('./utils/message')
const { isRealString } = require('./utils/validation')
const { Users } = require('./utils/users')

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')
let app = express()
let server = http.createServer(app)
let io = socketIO(server)
let users = new Users()

app.use(express.static(publicPath))

io.on('connection', (socket) => {

    socket.on('join', (params, callback) => {

        let room = params.room.toUpperCase()

        if (!isRealString(params.name) || !isRealString(room)) {
            return callback('Name & Room Name Required')
        }

        socket.join(room);
        users.removeUser(socket.id);
        users.addUser(socket.id, params.name, room);

        io.to(room).emit('updateUserList', users.getUserList(room));
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
    })

    //server listening 
    socket.on('createMessage', (message, callback) => {
        let user = users.getUser(socket.id)
        if (user && isRealString(message.text)) {
            io.to(user.room).emit('newMessage', generateMessage(user.name, message.text))
        }
        callback()
    });

    //server listening to client event -- emit message to other users and generate message
    socket.on('createLocationMessage', (coords) => {
        let user = users.getUser(socket.id)
        if (user) {
            io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude))
        }
    })

    socket.on('disconnect', () => {
        let user = users.removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('updateUserList', users.getUserList(user.room));
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    })
})

server.listen(port, () => {
    console.log(`Server live on ${port}`);
})

