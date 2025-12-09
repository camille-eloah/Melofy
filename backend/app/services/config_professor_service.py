"""
Service para gerenciar configurações do professor
"""

from sqlmodel import Session, select
from datetime import datetime
from app.models import (
    ConfigProfessor,
    ConfigAulaRemota,
    ConfigAulaPresencial,
    ConfigAulaDomicilio,
)


class ConfigProfessorService:
    """Service para operações de configuração do professor"""

    @staticmethod
    def criar_ou_atualizar_config_geral(
        db: Session,
        prof_id: int,
        valor_hora_aula: float = None,
        tipo_aula_principal: str = None,
    ) -> ConfigProfessor:
        """Cria ou atualiza a configuração geral do professor"""
        config = db.exec(
            select(ConfigProfessor).where(ConfigProfessor.prof_id == prof_id)
        ).first()

        if config:
            if valor_hora_aula is not None:
                config.valor_hora_aula = valor_hora_aula
            if tipo_aula_principal is not None:
                config.tipo_aula_principal = tipo_aula_principal
            config.atualizado_em = datetime.utcnow()
        else:
            config = ConfigProfessor(
                prof_id=prof_id,
                valor_hora_aula=valor_hora_aula,
                tipo_aula_principal=tipo_aula_principal,
            )
            db.add(config)

        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def criar_ou_atualizar_config_remota(
        db: Session, prof_id: int, link_meet: str
    ) -> ConfigAulaRemota:
        """Cria ou atualiza a configuração de aula remota"""
        config = db.exec(
            select(ConfigAulaRemota).where(ConfigAulaRemota.prof_id == prof_id)
        ).first()

        if config:
            config.link_meet = link_meet
            config.atualizado_em = datetime.utcnow()
        else:
            config = ConfigAulaRemota(prof_id=prof_id, link_meet=link_meet)
            db.add(config)

        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def criar_ou_atualizar_config_presencial(
        db: Session,
        prof_id: int,
        cidade: str,
        estado: str,
        rua: str,
        numero: str,
        bairro: str,
        complemento: str = None,
    ) -> ConfigAulaPresencial:
        """Cria ou atualiza a configuração de aula presencial"""
        config = db.exec(
            select(ConfigAulaPresencial).where(ConfigAulaPresencial.prof_id == prof_id)
        ).first()

        if config:
            config.cidade = cidade
            config.estado = estado
            config.rua = rua
            config.numero = numero
            config.bairro = bairro
            config.complemento = complemento
            config.atualizado_em = datetime.utcnow()
        else:
            config = ConfigAulaPresencial(
                prof_id=prof_id,
                cidade=cidade,
                estado=estado,
                rua=rua,
                numero=numero,
                bairro=bairro,
                complemento=complemento,
            )
            db.add(config)

        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def criar_ou_atualizar_config_domicilio(
        db: Session, prof_id: int, ativo: bool = True
    ) -> ConfigAulaDomicilio:
        """Cria ou atualiza a configuração de aula domicílio"""
        config = db.exec(
            select(ConfigAulaDomicilio).where(ConfigAulaDomicilio.prof_id == prof_id)
        ).first()

        if config:
            config.ativo = ativo
            config.atualizado_em = datetime.utcnow()
        else:
            config = ConfigAulaDomicilio(prof_id=prof_id, ativo=ativo)
            db.add(config)

        db.commit()
        db.refresh(config)
        return config

    @staticmethod
    def obter_config_geral(db: Session, prof_id: int) -> ConfigProfessor:
        """Obtém a configuração geral do professor"""
        return db.exec(
            select(ConfigProfessor).where(ConfigProfessor.prof_id == prof_id)
        ).first()

    @staticmethod
    def obter_config_remota(db: Session, prof_id: int) -> ConfigAulaRemota:
        """Obtém a configuração de aula remota"""
        return db.exec(
            select(ConfigAulaRemota).where(ConfigAulaRemota.prof_id == prof_id)
        ).first()

    @staticmethod
    def obter_config_presencial(db: Session, prof_id: int) -> ConfigAulaPresencial:
        """Obtém a configuração de aula presencial"""
        return db.exec(
            select(ConfigAulaPresencial).where(
                ConfigAulaPresencial.prof_id == prof_id
            )
        ).first()

    @staticmethod
    def obter_config_domicilio(db: Session, prof_id: int) -> ConfigAulaDomicilio:
        """Obtém a configuração de aula domicílio"""
        return db.exec(
            select(ConfigAulaDomicilio).where(ConfigAulaDomicilio.prof_id == prof_id)
        ).first()

    @staticmethod
    def obter_todas_configs(db: Session, prof_id: int) -> dict:
        """Obtém todas as configurações do professor"""
        return {
            "config_geral": ConfigProfessorService.obter_config_geral(db, prof_id),
            "config_remota": ConfigProfessorService.obter_config_remota(db, prof_id),
            "config_presencial": ConfigProfessorService.obter_config_presencial(
                db, prof_id
            ),
            "config_domicilio": ConfigProfessorService.obter_config_domicilio(
                db, prof_id
            ),
        }

    @staticmethod
    def deletar_config_remota(db: Session, prof_id: int) -> bool:
        """Deleta a configuração de aula remota"""
        config = db.exec(
            select(ConfigAulaRemota).where(ConfigAulaRemota.prof_id == prof_id)
        ).first()

        if config:
            db.delete(config)
            db.commit()
            return True
        return False

    @staticmethod
    def deletar_config_presencial(db: Session, prof_id: int) -> bool:
        """Deleta a configuração de aula presencial"""
        config = db.exec(
            select(ConfigAulaPresencial).where(
                ConfigAulaPresencial.prof_id == prof_id
            )
        ).first()

        if config:
            db.delete(config)
            db.commit()
            return True
        return False

    @staticmethod
    def deletar_config_domicilio(db: Session, prof_id: int) -> bool:
        """Deleta a configuração de aula domicílio"""
        config = db.exec(
            select(ConfigAulaDomicilio).where(ConfigAulaDomicilio.prof_id == prof_id)
        ).first()

        if config:
            db.delete(config)
            db.commit()
            return True
        return False
