from fastapi.testclient import TestClient

from app.main import app

AUTH = {"Authorization": "Bearer mock-jwt-token"}


def headers(user_id: int) -> dict[str, str]:
    return {**AUTH, "X-User-Id": str(user_id)}


with TestClient(app) as client:
    u1 = client.post(
        "/auth/register",
        json={
            "username": "alice",
            "phone": "+111",
            "display_name": "Alice",
            "otp": "123456",
        },
    ).json()
    u2 = client.post(
        "/auth/register",
        json={
            "username": "bob",
            "phone": "+222",
            "display_name": "Bob",
            "otp": "123456",
        },
    ).json()

    conv = client.post(
        "/conversations/direct",
        json={"user_id": u2["id"]},
        headers=headers(u1["id"]),
    ).json()

    r = client.post(
        "/messages",
        json={"conversation_id": conv["id"], "content": "Hello Bob"},
        headers=headers(u1["id"]),
    )
    assert r.status_code == 201, r.text
    msg = r.json()
    assert msg["content"] == "Hello Bob"
    assert msg["status"] == "sent"
    assert msg["sender"]["username"] == "alice"

    r = client.get(f"/messages/{conv['id']}", headers=headers(u2["id"]))
    assert r.status_code == 200, r.text
    messages = r.json()
    assert len(messages) == 1
    assert messages[0]["id"] == msg["id"]

    r = client.patch(f"/messages/{msg['id']}/read", headers=headers(u2["id"]))
    assert r.status_code == 200, r.text
    assert r.json()["status"] == "read"

    r = client.post(
        "/messages",
        json={"conversation_id": conv["id"], "content": "Hi"},
        headers=headers(u2["id"]),
    )
    assert r.status_code == 201

    r = client.get(f"/messages/{conv['id']}", headers=headers(u1["id"]))
    assert len(r.json()) == 2
    assert r.json()[0]["created_at"] <= r.json()[1]["created_at"]

    r = client.post(
        "/messages",
        json={"conversation_id": 999, "content": "Nope"},
        headers=headers(u1["id"]),
    )
    assert r.status_code == 404

    print("All message tests passed")
