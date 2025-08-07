import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CustomerView from "@/components/CustomerView";
import AdminView from "@/components/AdminView";
import { requestNotificationPermission, onMessageListener, showNotification } from "@/lib/firebase";
import { ShoppingCart, Settings, Utensils, Lock } from "lucide-react";

export default function Home() {
  const [currentView, setCurrentView] = useState<"customer" | "admin">("customer");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const ADMIN_PASSWORD = "NONAME";

  useEffect(() => {
    // Initialize Firebase notifications
    requestNotificationPermission().then((token) => {
      if (token) {
        console.log("Firebase token obtained:", token);
      }
    });

    // Listen for messages
    onMessageListener().then((payload: any) => {
      console.log("Received foreground message:", payload);
      showNotification(payload.notification?.title || "Thông báo mới", payload.notification?.body || "");
    }).catch((err) => console.log("Failed to listen for messages:", err));
  }, []);

  const handleAdminAccess = () => {
    if (isAuthenticated) {
      setCurrentView("admin");
    } else {
      setShowPasswordDialog(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setCurrentView("admin");
      setShowPasswordDialog(false);
      setPassword("");
    } else {
      alert("Mật khẩu không đúng!");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Utensils className="text-orange-500 text-2xl mr-3" />
              <span className="text-xl font-bold text-gray-900">Order System</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={currentView === "customer" ? "default" : "outline"}
                className={`${currentView === "customer" ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-500 text-orange-500 hover:bg-orange-50'}`}
                onClick={() => setCurrentView("customer")}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Đặt hàng
              </Button>
              <Button
                variant={currentView === "admin" ? "default" : "outline"}
                className={`${currentView === "admin" ? 'bg-blue-500 hover:bg-blue-600' : 'border-blue-500 text-blue-500 hover:bg-blue-50'}`}
                onClick={handleAdminAccess}
              >
                <Lock className="mr-2 h-4 w-4" />
                Quản trị
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {currentView === "customer" ? <CustomerView /> : <AdminView />}

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Đăng nhập quản trị</DialogTitle>
            <DialogDescription>
              Nhập mật khẩu để truy cập trang quản trị
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
            />
            <Button 
              onClick={handlePasswordSubmit}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              Đăng nhập
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
