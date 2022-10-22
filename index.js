import express from 'express';
import { createServer } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { ExpressPeerServer } from 'peer';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
	},
});
const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);
app.use('/peerjs/peerjs', peerServer);
app.use('/peerjs/peerjs/id', peerServer);

app.get('/', (req, res) => {
	res.redirect(`/${uuidv4()}`);
});

app.get('/:room', (req, res) => {
	// res.status(200).send({ room: req.params.room });
	res.render('room', { roomId: req.params.room });
});

io.on('connection', (socket) => {
	console.log('connection', socket.id);
	socket.on('join-room', (roomId, userId, userName) => {
		console.log('join-room', roomId, userId, userName);
		socket.join(roomId);
		socket.to(roomId).emit('user-connected', userId);
		socket.on('message', (message) => {
			console.log('message', roomId, userId, userName, message);
			io.to(roomId).emit('createMessage', message, userName);
		});
	});
});

server.listen(433);
console.log('Server started!');
