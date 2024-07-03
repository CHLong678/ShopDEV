const StatusCode = {
  OK: 200,
  CREATED: 201,
};

const ReasonStatusCode = {
  OK: "Success",
  CREATED: "Created!",
};

// class SuccessResponse {
//   constructor(
//     message,
//     statusCode = StatusCode.OK,
//     reasonStatusCode = ReasonStatusCode.OK,
//     metadata = {}
//   ) {
//     this.message = !message ? reasonStatusCode : message;
//     this.status = statusCode;
//     this.metadata = metadata;
//   }

//   send(res, headers = {}) {
//     return res.status(this.status).json(this);
//   }
//   // static send(
//   //   res,
//   //   message,
//   //   statusCode,
//   //   reasonStatusCode,
//   //   metadata,
//   //   headers = {}
//   // ) {
//   //   const successResponse = new SuccessResponse(
//   //     message,
//   //     statusCode,
//   //     reasonStatusCode,
//   //     metadata
//   //   );

//   //   // Add any custom headers before sending the response
//   //   Object.entries(headers).forEach(([key, value]) => {
//   //     res.setHeader(key, value);
//   //   });

//   //   return res.status(successResponse.status).json(successResponse);
//   // }
// }

// class OK extends SuccessResponse {
//   constructor({ message, metadata }) {
//     super({ message, metadata });
//   }
// }

// class CREATED extends SuccessResponse {
//   constructor({
//     message,
//     statusCode = StatusCode.CREATED,
//     reasonStatusCode = ReasonStatusCode.CREATED,
//     metadata,
//     options = {},
//   }) {
//     super({ message, statusCode, reasonStatusCode, metadata });
//     this.options = options;
//   }
// }

class SuccessResponse {
  constructor({
    message,
    statusCode = StatusCode.OK,
    reasonStatusCode = ReasonStatusCode.OK,
    metadata = {},
  }) {
    this.message = !message ? reasonStatusCode : message;
    this.status = statusCode;
    this.metadata = metadata;
  }

  send(res, headers = {}) {
    return res.status(this.status).json(this);
  }
}

class OK extends SuccessResponse {
  constructor({ message, metadata }) {
    super(message, StatusCode.OK, ReasonStatusCode.OK, metadata);
  }
}

class CREATED extends SuccessResponse {
  constructor({ message, metadata, options = {} }) {
    super(message, StatusCode.CREATED, ReasonStatusCode.CREATED, metadata);
    this.options = options;
  }
}

module.exports = {
  OK,
  CREATED,
  SuccessResponse,
};
