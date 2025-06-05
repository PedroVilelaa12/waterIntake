# --- schemas.py ---
# Crie um arquivo chamado schemas.py

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime, date
import uuid # Mantemos UUID para os IDs nos schemas se preferir consistência com a versão anterior, mas o BD usará INT

ML_PER_KG = 35

class UserBase(BaseModel):
    name: str = Field(..., example="João Silva", description="Nome completo do usuário.")
    weight_kg: float = Field(..., gt=0, example=70.5, description="Peso do usuário em quilogramas.")

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int # Agora o ID é um inteiro vindo do banco de dados
    created_at: datetime
    daily_goal_ml: Optional[float] = None # Será calculado

    # Usar model_validator para Pydantic V2 ou root_validator para V1
    @validator('daily_goal_ml', pre=True, always=True)
    def calculate_daily_goal(cls, v, values):
        if 'weight_kg' in values and values['weight_kg'] is not None:
            return values['weight_kg'] * ML_PER_KG
        return None # Ou lançar um erro se weight_kg for obrigatório para o cálculo

    class Config:
        from_attributes = True # Para Pydantic V2, substitui orm_mode = True


class WaterIntakeBase(BaseModel):
    amount_ml: int = Field(..., gt=0, example=250, description="Quantidade de água consumida em mililitros.")

class WaterIntakeCreate(WaterIntakeBase):
    pass

class WaterIntakeLogResponse(WaterIntakeBase): # Renomeado de WaterIntakeLog para evitar conflito com o modelo SQLAlchemy
    id: int
    user_id: int
    log_date: date
    logged_at: datetime

    class Config:
        from_attributes = True


class DailyProgress(BaseModel):
    user_name: str
    user_id: int # ID do usuário (inteiro)
    date: date
    daily_goal_ml: float
    consumed_ml: int
    remaining_ml: float
    goal_achieved: bool

    class Config:
        from_attributes = True
