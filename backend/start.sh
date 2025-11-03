#!/usr/bin/env sh
set -e

APP_MODULE="${UVICORN_APP:-src.main:app}"
HOST="${UVICORN_HOST:-0.0.0.0}"
PORT="${UVICORN_PORT:-8000}"
WORKERS="${UVICORN_WORKERS:-1}"
RELOAD="${UVICORN_RELOAD:-0}"

COMMON_ARGS="--host ${HOST} --port ${PORT}"

if [ "${WORKERS}" -gt 1 ]; then
  exec uvicorn "${APP_MODULE}" ${COMMON_ARGS} --workers "${WORKERS}"
fi

if [ "${RELOAD}" = "1" ]; then
  exec uvicorn "${APP_MODULE}" ${COMMON_ARGS} --reload
fi

exec uvicorn "${APP_MODULE}" ${COMMON_ARGS}
