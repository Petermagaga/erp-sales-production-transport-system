def is_feature_enabled(company, feature):
    plan = company.subscription.plan
    return getattr(plan, f"enable_{feature}", False)
