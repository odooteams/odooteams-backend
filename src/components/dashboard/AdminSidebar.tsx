import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  HelpCircle, 
  BookOpen, 
  BarChart3, 
  LogOut, 
  Users, 
  FileEdit, 
  Shield, 
  Settings, 
  MessageSquare, 
  UsersRound, 
  MessageCircle, 
  Calendar, 
  Bot, 
  KeyRound, 
  ClipboardList,
  Globe,
  ChevronDown,
  Archive,
  Search as SearchIcon
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Dashboard',
    items: [
      { title: 'Overview', url: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Analytics',
    items: [
      // { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
      { title: 'Visitors', url: '/admin/visitors', icon: Globe },
    ]
  },
  {
    label: 'User Management',
    items: [
      { title: 'Users', url: '/admin/users', icon: Users },
      { title: 'Permissions', url: '/admin/permissions', icon: KeyRound },
      { title: 'Audit Logs', url: '/admin/audit-logs', icon: ClipboardList },
    ]
  },
  {
    label: 'Content',
    items: [
      { title: 'Services', url: '/admin/services', icon: Briefcase },
      { title: 'Projects', url: '/admin/projects', icon: FileText },
      { title: 'Blogs', url: '/admin/blogs', icon: FileEdit },
      { title: 'Resources', url: '/admin/resources', icon: BookOpen },
      { title: 'FAQs', url: '/admin/faqs', icon: HelpCircle },
    ]
  },
  {
    label: 'Team & Testimonials',
    items: [
      { title: 'Team Members', url: '/admin/team', icon: UsersRound },
      { title: 'Testimonials', url: '/admin/testimonials', icon: MessageCircle },
      { title: 'Timeline', url: '/admin/timeline', icon: Calendar },
    ]
  },
  {
    label: 'Communication',
    items: [
      { title: 'Messages', url: '/admin/messages', icon: MessageSquare },
      { title: 'Chatbot', url: '/admin/chatbot', icon: Bot },
    ]
  },
  {
    label: 'Settings',
    items: [
      { title: 'SEO', url: '/admin/seo', icon: SearchIcon },
      { title: 'Security', url: '/admin/security', icon: Shield },
      { title: 'Policies', url: '/admin/policies', icon: Shield },
      { title: 'Backups', url: '/admin/backups', icon: Archive },
      { title: 'Settings', url: '/admin/settings', icon: Settings },
    ]
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isCollapsed = state === 'collapsed';
  
  // Track which groups are open
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    // Initialize all groups as open
    const initial: Record<string, boolean> = {};
    menuGroups.forEach(group => {
      initial[group.label] = true;
    });
    return initial;
  });

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isItemActive = (url: string) => {
    if (url === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="pt-2">
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label} className="py-1">
            {isCollapsed ? (
              // When collapsed, show items without group labels
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <NavLink
                          to={item.url}
                          end={item.url === '/admin'}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200',
                            isItemActive(item.url) 
                              ? 'bg-sidebar-accent text-sidebar-primary font-medium shadow-sm' 
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            ) : (
              // When expanded, show collapsible groups
              <Collapsible
                open={openGroups[group.label]}
                onOpenChange={() => toggleGroup(group.label)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-widest hover:text-sidebar-foreground/70 transition-colors">
                  <span>{group.label}</span>
                  <ChevronDown 
                    className={cn(
                      "h-3 w-3 transition-transform duration-200",
                      openGroups[group.label] ? "rotate-0" : "-rotate-90"
                    )} 
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === '/admin'}
                              className={cn(
                                'flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all duration-200',
                                isItemActive(item.url) 
                                  ? 'bg-sidebar-accent text-sidebar-primary font-medium shadow-sm' 
                                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                              )}
                            >
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span>{item.title}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarGroup>
        ))}

        {/* Logout at bottom */}
        <SidebarGroup className="mt-auto border-t pt-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Logout">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span>Logout</span>}
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
