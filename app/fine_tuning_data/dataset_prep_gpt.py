import os
import json
import openai
from openai import OpenAI

# Set up your OpenAI API key (it should be set in your environment variables)
openai.api_key = os.getenv("")

kcl_folder_path = "documentation/content/pages/docs/kcl/types"
output_file_path = "kcl_documentation_training_data_gpt.jsonl"

client = OpenAI()


# Function to create a question based on KCL documentation content focused on function usage
def generate_question(content):
    try:
        # Ask GPT to create a question specifically about function usage in KCL
        response = client.chat.completions.create(
            model="gpt-4o",  # Adjust this to the specific model you have access to
            messages=[
                {
                    "role": "system",
                    "content": "Generate a relevant and detailed question about the function usage in KCL based on the following content.",
                },
                {
                    "role": "user",
                    "content": f"Create a question that asks about the function usage, purpose, or example usage for the following KCL content:\n\n{content.strip()}",
                },
            ],
            max_tokens=1000,
            temperature=0,
        )
        # Retrieve the generated question
        question = response.choices[0].message.content
        return question
    except Exception as e:
        print(f"Error generating question: {e}")
        return None


# Function to generate an answer based on the generated question with emphasis on function use
def generate_answer(question, content):
    try:
        # Ask GPT to provide an answer focused on function usage within KCL
        response = client.chat.completions.create(
            model="gpt-4o",  # Adjust this to the specific model you have access to
            messages=[
                {
                    "role": "system",
                    "content": "Provide a detailed answer about the function usage in KCL based on the following question and context.",
                },
                {
                    "role": "user",
                    "content": f"Question:\n{question}\n\nContext (related to KCL function usage):\n{content.strip()}",
                },
            ],
            max_tokens=1024,
            temperature=0,
        )
        # Retrieve the generated answer
        answer = response.choices[0].message.content
        return answer
    except Exception as e:
        print(f"Error generating answer: {e}")
        return None


# Main function to generate Q&A pairs and save in JSONL format
def generate_qa_pairs(file_path):
    with open(file_path, "r") as file:
        content = file.read()

    # Generate a question based on the content focused on function usage
    question = generate_question(content)
    if not question:
        return None  # Skip if question generation fails

    # Generate an answer to the question focused on function usage
    answer = generate_answer(question, content)
    if not answer:
        return None  # Skip if answer generation fails

    # Construct the entry with the generated Q&A
    return {
        "system": "The following QA pair is based on KCL (KittCAD Language) documentation, a language for defining geometry and working with a Geometry Engine, demonstrating the usage and functionality of KCL functions.",
        "messages": [
            {"role": "user", "content": question},
            {"role": "assistant", "content": answer},
        ],
    }


# Function to process files and generate JSONL data iteratively
def generate_training_data(folder_path, output_file):
    # Open the output file in append mode
    with open(output_file, "a") as out_file:
        # Walk through all files in the specified directory
        for root, _, files in os.walk(folder_path):
            for file_name in files:
                file_path = os.path.join(root, file_name)

                # Generate Q&A pair for each file
                qa_entry = generate_qa_pairs(file_path)
                if qa_entry:
                    # Write each Q&A entry to the file immediately
                    out_file.write(json.dumps(qa_entry) + "\n")

    print(f"QA pairs generated and saved to {output_file}")


# Execute the function to generate the training data
generate_training_data(kcl_folder_path, output_file_path)
