from pydantic import BaseModel


class TranscriptionRead(BaseModel):
    name: str
    audio_file: str
    output: str
