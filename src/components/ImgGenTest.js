// import { useEffect, useRef, useState } from "react";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const prompt = 'tuxedo cat with black nose.';

// const [urlData, SeturlData] = useState("");

const ImgGen = async () => {
    const result = await openai.createImage({
        prompt,
        n: 1,
        size: "256x256",
    });
    const url = result.data.data[0].url;
    console.log(url);
}

ImgGen();