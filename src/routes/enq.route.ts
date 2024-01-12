import { Router } from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware";
import { createEnquiry, deleteEnquiry, getAllEnquiry, getEnquiry, updateEnquiry } from "../controllers/enq.controller";

const enqRouter: Router = Router();

enqRouter.post("/", createEnquiry);
enqRouter.get("/", authMiddleware, getAllEnquiry);
enqRouter.get("/:id", authMiddleware, getEnquiry);
enqRouter.put("/:id", authMiddleware, updateEnquiry);
enqRouter.delete("/:id", authMiddleware, deleteEnquiry);

export default enqRouter;