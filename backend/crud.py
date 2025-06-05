# --- crud.py ---
# Crie um arquivo chamado crud.py

from sqlalchemy.orm import Session
from sqlalchemy import func # Para usar func.sum e func.date
from datetime import date, datetime

import models
import schemas # Importa os schemas Pydantic

# --- Funções CRUD para Usuários ---

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(models.User.name == name).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name, 
        weight_kg=user.weight_kg,
        created_at=datetime.now() # Definir explicitamente ou usar server_default no modelo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Funções CRUD para Registros de Consumo de Água ---

def create_water_intake_log(db: Session, intake_log: schemas.WaterIntakeCreate, user_id: int):
    db_log = models.WaterIntakeLog(
        user_id=user_id,
        amount_ml=intake_log.amount_ml,
        log_date=date.today(), # Data do consumo é o dia atual
        logged_at=datetime.now() # Momento exato do registro
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def get_water_consumed_on_date(db: Session, user_id: int, target_date: date) -> int:
    """
    Calcula o total de água consumida por um usuário em uma data específica.
    """
    total_consumed = db.query(func.sum(models.WaterIntakeLog.amount_ml))\
        .filter(models.WaterIntakeLog.user_id == user_id)\
        .filter(models.WaterIntakeLog.log_date == target_date)\
        .scalar() # scalar() retorna o valor da primeira coluna da primeira linha, ou None
    return total_consumed or 0 # Retorna 0 se for None

def get_user_water_intake_history(db: Session, user_id: int) -> dict[date, int]:
    """
    Retorna um dicionário com a data como chave e o total consumido como valor.
    """
    # Agrupa os logs por data e soma as quantidades
    # O SQLAlchemy espera que você selecione explicitamente as colunas de agrupamento
    query_result = db.query(
            models.WaterIntakeLog.log_date,
            func.sum(models.WaterIntakeLog.amount_ml).label("total_ml")
        )\
        .filter(models.WaterIntakeLog.user_id == user_id)\
        .group_by(models.WaterIntakeLog.log_date)\
        .order_by(models.WaterIntakeLog.log_date.desc()) # Opcional: ordenar por data
    
    history = {log_date: total_ml for log_date, total_ml in query_result.all()}
    return history
