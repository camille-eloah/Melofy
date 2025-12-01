# Backend

## Pré-requisitos
1. Arquivo de variáveis de ambiente (`backend\app\.env`) contendo o conteúdo abaixo:

```shell
DB_USER=root
DB_PASSWORD=usbw
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_melofy
JWT_SECRET_KEY=melofy-dev-secret
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
COOKIE_SECURE=False
COOKIE_SAMESITE=Lax
DEBUG=true
```

2. Banco de dados MySQL configurado com as mesmas informações descritas no `.env`:

```shell
DB_USER=root
DB_PASSWORD=usbw
DB_HOST=localhost
DB_PORT=3306
DB_NAME=db_melofy
```

3. Use as queries do arquivo `backend\database\create_database.sql` para criar o database e todas as tabelas necessárias.

## Instruções

1. Clone o repositório:

```shell
git clone https://github.com/camille-eloah/Melofy.git
```

2. Crie um ambiente virtual:

```shell
python -m venv env
```

3. Ative o ambiente virtual:

* Windows:
```shell
env\Scripts\activate
```
* Linux:
```shell
source env\bin\activate
```

4. Instale as dependências:

```shell
pip install -r requirements.txt
```

5. Entre na pasta do backend e execute o comando para levantar a aplicação :

```shell
cd backend
uvicorn app.main:app 
```

Obs.: utilize `uvicorn app.main:app --reload` caso queira que a aplicação reinicie automaticamente a cada alteração feita no código.

