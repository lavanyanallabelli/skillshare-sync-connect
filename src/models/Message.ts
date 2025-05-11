
// Message model definition
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  readAt?: string;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageDate?: string;
  unreadCount: number;
}
