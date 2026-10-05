import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { useChat } from '../hooks/useChat'
import {
    getChats,
    getMessages,
    sendMessage,
} from '../service/chat.api'

const getDisplayName = (user) => {
    if (user?.name) {
        return user.name
    }

    const email = user?.email || 'User'
    const localPart = email.split('@')[0] || 'User'
    const cleanName = localPart.replace(/[._-]+/g, ' ')

    return cleanName
        .split(' ')
        .filter(Boolean)
        .map(
            (part) =>
                part.charAt(0).toUpperCase() +
                part.slice(1)
        )
        .join(' ') || 'User'
}

const sidebarItems = [
    { label: 'Convo', icon: '◌' },
    { label: 'Library', icon: '▣' },
    { label: 'Images', icon: '◍' },
]

const suggestedPrompts = [
    'Explain a difficult topic simply',
    'Help me write a professional email',
    'Suggest a fun weekend project',
]

const Dashboard = () => {
    const { initializeSocketConnection } = useChat()

    const navigate = useNavigate()

    const user = useSelector((state) => state.auth.user)

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [chatSearch, setChatSearch] = useState('')
    const [chats, setChats] = useState([])
    const [currentChatId, setCurrentChatId] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoadingChat, setIsLoadingChat] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [chatError, setChatError] = useState('')

    // Guest question counter
    const [guestQuestionCount, setGuestQuestionCount] =
        useState(() => {
            return Number(
                sessionStorage.getItem(
                    'guestQuestionCount'
                ) || 0
            )
        })

    const fileInputRef = useRef(null)

    // Check whether guest has reached limit
    const guestLimitReached =
        !user && guestQuestionCount >= 2

    useEffect(() => {
        if (user) {
            sessionStorage.removeItem('guestQuestionCount')
            setGuestQuestionCount(0)
        }
    }, [user])

    // Socket connection
    useEffect(() => {
        const socket = initializeSocketConnection()

        return () => {
            socket?.disconnect()
        }
    }, [initializeSocketConnection])

    // Get all chats
    useEffect(() => {
        // Guest users don't have saved chats
        if (!user) {
            return
        }

        let isActive = true

        getChats()
            .then((savedChats) => {
                if (isActive) {
                    setChats(savedChats)
                }
            })
            .catch((error) => {
                if (isActive) {
                    setChatError(
                        error.message ||
                            'Could not load chats.'
                    )
                }
            })

        return () => {
            isActive = false
        }
    }, [user])

    // Start new chat
    const startNewChat = () => {
        setCurrentChatId(null)
        setMessages([])
        setMessage('')
        setSelectedImage(null)
        setChatError('')
    }

    // Open existing chat
    const openChat = async (chat) => {
        setCurrentChatId(chat._id)
        setIsLoadingChat(true)
        setChatError('')

        try {
            const savedMessages = await getMessages(
                chat._id
            )

            setMessages(
                savedMessages.map((item) => ({
                    id: item._id,
                    role: item.role,
                    content: item.content,
                    image: item.image,
                }))
            )
        } catch (error) {
            setChatError(
                error.message ||
                    'Could not load conversation.'
            )
        } finally {
            setIsLoadingChat(false)
        }
    }

    // Open file picker
    const handleOpenFiles = () => {
        if (guestLimitReached) {
            setChatError(
                'Please login to continue chatting.'
            )
            return
        }

        fileInputRef.current?.click()
    }

    // File selected
    const handleFileChange = (event) => {
        const file = event.target.files?.[0]
        event.target.value = ''

        if (!file) {
            return
        }

        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
            setChatError('Choose a PNG, JPEG, or WebP image.')
            return
        }

        if (file.size > 4 * 1024 * 1024) {
            setChatError('Images must be 4 MB or smaller.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setSelectedImage({
                    name: file.name,
                    dataUrl: reader.result,
                })
                setChatError('')
            }
        }
        reader.onerror = () => {
            setChatError('Could not read that image.')
        }
        reader.readAsDataURL(file)
    }

    // Send message
    const handleSendMessage = async (event) => {
        event.preventDefault()

        const image = selectedImage?.dataUrl || ''
        const content =
            message.trim() ||
            (image ? 'What is in this image?' : '')

        if (!content || isSending) {
            return
        }

        // Guest user limit
        if (guestLimitReached) {
            setChatError(
                'You have reached the free chat limit. Please login to continue chatting.'
            )
            return
        }

        const userMessageId = crypto.randomUUID()
        const assistantMessageId = crypto.randomUUID()

        // Immediately show user message + empty AI message
        setMessages((current) => [
            ...current,
            {
                id: userMessageId,
                role: 'user',
                content,
                image,
            },
            {
                id: assistantMessageId,
                role: 'ai',
                content: '',
            },
        ])

        setMessage('')
        setChatError('')
        setIsSending(true)

        try {
            const result = await sendMessage({
                message: content,
                chatId: currentChatId,
                image,

                // Receive streamed AI tokens
                onToken: (token) => {
                    setMessages((current) =>
                        current.map((item) =>
                            item.id === assistantMessageId
                                ? {
                                      ...item,
                                      content:
                                          item.content +
                                          token,
                                  }
                                : item
                        )
                    )
                },
            })

            setSelectedImage(null)

            // Increase guest question count
            if (!user) {
                const newCount =
                    guestQuestionCount + 1

                setGuestQuestionCount(newCount)

                sessionStorage.setItem(
                    'guestQuestionCount',
                    newCount.toString()
                )
            }

            // Backend sends chat inside "done" event
            const savedChat = result?.chat

            if (savedChat?._id) {
                setCurrentChatId(savedChat._id)

                setChats((current) => [
                    savedChat,
                    ...current.filter(
                        (item) =>
                            item._id !==
                            savedChat._id
                    ),
                ])
            } else if (user) {
                const refreshedChats =
                    await getChats()

                setChats(refreshedChats)
            }

            // After second guest question
            if (
                !user &&
                guestQuestionCount + 1 >= 2
            ) {
                setChatError(
                    'You have used your 2 free questions. Login to continue chatting.'
                )
            }
        } catch (error) {
            console.error(
                'Message sending failed:',
                error
            )

            setChatError(
                error.message ||
                    'Could not send your message.'
            )
            setMessage(content)

            // Remove empty AI message if request failed
            setMessages((current) =>
                current.filter(
                    (item) =>
                        item.id !==
                            assistantMessageId ||
                        item.content
                )
            )
        } finally {
            setIsSending(false)
        }
    }

    const canSendMessage =
        message.trim().length > 0 &&
        !guestLimitReached
    const filteredChats = chats.filter((chat) =>
        (chat.title || 'New chat')
            .toLowerCase()
            .includes(chatSearch.trim().toLowerCase())
    )

    return (
        <main className="min-h-screen bg-black text-white">

            <div className="relative flex min-h-screen flex-col">

                {/* HEADER */}
                <header className="flex items-center justify-between border-b border-neutral-800 bg-black px-4 py-3">

                    <div className="flex items-center gap-3">

                        {/* Sidebar button */}
                        <button
                            type="button"
                            onClick={() =>
                                setIsSidebarOpen(
                                    (current) =>
                                        !current
                                )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-lg text-white transition hover:border-white hover:bg-neutral-800"
                        >
                            ☰
                        </button>

                        {/* Logo */}
                        <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-base font-medium text-white">

                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
                                C
                            </span>

                            <span>Convo</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">

                        {/* New chat */}
                        <button
                            type="button"
                            onClick={startNewChat}
                            aria-label="New chat"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-xl text-white transition hover:border-white hover:bg-neutral-800"
                        >
                            ⟳
                        </button>

                        {/* Login button for guest */}
                        {!user && (
                            <button
                                type="button"
                                onClick={() =>
                                    navigate('/login')
                                }
                                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
                            >
                                Login
                            </button>
                        )}

                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-xl text-white transition hover:border-white hover:bg-neutral-800"
                        >
                            ⌁
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">

                    {/* SIDEBAR */}
                    {isSidebarOpen && (
                        <aside className="w-75 border-r border-neutral-800 bg-black px-4 py-4">

                            <label className="mb-4 flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-3 text-white focus-within:border-white">
                                <span aria-hidden="true" className="text-lg">
                                    ⌕
                                </span>
                                <input
                                    type="search"
                                    value={chatSearch}
                                    onChange={(event) =>
                                        setChatSearch(event.target.value)
                                    }
                                    aria-label="Search conversations"
                                    placeholder="Search conversations"
                                    className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                                />
                            </label>

                            <button
                                type="button"
                                onClick={startNewChat}
                                className="mb-4 flex w-full items-center gap-3 rounded-xl border border-neutral-600 bg-white px-4 py-3 text-left text-base font-semibold text-black transition hover:bg-neutral-200"
                            >
                                <span aria-hidden="true" className="text-xl">
                                    +
                                </span>
                                <span>New chat</span>
                            </button>

                            <div className="space-y-3 pb-4">

                                {sidebarItems.map(
                                    (item) => (
                                        <button
                                            type="button"
                                            key={
                                                item.label
                                            }
                                            onClick={
                                                item.label ===
                                                'Convo'
                                                    ? startNewChat
                                                    : undefined
                                            }
                                            className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-2xl font-medium transition ${
                                                item.label ===
                                                'Convo'
                                                    ? 'bg-neutral-800 text-white'
                                                    : 'text-neutral-300 hover:bg-neutral-900 hover:text-white'
                                            }`}
                                        >
                                            <span className="w-8 text-center text-2xl">
                                                {
                                                    item.icon
                                                }
                                            </span>

                                            <span>
                                                {
                                                    item.label
                                                }
                                            </span>
                                        </button>
                                    )
                                )}
                            </div>

                            {/* CHAT LIST */}
                            <div className="mt-6">

                                <div className="mb-3 px-2 text-2xl font-bold text-white">
                                    Convo
                                </div>

                                <div className="space-y-2">

                                    {filteredChats.map(
                                        (chat) => (
                                            <button
                                                type="button"
                                                key={
                                                    chat._id
                                                }
                                                onClick={() =>
                                                    openChat(
                                                        chat
                                                    )
                                                }
                                                className={`block w-full truncate rounded-lg px-2 py-2 text-left text-sm transition ${
                                                    currentChatId ===
                                                    chat._id
                                                        ? 'bg-neutral-800 text-white'
                                                        : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                                                }`}
                                            >
                                                {chat.title ||
                                                    'New chat'}
                                            </button>
                                        )
                                    )}

                                    {chats.length ===
                                        0 && (
                                        <p className="px-2 text-sm text-zinc-500">
                                            {user
                                                ? 'Your conversations will appear here.'
                                                : 'Login to save your conversations.'}
                                        </p>
                                    )}
                                    {chats.length > 0 &&
                                        filteredChats.length === 0 && (
                                            <p className="px-2 text-sm text-zinc-500">
                                                No conversations match your search.
                                            </p>
                                        )}
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* MAIN CHAT */}
                    <main className="relative flex flex-1 flex-col bg-transparent">

                        {/* EMPTY STATE */}
                        {messages.length === 0 &&
                        !isLoadingChat ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-5 px-4 pt-6">

                                {/* Welcome Emoji */}
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 text-4xl">
                                    😊
                                </div>

                                <div className="text-center">

                                    <h1 className="text-5xl font-medium tracking-tight text-white">
                                        {user
                                            ? `Welcome Back, ${getDisplayName(user)}!`
                                            : 'Convo'}
                                    </h1>

                                    <p className="mt-3 text-2xl text-zinc-400">
                                        Let&apos;s get
                                        started! What
                                        would you like
                                        to chat about
                                        today?
                                    </p>

                                    {/* Guest counter */}
                                    {!user && (
                                        <p className="mt-4 text-sm text-white">
                                            {guestQuestionCount <
                                            2
                                                ? `${
                                                      2 -
                                                      guestQuestionCount
                                                  } free questions remaining`
                                                : 'Login to continue chatting'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (

                            /* MESSAGES */
                            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 overflow-y-auto px-4 py-8">

                                {isLoadingChat && (
                                    <p className="text-center text-sm text-zinc-500">
                                        Loading
                                        conversation...
                                    </p>
                                )}

                                {messages.map(
                                    (item) => (
                                        <div
                                            key={item.id}
                                            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-base ${
                                                item.role ===
                                                'user'
                                                    ? 'ml-auto border border-neutral-700 bg-neutral-800 text-white'
                                                    : 'mr-auto border border-neutral-800 bg-neutral-900 text-white'
                                            }`}
                                        >
                                            {item.image && (
                                                <img
                                                    src={item.image}
                                                    alt="Image attached to this message"
                                                    className="mb-2 max-h-72 max-w-full rounded-lg object-contain"
                                                />
                                            )}
                                            {item.content ||
                                                (isSending
                                                    ? 'Thinking...'
                                                    : '')}
                                        </div>
                                    )
                                )}

                                {/* Login message */}
                                {guestLimitReached && (
                                    <div className="mx-auto mt-4 w-full max-w-xl rounded-2xl border border-neutral-700 bg-neutral-900 p-5 text-center">

                                        <div className="mb-2 text-2xl">
                                            🔒
                                        </div>

                                        <h3 className="text-lg font-semibold text-white">
                                            Free chat limit
                                            reached
                                        </h3>

                                        <p className="mt-2 text-sm text-neutral-300">
                                            You have used
                                            your 2 free
                                            questions.
                                            Login to
                                            continue
                                            chatting with
                                            Convo.
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    '/login'
                                                )
                                            }
                                            className="mt-4 rounded-xl bg-white px-6 py-2.5 font-semibold text-black transition hover:bg-neutral-200"
                                        >
                                            Login to
                                            Continue
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INPUT */}
                        <div className="px-4 pb-10">

                            <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-700 bg-neutral-950 px-3 pt-3 pb-1">

                                {/* Chat error */}
                                {chatError &&
                                    !guestLimitReached && (
                                        <p
                                            role="alert"
                                            className="px-3 pb-2 text-sm text-white"
                                        >
                                            {
                                                chatError
                                            }
                                        </p>
                                    )}

                                {selectedImage && (
                                    <div className="mb-3 flex items-center gap-3 rounded-lg border border-neutral-800 bg-black p-2">
                                        <img
                                            src={selectedImage.dataUrl}
                                            alt="Selected attachment preview"
                                            className="h-14 w-14 rounded object-cover"
                                        />
                                        <span className="min-w-0 flex-1 truncate text-sm text-neutral-300">
                                            {selectedImage.name}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedImage(null)}
                                            aria-label="Remove attached image"
                                            className="flex h-8 w-8 items-center justify-center rounded text-lg text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}

                                <form
                                    onSubmit={
                                        handleSendMessage
                                    }
                                    className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-black px-3 py-3"
                                >

                                    <div className="flex-1">

                                        <input
                                            type="text"
                                            value={message}
                                            onChange={(e) =>
                                                setMessage(
                                                    e.target
                                                        .value
                                                )
                                            }
                                            placeholder={
                                                guestLimitReached
                                                    ? 'Login to continue chatting...'
                                                    : 'Ask Convo anything...'
                                            }
                                            disabled={
                                                isSending ||
                                                guestLimitReached
                                            }
                                            className="w-full border-none bg-transparent text-xl text-white placeholder:text-zinc-500 focus:outline-none disabled:cursor-not-allowed"
                                        />

                                    </div>

                                    <div className="flex items-center gap-2 text-white">

                                        {/* FILE INPUT */}
                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            multiple
                                            className="hidden"
                                            onChange={
                                                handleFileChange
                                            }
                                        />

                                        {/* ATTACHMENT */}
                                        <button
                                            type="button"
                                            onClick={
                                                handleOpenFiles
                                            }
                                            disabled={
                                                guestLimitReached ||
                                                isSending
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-xl text-white transition hover:border-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            ＋
                                        </button>

                                        {/* SEND BUTTON */}
                                        <button
                                            type="submit"
                                            disabled={
                                                !canSendMessage ||
                                                isSending
                                            }
                                            aria-label="Send message"
                                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xl shadow-lg transition ${
                                                canSendMessage &&
                                                !isSending
                                                    ? 'bg-white text-black hover:bg-neutral-200'
                                                    : 'bg-neutral-900 text-neutral-600'
                                            }`}
                                        >
                                            {isSending
                                                ? '…'
                                                : '↑'}
                                        </button>
                                    </div>
                                </form>

                            </div>

                            {!user && !guestLimitReached && (
                                <div className="mx-auto max-w-5xl">
                                    <p className="mt-1 text-center text-xs text-neutral-400">
                                        {2 - guestQuestionCount} free questions remaining
                                    </p>
                                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                                        {suggestedPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => setMessage(prompt)}
                                                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition hover:border-white hover:text-white"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </main>
    )
}

export default Dashboard
