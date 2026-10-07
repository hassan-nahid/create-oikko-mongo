# AI Agent Guidelines & Architecture Rules

Welcome AI Coding Assistant! This project is an enterprise MERN (MongoDB + Express + TypeScript) backend bootstrapped with `create-oikko-mongo`.

Follow these rules and conventions strictly when reading, generating, or refactoring code in this repository.

---

## 1. Core Architectural Pattern

This codebase strictly adheres to the **Modular Clean Architecture** pattern.

Every business domain lives in `src/app/modules/<moduleName>/`.
A complete module contains:
```
src/app/modules/<moduleName>/
├── <moduleName>.interface.ts    # TypeScript interfaces, types & enums
├── <moduleName>.validation.ts   # Zod validation schemas
├── <moduleName>.model.ts        # Mongoose Schema & Model definitions
├── <moduleName>.service.ts      # Pure business logic and database operations
├── <moduleName>.controller.ts   # HTTP request/response handling (wrapped in catchAsync)
└── <moduleName>.route.ts        # Express router definitions with middlewares
```

### Module Registration
Every new module route MUST be registered in `src/app/routes/index.ts`:
```typescript
const moduleRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/otp", route: OtpRoutes },
    // Add new module routes here
];
```

---

## 2. Coding Rules & Best Practices

### Rule 1: Always use `catchAsync` in Controllers
Never use raw `try/catch` inside controllers. Always wrap async controller functions with `catchAsync`:
```typescript
import { Request, Response } from "express";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProductServices } from "./product.service";

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductServices.createProductService(req.body);
    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Product created successfully",
        data: result,
    });
});
```

### Rule 2: Always use `sendResponse` for API Responses
All successful API responses must conform to the unified envelope structure:
```typescript
sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Data retrieved successfully",
    data: result.data,
    meta: result.meta, // Optional pagination meta: { page, limit, total, totalPage }
});
```

### Rule 3: Error Handling & `AppError`
- Never throw generic `Error` or string messages.
- Always throw `AppError` with a proper HTTP status code from `http-status-codes`:
```typescript
import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/appError";

if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, "Product not found");
}
```
All errors will be caught and formatted centrally by `src/app/middlewares/globalErrorHandler.ts`.

### Rule 4: Request Validation with Zod
Always validate incoming requests before reaching the controller.
1. Define schema in `<moduleName>.validation.ts`:
```typescript
import { z } from "zod";

const createProductSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
        price: z.number().positive("Price must be positive"),
    }),
});

export const ProductValidation = {
    createProductSchema,
};
```
2. Attach `validateRequest` middleware to the route:
```typescript
import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { ProductValidation } from "./product.validation";
import { ProductController } from "./product.controller";

const router = Router();
router.post(
    "/create",
    validateRequest(ProductValidation.createProductSchema),
    ProductController.createProduct
);
```

### Rule 5: Authentication & Role-Based Access Control (RBAC)
Protect routes using `checkAuth` middleware:
- Unrestricted authenticated access: `checkAuth()`
- Role-restricted access: `checkAuth(Role.ADMIN, Role.SUPER_ADMIN)`
```typescript
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), ProductController.deleteProduct);
```
Access the decoded user token in controllers:
```typescript
import { JwtPayload } from "jsonwebtoken";

const getMyProducts = catchAsync(async (req: Request, res: Response) => {
    const user = req.user as JwtPayload;
    const result = await ProductServices.getProductsByUser(user.userId);
    // ...
});
```

### Rule 6: Accessing Environment Variables
Never access `process.env.VARIABLE_NAME` directly across the codebase.
Always import the validated, type-safe configuration from `src/app/config/env.ts`:
```typescript
import env from "../config/env";

const port = env.PORT;
const dbUrl = env.DB_URL;
```

---

## 3. Workflow for Adding a New Feature

When requested to create a new feature (e.g. `order`):
1. **Interface**: Create `src/app/modules/order/order.interface.ts`.
2. **Schema & Model**: Create `src/app/modules/order/order.model.ts` using Mongoose.
3. **Validation**: Create `src/app/modules/order/order.validation.ts` using Zod.
4. **Service**: Create `src/app/modules/order/order.service.ts` with business logic and database queries.
5. **Controller**: Create `src/app/modules/order/order.controller.ts` with handlers wrapped in `catchAsync`.
6. **Route**: Create `src/app/modules/order/order.route.ts` with validations and auth guards.
7. **Registration**: Export `OrderRoutes` and mount in `src/app/routes/index.ts`.
