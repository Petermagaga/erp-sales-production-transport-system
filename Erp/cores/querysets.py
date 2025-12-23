from django.db import models

class CompanyQuerySet(models.QuerySet):
    def for_user(self,user):
        if user.is_superuser:
            return self
        
        if user.is_company_admin():
            return self.filter(company=user.company)
        


        return self.filter(
            company=user.company,
            branch=user.branch
        )