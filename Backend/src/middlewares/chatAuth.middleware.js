import { ApiError } from "../utils/ApiError.js";

export const canChat = (req, res, next) => {
  const { user } = req;
  const { recipientId } = req.body;

  if (!recipientId) throw new ApiError(400, "recipientId is required");

  if (user._id.toString() === recipientId.toString()) {
    throw new ApiError(403, "You cannot chat with yourself");
  }

  next();
};
