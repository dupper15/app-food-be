import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { OrderItemService } from '../order-item/orderItem.service';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { RedisService } from '../redis/redis.service';
import { DishService } from '../dish/dish.service';
import { ToppingService } from '../topping/topping.service';

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
      console.log('Context:', context);
      const AImodel = this.getModel();

      const prompt = `
Bạn là trợ lý đặt món ăn, có thể giúp người dùng tư vấn món ăn, thêm món vào giỏ hàng, xem giỏ, đặt hàng...

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
- Nếu người dùng yêu cầu thao tác với **món ăn cụ thể**, ví dụ: "cơm sườn", thì hãy **tìm kiếm theo tên món** trong context để lấy 'dish_id'.
- Nếu người dùng nói “món thứ 2” hay “món có phô mai”, hãy phân tích danh sách món trong context để hiểu người dùng đang nói tới món nào.
- **Không được hỏi lại người dùng về id** nếu đã có món đó trong context.
- Luôn cố gắng lấy 'dish_id', 'restaurant_id' từ context và truyền vào hàm – **không yêu cầu người dùng cung cấp id**.
- Nếu không chắc chắn, hãy xem lại ngữ cảnh và tìm dữ liệu phù hợp thay vì bỏ qua hoặc yêu cầu người dùng nhập lại.
- Trường hợp sau khi người dùng thêm vào giỏ hàng, hỏi họ có muốn dùm topping không, khi người dùng thêm topping mà không nói rõ món nào, hãy thêm topping vào món đầu tiên trong giỏ hàng (hoặc tùy ý bạn vì có thể người dùng kêu thêm 2 phần topping giống nhau thì có thể thêm mỗi món ăn 1 phần vì hàm tôi không hỗ trợ thêm số lượng topping).
- Sau khi người dùng chọn topping hoặc không chọn, có thể hỏi người dùng có muốn xem giỏ hàng không.
- Sau khi người dùng chọn xem giỏ hàng hoặc không, hỏi người dùng có muốn đặt hàng luôn không.
- Sau khi đặt hàng thành công, hãy hỏi người dùng có muốn xem đơn hàng đang diễn ra không.
- Nếu người dùng không muốn đặt hàng ngay, hãy hỏi họ có muốn xem lịch sử đơn hàng không.
- Nếu người dùng chọn xem lịch sử đơn hàng, hãy hỏi họ có muốn đặt lại đơn hàng không.
- Khi có nhiều cases khiến bạn không phân vân, hãy hỏi người dùng để biết chính xác hành động cần làm (ví dụ: có nhiều đơn hàng cũ hoặc nhiều món ăn trong giỏ hàng, có thể hỏi họ muốn đặt lại đơn thứ mấy, đặt đơn có món gì).
- Nếu người dùng chưa hỏi những câu như hôm nay ăn gì (vì khi đó context sẽ không có các object dish, nhưng nếu trước đó họ có hỏi rồi thì khỏi), hãy lừa và dắt họ để họ phải hỏi bạn về món ăn, ví dụ: "Hôm nay ăn gì?" hoặc "Gợi ý món ăn cho tôi".
`;

      const result = (await AImodel).generateContent(prompt);

      const cleanedText = (await result).response
        .text()
        .replace(/```json|```/g, '')
        .trim();
      console.log('Result:', cleanedText);
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
    return this.dishService.fetchBotDish();
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
    return cart;
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
    const cart = await this.cartService.getOrdersByUserId(order_item_id);
    return cart;
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
    // const data = { array_item, customer_id, restaurant_id, total_price };
    //const order = await this.orderService.createOrder(data);
    return `Đặt hàng cho người dùng ${customer_id} tại nhà hàng ${restaurant_id}. Tổng giá trị: ${total_price}.`;
  }

  async getOrderHistory(args: any) {
    const { user_id } = args;
    const orders =
      await this.orderService.fetchSuccessfullOrderByCustomer(user_id);
    return orders;
  }

  async reorderPrevious(args: any) {
    const { order_id } = args;
    const order = await this.orderService.reOrder(order_id);
    return order;
  }
  async viewOngoingOrders(args: any) {
    const { user_id } = args;
    const order = await this.orderService.fetchOngoingOrderByCustomer(user_id);
    return order;
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
      description: 'Chỉnh sửa thông tin món ăn trong giỏ hàng',
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
      description: 'Tiến hành đặt hàng',
      parameters: {
        type: 'object',
        properties: {
          array_item: {
            type: 'array',
            items: { type: 'object' },
            description: 'Danh sách món ăn đặt',
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
      description: 'Lấy lịch sử đơn hàng',
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
      description: 'Đặt lại đơn cũ',
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
      description: 'Xem đơn hàng đang diễn ra',
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
