import sys
import time
import logging
import logging.config
import socketserver

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "development": {"format": "[%(levelname)s %(funcName)s] %(message)s"}
    },
    "handlers": {
        "stdout": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "development",
            "level": "DEBUG",
        }
    },
    "loggers": {"": {"level": "DEBUG", "handlers": ["stdout"]}},
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)


# https://docs.python.org/3/library/socketserver.html
class TCPHandler(socketserver.BaseRequestHandler):
    """
    The request handler class for our server.
    It is instantiated once per connection to the server, and must
    override the handle() method to implement communication to the
    client.
    """

    def handle(self):
        # self.request is the TCP socket connected to the client
        while True:
            self.data = self.request.recv(1024).strip()
            logger.info("{} wrote:".format(self.client_address[0]))
            logger.info(self.data)
            if self.data == b"SLEEP":
                logger.info("Sleeping...")
                time.sleep(60)
            self.request.sendall(f"RECEIVED: {self.data}\n".encode())


def main(host, port):
    print(f"Starting TCP Server on {host}:{port}")
    with socketserver.TCPServer((host, int(port)), TCPHandler) as server:
        # Activate the server; this will keep running until you
        # interrupt the program with Ctrl-C
        logger.info("Serving forever...")
        server.serve_forever()


if __name__ == "__main__":
    host, port = sys.argv[1], sys.argv[2]
    main(host, port)
