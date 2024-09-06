const PORT = process.env.PORT || 3000
const io = require('socket.io')(PORT, {
    cors: {
        origin: ['https://www.capslockr.com'],
    },
})

console.log("Port is " + PORT)

let users = {}
const bot = {}

initUser(bot)

bot.user.username = "Tim"
users.bot = bot.user

function randomBotBehaviour() {

    // Generate a random delay between 2 to 4 minutes (120,000 to 240,000 milliseconds)
    const delay = Math.random() * (240000 - 120000) + 120000
    const y = Math.floor(Math.random() * (475 - 181 + 1)) + 181
    const x = Math.floor(Math.random() * (638 - 190 + 1)) + 190

    io.emit('update-user-location', "bot", x, y)
    
    const userAmount = Object.keys(users).length
    const phrases = ['', "Lovely day, isn't it?", "It was the axe what did it.", "It just happened. All so fast.", "With the soil, she now rests.", "Care to acompany me in some light conversation?", "AND I'LL FUCKING DO IT AGAIN!",
                    "I have but one regret.", "Only " + userAmount + " about today? Good.", "Has anyone seen my wife?", "Under the floorboards." ]
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const randomPhrase = phrases[randomIndex];

    if (randomPhrase) {
        io.emit('send-message', "bot", randomPhrase)
    }
}

function idleBot() {
    randomBotBehaviour()
    setTimeout(idleBot, Math.random() * (240000 - 120000) + 120000)
}

idleBot()

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
        users[socket.id].setY = -43
        users[socket.id].setX = 0
        users[socket.id].scaleX = 1
    })

    socket.on('send-anim', (anim, setY, setX, scaleX) => {
        users[socket.id].animation = anim
        users[socket.id].setY = setY
        users[socket.id].setX = setX
        users[socket.id].scaleX = scaleX
        io.emit('send-anim', socket.id, anim, users[socket.id].x, users[socket.id].y, setY, setX, scaleX)
    })

    socket.on('throw-snowball', (animKey, scaleX) => {
        io.emit('throw-snowball', socket.id, animKey, scaleX)
    })

    socket.on('update-user-location', (x, y) => {
        users[socket.id].x = x
        users[socket.id].y = y

        console.log(socket.id + " moved to new location")

        io.emit('update-user-location', socket.id, x, y)
    })

    socket.on('set-username', (username) => {
        users[socket.id].username = username

        console.log(socket.id + " changed username to " + username)

        io.emit('set-username', socket.id, username)
    })

    socket.on('send-message', (message) => {

        console.log(socket.id + " sent new message: " + message)

        io.emit('send-message', socket.id, message)
        if (message.startsWith("!bot")) { randomBotBehaviour() } 
    })

    socket.on('send-emote', (emote) => {

        //console.log(socket.id + " sent new message: " + message)

        io.emit('send-emote', socket.id, emote)
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
    socket.user.x = Math.floor(Math.random() * 20) + 310
    socket.user.y = Math.floor(Math.random() * 20) + 230
    socket.user.animation = 'idle-bottom'
    socket.user.setY = -43
    socket.user.setX = 0
    socket.user.scaleX = 1
}

function setUsername (socket, username) {
    socket.user.username = username
    console.log('New username: ' + socket.user.username)
}
