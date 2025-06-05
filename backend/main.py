from fastapi import FastAPI, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid # Mantendo UUID para os IDs dos modelos Pydantic, mas no BD usaremos INT por simplicidade com SQLite

# Importações dos módulos locais
import crud
import models
import schemas
from database import SessionLocal, engine, init_db
from fastapi.middleware.cors import CORSMiddleware
# Cria as tabelas no banco de dados (apenas se não existirem)
# Em um cenário de produção, você usaria Alembic para migrações.
models.Base.metadata.create_all(bind=engine)

# --- Inicialização do App FastAPI ---
app = FastAPI(
    title="API Lembrete de Beber Água com SQLAlchemy",
    description="API para gerenciar usuários e seus registros de consumo de água usando SQLAlchemy e SQLite.",
    version="0.2.0"
)
origins = [
    "http://localhost:3000", # URL do frontend React em desenvolvimento
    # Adicione outros origins se necessário (ex: URL de produção)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Permite todos os métodos (GET, POST, etc.)
    allow_headers=["*"], # Permite todos os cabeçalhos
)

# --- Dependência para obter a sessão do DB ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Evento de Startup ---
@app.on_event("startup")
async def startup_event():
    """
    Inicializa o banco de dados na inicialização do aplicativo.
    Isso garante que as tabelas sejam criadas.
    """
    init_db() # Garante que as tabelas sejam criadas se não existirem


@app.post("/users", response_model=schemas.User, status_code=201, tags=["Usuários"])
async def create_user_endpoint(
    user_data: schemas.UserCreate, 
    db: Session = Depends(get_db)
):
    """
    Cria um novo usuário. Se um usuário com o mesmo nome já existir,
    retorna um erro.

    - **name**: Nome do usuário.
    - **weight_kg**: Peso do usuário em Kg.
    """
    db_user_exists = crud.get_user_by_name(db, name=user_data.name)
    if db_user_exists:
        raise HTTPException(status_code=400, detail="Nome de usuário já registrado. Tente 'entrar' ou use outro nome.")
    created_user = crud.create_user(db=db, user=user_data)
    return created_user

@app.get("/users/{user_id}", response_model=schemas.User, tags=["Usuários"])
async def get_user_endpoint(
    user_id: int = Path(..., description="ID do usuário a ser recuperado."),
    db: Session = Depends(get_db)
):
    """
    Obtém os detalhes de um usuário específico pelo ID.
    """
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
    return db_user

@app.get("/users/name/{user_name}", response_model=schemas.User, tags=["Usuários"]) # NOVO ENDPOINT
async def get_user_by_name_endpoint(
    user_name: str = Path(..., description="Nome do usuário a ser recuperado."),
    db: Session = Depends(get_db)
):
    """
    Obtém os detalhes de um usuário específico pelo nome.
    """
    # É importante normalizar o nome (ex: minúsculas) se a busca deve ser case-insensitive
    # Para este exemplo, manteremos a busca case-sensitive como no CRUD.
    db_user = crud.get_user_by_name(db, name=user_name)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário com este nome não encontrado.")
    return db_user


@app.get("/users", response_model=List[schemas.User], tags=["Usuários"])
async def get_all_users_endpoint(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Obtém uma lista de todos os usuários.
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@app.post("/users/{user_id}/water_intake", response_model=schemas.WaterIntakeLogResponse, status_code=201, tags=["Consumo de Água"])
async def log_water_intake_endpoint(
    intake_data: schemas.WaterIntakeCreate,
    user_id: int = Path(..., description="ID do usuário para registrar o consumo."),
    db: Session = Depends(get_db)
):
    """
    Registra uma nova quantidade de água consumida por um usuário.

    - **user_id**: ID do usuário.
    - **amount_ml**: Quantidade de água consumida em mL.
    """
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="Usuário não encontrado para registrar consumo.")
    
    new_log = crud.create_water_intake_log(db=db, intake_log=intake_data, user_id=user_id)
    return new_log

@app.get("/users/{user_id}/daily_progress", response_model=schemas.DailyProgress, tags=["Progresso e Histórico"])
async def get_daily_progress_endpoint(
    user_id: int = Path(..., description="ID do usuário para verificar o progresso diário."),
    query_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Retorna o progresso de consumo de água do usuário para o dia atual ou uma data especificada.
    """
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    target_date = query_date if query_date else date.today()
    
    consumed_today_ml = crud.get_water_consumed_on_date(db, user_id=user_id, target_date=target_date)

    user_schema = schemas.User.model_validate(user) 
    daily_goal = user_schema.daily_goal_ml
    
    remaining_ml = max(0, daily_goal - consumed_today_ml)
    goal_achieved = consumed_today_ml >= daily_goal

    return schemas.DailyProgress(
        user_name=user.name,
        user_id=user.id, 
        date=target_date,
        daily_goal_ml=daily_goal,
        consumed_ml=consumed_today_ml,
        remaining_ml=remaining_ml,
        goal_achieved=goal_achieved
    )

@app.get("/users/{user_id}/history", response_model=List[schemas.DailyProgress], tags=["Progresso e Histórico"])
async def get_water_intake_history_endpoint(
    user_id: int = Path(..., description="ID do usuário para obter o histórico de consumo."),
    db: Session = Depends(get_db)
):
    """
    Retorna o histórico de consumo diário de água para um usuário.
    """
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")

    user_schema = schemas.User.model_validate(user)
    daily_goal = user_schema.daily_goal_ml

    history_data = crud.get_user_water_intake_history(db, user_id=user_id)
    
    history_progress: List[schemas.DailyProgress] = []

    for log_date_entry, consumed_ml in history_data.items():
        remaining_ml = max(0, daily_goal - consumed_ml)
        goal_achieved = consumed_ml >= daily_goal
        
        progress_entry = schemas.DailyProgress(
            user_name=user.name,
            user_id=user.id, 
            date=log_date_entry,
            daily_goal_ml=daily_goal,
            consumed_ml=consumed_ml,
            remaining_ml=remaining_ml,
            goal_achieved=goal_achieved
        )
        history_progress.append(progress_entry)
        
    history_progress.sort(key=lambda p: p.date, reverse=True)
        
    return history_progress