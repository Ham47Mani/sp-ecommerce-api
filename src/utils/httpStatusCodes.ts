// HTTP Response Status Codes
export enum HttpStatusCode {
  CONTINUE = 100, // The server has received the request headers and the client should proceed to send the request body.
  SWITCHINGPROTOCOLS = 101, // The requester has asked the server to switch protocols.
  PROCESSING = 102, // The server is processing the request but has not yet completed it.

  OK = 200, // The request was successful.
  CREATED = 201, // The request has been fulfilled, resulting in the creation of a new resource.
  ACCEPTED = 202, // The request has been accepted for processing but is not yet completed.
  NOCONTENT = 204, // The server successfully processed the request but doesn't need to return any content.
  RESETCONTENT = 205, // Tells the client to reset the document view.
  PARTIALCONTENT = 206, // The server is delivering part of the resource due to a range header sent by the client.
  MULTISTATUS = 207, // Provides status for multiple independent operations.

  MULTIPLECHOICES = 300, // The requested resource corresponds to any one of a set of representations.
  MOVEDPERMANENTLY = 301, // The requested resource has been permanently moved to a new location.
  FOUND = 302, // The server is redirecting the client to a different URL.
  SEEOTHER = 303, // The response to the request can be found under a different URL.
  NOTMODIFIED = 304, // Indicates that the resource has not been modified since the version specified by the request headers.
  USEPROXY = 305, // The requested resource must be accessed through the proxy mentioned in the Location header.
  TEMPORARYREDIRECT = 307, // The request should be temporarily redirected to another URL.
  PERMANENTREDIRECT = 308, // The request and all future requests should be repeated using another URL.

  BADREQUEST = 400, // The server cannot process the request due to a client error.
  NOTFOUND = 404, // The server cannot process the request due to a client error.
  UNAUTHORIZED = 401, // The client must authenticate to get the requested response.
  // ... (and so on, explaining each status code)

  INTERNALSERVERERROR = 500, // A generic error message returned when the server encounters an unexpected condition.
  NOTIMPLEMENTED = 501, // The server does not support the functionality required to fulfill the request.
  // ... (and so on, explaining each status code)
};