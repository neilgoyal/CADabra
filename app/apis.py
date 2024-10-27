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
from multimodal_to_text import *

app = Flask(__name__)
clear_folders(
    IMAGE_FOLDER_PATH, VIDEO_FOLDER_PATH, AUDIO_FOLDER_PATH
)  # On restarting server to upload




# Video Upload
@app.route("/videoUpload", methods=["POST"])
def videoToImages():
    try:
        video_file = request.files.get("video_file")
        n = 5  # Default to 5 frames if not specified
        output_dir = VIDEO_FOLDER_PATH

        if not video_file:
            return jsonify({"error": "No video file provided"}), 400

        # Save the video file temporarily
        os.makedirs(output_dir, exist_ok=True)
        video_path = os.path.join(output_dir, video_file.filename)
        video_file.save(video_path)
        extract_frames_from_videos(file_name=video_file.filename)  # Saved as frames
        return jsonify({"message": "Video saved successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Images Upload
@app.route("/imageUpload", methods=["POST"])
def upload_image():
    try:
        image_file = request.files.get("image_file")

        if not image_file:
            return jsonify({"error": "No image file provided"}), 400

        # Save the image file
        os.makedirs(IMAGE_FOLDER_PATH, exist_ok=True)
        image_path = os.path.join(IMAGE_FOLDER_PATH, image_file.filename)
        image_file.save(image_path)

        return jsonify({"message": "Image saved successfully", "path": image_path})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Audio Uploading
@app.route("/audioUpload", methods=["POST"])
def transcribe_mp3_file():
    try:
        # Get MP3 file and output folder from the request
        mp3_file = request.files.get("mp3_file")
        output_folder = request.form.get("output_folder", AUDIO_FOLDER_PATH)
        bucket_name = request.form.get("bucket_name", "aiatl")

        if not mp3_file:
            return jsonify({"error": "No MP3 file provided"}), 400

        mp3_file_path = os.path.join(AUDIO_FOLDER_PATH, mp3_file.filename)
        mp3_file.save(mp3_file_path)
        # Ensure the output folder exists
        os.makedirs(output_folder, exist_ok=True)

        # Initialize AWS clients with specified region
        # s3_client = boto3.client("s3", region_name=region_name)

        # Upload the MP3 file to S3
        mp3_file_name = os.path.basename(mp3_file_path)
        s3_key = f"audio/{mp3_file_name}"
        s3_client.upload_file(mp3_file_path, bucket_name, s3_key)

        # Start a transcription job
        job_name = f"transcription_job_{int(time.time())}"
        media_uri = f"s3://{bucket_name}/{s3_key}"

        transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={"MediaFileUri": media_uri},
            MediaFormat="mp3",
            LanguageCode="en-US",  # Change this if your audio is in a different language
            Settings={
                "ShowSpeakerLabels": True,
                "MaxSpeakerLabels": 2,  # Adjust based on the expected number of speakers
            },
            OutputBucketName=bucket_name,
            OutputKey=f"transcripts/{job_name}.json",
        )

        # Wait for the transcription job to complete
        print(f"Waiting for transcription job {job_name} to complete...")
        while True:
            status = transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            job_status = status["TranscriptionJob"]["TranscriptionJobStatus"]
            if job_status in ["COMPLETED", "FAILED"]:
                break
            time.sleep(5)

        if job_status == "COMPLETED":
            # Download the transcription result from S3
            transcript_file_name = f"{job_name}.json"
            transcript_file_path = os.path.join(output_folder, transcript_file_name)

            s3_client.download_file(
                bucket_name, f"transcripts/{job_name}.json", transcript_file_path
            )

            s3_client.delete_object(Bucket=bucket_name, Key=s3_key)
            transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)

            return jsonify(
                {
                    "message": "Transcription successful",
                    "transcription_path": transcript_file_path,
                }
            )
        else:
            return jsonify({"error": f"Transcription job {job_name} failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Stl File upload
@app.route("/stlUpload")
def stlToImage():
    try:
        # Get the STL file from the request
        stl_file = request.files.get("stl_file")
        output_folder = IMAGE_FOLDER_PATH

        if not stl_file:
            return jsonify({"error": "No STL file provided"}), 400

        # Save the STL file temporarily
        os.makedirs(output_folder, exist_ok=True)
        stl_file_path = os.path.join(output_folder, stl_file.filename)
        stl_file.save(stl_file_path)

        figure = pyplot.figure()
        axes = figure.add_subplot(projection="3d")

        your_mesh = mesh.Mesh.from_file(stl_file_path)
        axes.add_collection3d(mplot3d.art3d.Poly3DCollection(your_mesh.vectors))

        scale = your_mesh.points.flatten()
        axes.auto_scale_xyz(scale, scale, scale)

        output_filename = IMAGE_FOLDER_PATH + "/model.jpg"
        pyplot.savefig(output_filename, format="jpg", bbox_inches="tight")
        pyplot.close()

        return jsonify(
            {"message": "Image generated successfully", "image_path": output_filename}
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/kcltostep", methods=["POST"])
def convert_kcl_to_obj():
    try:
        # Get filename from the request
        filename = request.form.get("filename")
        if not filename or not filename.endswith(".kcl"):
            return jsonify({"error": "Invalid filename provided"}), 400

        # Define paths
        base_dir = os.path.dirname(os.path.dirname(__file__))  # Base path for 'cadabra'
        output_dir = os.path.join(base_dir, "cadabra-vis/public/assets")
        output_filename = filename.replace(".kcl", ".glb")
        generated_file_path = os.path.join(output_dir, "output.glb")
        final_output_file_path = os.path.join(output_dir, output_filename)
        kcl_file_path = os.path.join(output_dir, filename)

        # Run the zoo kcl export command with the output as a directory
        command = f"zoo kcl export --output-format=glb {kcl_file_path} {output_dir}"
        process = subprocess.run(command, shell=True, capture_output=True, text=True)

        # Check for errors
        if process.returncode != 0:
            return jsonify({"error": process.stderr}), 400

        # Rename the generated output file to match the input filename
        if os.path.exists(generated_file_path):
            os.rename(generated_file_path, final_output_file_path)
        else:
            return jsonify({"error": "Conversion file not found"}), 500

        return jsonify(
            {
                "message": "Conversion successful!",
                "output_dir": output_dir,
                "output_file": output_filename,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=4500)
