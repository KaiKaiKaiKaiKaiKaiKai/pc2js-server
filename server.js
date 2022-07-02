const PORT = process.env.PORT
const io = require('socket.io')(PORT, {
    cors: {
        origin: ['http://kn215.brighton.domains'],
    },
})


let users = {}

io.on('connection', socket => {
    console.log(socket.id + " connected")
    io.to(socket.id).emit('send-id', socket.id)
    initUser(socket)
    users[socket.id] = socket.user
    io.to(socket.id).emit('send-users', users)
    /**Object.keys(users).forEach(key => {
        console.log(key, users[key]);
    });**/

    socket.broadcast.emit('new-user', users[socket.id], socket.id)

    socket.on('reset-user-animation', () => {
        users[socket.id].animation = 'idle-bottom'
    })

    socket.on('update-user-location', (x, y, angle) => {
        users[socket.id].x = x
        users[socket.id].y = y

        console.log(socket.id + " moved to new location")

        io.emit('update-user-location', socket.id, x, y, angle)
    })

    socket.on('set-username', (username) => {
        users[socket.id].username = username

        console.log(socket.id + " changed username to " + username)

        io.emit('set-username', socket.id, username)
    })

    socket.on('send-message', (message) => {

        console.log(socket.id + " sent new message: " + message)

        io.emit('send-message', socket.id, message)
    })

    socket.on('disconnect', () => {
        delete users[socket.id];
        io.emit('delete-user', socket.id)
        console.log(socket.id + ' disconnected');
    })
})

function initUser(socket) {
    socket.user = {}
    socket.user.username = "Guest"
    socket.user.x = 320
    socket.user.y = 240
    socket.user.animation = 'idle-bottom'
}

function setUsername (socket, username) {
    socket.user.username = username
    console.log('New username: ' + socket.user.username)
}
