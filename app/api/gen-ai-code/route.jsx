import { GenAiCode } from "@/configs/AiModel"
import { NextResponse } from "next/server"

export async function POST(req) {
    const { prompt } = await req.json();
    try {
        const result = await GenAiCode.sendMessage(prompt);
        const resp = await result.response.text(); // Await the response text
        console.log('Raw AI Response:', resp);
        const parsedResp = JSON.parse(resp);
        console.log('Parsed AI Response:', parsedResp);

        const cleanFiles = parsedResp.files || {};
        const generatedFiles = parsedResp.generatedFiles || [];

        // Filter out only the newly generated files
        const filteredFiles = Object.keys(cleanFiles)
            .filter((file) => generatedFiles.includes(file))
            .reduce((acc, file) => {
                acc[file] = cleanFiles[file];
                return acc;
            }, {});

        // Return only the new files to the frontend
        return NextResponse.json({ ...parsedResp, files: filteredFiles });
    } catch (e) {
        return NextResponse.json({ error: e.message });
    }
}