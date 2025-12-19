import { useNavigate, NavLink } from 'react-router-dom';
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
import { LayoutDashboard, Briefcase, FileText, HelpCircle, BookOpen, BarChart3, LogOut, Users, FileEdit, Shield, Settings, MessageSquare, UsersRound, MessageCircle, Calendar, Bot, KeyRound } from 'lucide-react';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Permissions', url: '/admin/permissions', icon: KeyRound },
  { title: 'Messages', url: '/admin/messages', icon: MessageSquare },
  { title: 'Services', url: '/admin/services', icon: Briefcase },
  { title: 'Projects', url: '/admin/projects', icon: FileText },
  { title: 'FAQs', url: '/admin/faqs', icon: HelpCircle },
  { title: 'Resources', url: '/admin/resources', icon: BookOpen },
  { title: 'Blogs', url: '/admin/blogs', icon: FileEdit },
  { title: 'Team Members', url: '/admin/team', icon: UsersRound },
  { title: 'Testimonials', url: '/admin/testimonials', icon: MessageCircle },
  { title: 'Timeline', url: '/admin/timeline', icon: Calendar },
  { title: 'Chatbot', url: '/admin/chatbot', icon: Bot },
  { title: 'Policies', url: '/admin/policies', icon: Shield },
  { title: 'Settings', url: '/admin/settings', icon: Settings },
  { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-2 w-full ${isActive ? 'bg-muted text-primary font-medium' : 'hover:bg-muted/50'}`
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
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
