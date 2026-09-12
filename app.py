from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
import json

from ai.analyzer import analyze_request


class RequestHandler(BaseHTTPRequestHandler):

    def send_json(self, data, status=200):
        """
        Универсальная функция отправки JSON на frontend.
        """

        response = json.dumps(
            data,
            ensure_ascii=False
        )

        self.send_response(status)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8"
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.end_headers()

        self.wfile.write(
            response.encode("utf-8")
        )


    def do_POST(self):

        # Мы обрабатываем только POST /api/analyze
        if self.path != "/api/analyze":

            self.send_json(
                {
                    "error": "Route not found"
                },
                status=404
            )

            return


        # ------------------------------------------------
        # 1. Читаем JSON от frontend
        # ------------------------------------------------

        content_length = int(
            self.headers.get(
                "Content-Length",
                0
            )
        )

        raw_data = self.rfile.read(
            content_length
        )


        try:

            request_data = json.loads(
                raw_data.decode("utf-8")
            )

        except json.JSONDecodeError:

            self.send_json(
                {
                    "error": "Invalid JSON"
                },
                status=400
            )

            return


        # ------------------------------------------------
        # 2. Получаем message
        # ------------------------------------------------

        message = request_data.get(
            "message",
            ""
        ).strip()


        if not message:

            self.send_json(
                {
                    "error": "Message is empty"
                },
                status=400
            )

            return


        # ------------------------------------------------
        # 3. Передаём сообщение AI-модулю
        # ------------------------------------------------

        try:

            result = analyze_request(
                message
            )

        except Exception as error:

            print(
                "AI ERROR:",
                error
            )

            self.send_json(
                {
                    "error": "AI processing failed"
                },
                status=500
            )

            return


        # ------------------------------------------------
        # 4. Отправляем результат frontend
        # ------------------------------------------------

        self.send_json(
            result
        )


    def do_OPTIONS(self):

        """
        Нужно, если frontend и backend работают
        на разных портах.
        """

        self.send_response(200)

        self.send_header(
            "Access-Control-Allow-Origin",
            "*"
        )

        self.send_header(
            "Access-Control-Allow-Methods",
            "POST, OPTIONS"
        )

        self.send_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        )

        self.end_headers()


if __name__ == "__main__":

    server = HTTPServer(
        ("localhost", 8000),
        RequestHandler
    )

    print(
        "Backend запущен:"
    )

    print(
        "http://localhost:8000"
    )

    server.serve_forever()
