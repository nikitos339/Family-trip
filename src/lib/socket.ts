import { io } from "socket.io-client";

// Use the current window location for the socket connection
const socket = io(window.location.origin);

export default socket;
