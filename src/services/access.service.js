const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Types } = require("mongoose");

const shopModel = require("../models/shop.model");
const KeyTokenService = require("./keytoken.service");
const { createTokensPair, verifyJWT } = require("../auth/authUtils");
const { getInforData } = require("../utils");
const {
  BadRequestError,
  ConflictRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");

// Service
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {
  // Signup service
  static signUp = async ({ name, email, password }) => {
    // Check email exists ?
    const holderShop = await shopModel.findOne({ email }).lean();

    if (holderShop) {
      throw new BadRequestError("Error: Shop already registered!");
    }

    // Hashed password
    const passwordHash = await bcrypt.hash(password, 10);

    const newShop = await shopModel.create({
      name,
      email,
      password: passwordHash,
      roles: [RoleShop.SHOP],
    });

    if (newShop) {
      // created privateKey, publicKey
      // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      //   modulusLength: 4096,
      //   publicKeyEncoding: {
      //     type: "pkcs1", //Public Key Cryptography Standards (type1)
      //     format: "pem",
      //   },
      //   privateKeyEncoding: {
      //     type: "pkcs1",
      //     format: "pem",
      //   },
      // });
      const privateKey = crypto.randomBytes(64).toString("hex");
      const publicKey = crypto.randomBytes(64).toString("hex");

      const keyStore = await KeyTokenService.createKeyToken({
        userId: newShop._id,
        publicKey,
        privateKey,
      });

      if (!keyStore) {
        throw new BadRequestError("Error: Shop already registered!");
      }

      // const publicKeyObject = crypto.createPublicKey(publicKeyString);

      // Create tokens pair
      const tokens = await createTokensPair(
        { userId: newShop._id, email },
        publicKey,
        privateKey
      );

      return {
        shop: getInforData({
          fileds: ["_id", "name", "email"],
          object: newShop,
        }),
        tokens,
      };
    }
  };

  // Login service
  static login = async ({ email, password, refreshToken = null }) => {
    // if refreshToken is exsited, it will be deleted in dbs
    // 5: get data return login
    // 1: Check email in dbs
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new BadRequestError("Shop is not registered");

    // 2: Match password
    const match = await bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("Authentication failed");

    // 3: create AT vs RT and save
    /* created privateKey, publicKey
    const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: "pkcs1", //Public Key Cryptography Standards (type1)
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });  */
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");

    // 4: generate tokens (Create tokens pair)
    const { _id: userId } = foundShop;

    const tokens = await createTokensPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId,
      refreshToken: tokens.refreshToken,
      privateKey,
      publicKey,
    });

    return {
      shop: getInforData({
        fileds: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  // Logout service
  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  // Check this token used ?
  // static handlerRefreshToken = async (refreshToken) => {
  //   const foundToken = await KeyTokenService.findByRefreshTokenUsed(
  //     refreshToken
  //   );

  //   if (foundToken) {
  //     // decode to check
  //     const { userId, email } = await verifyJWT(
  //       refreshToken,
  //       foundToken.privateKey
  //     );

  //     // console.log({ userId, email });

  //     // delete
  //     await KeyTokenService.deleteKeyById(userId);
  //     throw new ForbiddenError(
  //       "Something wrong happened !! Please login again"
  //     );
  //   }

  //   const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
  //   if (!holderToken) {
  //     throw new AuthFailureError("Shop is not registered");
  //   }

  //   // verifyToken
  //   const { userId, email } = await verifyJWT(
  //     refreshToken,
  //     holderToken.privateKey
  //   );
  //   console.log("[2]---", { userId, email });
  //   // Check userId
  //   const foundShop = await findByEmail({ email });
  //   if (!foundShop) throw new AuthFailureError("Shop is not registered");

  //   // Create new keys pair
  //   const tokens = await createTokensPair(
  //     { userId, email },
  //     holderToken.publicKey,
  //     holderToken.privateKey
  //   );

  //   // update tokens
  //   await holderToken.updateOne({
  //     $set: {
  //       refreshToken: tokens.refreshToken,
  //     },
  //     $addToSet: {
  //       refreshTokensUsed: refreshToken, // refresh token is used to take a new token
  //     },
  //   });

  //   return {
  //     user: { userId, email },
  //     tokens,
  //   };
  // };
  static handlerRefreshTokenV2 = async ({ keyStore, user, refreshToken }) => {
    const { userId, email } = user;

    if (keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError(
        "Something wrong happened !! Please login again"
      );
    }

    if (keyStore.refreshToken !== refreshToken) {
      throw new AuthFailureError("Shop is not registered");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError("Shop is not registered");

    // Create new keys pair
    const tokens = await createTokensPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    // update tokens
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // refresh token is used to take a new token
      },
    });

    return {
      user,
      tokens,
    };
  };
}

module.exports = AccessService;
