# Backend

## Instruções

1. Clone o repositório

```shell
git clone https://github.com/camille-eloah/Melofy.git
```

2. Crie um ambiente virtual

```shell
python -m venv env
```

3. Ative o ambiente virtual

* Windows:
```shell
env\Scripts\activate
```
* Linux:
```shell
source env\bin\activate
```

4. Instale as dependências

```shell
pip install -r requirements.txt
```

5. Entre na pasta do backend e execute o comando para levantar a aplicação 

```shell
cd backend
uvicorn app.main:app 
```

Obs.: utilize `uvicorn app.main:app --reload` caso queira que a aplicação reinicie automaticamente a cada alteração feita no código.

