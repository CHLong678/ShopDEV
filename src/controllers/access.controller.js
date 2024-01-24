const { OK, CREATED, SuccessResponse } = require("../core/success.response");
const AccessService = require("../services/access.service");

class AccessController {
  // signUp
  signUp = async (req, res, next) => {
    // console.log(`[P]::signUp::`, req.body);
    // CREATED.send(res, {
    //   message: "Registered successfully",
    //   metadata: await AccessService.signUp(req.body),
    // });
    new CREATED({
      message: "Registered successfully!",
      metadata: await AccessService.signUp(req.body),
    }).send(res);
  };

  // Login
  login = async (req, res, next) => {
    new SuccessResponse({
      metadata: await AccessService.login(req.body),
    }).send(res);
  };

  // Logout
  logout = async (req, res, next) => {
    new SuccessResponse({
      message: "Logged out successfully",
      metadata: await AccessService.logout(req.keyStore),
    }).send(res);
  };

  // HandlerRefreshToken
  handlerRefreshToken = async (req, res, next) => {
    // new SuccessResponse({
    //   message: "Get tokens successfully",
    //   metadata: await AccessService.handlerRefreshToken(req.body),
    // }).send(res);

    // version2 (no need accessToken)
    new SuccessResponse({
      message: "Get tokens successfully",
      metadata: await AccessService.handlerRefreshTokenV2({
        refreshToken: req.refreshToken,
        user: req.user,
        keyStore: req.keyStore,
      }),
    }).send(res);
  };
}

module.exports = new AccessController();
