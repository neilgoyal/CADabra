from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from kittycad_api import *

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route("/api/simplify_prompt", methods=["POST"])
def simplify_prompt():
    # Simplify the original prompt
    data = request.get_json()
    prompt = data.get("original_prompt")
    if not prompt:
        return jsonify({"error": "Missing 'prompt' in request"}), 400
    simplified = simplify_original_prompt(prompt)
    return jsonify(simplified)


# API endpoint for text-to-CAD conversion
@app.route("/api/text_to_cad", methods=["POST"])
def text_to_cad():
    # Extract the hard prompt from the request JSON
    # Attempt to parse JSON data
    data = request.get_json(
        silent=True
    )  # Use silent=True to handle parsing errors gracefully

    # Print the parsed data and headers for debugging
    print("Received data:", data)
    print("Request Headers:", request.headers)

    # Check if JSON parsing was successful
    if data is None:
        return (
            jsonify(
                {
                    "error": "Request data must be in JSON format with Content-Type 'application/json'"
                }
            ),
            400,
        )

    # Attempt to retrieve "prompt" from the parsed data
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"error": "Missing 'prompt' in request"}), 400

    # Simplify the prompt
    prompt = simplify_original_prompt(prompt)

    # Run the asynchronous CAD generation function
    body = asyncio.run(simple_text_to_cad(prompt))

    # Return the result as JSON
    # Need to return body.code and cad_outputs/source.glb
    kcl_code = str(body.code)
    glb_file_path = os.path.join(OG_CAD_DIR, "source.glb")
    if os.path.exists(glb_file_path):
        with open(glb_file_path, "rb") as glb_file:
            source_glb_content = glb_file.read()
    else:
        return jsonify({"error": "GLB file not found"}), 404

    # Encode the GLB content in base64 for JSON compatibility
    import base64

    encoded_glb_content = base64.b64encode(source_glb_content).decode("utf-8")

    # Return the result as JSON
    response_data = {"kcl_code": kcl_code, "source_glb": encoded_glb_content}

    return jsonify(response_data)


# API endpoint for text-to-CAD conversion
@app.route("/api/kcl_editing", methods=["POST"])
def kcl_editing():
    # Extract the hard prompt from the request JSON
    # Attempt to parse JSON data
    data = request.get_json(
        silent=True
    )  # Use silent=True to handle parsing errors gracefully

    # Print the parsed data and headers for debugging
    print("Received data:", data)
    print("Request Headers:", request.headers)

    # Check if JSON parsing was successful
    if data is None:
        return (
            jsonify(
                {
                    "error": "Request data must be in JSON format with Content-Type 'application/json'"
                }
            ),
            400,
        )

    # Attempt to retrieve "prompt" from the parsed data
    kcl_code = data.get("kcl_code")
    prompt = data.get("prompt")
    if not prompt or not kcl_code:
        return jsonify({"error": "Missing args in request"}), 400

    # Run the asynchronous CAD generation function
    final_code = generate_and_fix_kcl_code(kcl_code, prompt)

    # Return the result as JSON
    # Need to return body.code and cad_outputs/source.glb
    kcl_code = str(final_code)
    glb_file_path = os.path.join(TEMP_KCL_FOLDER, "output.glb")
    if os.path.exists(glb_file_path):
        with open(glb_file_path, "rb") as glb_file:
            source_glb_content = glb_file.read()
    else:
        return jsonify({"error": "GLB file not found"}), 404

    # Encode the GLB content in base64 for JSON compatibility
    import base64

    encoded_glb_content = base64.b64encode(source_glb_content).decode("utf-8")

    # Return the result as JSON
    response_data = {"kcl_code": kcl_code, "source_glb": encoded_glb_content}

    return jsonify(response_data)


@app.route("/api/kcl_merging", methods=["POST"])
def kcl_merging():
    # Extract the hard prompt from the request JSON
    # Attempt to parse JSON data
    data = request.get_json(
        silent=True
    )  # Use silent=True to handle parsing errors gracefully

    # Print the parsed data and headers for debugging
    print("Received data:", data)
    print("Request Headers:", request.headers)

    # Check if JSON parsing was successful
    if data is None:
        return (
            jsonify(
                {
                    "error": "Request data must be in JSON format with Content-Type 'application/json'"
                }
            ),
            400,
        )

    # Attempt to retrieve "prompt" from the parsed data
    kcl_code_1 = data.get("kcl_code_1")
    kcl_code_2 = data.get("kcl_code_2")
    if not kcl_code_2 or not kcl_code_2:
        return jsonify({"error": "Missing args in request"}), 400

    # Run the asynchronous CAD generation function
    final_code = merge_and_fix_kcl_code(kcl_code_1, kcl_code_2)

    # Return the result as JSON
    # Need to return body.code and cad_outputs/source.glb
    kcl_code = str(final_code)
    glb_file_path = os.path.join(TEMP_KCL_FOLDER, "output.glb")
    if os.path.exists(glb_file_path):
        with open(glb_file_path, "rb") as glb_file:
            source_glb_content = glb_file.read()
    else:
        return jsonify({"error": "GLB file not found"}), 404

    # Encode the GLB content in base64 for JSON compatibility
    import base64

    encoded_glb_content = base64.b64encode(source_glb_content).decode("utf-8")

    # Return the result as JSON
    response_data = {"kcl_code": kcl_code, "source_glb": encoded_glb_content}

    return jsonify(response_data)


# Start the Flask application
if __name__ == "__main__":
    app.run(debug=True)
