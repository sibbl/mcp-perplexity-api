// source: https://github.com/ppl-ai/modelcontextprotocol/blob/main/perplexity-ask/index.ts

/**
MIT License

Copyright (c) 2025 perplexity

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * Performs a chat completion by sending a request to the Perplexity API.
 * Appends citations to the returned message content if they exist.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @returns {Promise<string>} The chat completion result with appended citations.
 * @throws Will throw an error if the API request fails.
 */
export async function performChatCompletion(
  apiKey: string,
  model: string,
  messages: Array<{ role: string; content: string }>
): Promise<string> {
  // Construct the API endpoint URL and request body
  const url = new URL("https://api.perplexity.ai/chat/completions");
  const body = {
    model, // Model identifier; adjust as needed
    messages: messages
    // Additional parameters can be added here if required (e.g., max_tokens, temperature, etc.)
    // See the Sonar API documentation for more details:
    // https://docs.perplexity.ai/api-reference/chat-completions
  };

  let response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  // Check for non-successful HTTP status
  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  // Attempt to parse the JSON response from the API
  let data : any;
  try {
    data = await response.json();
  } catch (jsonError) {
    throw new Error(
      `Failed to parse JSON response from Perplexity API: ${jsonError}`
    );
  }

  // Directly retrieve the main message content from the response
  let messageContent = data.choices[0].message.content;

  // If citations are provided, append them to the message content
  if (
    data.citations &&
    Array.isArray(data.citations) &&
    data.citations.length > 0
  ) {
    messageContent += "\n\nCitations:\n";
    data.citations.forEach((citation: string, index: number) => {
      messageContent += `[${index + 1}] ${citation}\n`;
    });
  }

  return messageContent;
}
