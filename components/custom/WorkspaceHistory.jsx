'use client'
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import { useConvex } from 'convex/react';
import Link from 'next/link';
import React, { use, useContext, useEffect, useState } from 'react'
import { useSidebar } from '../ui/sidebar';

function WorkspaceHistory() {
    const {userDetail,setUserDetail}=useContext(UserDetailContext);
    const convex=useConvex();
    const [workspaceList,setWorkspaceList]=useState();
    const {toggleSidebar} = useSidebar()

    useEffect(()=>{
        userDetail&&GetAllWorkspaces();
    },[userDetail])

    const GetAllWorkspaces=async()=>{
        const result=await convex.query(api.workspace.GetAllWorkspaces, {
            userId:userDetail?._id,
        });
        setWorkspaceList(result);
        console.log(result);
    }
  return (
    <div>
        <h2 className='font-medium text-lg'>Your Chats</h2>
        <div>
            {workspaceList && workspaceList.map((workspace, index) => (
                <Link href={"/workspace/"+workspace?._id} key={index}>
                <h2 onClick={toggleSidebar} className='text-sm text-gray-400 mt-2 font-light hover:text-white cursor-pointer'>
                    {workspace?.messages[0]?.content}
                </h2>
                 </Link>
            ))}
        </div>
    </div>
  )
}

export default WorkspaceHistory