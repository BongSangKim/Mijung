from enum import Enum
from fastapi import FastAPI, HTTPException, Request, logger
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


# IngredientMessage Enum 정의
class IngredientMessage(str, Enum):
    INGREDIENT_NOT_FOUND = "Ingredient not found."
    CATEGORY_NOT_FOUND = "Category not found."

def add_exception_handlers(app: FastAPI):
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        logger.error(f"Response Status Error: {exc.detail}")
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": exc.detail}
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.error(f"Method Argument Not Valid Error: {exc.errors()}")
        return JSONResponse(
            status_code=400,
            content={"error": exc.detail}
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error(f"서버 에러 발생: {str(exc)}")
        return JSONResponse(
            status_code=500,
            content={"error": IngredientMessage.INGREDIENT_NOT_FOUND}
        )