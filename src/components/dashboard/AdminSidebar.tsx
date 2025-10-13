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
import { LayoutDashboard, Briefcase, FileText, HelpCircle, BookOpen, BarChart3, LogOut, Users } from 'lucide-react';

const menuItems = [
  { title: 'Overview', url: '/admin', icon: LayoutDashboard },
  { title: 'Users', url: '/admin/users', icon: Users },
  { title: 'Services', url: '/admin/services', icon: Briefcase },
  { title: 'Projects', url: '/admin/projects', icon: FileText },
  { title: 'FAQs', url: '/admin/faqs', icon: HelpCircle },
  { title: 'Resources', url: '/admin/resources', icon: BookOpen },
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
