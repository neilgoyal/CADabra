import base64
import json
from flask import Flask, jsonify, request
from stl import mesh
from mpl_toolkits import mplot3d
from matplotlib import pyplot
import cv2
import os
import boto3
import time
import json
from moviepy.editor import VideoFileClip
from pydub import AudioSegment
import subprocess
import io
import base64
from PIL import Image
import json
import openai
from openai import OpenAI
from pydantic import BaseModel
import shutil

client = OpenAI()


# Set up your OpenAI API key (it should be set in your environment variables)
openai.api_key = os.getenv(
    ""
)


IMAGE_FOLDER_PATH = "./images_gen"
VIDEO_FOLDER_PATH = "./videos_gen"
AUDIO_FOLDER_PATH = "./audios_gen"


def clear_folders(*folders):
    """Clears all files and subdirectories in the specified folders."""
    for folder in folders:
        if os.path.exists(folder):
            shutil.rmtree(folder)  # Delete the folder and its contents
        os.makedirs(folder, exist_ok=True)  # Recreate the empty folder


def prepare_image(image):
    media_type = "image/jpeg"
    try:
        # Get image file and max size from the request
        img_file = image
        max_size = int(1024 * 1024)  # Default to 1MB
        if not img_file:
            print("No image")
            return (None, media_type)

        # Open the image
        img = Image.open(img_file)

        # Convert RGBA to RGB if necessary
        if img.mode == "RGBA":
            img = img.convert("RGB")

        quality = 85
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format="JPEG", quality=quality)
        img_byte_arr = img_byte_arr.getvalue()

        # Adjust quality to meet the max size constraint
        while len(img_byte_arr) > max_size and quality > 5:
            quality -= 5
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format="JPEG", quality=quality)
            img_byte_arr = img_byte_arr.getvalue()

        # If the image still exceeds max size, return an error
        if len(img_byte_arr) > max_size:
            print("Max size exceeded")
            return (None, media_type)

        # Encode the image in base64
        data = base64.b64encode(img_byte_arr).decode("utf-8")

        return data, media_type

    except Exception as e:
        return (None, media_type)


# For structured outputs
class SimplifiedPrompt(BaseModel):
    new_prompt: str


def extract_frames_from_videos(
    file_name,
    input_folder=VIDEO_FOLDER_PATH,
    output_folder=IMAGE_FOLDER_PATH,
    n=3,
):
    # Ensure output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Iterate through each file in the input folder
    for video_filename in os.listdir(input_folder):
        if video_filename == file_name:
            video_path = os.path.join(input_folder, video_filename)

            # Check if the file is a video by extension (you can adjust extensions as needed)
            if video_filename.lower().endswith((".mp4", ".avi", ".mov", ".mkv")):
                cap = cv2.VideoCapture(video_path)
                if not cap.isOpened():
                    print(f"Unable to open video file: {video_filename}")
                    continue

                total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
                if total_frames < n:
                    print(
                        f"Video {video_filename} has fewer frames ({total_frames}) than requested ({n})"
                    )
                    cap.release()
                    continue

                interval = total_frames // n
                video_output_dir = os.path.join(
                    output_folder, os.path.splitext(video_filename)[0]
                )
                os.makedirs(video_output_dir, exist_ok=True)
                frame_paths = []

                for i in range(n):
                    frame_pos = i * interval
                    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)

                    ret, frame = cap.read()
                    if not ret:
                        print(
                            f"Failed to read frame at position {frame_pos} in video {video_filename}"
                        )
                        continue

                    frame_filename = os.path.join(
                        video_output_dir, f"frame_{i + 1}.jpg"
                    )
                    frame_paths.append(frame_filename)
                    cv2.imwrite(frame_filename, frame)

                print(
                    f"Extracted {len(frame_paths)} frames from {video_filename} into {video_output_dir}"
                )
                cap.release()












def answer_user_prompt(
    image_folder_path=IMAGE_FOLDER_PATH,
    audio_folder_path=AUDIO_FOLDER_PATH,
    text="",
    supporting=True,
):
    # Create content list to hold image and text data
    content = []

    # Iterate over each file in the folder
    for filename in os.listdir(str(image_folder_path)):
        # Check if the file is an image (you can adjust the extensions as needed)
        if filename.lower().endswith((".jpg", ".jpeg", ".png")):
            # Read and encode the image as base64
            with open(os.path.join(image_folder_path, filename), "rb") as image_file:
                encoded_image = base64.b64encode(image_file.read()).decode("utf-8")

            # Create the image_url dictionary similar to the specified format
            image_content = {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{encoded_image}",
                    "detail": "low",
                },
            }
            content.append(image_content)

    # Adding audio transcript data
    for filename in os.listdir(str(audio_folder_path)):
        if filename.lower().endswith(".json"):
            with open(
                os.path.join(audio_folder_path, filename), "r", encoding="utf-8"
            ) as json_file:
                transcript_content = (
                    json_file.read().strip()
                )  # Read the file as a plain string
                text.append(transcript_content)

    # Add optional supporting user instructions if text is provided
    if text is not None and supporting:
        supporting_user_instructions = {
            "type": "text",
            "text": f"Give me a detailed description of the SINGLE object in this image. Here is MORE DETAILED information about it {text}",
        }
        content.append(supporting_user_instructions)

    # Set up the response using the GPT API with model, messages, and system instructions
    response = client.beta.chat.completions.parse(
        model="ft:gpt-4o-2024-08-06:personal::AMbJgbdO",
        messages=[
            {
                "role": "system",
                "content": """
                You are responsible for designing a precise prompt for a Text-to-CAD API that uses CAD design language to generate A SINGLE CAD object. You may receive text, images, or both. If multiple images are provided, they represent the SAME object and should be used together to UNDERSTAND the context of the object in great detail. The OUTPUT MUST be 100 words or less.

                STEPS TO FOLLOW:
                1. You MUST Describe the object using clear geometric shapes and measurable dimensions, avoiding abstract concepts.
                2. Focus solely on geometry, dimensions, angles, radii, and spatial arrangements. Avoid mentioning colors, textures, or materials.
                3. Be explicit about placement, alignment, and spacing of features.
                4. Include ONLY essential geometric details AND BE CONCISE!!

                The output must be a SHORT, SIMPLE description of ONE OBJECT (~15 words) to design a CAD model for!!
            """,
            },
            {"role": "user", "content": content},
        ],
        temperature=0,
        response_format=SimplifiedPrompt,
    )

    # Extract and return the generated prompt text from the response
    simplified_prompt = json.loads(response.choices[0].message.content.strip())
    # Return the simplified prompt as structured JSON
    return simplified_prompt["new_prompt"]
