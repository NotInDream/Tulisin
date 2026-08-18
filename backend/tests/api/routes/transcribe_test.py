async def test_transcribe_returns_reference_and_output(client):
    response = await client.post(
        "/api/v1/transcribe/",
        files={"file": ("rapat.mp3", b"fake-audio-bytes", "audio/mpeg")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "rapat.mp3"
    assert body["audio_file"].endswith(".mp3")
    assert body["output"] == f"transkrip untuk {body['audio_file']}"
    assert body["segments"] == [
        {"start": 0.0, "end": 1.0, "text": f"transkrip untuk {body['audio_file']}"}
    ]


async def test_transcribe_empty_file_rejected(client):
    response = await client.post(
        "/api/v1/transcribe/",
        files={"file": ("kosong.mp3", b"", "audio/mpeg")},
    )

    assert response.status_code == 400
