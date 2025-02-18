import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function Chat({ username }) {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        // Listen for messages and ensure duplicates are not added
        const handleMessage = (msg) => {
            setMessages((prev) => {
                if (!prev.some((m) => m.text === msg.text && m.user === msg.user)) {
                    return [...prev, msg];
                }
                return prev;
            });
        };

        socket.on("receive-message", handleMessage);

        return () => {
            socket.off("receive-message", handleMessage);
        };
    }, []);

    const sendMessage = () => {
        if (message.trim()) {
            const newMessage = { user: username, text: message };
            socket.emit("send-message", newMessage);
            setMessage("");
        }
    };

    return (
        <div className="mt-4 p-4 bg-gray-700 rounded">
            <h2 className="text-xl font-bold">Chat</h2>
            <div className="h-40 overflow-y-auto bg-gray-900 p-2 rounded">
                {messages.map((msg, index) => (
                    <p key={index} className="text-white">
                        <strong>{msg.user}:</strong> {msg.text}
                    </p>
                ))}
            </div>
            <input
                type="text"
                className="w-full p-2 mt-2 border border-gray-400 text-black"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button className="mt-2 p-2 bg-blue-500 text-white w-full" onClick={sendMessage}>
                Send
            </button>
        </div>
    );
}
