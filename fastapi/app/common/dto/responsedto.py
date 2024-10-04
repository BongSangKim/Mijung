from typing import Generic, TypeVar, Optional
from pydantic import BaseModel, Field

T = TypeVar('T')

class ResponseDTO(BaseModel, Generic[T]):
    data: Optional[T] = Field(None, description="응답 데이터")

    @classmethod
    def from_(cls, data: T) -> 'ResponseDTO[T]':
        return cls(data=data, pagination=None)