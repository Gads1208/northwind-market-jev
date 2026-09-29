#!/usr/bin/env python3
"""
Northwind Gourmet Market - Web Server & Jev IA Recommendation API
Zero external dependencies, powered by Python 3 standard library.
"""

import http.server
import json
import os
import sys
import urllib.parse
from src.jev_engine import JevRecommendationEngine

PORT = int(os.environ.get("PORT", 8080))
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

engine = JevRecommendationEngine()

class NorthwindHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=STATIC_DIR, **kwargs)

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == "/api/catalog":
            try:
                with open(os.path.join(DATA_DIR, "catalog.json"), "r", encoding="utf-8") as f:
                    cat_data = json.load(f)
                return self._send_json(cat_data)
            except Exception as e:
                return self._send_json({"error": str(e)}, status=500)

        elif path == "/api/health":
            has_env_key = bool(os.environ.get("TYPESAFE_API_KEY"))
            return self._send_json({
                "status": "healthy",
                "service": "Northwind Gourmet Jev AI Store",
                "version": "1.0.0",
                "totalProducts": len(engine.products),
                "totalCategories": len(engine.categories),
                "typeSafeApiKeyConfigured": has_env_key,
                "engine": "TypeSafe System One (Jev 1.13)"
            })

        # Fallback to static file serving
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        content_length = int(self.headers.get("Content-Length", 0))
        raw_body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"

        try:
            payload = json.loads(raw_body)
        except Exception:
            return self._send_json({"error": "Invalid JSON"}, status=400)

        if path == "/api/recommend":
            cart_items = payload.get("cart", [])
            custom_key = payload.get("apiKey") or None
            try:
                result = engine.recommend(cart_items, custom_api_key=custom_key)
                return self._send_json(result)
            except Exception as e:
                return self._send_json({"error": str(e)}, status=500)

        elif path == "/api/test-key":
            api_key = payload.get("apiKey", "")
            if not api_key:
                return self._send_json({"valid": False, "message": "Nenhuma chave fornecida."}, status=400)
            
            # Simple test call
            test_req = {
                "state": "Northwind Customer Gourmet Basket Connection Test",
                "model": "jev-latest",
                "questions": {
                    "ping": {
                        "type": "noul",
                        "instructions": "Is this a valid connection test?"
                    }
                }
            }
            res = engine._call_typesafe_api(test_req, api_key)
            if res and "answers" in res:
                return self._send_json({"valid": True, "message": "Chave TypeSafe validada com sucesso!", "model": res.get("model")})
            else:
                return self._send_json({"valid": False, "message": "Não foi possível autenticar na API TypeSafe. Verifique a chave."}, status=401)

        self.send_error(404, "Endpoint not found")

def run(port=PORT):
    server_address = ("", port)
    httpd = http.server.ThreadingHTTPServer(server_address, NorthwindHandler)
    print(f"==================================================")
    print(f" 🛍️  Northwind Gourmet Market (Jev IA) online!")
    print(f" 🌐 URL: http://localhost:{port}")
    print(f" 🧠 Jev IA Engine: Pronto para recomendações")
    print(f"==================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor finalizado com sucesso.")
        httpd.server_close()

if __name__ == "__main__":
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run(port_arg)
