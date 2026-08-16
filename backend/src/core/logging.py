import logging

_FORMAT = "%(levelname)s %(name)s: %(message)s"


def configure_logging(level: str) -> None:
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(_FORMAT))

    app_logger = logging.getLogger("src")
    app_logger.handlers.clear()
    app_logger.addHandler(handler)
    app_logger.setLevel(level.upper())
    app_logger.propagate = False
