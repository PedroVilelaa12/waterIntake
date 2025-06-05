# --- models.py ---
# Crie um arquivo chamado models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func # Para default=func.now()
from datetime import datetime, date

from database import Base # Importa a Base declarativa

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    weight_kg = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relacionamento com os registros de consumo de água
    water_intakes = relationship("WaterIntakeLog", back_populates="owner")

class WaterIntakeLog(Base):
    __tablename__ = "water_intake_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    amount_ml = Column(Integer, nullable=False)
    log_date = Column(Date, nullable=False, default=date.today) # Data do consumo
    logged_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False) # Momento exato do registro

    # Relacionamento com o usuário
    owner = relationship("User", back_populates="water_intakes")
