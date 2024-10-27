from typing import Any, List, Optional, Tuple, Union

from kittycad.api.ml import create_text_to_cad
from kittycad.client import ClientFromEnv
from kittycad.models import Error, TextToCad
from kittycad.models.file_export_format import FileExportFormat
from kittycad.models.text_to_cad_create_body import TextToCadCreateBody
from kittycad.types import Response
from kittycad.api.ml import get_text_to_cad_model_for_user
from kittycad.client import ClientFromEnv
from kittycad.models import Error, TextToCad
import os
import time
import asyncio
from pydantic import BaseModel
from kittycad.client import ClientFromEnv
from kittycad.api.ml import create_text_to_cad_iteration
from kittycad.client import ClientFromEnv
from kittycad.models import Error, TextToCadIteration
from kittycad.models.text_to_cad_iteration_body import TextToCadIterationBody
from kittycad.api.api_calls import get_async_operation
from kittycad.api.ml import create_text_to_cad_iteration
from kittycad.client import ClientFromEnv
from kittycad.models import (
    Error,
    TextToCadIteration,
    TextToCadIterationBody,
    TextToCad,
)

os.environ["KITTYCAD_API_TOKEN"] = (
    "api-e366904f-5080-4f99-a9ed-249fea2bbd10"  # Change when pushing
)


import json
import openai
from openai import OpenAI

# Set up your OpenAI API key (it should be set in your environment variables)
openai.api_key = os.getenv("")


OG_CAD_DIR = "./cad_outputs"
TEMP_KCL_LOCATION = "./code_output/kcl_code.kcl"
TEMP_KCL_FOLDER = "./code_output"

os.makedirs(OG_CAD_DIR, exist_ok=True)

# Ensure the parent directory of TEMP_KCL_LOCATION exists
os.makedirs(os.path.dirname(TEMP_KCL_LOCATION), exist_ok=True)

client = OpenAI()
cad_client = ClientFromEnv()


# For structured outputs
class SimplifiedPrompt(BaseModel):
    new_prompt: str


# To simplify the original prompt
def simplify_original_prompt(original_prompt):
    try:
        response = client.beta.chat.completions.parse(
            model="ft:gpt-4o-2024-08-06:personal::AMbJgbdO",
            messages=[
                {
                    "role": "system",
                    "content": "You are an assistant that converts detailed descriptions into SIMPLE and SPECIFIC prompts suitable for 3D model generation using CAD design terms. Describe an object that can be represented in geometric shapes, not nebulous concepts such as 'a tiger' or 'the universe'. Be as explicit as possible. For example, if you want a plate with 4 holes, say where you want the holes placed and how big of a diameter each should have. Describe a SINGLE object rather than assemblies.",
                },
                {
                    "role": "user",
                    "content": f"Summarize the following description into a VERY SIMPLE (~5-8 specific words) prompt specific with CAD design terms. If ONLY SEVERELY COMPLEX, you may choose to omit some information, BUT BE CHOOSY when DOING SO. The prompts MUST not be the EXACT same:\n\n{original_prompt.strip()}",
                },
            ],
            max_tokens=50,
            temperature=0,
            response_format=SimplifiedPrompt,
        )
        simplified_prompt = json.loads(response.choices[0].message.content.strip())
        # Return the simplified prompt as structured JSON
        return simplified_prompt["new_prompt"]

    except Exception as e:
        print(f"Error generating simplified prompt: {e}")
        return None


