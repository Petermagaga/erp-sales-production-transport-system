def get_executive_alerts(company):
    alerts = []

    subscription = company.subscription
    if subscription.status != "active":
        alerts.append({
            "type": "billing",
            "message": "Subscription not active"
        })

    if company.users.count() > subscription.plan.max_users:
        alerts.append({
            "type": "limit",
            "message": "User limit exceeded"
        })

    return alerts
