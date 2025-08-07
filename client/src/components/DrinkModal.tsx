import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import type { MenuItem, CartItem } from "@shared/schema";

interface DrinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (cartItem: CartItem) => void;
}

export default function DrinkModal({ isOpen, onClose, item, onAddToCart }: DrinkModalProps) {
  const [sugar, setSugar] = useState<string>("");
  const [ice, setIce] = useState<string>("");
  const [hasAloe, setHasAloe] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const resetForm = () => {
    setSugar("");
    setIce("");
    setHasAloe(false);
    setQuantity(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddToCart = () => {
    if (!item || !sugar || !ice) {
      alert("Vui lòng chọn độ ngọt và độ đá");
      return;
    }

    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      name: item.name,
      price: item.price + (hasAloe ? 5000 : 0),
      quantity: quantity,
      type: "drink",
      customization: {
        sugar: `${sugar}%`,
        ice: ice,
        topping: hasAloe ? "Nha đam" : undefined,
      },
    };

    onAddToCart(cartItem);
    handleClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tùy chỉnh {item.name}</DialogTitle>
          <DialogDescription>
            Chọn độ ngọt, độ đá và topping cho đồ uống của bạn
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Sugar Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Độ ngọt</Label>
            <div className="grid grid-cols-5 gap-2">
              {["0", "30", "50", "70", "100"].map((level) => (
                <Button
                  key={level}
                  variant={sugar === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSugar(level)}
                  className={`p-2 ${sugar === level ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-100 hover:bg-orange-500 hover:text-white'}`}
                >
                  {level}%
                </Button>
              ))}
            </div>
          </div>

          {/* Ice Level */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Độ đá</Label>
            <div className="grid grid-cols-3 gap-2">
              {["Ít", "Vừa", "Nhiều"].map((level) => (
                <Button
                  key={level}
                  variant={ice === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIce(level)}
                  className={`p-2 ${ice === level ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-100 hover:bg-orange-500 hover:text-white'}`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          {item.hasTopping && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Topping</Label>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="aloeTopping" 
                  checked={hasAloe}
                  onCheckedChange={(checked) => setHasAloe(checked as boolean)}
                />
                <Label htmlFor="aloeTopping">Nha đam (+5,000đ)</Label>
              </div>
            </div>
          )}

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