def simple_text_to_cad_sync(prompt) -> TextToCad:
    print("Generating CAD from Text - Simple Prompt")
    MAX_RETRIES = 5
    retries = 0
    current_prompt = prompt
    import shutil

    while retries <= MAX_RETRIES:
        # Attempt to create the CAD model
        try:
            result = create_text_to_cad.sync(
                client=cad_client,
                output_format=FileExportFormat.GLB,
                kcl="true",
                body=TextToCadCreateBody(
                    prompt=current_prompt,
                ),
            )

            if isinstance(result, Error) or result is None:
                print(f"Error in response: {result}")
                raise Exception("Error in response")

            body: TextToCad = result
            operation_id = body.id

            # Polling for operation status
            while body.status not in ["completed", "failed"]:
                print(f"Status: {body.status}... checking again in 2 seconds.")
                time.sleep(2)
                result = get_text_to_cad_model_for_user.sync(
                    client=cad_client,
                    id=str(operation_id),
                )

                if isinstance(result, Error) or result is None:
                    print(f"Error in response: {result}")
                    raise Exception("Error in response")

                body = result

            if body.status == "completed":
                print("CAD model generation completed successfully.")

                outputs = body.outputs  # This should be a dict
                if outputs:
                    # Print the keys of the outputs
                    print("Available output files:", outputs.keys())

                    # Check if 'source.glb' is in outputs
                    output_dir = OG_CAD_DIR
                    os.makedirs(output_dir, exist_ok=True)

                    for file_name, file_content in outputs.items():
                        file_path = os.path.join(output_dir, file_name)
                        print(f"Saving output to {file_path}")

                        # Open the destination file in binary write mode
                        with open(file_path, "wb") as output_file:
                            # Copy content directly if it's a file-like object
                            if hasattr(file_content, "read"):
                                shutil.copyfileobj(file_content, output_file)
                            else:
                                # Write raw bytes if it's a byte string
                                output_file.write(file_content)

                else:
                    print("No outputs found in the response.")
                return body  # Success!
            else:
                print(f"Attempt {retries + 1} failed with status 'failed'.")
                retries += 1

                if retries > MAX_RETRIES:
                    print("Maximum retries reached. Failed to generate CAD model.")
                    raise Exception(
                        "Failed to generate CAD model after maximum retries."
                    )

                # Simplify the prompt
                simplified = simplify_original_prompt(current_prompt)
                if simplified is None:
                    raise Exception("Failed to simplify the prompt.")
                current_prompt = simplified
                print(f"Retrying with simplified prompt: {current_prompt}")

        except Exception as e:
            print(f"Exception occurred: {e}")
            retries += 1
            if retries > MAX_RETRIES:
                print(
                    "Maximum retries reached due to exceptions. Failed to generate CAD model."
                )
                raise Exception("Failed to generate CAD model after maximum retries.")

            # Simplify the prompt before retrying
            simplified = simplify_original_prompt(current_prompt)
            if simplified is None:
                raise Exception("Failed to simplify the prompt.")
            current_prompt = simplified
            print(f"Retrying with simplified prompt due to exception: {current_prompt}")

    raise Exception("Failed to generate CAD model after maximum retries.")


# 1. TEXT TO CAD FUNCTION CALL
async def simple_text_to_cad(prompt) -> TextToCad:
    loop = asyncio.get_event_loop()
    # Run the synchronous function in a separate thread
    body = await loop.run_in_executor(None, simple_text_to_cad_sync, prompt)
    return body


# For structured outputs
class KCLCode(BaseModel):
    updated_kcl_code: str


def kcl_code_updater(kcl_code: str, prompt: str) -> Optional[str]:
    """
    Updates the given KCL code based on the provided prompt by making precise and relevant changes.
    Ensures adherence to the conventions of the KittyCAD format.

    :param kcl_code: The original KCL code as a string.
    :param prompt: The prompt describing the desired changes.
    :return: The updated KCL code as a string, or None if an error occurs.
    """
    try:
        # Construct the messages for the chat completion
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert in the KittyCAD language that is used to create CAD designs."
                    "Given a KittyCAD language code block and a prompt, update the code by making precise and relevant changes."
                    "Ensure that the updated code adheres to the conventions of the KittyCAD language format that you are well versed in."
                ),
            },
            {
                "role": "user",
                "content": (
                    f"Here is the original KittyCAD language code:\n```kcl\n{kcl_code}\n```\n\n"
                    f'Please update the code based on the following prompt:\n"{prompt}"\n\n'
                    "Provide only the updated, EXTREMELY COMPREHENSIVE and SYNTACTICALLY CORRECT KittyCAD language code without additional explanations. DO NOT LOSE THE ORIGINAL STRUCTURE OF THIS CAD OBJECT!! It MUST be valid KittyCAD language code! DECIMAL POINTS MUST NOT END WITH 0!!"
                ),
            },
        ]

        # Make the API call to OpenAI's ChatCompletion endpoint
        response = response = client.beta.chat.completions.parse(
            model="ft:gpt-4o-2024-08-06:personal::AMbJgbdO",
            messages=messages,
            temperature=0,
            response_format=KCLCode,
        )

        simplified_prompt = json.loads(response.choices[0].message.content.strip())
        # Return the simplified prompt as structured JSON
        return simplified_prompt["updated_kcl_code"]
        # Verify that KCL works if not loop

    except Exception as e:
        print(f"An error occurred: {e}")
        return None


import tempfile
import subprocess
import re


