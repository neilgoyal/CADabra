import os 
import boto3
import time 
import json 
from moviepy.editor import VideoFileClip
from pydub import AudioSegment


def transcribe_mp3_file(mp3_file_path, bucket_name,  region_name, output_folder="transcripts"):
    # Ensure the output folder exists
    os.makedirs(output_folder, exist_ok=True)

    # Initialize AWS clients with specified region
    #s3_client = boto3.client("s3", region_name=region_name)

    s3_client = boto3.client(
        's3',
        aws_access_key_id= 'AKIA2KJZWMTVJJDSN2JM',
        aws_secret_access_key='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',
        region_name=region_name
    )
    transcribe_client = boto3.client("transcribe", aws_access_key_id= 'AKIA2KJZWMTVJJDSN2JM',
        aws_secret_access_key='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', region_name=region_name)
    
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

        print(f"Transcription saved to {transcript_file_path}")
    else:
        print(f"Transcription job {job_name} failed.")

    # Optional: Delete the audio file from S3
    s3_client.delete_object(Bucket=bucket_name, Key=s3_key)

    # Optional: Delete the transcription job
    transcribe_client.delete_transcription_job(TranscriptionJobName=job_name)


## call using 
    # mp3 = "audio1.mp3"
    # bucket_name = "aiatl"
    # output_folder = "transcripts"
    # region_name = "us-east-1"
