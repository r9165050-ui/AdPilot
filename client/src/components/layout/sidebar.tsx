import { Link, useLocation } from "wouter";
import { 
  TrendingUp, 
  Facebook, 
  Instagram, 
  Target, 
  Wand2, 
  Copy, 
  Sparkles, 
  BarChart3,
  Settings, 
  HelpCircle,
  Zap
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const menuSections = [
    {
      title: "Campaign Management",
      items: [
        { path: "/", label: "Dashboard", icon: TrendingUp },
        { path: "/campaigns", label: "Campaigns", icon: Target },
        { path: "/optimization", label: "Optimization", icon: Zap },
        { path: "/analytics", label: "Analytics", icon: BarChart3 },
      ]
    },
    {
      title: "Creative Tools",
      items: [
        { path: "/templates", label: "Templates", icon: Copy },
        { path: "/ai-tools", label: "AI Tools", icon: Sparkles },
      ]
    },
    {
      title: "Account",
      items: [
        { path: "/settings", label: "Settings", icon: Settings },
        { path: "/support", label: "Support", icon: HelpCircle },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:block">
      <div className="p-4 space-y-6">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || 
                  (item.path === "/" && location === "/");
                
                return (
                  <Link key={item.path} href={item.path}>
                    <a className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
                      isActive
                        ? "bg-fb-blue bg-opacity-10 text-fb-blue"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                      <Icon className="mr-3" size={16} />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}
