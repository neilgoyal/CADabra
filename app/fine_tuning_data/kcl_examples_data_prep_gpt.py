import os
import json
import openai
from openai import OpenAI

# Set up your OpenAI API key (it should be set in your environment variables)
openai.api_key = os.getenv("")
client = OpenAI()

# kcl_folder_path = "documentation/content/pages/docs/kcl"
kcl_example_files = "kcl-samples"  # Go through all folders

output_file_path = "kcl_examples_training_data.jsonl"


# Function to create a question based on KCL documentation content focused on function usage
def generate_question(content, file_name):
    try:
        # Ask GPT to create a question specifically about function usage in KCL
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Adjust based on available model
            messages=[
                {
                    "role": "system",
                    "content": "You are tasked with creating relevant questions that ask about the purpose, functionality, or example usage of KCL code based on the following content.",
                },
                {
                    "role": "user",
                    "content": f"Based on the KCL file '{file_name}', create a question that asks what the code does or how it achieves its goal:\n\n{content.strip()}",
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


# Main function to generate Q&A pairs and save in JSONL format
def generate_qa_pairs(file_path, file_name):
    with open(file_path, "r") as file:
        content = file.read()

    # Generate a question based on the content focused on function usage
    question = generate_question(content, file_name)
    if not question:
        return None  # Skip if question generation fails

    # Use the content itself as the answer
    answer = content.strip()

    # Construct the entry with the generated Q&A
    return {
        "system": "The following QA pair is based on KCL (KittyCAD Language) documentation, demonstrating the usage and functionality of KCL functions for generating specific CAD designs.",
        "messages": [
            {"role": "user", "content": question},
            {"role": "assistant", "content": answer},
        ],
    }


# Function to process each .kcl file in subdirectories and generate JSONL data iteratively
def generate_training_data(folder_path, output_file):
    with open(output_file, "a") as out_file:
        # Walk through all subdirectories in the specified directory
        for root, dirs, _ in os.walk(folder_path):
            for dir_name in dirs:
                kcl_file_path = os.path.join(root, dir_name, f"{dir_name}.kcl")

                # Check if the .kcl file exists
                if os.path.isfile(kcl_file_path):
                    # Generate Q&A pair for each .kcl file
                    qa_entry = generate_qa_pairs(kcl_file_path, dir_name)
                    if qa_entry:
                        # Write each Q&A entry to the file immediately
                        out_file.write(json.dumps(qa_entry) + "\n")
                        print(f"Processed {kcl_file_path} and saved Q&A.")

    print(f"QA pairs generated and saved to {output_file}")


# Execute the function to generate the training data
generate_training_data(kcl_example_files, output_file_path)
