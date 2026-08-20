from app.config import (
    FIREBASE_ENABLED,
    FIREBASE_KEY_PATH
)

if FIREBASE_ENABLED:

    import firebase_admin

    from firebase_admin import (
        credentials,
        messaging
    )

    cred = credentials.Certificate(
        FIREBASE_KEY_PATH
    )

    firebase_admin.initialize_app(
        cred
    )


def send_push_notification(
    fcm_token,
    title,
    body
):

    if not fcm_token:

        return {
            "status": "failed",
            "reason": "missing token"
        }

    if not FIREBASE_ENABLED:

        try:
            print(
                f"""
                MOCK FIREBASE

                Token: {fcm_token}
                Title: {title}
                Body: {body}
                """
            )
        except UnicodeEncodeError:
            print(
                f"""
                MOCK FIREBASE

                Token: {fcm_token}
                Title: {title}
                Body: {body.encode('ascii', errors='replace').decode('ascii')}
                """
            )

        return {
            "status": "mock_sent"
        }

    message = messaging.Message(

        notification=
        messaging.Notification(
            title=title,
            body=body
        ),

        token=fcm_token
    )

    response = messaging.send(
        message
    )

    return {
        "status": "sent",
        "message_id": response
    }