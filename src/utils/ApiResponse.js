class ApiResponse {
  constructor(statusCode, data, message = "Request successful") {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = true;
  }
}
export {ApiResponse}