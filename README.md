# [Idea Generator](https://ideagenerator-xyz.vercel.app/)

Type in any keyword to generate creative ideas for an IT service!

https://user-images.githubusercontent.com/29723695/221411205-78d52d5f-a5bd-4c18-87eb-da162c61bd56.MOV


## How it works

It uses GPT-3 model provided by [OpenAI](https://platform.openai.com/docs/models/gpt-3) to generate creative ideas from the given keyword. This application takes a keyword from you, combines it with the prompt you define in .env file, and sends it through the OpenAI's api using a Next.js API route. It then returns an idea generated from the keyword. Furthermore, you can construct an [XYZ Hypothesis](https://www.youtube.com/watch?v=4sZMHAMN0DQ) based on the generated idea.

## Running Locally

### Cloning the repository the local machine.

```bash
git clone
```

### Creating a account on OpenAI to get an API key.

1. Go to [OpenAI](https://openai.com/api/) to make an account.
2. Click on your profile picture in the top right corner, and click on "View API Keys".
3. Click on "Create new secret key". Copy the secret key.


### Storing API key in .env file.

Create a file in root directory of project with env. And store your API key in it, as shown in the .example.env file.


If you'd also like to do rate limiting, create an account on UpStash, create a Redis database, and populate the two environment variables in `.env` as well. If you don't want to do rate limiting, you don't need to make any changes.

### Installing the dependencies.

```bash
yarn install
```

### Running the application.

Then, run the application in the command line and it will be available at `http://localhost:3000`.

```bash
yarn dev
```
