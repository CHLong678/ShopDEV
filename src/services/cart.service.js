"use strict";

const cartModel = require("../models/cart.model");
const { NotFoundError } = require("../core/error.response");
const {
  createUserCart,
  updateUserCartQuantity,
  deleteCart,
} = require("../models/repositories/cart.repo");
const { getProductById } = require("../models/repositories/product.repo");

/*
  Key features: Cart Service
    - Add products to cart [user]
    - Reduce products quantity [user]
    - Increase products quantity [user]
    - Get cart [user]
    - Delete cart [user]
    - Delete cart item [user]
*/

class CartService {
  static async addToCart({ userId, product = {} }) {
    // check cart
    const userCart = await cartModel.findOne({ cart_userId: userId });
    if (!userCart) {
      //create cart for User
      return await createUserCart({ userId, product });
    }

    // if having a cart but do not have any products
    if (!userCart.cart_products.length) {
      userCart.cart_products = [product];
      userCart.cart_count_products = 1;
      return await userCart.save();
    }

    // if having a cart and having same product -> update quantity
    return await updateUserCartQuantity({ userId, product });
  }

  // update
  /* payload:
  {
    userId,
    shop_order_ids: [
      {
        shopId,
        item_products: [
          {
            quantity,
            price,
            shopId,
            old_quantity,
            productId
          }
        ],
        version
      }
    ]
  }
  */
  static async addToCartV2({ userId, shop_order_ids }) {
    const { productId, quantity, old_quantity } =
      shop_order_ids[0]?.item_products[0];
    // check product
    const foundProduct = await getProductById(productId);
    if (!foundProduct) throw new NotFoundError("not found product");

    //compare
    if (foundProduct.product_shop.toString() !== shop_order_ids[0]?.shopId)
      throw new NotFoundError("product do not belong to this shop");

    if (quantity === 0) {
      return await deleteCart({ userId, productId });
    }

    return await updateUserCartQuantity({
      userId,
      product: {
        productId,
        quantity: quantity - old_quantity,
      },
    });
  }

  static async deleteUserCart({ userId, productId }) {
    return deleteCart({ userId, productId });
  }

  static async getListUserCart({ userId }) {
    return await cartModel
      .findOne({
        cart_userId: +userId,
      })
      .lean();
  }
}

module.exports = CartService;
