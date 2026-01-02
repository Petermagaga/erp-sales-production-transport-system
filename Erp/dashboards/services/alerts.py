def get_executive_alerts(company):
    if not company:
        return []

    subscription = getattr(company, "subscription", None)
    if not subscription:
        return []

    alerts = []  # ✅ MUST be defined

    if subscription.status != "active":
        alerts.append({
            "type": "billing",
            "message": "Subscription not active"
        })

    # Guard against missing relation
    user_count = company.users.count() if hasattr(company, "users") else 0

    if user_count > subscription.plan.max_users:
        alerts.append({
            "type": "limit",
            "message": "User limit exceeded"
        })

    return alerts
