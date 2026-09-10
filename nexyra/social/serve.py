#!/usr/bin/env python3
"""
Local preview server for the Nexyra template editors.

Plain `python3 -m http.server` works for browsing and image export, but MP4
export needs SharedArrayBuffer, which only exists on a page served as
"cross-origin isolated" — that requires two response headers most simple
static servers don't send. This tiny server adds them.

Usage:
    python3 serve.py [port]      # defaults to 8000, then open the printed URL
"""
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000


class COOPCOEPHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("127.0.0.1", PORT), COOPCOEPHandler) as httpd:
        print(f"Serving Nexyra templates at http://127.0.0.1:{PORT}/ (Ctrl+C to stop)")
        httpd.serve_forever()
