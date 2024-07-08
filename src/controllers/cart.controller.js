"use-strict";
const { SuccessResponse, CREATED } = require("../core/success.response");
const CartService = require("../services/cart.service");

class CartController {
  addToCart = async (req, res, next) => {
    new SuccessResponse({
      message: "Create a new cart successfully",
      metadata: await CartService.addToCart({ ...req.body }),
    }).send(res);
  };

  // update
  update = async (req, res, next) => {
    new SuccessResponse({
      message: "Update cart successfully",
      metadata: await CartService.addToCartV2({ ...req.body }),
    }).send(res);
  };

  delete = async (req, res, next) => {
    new SuccessResponse({
      message: "Delete cart successfully",
      metadata: await CartService.deleteUserCart({ ...req.body }),
    }).send(res);
  };

  getList = async (req, res, next) => {
    new SuccessResponse({
      message: "Get list to cart successfully",
      metadata: await CartService.getListUserCart({ ...req.query }),
    }).send(res);
  };
}

module.exports = new CartController();
