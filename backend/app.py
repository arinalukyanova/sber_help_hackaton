# ======================================================
# SberHelp Backend (Flask)
# ======================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)  # разрешаем запросы с фронтенда

# ======================================================
# ХРАНИЛИЩЕ ЗАЯВОК В ПАМЯТИ
# ======================================================

tickets = {}

# ======================================================
# ЗАГЛУШКА ДЛЯ LLM (потом заменишь на GigaChat/YandexGPT)
# ======================================================

def generate_questions(user_request: str):
    """Возвращает 3 уточняющих вопроса."""
    return [
        "На каком устройстве возникает проблема?",
        "Когда проблема появилась впервые?",
        "Что именно происходит при попытке входа?"
    ]


def generate_summary(user_request: str, answers: list):
    """Формирует резюме: 'Я правильно понял, что...'"""
    summary = f"Я правильно понял, что ваш запрос: {user_request}."
    if answers:
        summary += " Уточнения: " + "; ".join(answers) + "."
    return summary


def can_solve(user_request: str) -> bool:
    """Проверяет, может ли ИИ решить проблему."""
    lower = user_request.lower()
    return any(word in lower for word in ["пароль", "wi-fi", "почт", "вход"])


def generate_solution(user_request: str) -> str:
    """Генерирует решение проблемы."""
    lower = user_request.lower()

    if "пароль" in lower:
        return (
            "1. Перейдите в личный кабинет.\n"
            "2. Нажмите 'Восстановить пароль'.\n"
            "3. Следуйте инструкции в письме."
        )
    elif "wi-fi" in lower or "вайфай" in lower:
        return (
            "1. Перезагрузите роутер.\n"
            "2. Проверьте подключение к сети.\n"
            "3. Если не помогает — обратитесь в IT-отдел."
        )
    elif "почт" in lower:
        return (
            "1. Проверьте настройки почтового клиента.\n"
            "2. Убедитесь, что пароль верный.\n"
            "3. Попробуйте войти через веб-версию."
        )
    elif "вход" in lower:
        return (
            "1. Завершите активные сессии в настройках безопасности.\n"
            "2. Подождите несколько минут.\n"
            "3. Попробуйте войти с новым паролем."
        )
    return "Решение не найдено. Запрос передан в поддержку."


# ======================================================
# ЭНДПОИНТЫ
# ======================================================

@app.route("/tickets", methods=["POST"])
def create_ticket():
    """
    Создать заявку.
    Тело запроса: { "request": "текст запроса клиента" }
    """
    data = request.get_json()
    user_request = data.get("request", "").strip()

    if not user_request:
        return jsonify({"error": "Request is empty"}), 400

    ticket_id = str(uuid.uuid4())
    questions = generate_questions(user_request)

    tickets[ticket_id] = {
        "id": ticket_id,
        "originalRequest": user_request,
        "questions": questions,
        "answers": [],
        "summary": "",
        "status": "WAITING_ANSWERS",
        "solution": "",
        "escalationReason": ""
    }

    return jsonify(tickets[ticket_id]), 200


@app.route("/tickets/<ticket_id>/answers", methods=["POST"])
def submit_answers(ticket_id):
    """
    Ответить на вопросы.
    Тело запроса: { "answers": ["ответ1", "ответ2", "ответ3"] }
    """
    if ticket_id not in tickets:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json()
    answers = data.get("answers", [])

    ticket = tickets[ticket_id]
    ticket["answers"] = answers

    # Формируем резюме
    summary = generate_summary(ticket["originalRequest"], answers)
    ticket["summary"] = summary
    ticket["status"] = "WAITING_CONFIRM"

    return jsonify(ticket), 200


@app.route("/tickets/<ticket_id>/confirm", methods=["POST"])
def confirm_ticket(ticket_id):
    """
    Подтвердить или отклонить резюме.
    Тело запроса: { "confirmed": true } или { "confirmed": false }
    """
    if ticket_id not in tickets:
        return jsonify({"error": "Ticket not found"}), 404

    data = request.get_json()
    confirmed = data.get("confirmed", False)

    ticket = tickets[ticket_id]

    if confirmed:
        # Клиент подтвердил, что это его проблема
        if can_solve(ticket["originalRequest"]):
            # ИИ может решить
            solution = generate_solution(ticket["originalRequest"])
            ticket["solution"] = solution
            ticket["status"] = "RESOLVED"
        else:
            # ИИ не может решить → эскалация
            ticket["status"] = "ESCALATED"
            ticket["escalationReason"] = "ИИ не смог решить проблему. Запрос передан в поддержку."
    else:
        # Клиент отклонил резюме → эскалация
        ticket["status"] = "ESCALATED"
        ticket["escalationReason"] = "Клиент отклонил резюме. ИИ не справился. Передано в поддержку."

    return jsonify(ticket), 200


@app.route("/tickets", methods=["GET"])
def get_all_tickets():
    """Получить все заявки."""
    return jsonify(list(tickets.values())), 200


@app.route("/tickets/<ticket_id>", methods=["GET"])
def get_ticket(ticket_id):
    """Получить одну заявку по ID."""
    if ticket_id not in tickets:
        return jsonify({"error": "Ticket not found"}), 404
    return jsonify(tickets[ticket_id]), 200


# ======================================================
# ЗАПУСК
# ======================================================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)