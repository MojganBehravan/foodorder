# Use a base image with Node.js and Python
FROM python:3.12

# Install Node.js and npm
RUN apt update && apt install -y nodejs npm

# Install Firebase CLI globally
RUN npm install -g firebase-tools

# Set the working directory for the entire project (root)
WORKDIR /app

# Copy the entire project (including public and functions folders) into the container
COPY . .

# Install Python dependencies (for functions), using the correct path to requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Expose Firebase default ports (optional)
EXPOSE 5000 8080 4000 9005 4500

# Run Firebase Serve (Only Hosting & Functions)
CMD ["firebase", "serve", "--only", "hosting,functions"]
