import userModel from "../models/userModel.js";
import axios from "axios";

export const generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    const userId = req.body.userId; // or req.user.id if using middleware

    if (!userId || !prompt) {
      return res
        .status(400)
        .json({ success: false, message: "Missing prompt or user ID" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.creditBalance <= 0) {
  return res.status(403).json({
    success: false,
    message: "No Credit Balance",
    creditBalance: user.creditBalance,
  });
}


    // ✅ Call ClipDrop API
    const clipdropResponse = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      { prompt },
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // ClipDrop returns image binary
      }
    );

    // ✅ Convert image buffer to base64 URL to return directly to frontend
    const base64Image = `data:image/png;base64,${Buffer.from(
      clipdropResponse.data
    ).toString("base64")}`;

    // ✅ Deduct 1 credit from user
    await userModel.findByIdAndUpdate(userId, {
      creditBalance: user.creditBalance - 1,
    });

    res.status(200).json({
      success: true,
      message: "Image Generated",
      creditBalance: user.creditBalance - 1,
      resultImage: base64Image,
    });
  } catch (error) {
    console.error("Image generation error:", error.message);
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to generate image using ClipDrop",
    });
  }
};
