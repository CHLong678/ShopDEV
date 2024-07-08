"use strict";

const cartModel = require("../cart.model");

const createUserCart = async ({ userId, product }) => {
  const query = {
      cart_userId: userId,
      cart_state: "active",
    },
    updateOrInsert = {
      $addToSet: {
        cart_products: product,
      },
      $inc: {
        cart_count_products: 1,
      },
    },
    options = {
      upsert: true,
      new: true,
    };
  return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
};

const updateUserCartQuantity = async ({ userId, product }) => {
  const { productId, quantity, old_quantity, name, price, shopId } = product;

  const userCart = await cartModel.findOne({
    cart_userId: userId,
    cart_state: "active",
  });

  let updateSet;

  if (userCart) {
    updateSet = {
      $inc: {
        "cart_products.$.quantity": quantity,
      },
    };

    if (old_quantity === 0 && quantity > 0) {
      updateSet = {
        $inc: {
          cart_count_products: 1,
        },
      };
    }
  } else {
    updateSet = {
      $addToSet: {
        cart_products: {
          productId,
          shopId,
          quantity,
          name,
          price,
        },
      },
      $inc: {
        cart_count_products: 1,
      },
    };
  }

  const query = {
    cart_userId: userId,
    "cart_products.productId": productId,
    cart_state: "active",
  };
  const options = {
    upsert: true,
    new: true,
  };

  return await cartModel.findOneAndUpdate(query, updateSet, options);
};

const deleteCart = async ({ userId, productId }) => {
  const query = {
      cart_userId: userId,
      cart_state: "active",
    },
    updateSet = {
      $pull: {
        cart_products: { productId },
      },
      $inc: {
        cart_count_products: -1,
      },
    };

  return await cartModel.updateOne(query, updateSet);
};

// const updateUserCartQuantity = async ({ userId, product }) => {
//   const { productId, quantity } = product;

//   const query = {
//       cart_userId: userId,
//       "cart_products.productId": productId,
//       cart_state: "active",
//     },
//     updateSet = {
//       $inc: {
//         "cart_products.$.quantity": quantity,
//       },
//     },
//     options = {
//       upsert: true,
//       new: true,
//     };

//   return await cartModel.findOneAndUpdate(query, updateSet, options);
// };

module.exports = {
  createUserCart,
  updateUserCartQuantity,
  deleteCart,
};
// "use strict";
// const cartModel = require("../cart.model");
// const createUserCart = async ({ userId, product }) => {
//   const query = {
//       cart_userId: userId,
//       cart_state: "active",
//     },
//     updateOrInsert = {
//       $addToSet: {
//         cart_products: product,
//       },
//     },
//     options = {
//       upsert: true,
//       new: true,
//     };
//   return await cartModel.findOneAndUpdate(query, updateOrInsert, options);
// };
// const deleteCart = async ({ userId, productId }) => {
//   const query = {
//       cart_userId: userId,
//       cart_state: "active",
//     },
//     updateSet = {
//       $pull: {
//         cart_products: { productId },
//       },
//     };

//   return await cartModel.updateOne(query, updateSet);
// };
// module.exports = {
//   createUserCart,
//   updateUserCartQuantity,
//   deleteCart,
// };
