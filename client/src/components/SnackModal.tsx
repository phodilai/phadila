import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { MenuItem, CartItem } from "@shared/schema";

interface SnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function SnackModal({ isOpen, onClose, item, onAddToCart }: SnackModalProps) {
  const [quantity, setQuantity] = useState(1);

  const resetForm = () => {
    setQuantity(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddToCart = () => {
    if (!item) return;

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price,
      quantity: quantity,
      type: "snack",
    };

    onAddToCart(cartItem);
    handleClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn số lượng {item.name}</DialogTitle>
          <DialogDescription>
            Chọn số lượng món ăn vặt bạn muốn đặt
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Quantity */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Số lượng</Label>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-full p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold min-w-[2rem] text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-full p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={handleAddToCart}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3"
          >
            Thêm vào giỏ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
