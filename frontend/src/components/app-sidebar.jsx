import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Transactions",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "All Transactions",
          url: "/all-transactions",
        },
        {
          title: "Add New Transaction",
          url: "#",
        },
        {
          title: "Recurring Transactions",
          url: "#",
        },
        {
          title: "Categories",
          url: "#",
        },
      ],
    },
    {
      title: "Budgeting",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Current Budgets",
          url: "#",
        },
        {
          title: "New Budget",
          url: "#",
        },
        {
          title: "Budget Alerts",
          url: "#",
        },
        {
          title: "Budget Recommendations",
          url: "#",
        },
      ],
    },
    {
      title: "Goals & Savings",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "My Goals",
          url: "#",
        },
        {
          title: "New Goal",
          url: "#",
        },
        {
          title: "TSavings History",
          url: "#",
        },
      ],
    },
    {
      title: "Multi-Currency Support",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Manage Currencies",
          url: "#",
        },
        {
          title: "Exchange Rates",
          url: "#",
        },
        {
          title: "Currency Conversion ",
          url: "#",
        },
      ],
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail></SidebarRail>
    </Sidebar>)
  );
}
