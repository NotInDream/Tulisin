class DomainError(Exception):
    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class NotFoundError(DomainError):
    pass


class TranscriptionError(DomainError):
    pass


class HistoryNotFoundError(NotFoundError):
    def __init__(self, history_id: int) -> None:
        super().__init__(f"History {history_id} tidak ditemukan.")
