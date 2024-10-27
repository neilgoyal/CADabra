from openai import OpenAI
import os
import json
import openai
from openai import OpenAI

# Set up your OpenAI API key (it should be set in your environment variables)
openai.api_key = os.getenv("")

client = OpenAI()

# obj = client.files.create(
#     file=open("gpt_finetuning_dataset.jsonl", "rb"),
#     purpose="fine-tune",
# )
# client.fine_tuning.jobs.create(training_file=str(obj.id), model="gpt-4o-2024-08-06")
# print(client.fine_tuning.jobs.list(limit=10))
# print(client.fine_tuning.jobs.retrieve("ftjob-bSszonEmoEFnPaBhrr8RTNFD").status)
# print(
#     client.fine_tuning.jobs.list_events(
#         fine_tuning_job_id="ftjob-bSszonEmoEFnPaBhrr8RTNFD", limit=10
#     )
# )
