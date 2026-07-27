export type Message = {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline?: boolean;
  messages: Message[];
};
