from django.apps import AppConfig

class AuditConfig(AppConfig):
    name = "auditt"

    def ready(self):
        import audit.signals
