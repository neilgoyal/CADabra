import anthropic
import base64
import filetype
from PIL import Image
import io
import math
import time
from kittycad.api.ml import create_text_to_cad, get_text_to_cad_model_for_user
from kittycad.client import ClientFromEnv
from kittycad.models import (
    ApiCallStatus,
    Error,
    FileExportFormat,
    TextToCad,
    TextToCadCreateBody,
)
import cv2

client_claude = anthropic.Anthropic()
# Create our client.
client_zoo = ClientFromEnv()

def prepare_image(img_path, max_size=100*1024*1024):
    with Image.open(img_path) as img:
        if img.mode == 'RGBA':
            img = img.convert('RGB')

        quality = 85
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=quality)
        img_byte_arr = img_byte_arr.getvalue()
        
        while len(img_byte_arr) > max_size and quality > 5:
            quality -= 5
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=quality)
            img_byte_arr = img_byte_arr.getvalue()
        
        # mostly not needed
        if len(img_byte_arr) > max_size:
            raise ValueError(f"Image size exceeds {max_size/1024/1024}MB limit")
            
        data = base64.b64encode(img_byte_arr).decode('utf-8')
        #media_type = filetype.guess(img_path).mime
        media_type = 'image/jpeg'

        return data, media_type



def generate_claude_prompt(images, text=None, supporting=True):
    content = []
    for image in images:
        data, media_type = prepare_image(image)
        individual_image = {
            "type": "image",
            "source":{
                "type":"base64",
                "media_type":media_type,
                "data":data
            }
        }
        content.append(individual_image)
    
    if text is not None and supporting:
        supporting_user_instructions = {
            "type": "text",
            "text": "Describe this image."
        }
        content.append(supporting_user_instructions)


    message = client_claude.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        temperature=0,
        system="""
            You are responsible for designing a precise prompt for Zoo's Text-to-CAD API. You may receive text, images, or both. If multiple images are provided, they represent the same object and should be used together for context. The prompt must be 100 words or less.

            Prompt Writing Tips:

            1. Describe the object using clear geometric shapes and measurable dimensions, avoiding abstract concepts.
            2. Focus solely on geometry, dimensions, angles, radii, and spatial arrangements. Avoid mentioning colors, textures, or materials.
            3. Be explicit about placement, alignment, and spacing of features.
            4. Include only essential geometric details to maintain brevity while ensuring CAD model accuracy.
        """,
        messages=[
            {
                "role": "user",
                "content": content
            }
        ]
    )

    return message.content[0].text


def t2Cad(claude_prompt):
    # Prompt the API to generate a 3D model from text.
    response = create_text_to_cad.sync(
        client=client_zoo,
        output_format=FileExportFormat.GLB,
        body=TextToCadCreateBody(
            prompt=claude_prompt
        ),
    )

    if isinstance(response, Error) or response is None:
        print(f"Error: {response}")
        exit(1)

    result: TextToCad = response

    # Polling to check if the task is complete
    while result.completed_at is None:
        # Wait for 5 seconds before checking again
        time.sleep(5)

        # Check the status of the task
        response = get_text_to_cad_model_for_user.sync(
            client=client_zoo,
            id=result.id,
        )

        if isinstance(response, Error) or response is None:
            print(f"Error: {response}")
            exit(1)

        result = response

    if result.status == ApiCallStatus.FAILED:
        # Print out the error message
        print(f"Text-to-CAD failed: {result.error}")

    elif result.status == ApiCallStatus.COMPLETED:
        if result.outputs is None:
            print("Text-to-CAD completed but returned no files.")
            exit(0)

        # Print out the names of the generated files
        print(f"Text-to-CAD completed and returned {len(result.outputs)} files:")
        for name in result.outputs:
            print(f"  * {name}")

        final_result = result.outputs["source.step"]
        with open("text-to-cad-output.step", "w", encoding="utf-8") as output_file:
            output_file.write(final_result.decode("utf-8"))
            print(f"Saved output to {output_file.name}")


paths = ['image1.jpeg','image2.jpeg']
zoo_prompt = generate_claude_prompt(paths)
print(zoo_prompt)
t2Cad(zoo_prompt)


# text - goes through gpt, becomes a detailed prompt
# audio - transcribed to text, same pipeline as text
# image - goes to gpt, becomes detailed prompt
# video - capture meaningful images, same pipeline as image
# for now, meaningful images will just mean a picture taken every 2 seconds (or some percentage of the length)