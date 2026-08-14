async def test_list_history_empty(client):
    response = await client.get("/api/v1/history/")

    assert response.status_code == 200
    assert response.json() == []


async def test_create_then_list_and_get(client):
    payload = {
        "name": "Rapat mingguan",
        "audio_file": "rapat.mp3",
        "output": "hasil transkrip",
    }
    created = await client.post("/api/v1/history/", json=payload)

    assert created.status_code == 201
    body = created.json()
    assert body["id"] >= 1
    assert body["name"] == "Rapat mingguan"
    assert body["created_at"]
    assert body["updated_at"]

    listed = await client.get("/api/v1/history/")
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    fetched = await client.get(f"/api/v1/history/{body['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["output"] == "hasil transkrip"


async def test_get_missing_history_returns_404(client):
    response = await client.get("/api/v1/history/999")

    assert response.status_code == 404


async def test_put_history_updates_item(client):
    created = await client.post(
        "/api/v1/history/",
        json={"name": "Awal", "audio_file": "a.mp3", "output": "draf"},
    )
    history_id = created.json()["id"]

    response = await client.put(
        f"/api/v1/history/{history_id}",
        json={"name": "Revisi", "audio_file": "a.mp3", "output": "final"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == history_id
    assert body["name"] == "Revisi"
    assert body["output"] == "final"


async def test_put_missing_history_returns_404(client):
    response = await client.put(
        "/api/v1/history/999",
        json={"name": "x", "audio_file": "x.mp3", "output": "x"},
    )
    assert response.status_code == 404


async def test_delete_history_id(client):
    response = await client.delete("/api/v1/history/1")
    assert response.status_code == 204
