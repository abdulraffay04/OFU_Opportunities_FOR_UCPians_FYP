require('dotenv').config();
const app = require('./src/app.js');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log("OFU Backend running on port " + PORT);
  console.log("Accessible on your network at this port");
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Gracefully close the server and exit the process
  server.close(() => {
    process.exit(1);
  });
});
