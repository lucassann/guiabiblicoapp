import {
  LayoutDashboard,
  Settings,
  Users,
  Command,
  BookOpen
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@guiabiblico.com',
    avatar: '',
  },
  teams: [
    {
      name: 'Guia Bíblico',
      logo: Command,
      plan: 'Admin Panel',
    }
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Visão Geral',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Membros',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Biblioteca',
          url: '/materials',
          icon: BookOpen,
        },
        {
          title: 'Pão Diário',
          url: '/daily-bread',
          icon: BookOpen, // Can change later if we have another icon
        },
        {
          title: 'Configurações',
          url: '/settings',
          icon: Settings,
        }
      ],
    }
  ],
}
