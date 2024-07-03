"use strict";

const { BadRequestError, NotFoundError } = require("../core/error.response");
const discountModel = require("../models/discount.model");
const {
  findAllDiscountCodesUnselect,
  findAllDiscountCodesSelect,
  checkDiscountExists,
} = require("../models/repositories/discount.repo");
const { findAllProducts } = require("../models/repositories/product.repo");
const { convertToObjectIdMongodb } = require("../utils");

/* Discount Services [Shop|Admin]
1. Generator discount codes [User|Shop]
2. Get all discount codes [User|Shop]
3. Get all product by discount codes [User]
4. Get discount amount [User|Shop]
5. Delete discount code [Admin|Shop]
6. Cancel discount code [User]
*/

class DiscountService {
  static async createDiscountCode(payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      uses_count,
      max_uses_per_user,
      users_used,
    } = payload;

    // check
    // if (new Date() < new Date(start_date) || new Date() > new Date(end_date)) {
    //   throw new BadRequestError("Discount code has expired");
    // }

    if (new Date(start_date) >= new Date(end_date)) {
      throw new BadRequestError("Start date must be before end date");
    }

    // create index for discount code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (foundDiscount && foundDiscount.discount_is_active) {
      throw new BadRequestError("Discount exists!");
    }

    const newDiscount = await discountModel.create({
      discount_name: name,
      discount_description: description,
      discount_type: type,
      discount_code: code,
      discount_value: value,
      discount_min_order_value: min_order_value || 0,
      discount_max_value: max_value,
      discount_start_date: new Date(start_date),
      discount_end_date: new Date(end_date),
      discount_max_uses: max_uses,
      discount_uses_count: uses_count,
      discount_users_used: users_used,
      discount_shopId: convertToObjectIdMongodb(shopId),
      discount_max_uses_per_user: max_uses_per_user,
      discount_is_active: is_active,
      discount_applies_to: applies_to,
      discount_product_ids: applies_to === "all" ? [] : product_ids,
    });

    return newDiscount;
  }

  // Update discount code
  static async updateDiscountCode(discountId, payload) {
    const {
      code,
      start_date,
      end_date,
      is_active,
      shopId,
      min_order_value,
      product_ids,
      applies_to,
      name,
      description,
      type,
      value,
      max_value,
      max_uses,
      max_uses_per_user,
    } = payload;

    const objectId = convertToObjectIdMongodb(discountId);
    // validate discount ID
    if (!objectId) {
      throw new BadRequestError("Invalid discount ID");
    }

    // validate dates
    if (start_date && end_date) {
      if (new Date(start_date) >= new Date(end_date)) {
        throw new BadRequestError("Start date must be before end date");
      }

      if (new Date() > new Date(end_date)) {
        throw new BadRequestError("Discount code has expired");
      }
    }

    //check if the discount code exists
    const foundDiscount = await discountModel.findById(objectId).lean();
    if (!foundDiscount) {
      throw new NotFoundError("Discount not found");
    }

    //Ensure the discount belongs to the specified shop
    if (foundDiscount.discount_shopId.toString() !== shopId) {
      throw new BadRequestError(
        "Discount does not belong to the specified shop"
      );
    }

    // Prepare the update object
    const updateData = {
      //check if 'code' is truthy,this adds { discount_code: code } to updateData
      ...(code && { discount_code: code }),
      ...(start_date && { discount_start_date: new Date(start_date) }),
      ...(end_date && { discount_end_date: new Date(end_date) }),
      ...(typeof is_active !== "undefined" && {
        discount_is_active: is_active,
      }),
      ...(min_order_value && { discount_min_order_value: min_order_value }),
      ...(applies_to && { discount_applies_to: applies_to }),
      ...(name && { discount_name: name }),
      ...(description && { discount_description: description }),
      ...(type && { discount_type: type }),
      ...(value && { discount_value: value }),
      ...(max_value && { discount_max_value: max_value }),
      ...(max_uses && { discount_max_uses: max_uses }),
      ...(max_uses_per_user && {
        discount_max_uses_per_user: max_uses_per_user,
      }),
      ...(product_ids && {
        discount_product_ids: applies_to === "all" ? [] : product_ids,
      }),
    };

    // update the discount code
    const updatedDiscount = await discountModel.findByIdAndUpdate(
      objectId,
      updateData,
      { new: true }
    );

    if (!updatedDiscount) {
      throw new BadRequestError("Failed to update discount code");
    }

    return updatedDiscount;
  }

  /*
  Get all discount codes available with products
   */

  static async getAllDiscountCodesWithProduct({
    code,
    shopId,
    userId,
    limit,
    page,
  }) {
    //create index for discount_code
    const foundDiscount = await discountModel
      .findOne({
        discount_code: code,
        discount_shopId: convertToObjectIdMongodb(shopId),
      })
      .lean();

    if (!foundDiscount || !foundDiscount.discount_is_active) {
      throw new NotFoundError("Discount is not exists!");
    }

    const { discount_applies_to, discount_product_ids } = foundDiscount;
    let products;

    if (discount_applies_to === "all") {
      // get all products
      products = await findAllProducts({
        filter: {
          product_shop: convertToObjectIdMongodb(shopId),
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    if (discount_applies_to === "specific") {
      // get the products ids
      products = await findAllProducts({
        filter: {
          _id: { $in: discount_product_ids },
          isPublished: true,
        },
        limit: +limit,
        page: +page,
        sort: "ctime",
        select: ["product_name"],
      });
    }

    return products;
  }

  /*
  Get all discount code of Shop
  */
  static async getAllDiscountCodeOfShop({ limit, page, shopId }) {
    const discounts = await findAllDiscountCodesUnselect({
      limit: +limit,
      page: +page,
      filter: {
        discount_shopId: convertToObjectIdMongodb(shopId),
        discount_is_active: true,
      },
      unSelect: ["__v", "discount_shopId"],
      model: discountModel,
    });

    return discounts;
  }

  /*
  apply discount code
  products = [
    {
      productId, shopId, quantity, name, price
    },{
      productId, shopId, quantity, name, price
    }
  ]
  */

  static async getDiscountAmount({ codeId, userId, shopId, products }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount is not exists!");

    const {
      discount_is_active,
      discount_max_uses,
      discount_min_order_value,
      discount_users_used,
      discount_type,
      discount_value,
      discount_max_uses_per_user,
    } = foundDiscount;

    if (!discount_is_active) throw new NotFoundError("Discount is expired");
    if (discount_max_uses <= 0)
      throw new NotFoundError("Discount is exhausted");

    // check xem co set gia tri toi thieu khong
    let totalOrder = 0;
    if (discount_min_order_value > 0) {
      //get total
      totalOrder = products.reduce((acc, product) => {
        return acc + product.quantity * product.price;
      }, 0);

      if (
        discount_min_order_value > 0 &&
        totalOrder < discount_min_order_value
      ) {
        throw new NotFoundError(
          `Discount requires a minimum order value of ${discount_min_order_value}`
        );
      }

      if (discount_max_uses_per_user > 0) {
        const userUseDiscount = discount_users_used.find(
          (user) => user.userId === userId
        );

        if (
          userUseDiscount &&
          userUseDiscount.count >= discount_max_uses_per_user
        ) {
          throw new NotFoundError(
            `Discount has reached the maximum uses for this user`
          );
        }
      }
    }
    // check xem discount la fixed_amount
    const amount =
      discount_type === "fixed_amount"
        ? discount_value
        : totalOrder * (discount_value / 100);

    return {
      totalOrder,
      discount: amount,
      totalPrice: totalOrder - amount,
    };
  }

  static async deleteDiscountCode({ shopId, codeId }) {
    const deleted = await discountModel.findOneAndDelete({
      discount_code: codeId,
      discount_shopId: convertToObjectIdMongodb(shopId),
    });

    return deleted;
  }

  /*
  cancel discount code
  */
  static async cancelDiscountCode({ codeId, shopId, userId }) {
    const foundDiscount = await checkDiscountExists({
      model: discountModel,
      filter: {
        discount_code: codeId,
        discount_shopId: convertToObjectIdMongodb(shopId),
      },
    });

    if (!foundDiscount) throw new NotFoundError("Discount is not exists");

    const result = await discount.findByIdAndUpdate(foundDiscount._id, {
      $pull: {
        discount_users_used: userId,
      },
      $inc: {
        discount_max_uses: 1,
        discount_uses_count: -1,
      },
    });

    return result;
  }
}

module.exports = DiscountService;
