# --- database.py ---
# Crie um arquivo chamado database.py no mesmo diretório do main.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./lembrete_agua.db"
# Para PostgreSQL, seria algo como:
# SQLALCHEMY_DATABASE_URL = "postgresql://user:password@postgresserver/db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Necessário apenas para SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def init_db():
    # Cria todas as tabelas no banco de dados
    # Em um ambiente de produção, você provavelmente usaria Alembic para migrações de banco de dados.
    Base.metadata.create_all(bind=engine)

