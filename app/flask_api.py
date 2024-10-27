from flask import Flask, request, jsonify
from flask_cors import CORS
import asyncio
from kittycad_api import *
from multimodal_to_text import *
from datetime import datetime

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
    multimodal_prompt = answer_user_prompt(text=prompt)
    prompt = simplify_original_prompt(multimodal_prompt["new_prompt"])

    # Run the asynchronous CAD generation function
    body = asyncio.run(simple_text_to_cad(prompt))
    
    
    
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Root directory
    OUTPUT_DIR = os.path.join(BASE_DIR, "cadabra-vis/public/assets") 
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    kcl_filename = os.path.join(OUTPUT_DIR, f"{date_str}.kcl")
    glb_filename = os.path.join(OUTPUT_DIR, f"{date_str}.glb")

    # Write the KCL code to a file
    with open(kcl_filename, "w") as kcl_file:
        kcl_file.write(str(body.code))

    # Path to the source GLB file
    source_glb_path = os.path.join(OG_CAD_DIR, "source.glb")

    # Copy and encode the GLB file content
    if os.path.exists(source_glb_path):
        with open(source_glb_path, "rb") as source_glb:
            source_glb_content = source_glb.read()
        
        # Save to glb_filename
        with open(glb_filename, "wb") as glb_file:
            glb_file.write(source_glb_content)

        # Encode the GLB content for JSON response
        encoded_glb_content = base64.b64encode(source_glb_content).decode("utf-8")
    else:
        return jsonify({"error": "GLB file not found"}), 404

    # Return the result as JSON
    response_data = {
        "kcl_code": body.code,
        "source_glb": encoded_glb_content,
        "llm": multimodal_prompt["object_created"],
    }

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
    BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # Root directory
    OUTPUT_DIR = os.path.join(BASE_DIR, "cadabra-vis/public/assets") 
    
    date_str = datetime.now().strftime("%Y-%m-%d")
    kcl_filename = os.path.join(OUTPUT_DIR, f"{date_str}.kcl")
    glb_filename = os.path.join(OUTPUT_DIR, f"{date_str}.glb")

    # Attempt to retrieve "prompt" from the parsed data
    kcl_code = data.get("kcl_code")
    prompt = data.get("prompt")
    if not prompt or not kcl_code:
        return jsonify({"error": "Missing args in request"}), 400

    # Run the asynchronous CAD generation function
    (final_code, llm_output) = generate_and_fix_kcl_code(kcl_code, prompt)

    # Return the result as JSON
    # Need to return body.code and cad_outputs/source.glb
    kcl_code = str(final_code)
    
    with open(kcl_filename, "w") as kcl_file:
        kcl_file.write(kcl_code)
        
        
    glb_file_path = os.path.join(TEMP_KCL_FOLDER, "output.glb")
    
    
    


    # Copy and encode the GLB file content
    if os.path.exists(glb_file_path):
        with open(glb_file_path, "rb") as source_glb:
            source_glb_content = source_glb.read()
        
        # Save to glb_filename
        with open(glb_filename, "wb") as glb_file:
            glb_file.write(source_glb_content)

        # Encode the GLB content for JSON response
        encoded_glb_content = base64.b64encode(source_glb_content).decode("utf-8")
    else:
        return jsonify({"error": "GLB file not found"}), 404

    # Return the result as JSON
    response_data = {
        "kcl_code": kcl_code,
        "source_glb": encoded_glb_content,
        "llm": llm_output,
    }

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
