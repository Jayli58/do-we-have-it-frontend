"use strict";

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;

  if (request.uri === "/api") {
    request.uri = "/";
  } else if (request.uri.startsWith("/api/")) {
    request.uri = request.uri.substring(4);
  }

  return request;
};
