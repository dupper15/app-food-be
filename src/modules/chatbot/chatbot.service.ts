import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { OrderItemService } from '../order-item/orderItem.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { RedisService } from '../redis/redis.service';
import { DishService } from '../dish/dish.service';
import { ToppingService } from '../topping/topping.service';
import { ObjectId } from 'mongoose';

dotenv.config();

const API_KEY = process.env.API_KEY || 'my_api_key';

@Injectable()
export class ChatBotService {
  constructor(
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    private readonly cartService: CartService,
    private readonly dishService: DishService,
    private readonly toppingService: ToppingService,
  ) {}
  async generateTextFromImage(
    imageUrl: string,
    text: string = 'mô tả món ăn này',
  ): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString('base64');

      const model = await this.getModel();
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg',
          },
        },
        text,
      ]);

      return result.response.text();
    } catch (err) {
      console.error('Error generating content from image:', err);
      return 'Lỗi khi tạo mô tả từ ảnh';
    }
  }

  async generateText(userMessage: string, userId) {
    try {
      const redisService = new RedisService();
      const context = JSON.parse(
        (await redisService.get(`user:${userId}:context`)) || '[]',
      );
      const AImodel = this.getModel();

      const prompt = `
Bạn là trợ lý đặt món ăn, giúp người dùng tư vấn món ăn, thêm món vào giỏ hàng, xem giỏ, đặt hàng, thêm topping, xem lịch sử đơn hàng...

Đây là userId của người dùng: ${userId}

Dưới đây là danh sách các hàm bạn có thể gọi:
${JSON.stringify(this.functions, null, 2)}

Trả kết quả về dưới dạng JSON như sau:
{
  "content": "Nội dung trả lời",
  "functionName": "Tên hàm được gọi",
  "parameters": { tham số truyền vào hàm (nếu có) }
}

Ví dụ:
{
  "content": "Đã thêm món vào giỏ hàng",
  "functionName": "add_dish_to_cart",
  "parameters": {
    "user_id": "123456",
    "dish_id": "abc123",
    "restaurant_id": "xyz456"
  }
}

Câu hỏi của người dùng: "${userMessage}"

Dưới đây là ngữ cảnh cuộc trò chuyện trước đó : 
${JSON.stringify(context, null, 2)}

⚠️ Rất quan trọng:
      ⚠️ Quy tắc rất quan trọng:

1. **Tư vấn món ăn**:
   - Khi người dùng nói kiểu “hôm nay ăn gì”, “tôi đói quá”, “tư vấn món”... hãy gọi hàm **recommend_dish_by_time**.

2. **Khi nhắc đến món cụ thể**:
   - Nếu người dùng nói tên món (VD: “cơm sườn”), hãy tìm trong context để lấy **dish_id** và **restaurant_id** – **không bao giờ hỏi lại id**.
   - Nếu nói “món thứ 2” hoặc “món có phô mai”, hãy suy luận dựa vào danh sách món trong context.

3. **Topping**:
   - Khi người dùng nói thêm topping nhưng không nói rõ món nào, hãy thêm vào món **mới nhất được thêm vào giỏ hàng**, hoặc mỗi món 1 phần.
   - Gọi hàm update_cart_item với **order_item_id** của món mới nhất trong giỏ hàng.
   - Khi người dùng muốn **xem danh sách topping**, lấy restaurant_id từ món ăn gần nhất họ đã thêm vào giỏ hàng.
   - Khi trả ra topping cho người dùng, hãy nói: đây là danh sách topping có sẵn, không nói rõ món ăn nào.
   - Sau khi thêm topping, đừng nói rõ đã thêm topping vào món nào, chỉ cần nói đã thêm topping thành công.

4. **Luồng hành động khuyến nghị**:
   - Sau khi thêm món vào giỏ → hỏi: “Bạn có muốn thêm topping không?”
   - Sau khi thêm topping hoặc không → hỏi: “Bạn có muốn xem giỏ hàng không?”
   - Sau khi xem hoặc không → hỏi: “Bạn có muốn đặt hàng không?”
   - Sau khi đặt hàng → hỏi: “Bạn có muốn xem đơn hàng đang diễn ra không?”
   - Nếu không muốn đặt → hỏi: “Bạn có muốn xem lịch sử đơn hàng không?”
   - Nếu xem lịch sử → hỏi: “Bạn có muốn đặt lại đơn hàng nào không?”

5. **Về đơn hàng**:
   - Nếu người dùng hỏi về đơn hàng, hãy trả lời theo hướng mở (VD: “Đây là đơn hàng của bạn", "Đây là các món ăn tôi nghĩ phù hợp với bạn", "Đã thanh toán",... không cần phải quá chi tiết), **không nói về giỏ hàng** trừ khi họ yêu cầu.

6. **Lặp lại yêu cầu**:
   - Dù người dùng yêu cầu giống trước, vẫn trả lời bình thường – **không được nói là đã trả lời ở trên**.

7. **Giải quyết tình huống không rõ ràng**:
   - Nếu có nhiều món, nhiều đơn,... hãy hỏi lại người dùng “Bạn muốn thực hiện với món nào?” hoặc “Đơn hàng nào?”

8. **Hạn chế**:
   - **Không được hỏi người dùng cung cấp id** nếu đã có dữ liệu trong context.
   - **Không được lấy dữ liệu context để hiển thị ra ngoài**, chỉ dùng để phân tích logic.
   - **Chỉ gọi 1 hàm duy nhất trong mỗi phản hồi.**

9. **Luôn đưa ra gợi ý mở**:
   - Khi tư vấn món ăn, không nên nói cụ thể món mặn, món cay,... mà hãy giữ mở.

10. **Xử lý thiếu thông tin**:
    - Nếu thiếu dish_id hoặc restaurant_id và không thể suy ra từ context, hãy **gợi ý để người dùng chọn lại món bằng tên**, nhưng **không yêu cầu id**.
11. Không được xuất các id người dùng, món ăn, nhà hàng, topping, đơn hàng, ...
    Không được nói những điều liên quan đến phần mềm như : hàm, ...
12. Khi đã chọn được hàm, có các tham số cụ thể thì hãy trả lời bằng câu khẳng định, không được dùng câu hỏi
13. Khi người dùng yêu cầu chỉnh số lượng món ăn nào đó, hay gọi hàm update_cart_item, với tham số là order_item_id của món ăn đó (món phù hợp với yêu cầu người dùng và mới nhất) lấy trong context, quantity
`;

      const result = (await AImodel).generateContent(prompt);

      const cleanedText = (await result).response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      const message = JSON.parse(cleanedText);

      // Trường hợp có yêu cầu gọi hàm
      if (message.functionName) {
        const functionToCall = this.functions.find(
          (f) => f.name === message.functionName,
        );
        if (!functionToCall) {
          return `Không tìm thấy hàm "${message.functionName}"`;
        }

        const functionResult = await this.callFunction(
          functionToCall,
          message.parameters || {},
        );
        const newContext = [
          ...context,
          { role: 'user', content: userMessage },
          {
            role: 'assistant',
            content: `${message}\nKết quả thực thi: ${functionResult}`,
          },
        ];

        await redisService.set(
          `user:${userId}:context`,
          JSON.stringify(newContext),
          3600,
        );

        return `{
          "content": "${message.content}",
          "functionName": "${message.functionName}",
          "result": "${functionResult}"
        }`;
      }
      const newContext = [
        ...context,
        { role: 'user', content: userMessage },
        { role: 'assistant', content: message.content },
      ];
      await redisService.set(
        `user:${userId}:context`,
        JSON.stringify(newContext),
        3600,
      );

      return message.content.toString();
    } catch (err) {
      console.error('Error generating content:', err);
      return 'Lỗi khi tạo văn bản. Vui lòng thử lại sau.';
    }
  }
  async callFunction(func: any, functionArgs: any) {
    console.log('callFunction', func, functionArgs);
    switch (func.name) {
      case 'recommend_dish_by_time':
        return this.recommendDishByTime(functionArgs);

      case 'add_dish_to_cart':
        return this.addDishToCart(functionArgs);

      case 'get_user_cart':
        return this.getUserCart(functionArgs);

      case 'update_cart_item':
        return this.updateCartItem(functionArgs);
      case 'get_topping_of_restaurant':
        return this.getToppingOfRestaurant(functionArgs);

      case 'remove_cart_item':
        return this.removeCartItem(functionArgs);

      case 'place_order':
        return this.placeOrder(functionArgs);

      case 'get_order_history':
        return this.getOrderHistory(functionArgs);

      case 'reorder_previous':
        return this.reorderPrevious(functionArgs);
      case 'view_ongoing_orders':
        return this.viewOngoingOrders(functionArgs);
      default:
        return 'Function not supported.';
    }
  }

  async recommendDishByTime(args: any) {
    const dishes = await this.dishService.fetchBotDish();
    const now = new Date();
    const vnTime = now.toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    const AImodel = this.getModel();
    const prompt = `Bây giờ là ${vnTime}, hãy gợi ý cho tôi 10 món ăn ngon và phù hợp với thời gian này. Dưới đây là danh sách món ăn có sẵn: ${JSON.stringify(dishes)} hãy trả về cho tôi mảng các _id dạng ["123456", "789012",...] không trả lời thêm gì, chỉ cần mảng`;
    const result = (await AImodel).generateContent(prompt);
    const response = (await result).response
      .text()
      .replace(/```json|```/g, '')
      .trim();
    const idArray = JSON.parse(response) as string[];
    const dishObject = await this.dishService.fetchDishById(idArray);
    return dishObject;
  }

  async getToppingOfRestaurant(args: any) {
    const { restaurant_id } = args;
    const toppings = await this.toppingService.getAllTopping(restaurant_id);
    return toppings;
  }
  async addDishToCart(args: any) {
    const { user_id, dish_id, quantity, topping } = args;
    const cartItem = await this.cartService.addDish(
      { dish_id, user_id, quantity, topping },
      user_id,
    );
    return cartItem;
  }

  async getUserCart(args: any) {
    const { user_id } = args;
    const cart = await this.cartService.getOrdersByUserId(user_id);
    const ans = JSON.stringify(cart, null, 2);
    return ans;
  }

  async updateCartItem(args: any) {
    const { order_item_id, quantity, topping } = args;
    const newOrderItem = await this.orderItemService.editOrderItem(
      order_item_id,
      {
        quantity,
        topping,
      },
    );
    return `Đã cập nhật món ăn trong giỏ hàng thành công.`;
  }

  async removeCartItem(args: any) {
    const { order_item_id } = args;
    const orderItem =
      await this.orderItemService.deleteOrderItem(order_item_id);
    const cart = await this.cartService.getOrdersByUserId(order_item_id);
    return cart;
  }

  async placeOrder(args: any) {
    const { array_item, customer_id, restaurant_id, total_price } = args;
    const data = { array_item, customer_id, restaurant_id, total_price };
    const order = await this.orderService.createOrder(data);
    return `Đã đặt hàng thành công.`;
  }

  async getOrderHistory(args: { user_id: ObjectId }) {
    const { user_id } = args;
    const orders =
      await this.orderService.fetchSuccessfullOrderByCustomerTemp(user_id);
    const ans = JSON.stringify(orders, null, 2);
    return ans;
  }

  async reorderPrevious(args: any) {
    const { order_id } = args;
    const order = await this.orderService.reOrder(order_id);
    return order;
  }
  async viewOngoingOrders(args: any) {
    const { user_id } = args;
    const order =
      await this.orderService.fetchOngoingOrderByCustomerTemp(user_id);
    const ans = JSON.stringify(order, null, 2);
    return ans;
  }
  functions = [
    {
      name: 'recommend_dish_by_time',
      description:
        'Gợi ý món ăn cho người khi người dùng không biết phải ăn gì hoặc cần gợi ý món ăn',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
    {
      name: 'add_dish_to_cart',
      description: 'Thêm món ăn vào giỏ hàng của người dùng',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID của người dùng' },
          dish_id: { type: 'objectId', description: 'ID của món ăn' },
          quantity: {
            type: 'number',
            description: 'Số lượng món ăn muốn thêm',
          },
          topping: {
            type: 'objectId',
            description: 'ID của topping (nếu có)',
          },
        },
        required: ['user_id', 'dish_id', 'quantity'],
      },
    },
    {
      name: 'get_topping_of_restaurant',
      description: 'Lấy danh sách topping của một nhà hàng',
      parameters: {
        type: 'object',
        properties: {
          restaurant_id: { type: 'objectId', description: 'ID của nhà hàng' },
        },
        required: ['restaurant_id'],
      },
    },
    {
      name: 'get_user_cart',
      description: 'Lấy thông tin giỏ hàng hiện tại của người dùng',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID của người dùng' },
        },
        required: ['user_id'],
      },
    },
    {
      name: 'update_cart_item',
      description:
        'Chỉnh sửa thông tin món ăn trong giỏ hàng, như là thêm topping, cập nhật số lượng',
      parameters: {
        type: 'object',
        properties: {
          order_item_id: {
            type: 'objectId',
            description: 'ID món ăn trong giỏ',
          },
          quantity: { type: 'number', description: 'Số lượng cập nhật' },
          topping: {
            type: 'objectId',
            description: 'ID topping mới (nếu có)',
          },
        },
        required: ['order_item_id'],
      },
    },
    {
      name: 'remove_cart_item',
      description: 'Xoá món ăn khỏi giỏ hàng',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID người dùng' },
          order_item_id: {
            type: 'objectId',
            description: 'ID món ăn trong giỏ',
          },
        },
        required: ['user_id', 'order_item_id'],
      },
    },
    {
      name: 'place_order',
      description:
        'Tiến hành đặt hàng, hoặc người dùng muốn thanh toán giỏ hàng',
      parameters: {
        type: 'object',
        properties: {
          array_item: {
            type: 'array',
            items: { type: 'object' },
            description: 'Mảng các id của các món ăn trong giỏ hàng',
          },
          customer_id: { type: 'objectId', description: 'ID người dùng' },
          restaurant_id: { type: 'objectId', description: 'ID nhà hàng' },
          voucher_id: {
            type: 'objectId',
            description: 'ID mã giảm giá (nếu có)',
          },
          total_price: { type: 'number', description: 'Tổng tiền' },
          used_point: {
            type: 'number',
            description: 'Điểm thưởng sử dụng (nếu có)',
          },
        },
        required: ['array_item', 'customer_id', 'restaurant_id', 'total_price'],
      },
    },
    {
      name: 'get_order_history',
      description: 'Lấy lịch sử đơn hàng đã thành công (cũ) của người dùng',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID người dùng' },
        },
        required: ['user_id'],
      },
    },
    {
      name: 'reorder_previous',
      description: 'Đặt lại đơn hàng nào đó người dùng muốn',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID người dùng' },
          order_id: { type: 'objectId', description: 'ID đơn hàng cũ' },
        },
        required: ['user_id', 'order_id'],
      },
    },
    {
      name: 'view_ongoing_orders',
      description:
        'Xem các đơn hàng hiện tại của người dùng (không phải giỏ hàng)',
      parameters: {
        type: 'object',
        properties: {
          user_id: { type: 'objectId', description: 'ID người dùng' },
        },
        required: ['user_id'],
      },
    },
  ];
  async getModel(): Promise<GenerativeModel> {
    if (!API_KEY) {
      throw new Error('API_KEY is not defined.');
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }
}
