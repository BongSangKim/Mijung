from fastapi import APIRouter

from app.common.scheduler import fetch_data_from_api

router = APIRouter(
    tags=['scheduler'],
    responses={404: {"description": "Not found"}}
)

@router.get("/scheduler/start")
async def startScheduler():
    fetch_data_from_api()