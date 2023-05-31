import { Configuration, OpenAIApi } from "openai";
// OpenAI API 환경 변수 설정
const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/*
  System Prompt 설정
  이 설정에 따라 AI 의 대답의 유형을 다르게 만들 수 있음
  단, 이 설정을 항상 확실히 참조하지는 않음
  이 설정은 메시지 목록의 첫 번째 메시지로 사용됨
*/
const systemPrompt =
  "입력된 내용들을 하나의 짧은 문장으로 요약해서 알려줘.";

export default async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  // POST 로 전송받은 내용 중 messages 를 추출
  const { messages } = req.body;

  // console.log([
  //   { role: "system", content: systemPrompt },
  //   ...messages.slice(-6),
  // ]);

  // API Reference: https://platform.openai.com/docs/api-reference/chat/create
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    // temperature 값이 높을 수록 AI 의 답변이 다양해짐
    temperature: 0.7,
    // max_tokens 값을 제한함. 이 값을 크게하면 컨텍스트 히스토리에 제약이 커짐.
    max_tokens: 512,
    /*
      전체 프롬프트를 묶어서 보냄
      system 은 항상 처음에 와야 함
      컨텍스트 유지를 위해 이전 메시지를 포함해서 보냄 (6개, 즉 대화 3개의 페어)
    */
    messages: [
      { role: "system", content: systemPrompt },
      ...messages,
    ],
  });

  // console.log(completion.data.choices[0].message);

  res.status(200).json({
    // AI 의 답변은 assistant 역할로 전송
    role: "assistant",
    // AI 의 답변은 choices[0].text 에 있음
    // 상세한 Response 형식은 다음을 참조 : https://platform.openai.com/docs/api-reference/chat/create
    content: completion.data.choices[0].message.content,
  });
};


