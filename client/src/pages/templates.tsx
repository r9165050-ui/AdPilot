import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Plus, Eye } from "lucide-react";
import type { AdTemplate } from "@shared/schema";

export default function Templates() {
  const { data: templates, isLoading } = useQuery<AdTemplate[]>({
    queryKey: ["/api/templates"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'facebook':
        return <Facebook className="text-fb-blue" size={16} />;
      case 'instagram':
        return <Instagram className="text-ig-pink" size={16} />;
      case 'both':
        return (
          <div className="flex space-x-1">
            <Facebook className="text-fb-blue" size={14} />
            <Instagram className="text-ig-pink" size={14} />
          </div>
        );
      default:
        return null;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'promotion':
        return 'bg-fb-blue bg-opacity-10 text-fb-blue';
      case 'branding':
        return 'bg-ig-pink bg-opacity-10 text-ig-pink';
      case 'seasonal':
        return 'bg-warning bg-opacity-10 text-warning';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-text-dark">Ad Templates</h2>
          <p className="text-gray-500 mt-1">Ready-to-use templates for your campaigns</p>
        </div>
        <Button className="bg-fb-blue text-white hover:bg-blue-600 mt-4 sm:mt-0">
          <Plus className="mr-2" size={16} />
          Create Template
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Category:</label>
          <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
            <option>All Categories</option>
            <option>Promotion</option>
            <option>Branding</option>
            <option>Seasonal</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Platform:</label>
          <select className="border border-gray-200 rounded-lg px-3 py-1 text-sm">
            <option>All Platforms</option>
            <option>Facebook</option>
            <option>Instagram</option>
            <option>Both</option>
          </select>
        </div>
      </div>

      {templates?.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-gray-500">
              <p className="text-lg font-medium mb-2">No templates available</p>
              <p className="text-sm mb-6">Create your first template to get started</p>
              <Button className="bg-fb-blue text-white hover:bg-blue-600">
                <Plus className="mr-2" size={16} />
                Create Your First Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow group">
              <div className="relative">
                <img
                  src={template.thumbnail || "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"}
                  alt={template.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-t-lg flex items-center justify-center">
                  <Button 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-text-dark hover:bg-gray-100"
                  >
                    <Eye className="mr-2" size={14} />
                    Preview
                  </Button>
                </div>
                <div className="absolute top-4 right-4">
                  {getPlatformIcon(template.platform)}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-text-dark">{template.name}</h3>
                  <Badge className={`${getCategoryColor(template.category)} border-0 text-xs`}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="text-gray-600">
                    {(template.content as any)?.description || "Professional ad template"}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Created {new Date(template.createdAt!).toLocaleDateString()}
                  </p>
                  <Button size="sm" className="bg-fb-blue text-white hover:bg-blue-600">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
