import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true,
})

export const sendMessage = async ({ message, chatId, onToken }) => {
    const response = await fetch(
        `${api.defaults.baseURL}/api/chats/message`,
        {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message,
                chat: chatId,
            }),
        }
    )

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || "Could not send your message.")
    }

    if (!response.body) {
        throw new Error("The server did not start a response stream.")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    let buffer = ""
    let result = null

    const processFrame = (frame) => {
        let eventName = "message"
        const dataLines = []

        for (const line of frame.split("\n")) {
            if (line.startsWith("event:")) {
                eventName = line.slice(6).trim()
            }

            if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trim())
            }
        }

        if (dataLines.length === 0) return

        const data = dataLines.join("\n")

        if (eventName === "token") {
            onToken?.(JSON.parse(data))
        }

        if (eventName === "done") {
            result = JSON.parse(data)
        }

        if (eventName === "error") {
            throw new Error(
                JSON.parse(data).message || "The AI response failed."
            )
        }
    }

    while (true) {
        const { value, done } = await reader.read()

        buffer += decoder.decode(
            value || new Uint8Array(),
            { stream: !done }
        )

        const frames = buffer
            .replaceAll("\r\n", "\n")
            .split("\n\n")

        buffer = frames.pop() || ""

        frames.forEach(processFrame)

        if (done) break
    }

    if (buffer.trim()) {
        processFrame(buffer)
    }

    return result
}

export const getChats = async () => {
    const response = await api.get("/api/chats")

    return response.data.chats || []
}


export const getMessages = async (chatId) => {
    const response = await api.get(
        `/api/chats/${chatId}/messages`
    )

    return response.data.messages || []
}


export const deleteChat = async (chatId) => {
    const response = await api.delete(
        `/api/chats/delete/${chatId}`
    )

    return response.data
}