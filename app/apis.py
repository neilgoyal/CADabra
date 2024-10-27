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

app = Flask(__name__)

@app.route('/prepare_image', methods=['POST'])
def prepare_image():
    try:
        # Get image file and max size from the request
        img_file = request.files.get('image')
        max_size = int(request.form.get('max_size', 1024 * 1024))  # Default to 1MB

        if not img_file:
            return jsonify({"error": "No image file provided"}), 400

        # Open the image
        img = Image.open(img_file)
        
        # Convert RGBA to RGB if necessary
        if img.mode == 'RGBA':
            img = img.convert('RGB')

        quality = 85
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=quality)
        img_byte_arr = img_byte_arr.getvalue()

        # Adjust quality to meet the max size constraint
        while len(img_byte_arr) > max_size and quality > 5:
            quality -= 5
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG', quality=quality)
            img_byte_arr = img_byte_arr.getvalue()

        # If the image still exceeds max size, return an error
        if len(img_byte_arr) > max_size:
            return jsonify({"error": f"Image size exceeds {max_size / 1024 / 1024}MB limit"}), 400

        # Encode the image in base64
        data = base64.b64encode(img_byte_arr).decode('utf-8')
        media_type = 'image/jpeg'

        return jsonify({"image_data": data, "media_type": media_type})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/videoToImages', methods=['POST'])
def videoToImages():
    try:
        video_file = request.files.get('video_file')
        n = 5  # Default to 5 frames if not specified
        output_dir = 'outputFrames'

        if not video_file:
            return jsonify({"error": "No video file provided"}), 400

        # Save the video file temporarily
        os.makedirs(output_dir, exist_ok=True)
        video_path = os.path.join(output_dir, video_file.filename)
        video_file.save(video_path)
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return jsonify({"error": "Unable to open video file"}), 500

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames < n:
            return jsonify({"error": f"Video has fewer frames ({total_frames}) than requested ({n})"}), 400

        interval = total_frames // n
        video_paths = []

        for i in range(n):
            frame_pos = i * interval
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_pos)

            ret, frame = cap.read()
            if not ret:
                continue

            frame_filename = os.path.join(output_dir, f"frame_{i + 1}.jpg")
            video_paths.append(frame_filename)
            cv2.imwrite(frame_filename, frame)

        cap.release()
        return jsonify({"message": "Frames extracted successfully", "frame_paths": frame_paths})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/stltoImage')
def stlToImage(path):
    try:
        # Get the STL file from the request
        stl_file = request.files.get('stl_file')
        output_folder = 'outputImages'

        if not stl_file:
            return jsonify({"error": "No STL file provided"}), 400

        # Save the STL file temporarily
        os.makedirs(output_folder, exist_ok=True)
        stl_file_path = os.path.join(output_folder, stl_file.filename)
        stl_file.save(stl_file_path)

        figure = pyplot.figure()
        axes = figure.add_subplot(projection='3d')

        your_mesh = mesh.Mesh.from_file(path)
        axes.add_collection3d(mplot3d.art3d.Poly3DCollection(your_mesh.vectors))

        scale = your_mesh.points.flatten()
        axes.auto_scale_xyz(scale, scale, scale)

        output_filename = 'outputImages/model.jpg'
        pyplot.savefig(output_filename, format='jpg', bbox_inches='tight')
        pyplot.close()
        
        return jsonify({"message": "Image generated successfully", "image_path": output_filename})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/audiototext', methods=['POST'])
def transcribe_mp3_file():
    try:
        # Get MP3 file and output folder from the request
        mp3_file = request.files.get('mp3_file')
        output_folder = request.form.get('output_folder', 'transcripts')
        bucket_name = request.form.get('bucket_name', 'aiatl')
        
        if not mp3_file:
            return jsonify({"error": "No MP3 file provided"}), 400

        # Ensure the output folder exists
        os.makedirs(output_folder, exist_ok=True)

        # Initialize AWS clients with specified region
        #s3_client = boto3.client("s3", region_name=region_name)
        
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
            status = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
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

            return jsonify({"message": "Transcription successful", "transcription_path": transcript_file_path})
        else:
            return jsonify({"error": f"Transcription job {job_name} failed"}), 500

    except Exception as e:
        return jsonify({"error": str(e)}), 500


## call using 
    # mp3 = "audio1.mp3"
    # bucket_name = "aiatl"
    # output_folder = "transcripts"
    # region_name = "us-east-1"

@app.route('/kcltostep', methods=['POST'])
def convert_kcl_to_obj():
    try:
        kcl_file = request.files.get('kcl_file')
        #output_dir = request.form.get('output_dir')
        output_dir = 'step_output'

        # Save the uploaded KCL file temporarily
        kcl_file_path = os.path.join(output_dir, kcl_file.filename)
        kcl_file.save(kcl_file_path)

        # Build the command to run in CLI
        command = f"zoo kcl export --output-format=obj {kcl_file_path} {output_dir}"

        # Run the command
        process = subprocess.run(command, shell=True, capture_output=True, text=True)

        # Check for errors
        if process.returncode != 0:
            return jsonify({"error": process.stderr}), 400

        return jsonify({"message": "Conversion successful!", "output_dir": output_dir})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)