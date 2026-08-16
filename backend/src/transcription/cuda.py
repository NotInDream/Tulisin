import importlib.util
import logging
import os
import sys
from pathlib import Path

logger = logging.getLogger(__name__)

_registered = False


def register_cuda_dll_directories() -> None:
    global _registered
    if _registered:
        return
    if sys.platform != "win32":
        logger.debug("Lewati registrasi DLL CUDA: platform bukan win32")
        _registered = True
        return
    _registered = True
    spec = importlib.util.find_spec("nvidia")
    if spec is None or spec.submodule_search_locations is None:
        logger.warning("Package 'nvidia' tidak ditemukan; DLL CUDA tidak diregistrasi")
        return
    bin_dirs = [
        str(bin_dir)
        for location in spec.submodule_search_locations
        for bin_dir in Path(location).glob("*/bin")
        if bin_dir.is_dir()
    ]
    if not bin_dirs:
        logger.warning("Tidak ada direktori bin CUDA di dalam package 'nvidia'")
        return
    for bin_dir in bin_dirs:
        os.add_dll_directory(bin_dir)
    os.environ["PATH"] = os.pathsep.join([*bin_dirs, os.environ.get("PATH", "")])
    logger.info("Direktori DLL CUDA diregistrasi ke PATH: %s", bin_dirs)
