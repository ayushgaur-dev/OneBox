
import os
from google import genai

api_key = os.environ["GEMINI_API_KEY"]

client = genai.Client(api_key=api_key)

response = client.models.generate_content(
    model="gemini-3.5-flash",
    contents="Summarize in one sentence: Submit the DBMS assignment by Friday."
)

print("Gemini response:")
print(response.text)
