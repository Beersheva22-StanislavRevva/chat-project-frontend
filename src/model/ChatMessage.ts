type ChatMessage  = {
    id?: any,
    from: string,
    text: string,
    to: string,
    dateTime: string,
    readByRecepient?: number,
    direction?: string
}
export default ChatMessage;