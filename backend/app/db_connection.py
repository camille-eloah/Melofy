from sqlmodel import SQLModel, create_engine, Session
import os

# -------------------------------------------------
# Configuração da URL de conexão
# -------------------------------------------------
# Exemplo de URL:
# mysql+mysqlconnector://usuario:senha@localhost:3306/db_melofy
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+mysqlconnector://root:password@localhost:3306/db_melofy"
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
