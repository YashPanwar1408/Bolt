'use client'
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import MDEditor from '@uiw/react-md-editor';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Link, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';
import { toast } from 'sonner';
// import ReactMarkdown from 'react-markdown';

export const countToken=(inputText)=>{
    return inputText.trim().split(/\s+/).filter(word=>word).length;
}

function ChatView() {
    const { id } = useParams();
    const convex = useConvex();
    const { userDetail, setUserDetail } = useContext(UserDetailContext);
    const { messages, setMessages } = useContext(MessagesContext);
    const [userInput, setUserInput] = useState(); // Correctly use useState
    const [loading, setLoading] = useState(false); // Correctly use useState
    const UpdateMessages = useMutation(api.workspace.UpdateMessages);
    const {toggleSidebar} = useSidebar();
    const UpdateTokens = useMutation(api.users.UpdateToken);

    useEffect(() => {
        id && GetWorkspaceData();
    }, [id]);

    const GetWorkspaceData = async () => {
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id,
        });
        setMessages(Array.isArray(result?.messages) ? result.messages : []); // Ensure it's an array
        console.log(result);
    };

    const GetAiResponse = async () => {
        try {
            setLoading(true);
            const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
            const result = await axios.post('/api/ai-chat', {
                prompt: PROMPT,
            });
            console.log('AI Chat Response:', result.data);

            const aiResp = {
                role: 'ai',
                content: result.data.result,
            };

            setMessages((prev) => [...prev, aiResp]);

            await UpdateMessages({
                messages: [...messages, aiResp],
                workspaceId: id,
            });

            const token=Number(userDetail?.token)-Number(countToken(JSON.stringify(aiResp)));
            setUserDetail(prev => ({
                ...prev,
                token: token,
            }));
            //update token to database
            await UpdateTokens({
                userId: userDetail?._id,
                token: token,
            })
            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (messages?.length > 0) {
            const role = messages[messages.length - 1]?.role;
            if (role === 'user') {
                GetAiResponse();
            }
        }
    }, [messages]);

    const onGenerate = (input) => {
        if(userDetail?.token < 10){
            toast('You dont have enough tokens to generate!')
            return ;
        }
        setMessages((prev) => [
            ...prev,
            {
                role: 'user',
                content: input,
            },
        ]);
        setUserInput('');
    };
    return (
        <div className="relative h-[85vh] flex flex-col">
            <div className="flex-1 pl-5 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-hide">
                    {Array.isArray(messages) &&
                        messages.map((msg, index) => (
                            <div
                                key={index}
                                className="p-3 rounded-lg mb-2 flex gap-2 items-center leading-7"
                                style={{
                                    backgroundColor: Colors.CHAT_BACKGROUND,
                                }}
                            >
                                {msg?.role === 'user' && (
                                    <Image
                                        src={userDetail?.picture}
                                        alt="userImage"
                                        width={35}
                                        height={35}
                                        className="rounded-full"
                                    />
                                )}
                                <MDEditor.Markdown
                                    source={msg.content}
                                    style={{
                                        backgroundColor: 'transparent',
                                        color: 'inherit',
                                        fontSize: '1rem',
                                        lineHeight: '1.6',
                                        padding: '0.5rem',
                                    }}
                                />
                            </div>
                        ))}
                    {loading && (
                        <div className="p-3 rounded-lg mb-2 flex gap-2 items-center">
                            <Loader2Icon className="animate-spin" />
                            <h2>Generating response...</h2>
                        </div>
                    )}
                </div>
            </div>
            {/* Input section */}
            <div className='flex gap-2 items-end'>
              {userDetail && <Image src={userDetail?.picture} className='rounded-full cursor-pointer' onClick={toggleSidebar} alt='user' width={30} height={30} />}
                <div
                    className="p-5 border rounded-xl max-w-xl w-full mt-3"
                    style={{ backgroundColor: Colors.BACKGROUND }}
                >
                    <div className="flex gap-2">
                        <textarea
                            placeholder={Lookup.INPUT_PLACEHOLDER}
                            value={userInput}
                            onChange={(event) => setUserInput(event.target.value)}
                            className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"
                        />
                        {userInput && (
                            <ArrowRight
                                onClick={() => onGenerate(userInput)}
                                className="bg-blue-500 p-2 h-8 w-8 cursor-pointer rounded-md"
                            />
                        )}
                    </div>
                    <div>
                        <Link className="h-5 w-5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ChatView;