const {Server} = require('socket.io');

module.exports = (server) => {
    const io = new Server(server, {
        cors: {
            origin: 'https://aaharamitra.vercel.app/',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('newFoodItem', (foodItem) => {
            io.emit('foodItemAdded', foodItem);
        });

        socket.on('foodItemClaimed', ({foodItemId, claimedByOrg}) => {
            io.emit('foodItemClaimedUpdate', {foodItemId, claimedByOrg});
        });

        socket.on('deleteFoodItem', ({foodItemId}) => {
            io.emit('foodItemDeleted', {foodItemId});
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};
