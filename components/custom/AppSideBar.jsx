import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import Image from 'next/image'
import { Button } from '../ui/button'
import { MessageCircleCode } from 'lucide-react'
import WorkspaceHistory from './WorkspaceHistory'
import SideBarFooter from './SideBarFooter'

const AppSideBar = () => {
  return (
    <div>
         <Sidebar>
      <SidebarHeader className="p-4">
      <Image src={'/logo.webp'} alt='logo' height={30} width={30} />
        <Button> <MessageCircleCode/> Start new Chat</Button>
      </SidebarHeader>
      <SidebarContent className="p-5">
        <SidebarGroup>
        <WorkspaceHistory/>
        </SidebarGroup>
        {/* <SidebarGroup /> */}
      </SidebarContent>
      <SidebarFooter >
        <SideBarFooter/>
      </SidebarFooter>
    </Sidebar>
    </div>
  )
}

export default AppSideBar