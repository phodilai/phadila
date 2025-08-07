import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { showNotification } from "@/lib/firebase";
import DrinkModal from "./DrinkModal";
import SnackModal from "./SnackModal";
import { ShoppingBag, Users, Coffee, Cookie, ShoppingCart, Trash2 } from "lucide-react";
import type { MenuItem, CartItem, InsertOrder } from "@shared/schema";

export default function CustomerView() {
  const [orderType, setOrderType] = useState<"takeout" | "dinein" | null>(null);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  // Modal states
  const [drinkModalOpen, setDrinkModalOpen] = useState(false);
  const [snackModalOpen, setSnackModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: InsertOrder) => {
      const response = await apiRequest("POST", "/api/orders", orderData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Đặt hàng thành công!",
        description: "Đơn hàng của bạn đã được gửi đi.",
      });
      
      // Show local notification for confirmation
      showNotification("Đơn hàng đã được gửi", "Cảm ơn bạn đã đặt hàng!");
      
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể đặt hàng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setCart([]);
    setOrderType(null);
    setSelectedTable(null);
    setCustomerInfo({ name: "", phone: "", address: "", note: "" });
  };

  const selectOrderType = (type: "takeout" | "dinein") => {
    setOrderType(type);
    setSelectedTable(null);
  };

  const selectTable = (tableNumber: number) => {
    setSelectedTable(tableNumber);
  };

  const openDrinkModal = (item: MenuItem) => {
    setSelectedItem(item);
    setDrinkModalOpen(true);
  };

  const openSnackModal = (item: MenuItem) => {
    setSelectedItem(item);
    setSnackModalOpen(true);
  };

  const addToCart = (cartItem: CartItem) => {
    setCart(prev => [...prev, cartItem]);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const canPlaceOrder = () => {
    return cart.length > 0 && orderType && 
           (orderType === "takeout" || (orderType === "dinein" && selectedTable)) &&
           (orderType === "dinein" || (customerInfo.name && customerInfo.phone && customerInfo.address));
  };

  const placeOrder = () => {
    if (!canPlaceOrder()) return;

    const orderData: InsertOrder = {
      orderType: orderType!,
      tableNumber: selectedTable,
      customerName: orderType === "takeout" ? customerInfo.name : null,
      customerPhone: orderType === "takeout" ? customerInfo.phone : null,
      customerAddress: orderType === "takeout" ? customerInfo.address : null,
      customerNote: customerInfo.note || null,
      items: cart,
      total: getTotalAmount(),
      status: "new",
    };

    createOrderMutation.mutate(orderData);
  };

  const visibleMenuItems = menuItems.filter(item => item.isVisible);
  const drinks = visibleMenuItems.filter(item => item.type === "drink");
  const snacks = visibleMenuItems.filter(item => item.type === "snack");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Menu Items */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Thực đơn</h2>
          
          {/* Drinks Section */}
          {drinks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Coffee className="text-orange-500 mr-2" />
                Đồ uống
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drinks.map((item) => (
                  <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <img
                        src={item.image || `https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-orange-500 font-bold">{item.price.toLocaleString()}đ</p>
                      <Button
                        className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
                        onClick={() => openDrinkModal(item)}
                      >
                        Thêm vào giỏ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Snacks Section */}
          {snacks.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Cookie className="text-orange-500 mr-2" />
                Đồ ăn vặt
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {snacks.map((item) => (
                  <Card key={item.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <img
                        src={item.image || `https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300`}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-orange-500 font-bold">{item.price.toLocaleString()}đ</p>
                      <Button
                        className="w-full mt-3 bg-orange-500 hover:bg-orange-600"
                        onClick={() => openSnackModal(item)}
                      >
                        Thêm vào giỏ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Type Selection */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Chọn hình thức phục vụ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant={orderType === "takeout" ? "default" : "outline"}
              className={`h-auto p-4 ${orderType === "takeout" ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'}`}
              onClick={() => selectOrderType("takeout")}
            >
              <ShoppingBag className="text-orange-500 mr-3 h-6 w-6" />
              <span className="text-lg font-medium">Đặt hàng mang về</span>
            </Button>
            <Button
              variant={orderType === "dinein" ? "default" : "outline"}
              className={`h-auto p-4 ${orderType === "dinein" ? 'bg-orange-500 hover:bg-orange-600' : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50'}`}
              onClick={() => selectOrderType("dinein")}
            >
              <Users className="text-orange-500 mr-3 h-6 w-6" />
              <span className="text-lg font-medium">Ngồi tại chỗ</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table Selection */}
      {orderType === "dinein" && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chọn số bàn</h3>
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((tableNum) => (
                <Button
                  key={tableNum}
                  variant={selectedTable === tableNum ? "default" : "outline"}
                  className={`p-3 ${selectedTable === tableNum ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-100 hover:bg-orange-500 hover:text-white'}`}
                  onClick={() => selectTable(tableNum)}
                >
                  Bàn {tableNum}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Info Form */}
      {orderType === "takeout" && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thông tin khách hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Tên khách hàng</Label>
                <Input
                  id="customerName"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nhập tên..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Số điện thoại</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Nhập số điện thoại..."
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customerAddress">Địa chỉ</Label>
                <Input
                  id="customerAddress"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Nhập địa chỉ..."
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customerNote">Ghi chú</Label>
                <Textarea
                  id="customerNote"
                  value={customerInfo.note}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Ghi chú thêm..."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <ShoppingCart className="text-orange-500 mr-3" />
            Giỏ hàng
          </h2>
          <div className="space-y-4 mb-6">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Chưa có món nào trong giỏ</p>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h5 className="font-medium">{item.name} x{item.quantity}</h5>
                    {item.customization && (
                      <div className="text-sm text-gray-600">
                        {item.customization.sugar && `Đường: ${item.customization.sugar}`}
                        {item.customization.ice && `, Đá: ${item.customization.ice}`}
                        {item.customization.topping && `, Topping: ${item.customization.topping}`}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-orange-500">
                      {(item.price * item.quantity).toLocaleString()}đ
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-xl font-bold mb-4">
              <span>Tổng cộng:</span>
              <span className="text-orange-500">{getTotalAmount().toLocaleString()}đ</span>
            </div>
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-lg font-semibold"
              disabled={!canPlaceOrder() || createOrderMutation.isPending}
              onClick={placeOrder}
            >
              {createOrderMutation.isPending ? "Đang đặt hàng..." : "Đặt hàng"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <DrinkModal
        isOpen={drinkModalOpen}
        onClose={() => setDrinkModalOpen(false)}
        item={selectedItem}
        onAddToCart={addToCart}
      />
      <SnackModal
        isOpen={snackModalOpen}
        onClose={() => setSnackModalOpen(false)}
        item={selectedItem}
        onAddToCart={addToCart}
      />
    </div>
  );
}
