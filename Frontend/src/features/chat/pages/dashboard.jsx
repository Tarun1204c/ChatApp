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
    { label: 'Search', icon: '⌕' },
    { label: 'Convo', icon: '◌' },
    { label: 'Library', icon: '▣' },
    { label: 'Images', icon: '◍' },
]

const Dashboard = () => {
    const { initializeSocketConnection } = useChat()

    const navigate = useNavigate()

    const user = useSelector((state) => state.auth.user)

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [message, setMessage] = useState('')
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
                localStorage.getItem(
                    'guestQuestionCount'
                ) || 0
            )
        })

    const fileInputRef = useRef(null)

    // Check whether guest has reached limit
    const guestLimitReached =
        !user && guestQuestionCount >= 2

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
        if (event.target.files?.length) {
            console.log(
                'Selected files:',
                event.target.files
            )
        }

        event.target.value = ''
    }

    // Send message
    const handleSendMessage = async (event) => {
        event.preventDefault()

        const content = message.trim()

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

            // Increase guest question count
            if (!user) {
                const newCount =
                    guestQuestionCount + 1

                setGuestQuestionCount(newCount)

                localStorage.setItem(
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

    return (
        <main className="min-h-screen bg-black text-white">

            {/* Background */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(217,70,239,0.16),transparent_32%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.13),transparent_30%)]" />

            <div className="relative flex min-h-screen flex-col">

                {/* HEADER */}
                <header className="flex items-center justify-between border-b border-fuchsia-900/30 bg-zinc-950/90 px-4 py-3 backdrop-blur-xl">

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
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-800/50 bg-zinc-900 text-lg text-fuchsia-400 shadow-lg shadow-fuchsia-950/20 transition hover:border-fuchsia-500 hover:bg-fuchsia-950/30"
                        >
                            ☰
                        </button>

                        {/* Logo */}
                        <div className="flex items-center gap-2 rounded-full border border-fuchsia-800/50 bg-zinc-900 px-3 py-1.5 text-base font-medium text-white shadow-lg shadow-fuchsia-950/20">

                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 text-[10px] font-bold text-white">
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
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-800/50 bg-zinc-900 text-xl text-fuchsia-400 shadow-lg shadow-fuchsia-950/20 transition hover:border-fuchsia-500 hover:bg-fuchsia-950/30"
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
                                className="rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-105"
                            >
                                Login
                            </button>
                        )}

                        <button
                            type="button"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-fuchsia-800/50 bg-zinc-900 text-xl text-fuchsia-400 shadow-lg shadow-fuchsia-950/20 transition hover:border-fuchsia-500 hover:bg-fuchsia-950/30"
                        >
                            ⌁
                        </button>
                    </div>
                </header>

                <div className="flex flex-1 overflow-hidden">

                    {/* SIDEBAR */}
                    {isSidebarOpen && (
                        <aside className="w-[300px] border-r border-fuchsia-900/30 bg-zinc-950/90 px-4 py-4 backdrop-blur-xl">

                            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-fuchsia-900/30 bg-fuchsia-950/30 px-4 py-3 text-fuchsia-300">

                                <span className="text-lg">
                                    ⌕
                                </span>

                                <span className="text-xl font-medium">
                                    Search
                                </span>
                            </div>

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
                                                    ? 'bg-fuchsia-950/50 text-fuchsia-300'
                                                    : 'text-zinc-300 hover:bg-fuchsia-950/30 hover:text-fuchsia-300'
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

                                    {chats.map(
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
                                                        ? 'bg-fuchsia-950/60 text-fuchsia-300'
                                                        : 'text-zinc-400 hover:bg-fuchsia-950/30 hover:text-fuchsia-300'
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
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-pink-600 text-4xl shadow-xl shadow-fuchsia-500/30">
                                    😊
                                </div>

                                <div className="text-center">

                                    <h1 className="text-5xl font-medium tracking-tight text-white">
                                        Welcome Back,{' '}
                                        {user
                                            ? getDisplayName(
                                                  user
                                              )
                                            : 'User'}
                                        !
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
                                        <p className="mt-4 text-sm text-fuchsia-400">
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
                                                    ? 'ml-auto bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-950/30'
                                                    : 'mr-auto border border-fuchsia-900/30 bg-zinc-900/90 text-zinc-200 shadow-lg shadow-black/20'
                                            }`}
                                        >
                                            {item.content ||
                                                (isSending
                                                    ? 'Thinking...'
                                                    : '')}
                                        </div>
                                    )
                                )}

                                {/* Login message */}
                                {guestLimitReached && (
                                    <div className="mx-auto mt-4 w-full max-w-xl rounded-2xl border border-fuchsia-700/40 bg-gradient-to-r from-fuchsia-950/50 to-pink-950/40 p-5 text-center shadow-xl shadow-fuchsia-950/20">

                                        <div className="mb-2 text-2xl">
                                            🔒
                                        </div>

                                        <h3 className="text-lg font-semibold text-white">
                                            Free chat limit
                                            reached
                                        </h3>

                                        <p className="mt-2 text-sm text-zinc-400">
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
                                            className="mt-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-fuchsia-900/30 transition hover:scale-105"
                                        >
                                            Login to
                                            Continue
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* INPUT */}
                        <div className="px-4 pb-6">

                            <div className="mx-auto max-w-5xl rounded-3xl border border-fuchsia-900/40 bg-zinc-950/90 p-3 shadow-2xl shadow-fuchsia-950/30 backdrop-blur-xl">

                                {/* Chat error */}
                                {chatError &&
                                    !guestLimitReached && (
                                        <p
                                            role="alert"
                                            className="px-3 pb-2 text-sm text-rose-400"
                                        >
                                            {
                                                chatError
                                            }
                                        </p>
                                    )}

                                <form
                                    onSubmit={
                                        handleSendMessage
                                    }
                                    className="flex items-center gap-3 rounded-2xl border border-fuchsia-900/30 bg-zinc-900/80 px-3 py-3 shadow-inner shadow-black"
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

                                    <div className="flex items-center gap-2 text-fuchsia-400">

                                        {/* FILE INPUT */}
                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
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
                                                guestLimitReached
                                            }
                                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-fuchsia-800/50 bg-zinc-900 text-xl text-fuchsia-400 shadow-sm transition hover:border-fuchsia-500 hover:bg-fuchsia-950/30 disabled:cursor-not-allowed disabled:opacity-40"
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
                                                    ? 'bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-fuchsia-500/30 hover:scale-105'
                                                    : 'bg-zinc-900 text-fuchsia-900'
                                            }`}
                                        >
                                            {isSending
                                                ? '…'
                                                : '↑'}
                                        </button>
                                    </div>
                                </form>

                                {/* Guest counter below input */}
                                {!user &&
                                    !guestLimitReached && (
                                        <p className="mt-2 text-center text-xs text-zinc-600">
                                            {
                                                2 -
                                                guestQuestionCount
                                            }{' '}
                                            free questions
                                            remaining
                                        </p>
                                    )}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </main>
    )
}

export default Dashboard
