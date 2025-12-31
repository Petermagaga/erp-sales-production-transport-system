from django.core.exceptions import PermissionDenied

def check_user_limit(company):
    subscription= company.subscription
    max_users= subscription.plan.max_users

    if company.users.count() >= max_users:
        raise PermissionDenied("User limit reached for you plan")
    

def check_branch_limit(company):
    if company.branches.count() >= company.subscription.plan.max_branches:
        raise PermissionDenied("Branch limit reached.")
