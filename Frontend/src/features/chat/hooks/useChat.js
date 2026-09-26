import { initializeSocketConnection } from "../service/chat.socket"
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading } from "../chat.slice";
import { useDispatch } from "react-redux";


export const useChat = () => {

    const dispatch = useDispatch()

   async function handleSendMessage({message, chatId}) {
        dispatch(setLoading(true))
        const data = await  sendMessage({message, chatId})
        const {chat, messages} = data
        dispatch(setChats((prev) => {
            return {
                ...prev,
                [chat.title]:{
                    ...chat,
                    messages: [ {content: message, role: "user"}, 
                                messages
                    ]
                }
            }
        }))
        dispatch(setCurrentChatId(chat._id))
        
    }

    return {
        initializeSocketConnection,
        handleSendMessage,
    }
}