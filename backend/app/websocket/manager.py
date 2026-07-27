from fastapi import WebSocket


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[int, dict[int, WebSocket]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        conversation_id: int,
        user_id: int,
    ) -> None:
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = {}
        self.active_connections[conversation_id][user_id] = websocket

    def disconnect(self, conversation_id: int, user_id: int) -> None:
        room = self.active_connections.get(conversation_id)
        if room is None:
            return
        room.pop(user_id, None)
        if not room:
            self.active_connections.pop(conversation_id, None)

    def get_connected_users(self, conversation_id: int) -> list[int]:
        room = self.active_connections.get(conversation_id)
        if room is None:
            return []
        return list(room.keys())

    async def broadcast(self, conversation_id: int, message: dict) -> None:
        room = self.active_connections.get(conversation_id)
        if room is None:
            return

        stale_users: list[int] = []
        for user_id, websocket in room.items():
            try:
                await websocket.send_json(message)
            except Exception:
                stale_users.append(user_id)

        for user_id in stale_users:
            self.disconnect(conversation_id, user_id)
