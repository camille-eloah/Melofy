from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv
import os

# -------------------------------------------------
# Carregar variáveis do arquivo .env
# -------------------------------------------------
load_dotenv()

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD") or ""
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "db_melofy")

# Montagem da URL
DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Criação do engine
engine = create_engine(DATABASE_URL, echo=True)

# -------------------------------------------------
# Funções auxiliares
# -------------------------------------------------
def create_db_and_tables():
    """Cria as tabelas no banco, se ainda não existirem"""
    import models  # importa todos os modelos para o SQLModel conhecer
    SQLModel.metadata.create_all(engine)

def get_session():
    """Gerador de sessão para ser usado com Depends no FastAPI"""
    with Session(engine) as session:
        yield session
