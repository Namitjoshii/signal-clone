import json

from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import ValidationError

from app.database import SessionLocal
from app.schemas.message import MessageResponse, SendMessageRequest
from app.services.message_service import MessageService
from app.websocket.manager import ConnectionManager
from app.websocket.schemas import WebSocketIncomingMessage
from app.websocket.validation import validate_connection

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/{conversation_id}/{user_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    user_id: int,
) -> None:
    db = SessionLocal()
    try:
        error = validate_connection(db, conversation_id, user_id)
        if error is not None:
            await websocket.close(code=1008, reason=error)
            return

        await manager.connect(websocket, conversation_id, user_id)

        await websocket.send_json(
            {
                "type": "connected",
                "conversation_id": conversation_id,
                "user_id": user_id,
                "connected_users": manager.get_connected_users(conversation_id),
            }
        )

        message_service = MessageService(db)

        while True:
            raw = await websocket.receive_text()
            try:
                payload = json.loads(raw)
                incoming = WebSocketIncomingMessage.model_validate(payload)
            except (json.JSONDecodeError, ValidationError) as exc:
                await websocket.send_json(
                    {"type": "error", "detail": str(exc)},
                )
                continue

            try:
                message = message_service.send_message(
                    user_id,
                    SendMessageRequest(
                        conversation_id=conversation_id,
                        content=incoming.content,
                    ),
                )
            except HTTPException as exc:
                await websocket.send_json(
                    {"type": "error", "detail": exc.detail},
                )
                continue

            response = MessageResponse.model_validate(message).model_dump(mode="json")
            broadcast_payload = {"type": "message", "message": response}
            await manager.broadcast(conversation_id, broadcast_payload)

    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(conversation_id, user_id)
        db.close()
