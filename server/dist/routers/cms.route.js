import express from "express";
import { getCmsContent, updateCmsContent } from "../controllers/cms.controller.js";
import { authGuard, adminGuard } from "../middlewares/auth.middleware.js";
import { uploadCmsFile } from "../middlewares/upload.middleware.js";
const router = express.Router();
router.get("/", getCmsContent);
router.put("/", authGuard, adminGuard, updateCmsContent);
router.post("/upload", authGuard, adminGuard, uploadCmsFile.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ status: "fail", message: "No file uploaded" });
    }
    const pathUrl = req.file.path.replace(/\\/g, "/");
    res.status(200).json({
        status: "success",
        url: pathUrl
    });
});
export default router;
//# sourceMappingURL=cms.route.js.map