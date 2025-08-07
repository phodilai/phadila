import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart3, 
  Bell, 
  CheckCircle, 
  History, 
  CreditCard, 
  Check, 
  HandHeart, 
  Trash2,
  TrendingUp,
  ShoppingCart,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Edit,
  Save,
  X
} from "lucide-react";
import { showNotification } from "@/lib/firebase";
import type { Order, MenuItem, UpdateOrder } from "@shared/schema";

export default function AdminView() {
  const [activeTab, setActiveTab] = useState("new-orders");
  const [previousOrderCount, setPreviousOrderCount] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingItems, setEditingItems] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Monitor for new orders and show notifications
  useEffect(() => {
    if (orders.length > 0) {
      const newOrders = orders.filter(order => order.status === 'new');
      const currentNewOrderCount = newOrders.length;
      
      if (previousOrderCount > 0 && currentNewOrderCount > previousOrderCount) {
        const latestOrder = newOrders[0];
        showNotification(
          "Đơn hàng mới!", 
          `${latestOrder.customerName || `Bàn ${latestOrder.tableNumber}`} - ${latestOrder.total.toLocaleString()}đ`
        );
        
        // Auto switch to new orders tab when new order arrives
        setActiveTab("new-orders");
      }
      
      setPreviousOrderCount(currentNewOrderCount);
    }
  }, [orders, previousOrderCount]);

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: revenueData } = useQuery({
    queryKey: ["/api/analytics/revenue"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/revenue?days=7");
      return response.json();
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrder }) => {
      const response = await apiRequest("PATCH", `/api/orders/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái đơn hàng đã được cập nhật.",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật đơn hàng.",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/orders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Đã xóa",
        description: "Đơn hàng đã được xóa khỏi lịch sử.",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa đơn hàng.",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: string; isVisible: boolean }) => {
      const response = await apiRequest("PATCH", `/api/menu-items/${id}`, { isVisible });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái món ăn đã được cập nhật.",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật món ăn.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "paid" },
    });
  };

  const handleComplete = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "completed" },
    });
  };

  const handleSendOff = (orderId: string) => {
    updateOrderMutation.mutate({
      id: orderId,
      data: { status: "history" },
    });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const toggleMenuItem = (itemId: string, currentVisibility: boolean) => {
    updateMenuItemMutation.mutate({
      id: itemId,
      isVisible: !currentVisibility,
    });
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const startEditingOrder = (order: Order) => {
    setEditingOrder(order.id);
    setEditingItems([...(order.items as any[])]);
  };

  const cancelEditingOrder = () => {
    setEditingOrder(null);
    setEditingItems([]);
  };

  const saveOrderChanges = () => {
    if (!editingOrder) return;
    
    const newTotal = editingItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    updateOrderMutation.mutate({
      id: editingOrder,
      data: { 
        items: editingItems,
        total: newTotal
      },
    });
    
    setEditingOrder(null);
    setEditingItems([]);
  };

  const updateItemQuantity = (itemIndex: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = [...editingItems];
    updatedItems[itemIndex].quantity = newQuantity;
    setEditingItems(updatedItems);
  };

  const removeItemFromOrder = (itemIndex: number) => {
    const updatedItems = editingItems.filter((_, index) => index !== itemIndex);
    setEditingItems(updatedItems);
  };

  const getOrdersByStatus = (status: string) => {
    return orders.filter(order => order.status === status);
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge variant="destructive">Mới</Badge>;
      case "paid":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Đã thanh toán</Badge>;
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600">Hoàn thành</Badge>;
      case "history":
        return <Badge variant="secondary">Đã hoàn tất</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatOrderItems = (items: any[]) => {
    return items.map(item => {
      let itemText = `• ${item.name}`;
      if (item.customization) {
        const customizations = [];
        if (item.customization.sugar) customizations.push(`Đường: ${item.customization.sugar}`);
        if (item.customization.ice) customizations.push(`Đá: ${item.customization.ice}`);
        if (item.customization.topping) customizations.push(`Topping: ${item.customization.topping}`);
        if (customizations.length > 0) {
          itemText += ` (${customizations.join(', ')})`;
        }
      }
      itemText += ` x${item.quantity}`;
      return itemText;
    }).join('\n');
  };

  const newOrders = getOrdersByStatus("new").concat(getOrdersByStatus("paid"));
  const completedOrders = getOrdersByStatus("completed");
  const historyOrders = getOrdersByStatus("history");

  const todayRevenue = revenueData?.dailyRevenue?.find(
    (day: any) => day.date === new Date().toISOString().split('T')[0]
  )?.revenue || 0;

  const todayOrders = revenueData?.dailyRevenue?.find(
    (day: any) => day.date === new Date().toISOString().split('T')[0]
  )?.orders || 0;

  if (ordersLoading || menuLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Revenue Dashboard */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="text-green-500 mr-3" />
            Doanh thu 7 ngày gần nhất
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Tổng doanh thu</h3>
                  <p className="text-3xl font-bold">{(revenueData?.total || 0).toLocaleString()}đ</p>
                </div>
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Số đơn hàng</h3>
                  <p className="text-3xl font-bold">{revenueData?.orderCount || 0}</p>
                </div>
                <ShoppingCart className="h-8 w-8" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Đơn hàng hôm nay</h3>
                  <p className="text-3xl font-bold">{todayOrders}</p>
                </div>
                <Calendar className="h-8 w-8" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Doanh thu hôm nay</h3>
                  <p className="text-3xl font-bold">{todayRevenue.toLocaleString()}đ</p>
                </div>
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Management */}
      <Card>
        <CardContent className="p-6">

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="new-orders" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Đơn mới ({newOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed-orders" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Đơn đã trả ({completedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="order-history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Lịch sử đơn
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new-orders" className="space-y-4">
              {newOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có đơn hàng mới</p>
              ) : (
                newOrders.map((order) => (
                  <Card key={order.id} className={`border ${order.status === 'new' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'}`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">#{order.id.slice(-6)} - {order.customerName || `Bàn ${order.tableNumber}`}</h4>
                          <p className="text-sm text-gray-600">
                            {order.orderType === 'dinein' ? `Bàn ${order.tableNumber}` : order.customerPhone} • 
                            {new Date(order.createdAt || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • 
                            {order.orderType === 'dinein' ? 'Ngồi tại chỗ' : 'Đặt hàng mang về'}
                          </p>
                          {order.customerAddress && (
                            <p className="text-sm text-gray-600">Địa chỉ: {order.customerAddress}</p>
                          )}
                          {order.customerNote && (
                            <p className="text-sm text-gray-600">Ghi chú: {order.customerNote}</p>
                          )}
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <div className="mb-4">
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleOrderExpansion(order.id)}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            {expandedOrders.has(order.id) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Ẩn chi tiết
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Xem chi tiết
                              </>
                            )}
                          </Button>
                          {expandedOrders.has(order.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditingOrder(order)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Chỉnh sửa
                            </Button>
                          )}
                        </div>
                        {expandedOrders.has(order.id) && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            {editingOrder === order.id ? (
                              <div className="space-y-3">
                                {editingItems.map((item, index) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex-1">
                                      <span className="font-medium">{item.name}</span>
                                      {item.customization && (
                                        <div className="text-xs text-gray-600">
                                          {item.customization.sugar && `Đường: ${item.customization.sugar}`}
                                          {item.customization.ice && `, Đá: ${item.customization.ice}`}
                                          {item.customization.topping && `, Topping: ${item.customization.topping}`}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                        className="w-6 h-6 p-0"
                                      >
                                        -
                                      </Button>
                                      <span className="w-8 text-center">{item.quantity}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                        className="w-6 h-6 p-0"
                                      >
                                        +
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeItemFromOrder(index)}
                                        className="text-red-500 hover:text-red-700 w-6 h-6 p-0"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={saveOrderChanges}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <Save className="h-4 w-4 mr-1" />
                                    Lưu
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={cancelEditingOrder}
                                  >
                                    Hủy
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="whitespace-pre-line text-sm">
                                {formatOrderItems(order.items as any[])}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-orange-500">{order.total.toLocaleString()}đ</span>
                        <div className="space-x-2">
                          {order.status === 'new' && (
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handlePayment(order.id)}
                            >
                              <CreditCard className="h-4 w-4 mr-1" />
                              Thanh toán
                            </Button>
                          )}
                          <Button
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600"
                            onClick={() => handleComplete(order.id)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Trả đơn
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="completed-orders" className="space-y-4">
              {completedOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Không có đơn hàng đã hoàn thành</p>
              ) : (
                completedOrders.map((order) => (
                  <Card key={order.id} className="border border-green-300 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">#{order.id.slice(-6)} - {order.customerName || `Bàn ${order.tableNumber}`}</h4>
                          <p className="text-sm text-gray-600">
                            {order.orderType === 'dinein' ? `Bàn ${order.tableNumber}` : order.customerPhone} • 
                            {new Date(order.createdAt || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • 
                            {order.orderType === 'dinein' ? 'Ngồi tại chỗ' : 'Đặt hàng mang về'}
                          </p>
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-sm text-gray-600 hover:text-gray-800 mb-2"
                        >
                          {expandedOrders.has(order.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Ẩn chi tiết
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Xem chi tiết
                            </>
                          )}
                        </Button>
                        {expandedOrders.has(order.id) && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="whitespace-pre-line text-sm">
                              {formatOrderItems(order.items as any[])}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-orange-500">{order.total.toLocaleString()}đ</span>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                          onClick={() => handleSendOff(order.id)}
                        >
                          <HandHeart className="h-4 w-4 mr-1" />
                          Tiễn khách
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="order-history" className="space-y-4">
              {historyOrders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Chưa có đơn hàng trong lịch sử</p>
              ) : (
                historyOrders.map((order) => (
                  <Card key={order.id} className="border border-gray-300 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">#{order.id.slice(-6)} - {order.customerName || `Bàn ${order.tableNumber}`}</h4>
                          <p className="text-sm text-gray-600">
                            {order.orderType === 'dinein' ? `Bàn ${order.tableNumber}` : order.customerPhone} • 
                            {new Date(order.createdAt || '').toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • 
                            {order.orderType === 'dinein' ? 'Ngồi tại chỗ' : 'Đặt hàng mang về'}
                          </p>
                          {order.customerAddress && (
                            <p className="text-sm text-gray-600">Địa chỉ: {order.customerAddress}</p>
                          )}
                        </div>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <div className="mb-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="text-sm text-gray-600 hover:text-gray-800 mb-2"
                        >
                          {expandedOrders.has(order.id) ? (
                            <>
                              <ChevronUp className="h-4 w-4 mr-1" />
                              Ẩn chi tiết
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4 mr-1" />
                              Xem chi tiết
                            </>
                          )}
                        </Button>
                        {expandedOrders.has(order.id) && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="whitespace-pre-line text-sm">
                              {formatOrderItems(order.items as any[])}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-600">{order.total.toLocaleString()}đ</span>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteOrder(order.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa đơn
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
