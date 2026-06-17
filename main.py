"""VitaLink(의료지갑) — FastAPI 모듈러 모놀리식 진입점.

헥사고날 + 클린 + DDD 구조의 3개 Bounded Context를 조립한다.
  - identity        : Open DID / VC 가족 건강 위임
  - medical_record  : 의료 데이터 + 블록체인 무결성 검증
  - share_token     : Redis 일회성 공유 토큰
"""

from __future__ import annotations

import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# PYTHONPATH: 프로젝트 루트와 apps 디렉터리를 모두 등록 (모듈 절대경로 import)
_backend_root = Path(__file__).resolve().parent
_apps_root = _backend_root / "apps"
for _path in (_backend_root, _apps_root):
    if str(_path) not in sys.path:
        sys.path.insert(0, str(_path))

from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

load_dotenv(_backend_root / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from core.database import dispose_engine, get_db, init_db, init_engine
from core.db_health_adapter import DbHealthAdapter

from identity.adapter.inbound.api import identity_router
from medical_record.adapter.inbound.api import medical_record_router
from share_token.adapter.inbound.api import share_token_router


def _auto_seed_enabled() -> bool:
    return os.getenv("AUTO_SEED", "").lower() in ("1", "true", "yes")


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_engine()
        await init_db()
    except Exception:
        logger.exception("데이터베이스 시작 초기화 실패")

    if _auto_seed_enabled():
        try:
            from core.database import async_session_maker
            from scripts.seed_mock_data import run_seed

            if async_session_maker is not None:
                count = await run_seed(async_session_maker)
                logger.info("목업 데이터 자동 시드 완료: %d 행", count)
            else:
                logger.warning("시드 생략 — async_session_maker 미초기화 (DATABASE_URL 확인)")
        except Exception:
            logger.exception("목업 데이터 자동 시드 실패 (앱은 계속 실행)")

    yield
    await dispose_engine()


app = FastAPI(title="VitaLink API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(identity_router)
app.include_router(medical_record_router)
app.include_router(share_token_router)


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "VitaLink 의료지갑 API", "docs": "/docs"}


@app.get("/db-check")
async def check_db(db: AsyncSession = Depends(get_db)):
    return await DbHealthAdapter.neon_time_check(db)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
