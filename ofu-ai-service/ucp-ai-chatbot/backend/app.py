from flask import Flask
from flask import request
from flask import jsonify

from flask_cors import CORS

from chatbot import chatbot

from config import Config
from profile_manager import profile_manager


app = Flask(__name__)

CORS(app)


@app.route("/")

def home():

    return jsonify(
        {
            "status": "running",
            "project":
            "UCP AI Chatbot"
        }
    )


@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    try:

        data = request.get_json()

        message = data.get(
            "message",
            ""
        )

        if not message:

            return jsonify(
                {
                    "error":
                    "Empty message"
                }
            )

        answer = chatbot.ask(
            message
        )

        return jsonify(
            {
                "response":
                answer
            }
        )

    except Exception as e:

        return jsonify(
            {
                "error":
                str(e)
            }
        )


@app.route(
    "/reset",
    methods=["POST"]
)
def reset_chat():

    chatbot.clear_memory()

    return jsonify(
        {
            "message":
            "Chat memory cleared"
        }
    )

@app.route(
    "/profile",
    methods=["POST"]
)
def profile():

    data = request.get_json()

    profile_manager.set_profile(
        data
    )

    return jsonify(
        {
            "status":"saved"
        }
    )

if __name__ == "__main__":

    app.run(
        host=Config.FLASK_HOST,
        port=Config.FLASK_PORT,
        debug=True
    )