def lint_kcl_code(
    kcl_code: str, file_path: str = TEMP_KCL_LOCATION, storage_default="code_output"
) -> Optional[str]:
    """
    Lints the given KCL code using 'zoo kcl lint'.
    Returns None if there are no linting errors.
    Returns the error message if there are linting errors.
    """
    try:
        stripped_code = "\n".join(line.strip() for line in str(kcl_code).splitlines())
        stripped_code = re.sub(r"\r\n", "\n", stripped_code)

        # Write the stripped KCL code to the specified file path
        with open(file_path, "w", encoding="utf-8", newline="") as file:
            file.write(stripped_code)

        # Run 'zoo kcl lint' on the temporary file
        result = subprocess.run(
            ["zoo", "kcl", "export", "--output-format=glb", file_path, storage_default],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        if result.returncode == 0:
            # No linting errors
            return None
        else:
            # Linting errors, capture the error message
            error_message = result.stdout + result.stderr
            return error_message.strip()

    except Exception as e:
        print(f"An error occurred during linting: {e}")
        return None


def generate_and_fix_kcl_code(
    kcl_code: str, prompt: str, max_retries: int = 10
) -> Optional[str]:
    """
    Generates updated KCL code based on the prompt and fixes any linting errors.
    Retries up to max_retries times if there are linting errors.

    :param kcl_code: The original KCL code as a string.
    :param prompt: The prompt describing the desired changes.
    :param max_retries: The maximum number of retries for fixing linting errors.
    :return: The lint-free updated KCL code as a string, or None if unsuccessful.
    """
    retries = 0
    current_code = kcl_code

    while retries <= max_retries:
        print(f"\nAttempt {retries + 1}:")

        # Update the KCL code based on the prompt
        updated_code = kcl_code_updater(current_code, prompt)

        if not updated_code:
            print("Failed to update the KCL code.")
            return None

        # Lint the updated code
        lint_errors = lint_kcl_code(updated_code)

        if lint_errors is None:
            print("No linting errors found. Code is clean.")
            return updated_code
        else:
            print("Linting errors found:")
            print(lint_errors)
            retries += 1

            if retries > max_retries:
                print("Maximum retries reached. Failed to fix linting errors.")
                return kcl_code

            # Use the error message to regenerate the code
            print("Regenerating code using the linting error message...")
            # Combine the original prompt with the linting errors
            prompt_with_errors = (
                f"The KittyCAD Language code above has the following linting errors that need to be fixed:\n{lint_errors}\n"
                "Please update the code to fix these errors and ensure it adheres to the KittyCAD language format and syntax."
            )
            current_code = updated_code  # Use the last updated code as the new base
            prompt = (
                prompt_with_errors  # Update the prompt to include the linting errors
            )

    print("Failed to generate lint-free KCL code after maximum retries.")
    return kcl_code


hard_prompt = """
A long shaft with 12mm threads.
"""

# kcl_code = """
# // Generated by Text-to-CAD: Threaded rod
# // Define constants in mm
# rodLength = 100.0
# rodDiameter = 10.0
# chamferLength = 1.0
# threadPitch = 1.5
# // create a sketch on the 'XY' plane
# sketch000 = startSketchOn('XY')
# // create circular sketch profile using half the rod diameter
# profile000 = circle({center: [0, 0], radius: rodDiameter / 2}, sketch000, $arc000)
# // extrude the sketch profile the length of the rod
# solidRod = extrude(rodLength, [profile000])
# // chamfer the ends of the rod
# chamfer000 = chamfer({
#   length: chamferLength,
#   tags: [arc000, getOppositeEdge(arc000)]
# }, solidRod)
# // create a sketch on the 'XY' plane for the helix
# sketch001 = startSketchOn('XY')
# // create circular sketch profile using half the rod diameter for the helix
# profile001 = circle({center: [0.000000, 0.000000], radius: rodDiameter / 2}, sketch001, $arc001)
# // create a helix for the thread profile
# helix000 = extrude(rodLength, profile001)
#   |> helix({
#        angleStart: 0.0,
#        ccw: true,
#        revolutions: rodLength / threadPitch
#      }, %)
# """

# kcl_code_completion_prompt = "Add a thick top to this rod. BE EXTREMELY DETAILED."

# prompt = simplify_original_prompt(hard_prompt)
# # Run the asynchronous function
# body = asyncio.run(simple_text_to_cad(prompt))
# initial_code = body.code

# final_code = generate_and_fix_kcl_code(initial_code, kcl_code_completion_prompt)

# # Check and print the final code
# if final_code:
#     print("\nFinal Updated KCL Code:")
#     print(final_code)
# else:
#     print("Failed to generate lint-free KCL code.")

# # kcl_code_completions(kcl_code_completion_prompt)
