const JWT = require("jsonwebtoken");
const { asyncHandler } = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserid } = require("../services/keytoken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rtoken-id",
};

const createTokensPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, publicKey, {
      // algorithm: "RS256",
      expiresIn: "2 days",
    });

    // refreshToken
    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "RS256",
      expiresIn: "7 days",
    });

    // verifyToken
    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.error(`error verify::`, err);
      } else {
        console.log(`decoded verify:: ${decoded}`);
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {}
};

// const authentication = asyncHandler(async (req, res, next) => {
//   /*
//   1. Check userId missing ?
//   2. Get accessToken
//   3. Verify accessToken
//   4. Check user in dbs
//   5. Check keyStore with this userId
//   6. OK all => return next()
//   */

//   const userId = req.headers[HEADER.CLIENT_ID];
//   if (!userId) throw new AuthFailureError("Invalid request");

//   const keyStore = await findByUserid(userId);
//   if (!keyStore) throw new NotFoundError("Not found keyStore");

//   const accessToken = req.headers[HEADER.AUTHORIZATION];
//   if (!accessToken) throw new AuthFailureError("Invalid request");

//   try {
//     const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
//     if (userId !== decodeUser.userId)
//       throw new AuthFailureError("Invalid user");

//     req.keyStore = keyStore;
//     return next();
//   } catch (error) {
//     throw error;
//   }
// });

const authenticationV2 = asyncHandler(async (req, res, next) => {
  /*
  1. Check userId missing ?
  2. Get accessToken
  3. Verify accessToken
  4. Check user in dbs
  5. Check keyStore with this userId
  6. OK all => return next()
  */

  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailureError("Invalid request");

  const keyStore = await findByUserid(userId);
  if (!keyStore) throw new NotFoundError("Not found keyStore");

  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId !== decodeUser.userId)
        throw new AuthFailureError("Invalid user");

      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokensPair,
  authenticationV2,
  verifyJWT,
};

//If not using RSA, then the publicKey and privateKey can be considered equivalent to the accessToken and refreshToken for decoding.
