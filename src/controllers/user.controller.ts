import { Request, Response } from 'express';
import userModel from '../model/user.model';
import asyncHandler from 'express-async-handler';
import { HttpStatusCode } from '../utils/httpStatusCodes';
import { CART, COUPON, ORDER, PRODUCT, USER } from '../utils/modale.type';
import { generateRefreshToken, generateToken, verifyToken } from '../utils/jwtToken';
import { resData } from '../utils/dataRes';
import { createItem, deleteItem, getItem, getItems, updateItem } from '../utils/mongooseCruds';
import { FilterQuery, UpdateQuery, isValidObjectId } from 'mongoose';
import { handleResponseError, handleResponseSuccess } from '../utils/handleResponse';
import { CustomRequest, EMAILDATA, ORDERSTATUS, OrderProduct } from '../utils/costume.type';
import { JwtPayload } from 'jsonwebtoken';
import { sendEmail } from '../utils/nodemailer.util';
import { createHash } from 'crypto';
import cartModel from '../model/cart.model';
import productModel from '../model/product.model';
import couponModel from '../model/coupon.model';
import { v4 as uuidv4 } from 'uuid';
import orderModel from '../model/order.model';

// ======================= Register User =======================
export const registerUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, mobile, email, password } = req.body;
  // Check if all inputs empty
  if (!firstName || !lastName || !mobile || !email || !password) {
    res.status(HttpStatusCode.BADREQUEST);
    throw new Error('All fields (firstName, lastName, mobile, email, password) are required');
  }
  // Check if user exists
  const existingUser = await getItem(userModel, { email });
  if (existingUser) {
    handleResponseSuccess(res, HttpStatusCode.OK, 'User already exists', [existingUser]);
    return;
  }
  // Create new user
  const newUser = await createItem(userModel, req.body);
  handleResponseSuccess(res, HttpStatusCode.CREATED, 'User created successfully', [newUser]);
});

// ======================= Login User =======================
export const loginUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Email and password is required');
  }

  // Check if user exists
  const findUser = await getItem(userModel, { email });
  if (!findUser) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
    return;
  }
  // Check Matched Password
  const isMatch: boolean = await findUser.isPasswordMatched(password);
  if (isMatch) {
    // Refrech token & update user
    const refreshToken: string = await generateRefreshToken(findUser._id, "3d") as string;
    await updateItem(userModel, {email}, {refreshToken});
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    })
    // Send Response
    handleResponseSuccess(res, HttpStatusCode.OK, 'Success login user', [
      {
        id: findUser._id,
        firstName: findUser.firstName,
        lastName: findUser.lastName,
        mobile: findUser.mobile,
        email: findUser.email,
        token: await generateToken(findUser._id),
      }
    ]);

  }else {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid credentials');
  }
});

// ======================= Login Admin =======================
export const loginAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Email and password is required');
  }

  // Check if user exists
  const findAdmin = await getItem(userModel, { email });
  if (!findAdmin) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
    return;
  }
  // Check Matched Password
  const isMatch: boolean = await findAdmin.isPasswordMatched(password);
  if(isMatch && findAdmin.role !== 'admin') {
    handleResponseError(res, HttpStatusCode.NOTFOUND, 'Unauthorized - your are not an admin');
    return;
  }
  if (isMatch) {
    // Refrech token & update user
    const refreshToken: string = await generateRefreshToken(findAdmin._id, "3d") as string;
    await updateItem(userModel, {email}, {refreshToken});
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000
    })
    // Send Response
    handleResponseSuccess(res, HttpStatusCode.OK, 'Success login user', [
      {
        id: findAdmin._id,
        firstName: findAdmin.firstName,
        lastName: findAdmin.lastName,
        mobile: findAdmin.mobile,
        email: findAdmin.email,
        token: await generateToken(findAdmin._id),
      }
    ]);

  }else {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid credentials');
  }
});

// ======================= Logout User =======================
export const logout = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  const {refreshToken} = req.cookies;
  if(!refreshToken) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "No refresh token in cookies");
    return;
  }
  try {
    const {id} = await verifyToken(refreshToken) as JwtPayload;
    const user: USER | null = await getItem(userModel, {_id: id});
    if(!user) {
      res.clearCookie("refreshToken", {httpOnly: true, secure: true});
      handleResponseError(res, HttpStatusCode.NOCONTENT, "No exists user");
    }
    await updateItem(userModel, {id: user?.id}, {refreshToken: ""});
    res.clearCookie("refreshToken", {httpOnly: true, secure: true});
    handleResponseSuccess(res, HttpStatusCode.NOCONTENT, "logout", []);
  } catch (err) {
    handleResponseError(res, HttpStatusCode.INTERNALSERVERERROR, "Error handling refresh token");
  }
})

// ======================= Get All User =======================
export const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const allUsers = await getItems(userModel, {});
    handleResponseSuccess(res, HttpStatusCode.OK,'All users', allUsers);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get a user =======================
export const getUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    res.status(HttpStatusCode.BADREQUEST).json(resData('Invalid ObjectId', false));
    return;
  }
  try {    
    const user: USER | null = await getItem(userModel, { _id: id });
    if(user)
      handleResponseSuccess(res, HttpStatusCode.OK,`User ${user!.firstName} info`, [user]);
    else
      handleResponseError(res, HttpStatusCode.NOTFOUND, `User not found`);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get user wishlist =======================
export const getWishlist = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  const _id: string = req.user?._id;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    res.status(HttpStatusCode.BADREQUEST).json(resData('Invalid ObjectId', false));
    return;
  }
  try {    
    const user: USER | null = await getItem(userModel, { _id});
    if(user) {
      await user.populate("wishList");
      handleResponseSuccess(res, HttpStatusCode.OK,`User ${user!.firstName} wishlist :`, [user.wishList]);
      return;
    } else {
      handleResponseError(res, HttpStatusCode.NOTFOUND, `User not found`);
      return;
    }
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Delete a user =======================
export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {id} = req.params;
  if (!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID is required');
  } 
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {    
    // Check if user exists before delete it
    const userToDelete = await getItem(userModel, { _id: id });
    if (!userToDelete) {
      handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
      return;
    }
    const user: USER | null = await deleteItem(userModel, { _id: id });
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${user!.firstName} Deleted`, [user]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Update a user =======================
export const updateUser = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
  let id: string;
  // Check if user is update his information
  if (req.url.includes("/edit") && req.user) {
    id = req.user['_id'];
  } else {
    id = req.params.id;
  }
  const { firstName, lastName, mobile, email, password } = req.body;
  // Check id is empty
  if (!id) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID is required');
  } 
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    // Check if user exists before update it
    const userToUpdate = await getItem(userModel, { _id: id });
    if (!userToUpdate) {
      handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
      return;
    }
    const updatedUser = await updateItem(userModel, { _id: id }, req.body);
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${updatedUser!.firstName} Updated`, [updatedUser]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Block|UnBlock a user =======================
export const block = (block:boolean) => {
  return asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const {id} = req.params;

    // Check id is empty
    if (!id) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'ID is required');
    } 
    // Check if the id is a good ObjectId of mongoose
    if(!isValidObjectId(id)) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
      return;
    }
    try {
      // Check if user exists before update it
      const userManageBlock = await getItem(userModel, { _id: id });
      if (!userManageBlock) {
        handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
        return;
      }
      const manageBlock = await updateItem(userModel, { _id: id }, {isBlocked: block});
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${manageBlock!.firstName} ${block? "blocked" : "Unblocked" }`, [manageBlock]);
    } catch (err: any) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
    }
  });
}

// ======================= Handle Refresh token =======================
export const handleRefreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {refreshToken} = req.cookies;
  if(!refreshToken) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "No refresh token in cookies");
    return;
  }
  try {
    const {id} = await verifyToken(refreshToken) as JwtPayload;
    const user: USER | null = await getItem(userModel, {_id: id});
    if(!user) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, "No exists user with this refresh token");
      return;
    }
    const accessToken = await generateToken(user?.id);
    handleResponseSuccess(res, HttpStatusCode.OK, "New access token", [{accessToken}]);
  } catch (err) {
    handleResponseError(res, HttpStatusCode.INTERNALSERVERERROR, "Error handling refresh token");
  }
});

// ======================= Update Password =======================
export const updatePassword = asyncHandler(async (req:CustomRequest, res:Response): Promise<void> => {
  if(!req.user) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "User not exsist");
    return
  }
  const {_id} = req.user;
  const {password} = req.body
  if(!password) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Passoword is required");
    return;
  }
  const user = await getItem(userModel, {_id});
  if(user) {
    user.password = password;
    const updatedUser = await user.save();
    handleResponseSuccess(res, HttpStatusCode.OK, "Password updated", [user]);
  } else {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "User not exsist");
  }
});

// ======================= Forget Password Token =======================
export const forgetPasswordToken = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  // Check "email"
  const {email} = req.body;
  if(!email) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Email is required");
    return;
  }
  // Check if user exists
  const user: USER | null = await getItem(userModel, {email});
  if(!user) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "There's no user with this email");
    return;
  }
  try {
    const token = await user.createPasswordToken();
    await user.save();
    const resetURL = `http://localhost:3000/api/user/reset-password/${token}`
    const resetMessage = `
      Hi, Please follow this link to reset your password. This link is valid till 10 minutes from now 
      <a href="${resetURL}">Click Here</a>
    `;
    const data: EMAILDATA = {// Create email details
      to: email,
      subject: "Forget password link",
      text: `Hey user,`,
      html: resetMessage
    };
    const response: string = await sendEmail(data);
    handleResponseSuccess(res, HttpStatusCode.OK, `Email send to ${email} success`, [{response, token}]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.NOTFOUND, err.message);
  }
});

// ======================= Rest Password =======================
export const resetPassword = asyncHandler(async(req: Request, res: Response): Promise<void> => {
  // Check password
  const { password } = req.body;
  if(!password) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Password is required");
    return;
  }
  // Check token
  const { token } = req.params;
  if(!password) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Token is required");
    return;
  }
  // Search user with token
  const hashedToken: string = createHash("sha256").update(token).digest("hex");
  const user: USER | null = await getItem(userModel, {passwordResetToken: hashedToken});
  if(!user) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "User not exists with this token");
    return;
  }
  if(Number(Date.now()) > Number(user.passwordResetExpires)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, "Token expire");
    return;
  }
  // If user exists change the password and reset token and expiration
  user.password = password;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();
  handleResponseSuccess(res, HttpStatusCode.OK, "User - Change password successfuly", [user]);
});

// ======================= Save User Address =======================
export const saveUserAddress = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  const { address } = req.body;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    // Check if user exists before update it
    const userToUpdate = await getItem(userModel, { _id});
    if (!userToUpdate) {
      handleResponseError(res, HttpStatusCode.NOTFOUND, 'User not found');
      return;
    }
    const updatedUser = await updateItem(userModel, { _id }, {address});
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${updatedUser!.firstName} Update Address`, [updatedUser]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= User Cart Address =======================
export const userCart = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  const cart: OrderProduct[] | undefined = req.body.cart;
  if (!cart || !Array.isArray(cart)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Cart is required & must be an array');
    return;
  } 
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    const product: OrderProduct[] = [];
    const user: USER | null = await getItem(userModel, {_id});
    if(!user) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, `User not exists`);
      return;
    }
    // Check if user already have product in cart
    const alreadyExistsCart = await getItem(cartModel, {orderBy: user._id});
    if(alreadyExistsCart) {
      const newcart: CART | null = await deleteItem(cartModel, {orderBy: user._id});
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${user.firstName} delete this cart :`, [newcart]);
    } else {
      let cartTotal: number = 0;
      for(let i = 0; i < cart.length; i++) {
        let object: OrderProduct = {...cart[i]}
        const cartProduct = await getItem(productModel, {_id: cart[i].productID});
        if(!cartProduct) {
          handleResponseError(res, HttpStatusCode.BADREQUEST, `Product not exists`);
          return;
        }
        const getPrice = cartProduct?.price;
        object.price = getPrice;
        product.push(object);
        cartTotal += (getPrice * cart[i].count);
      }
      const newcart: CART | null = await createItem(cartModel, {products: product, cartTotal, orderBy: _id})
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${user.firstName} add this cart :`, [newcart]);
    }
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get User Cart =======================
export const getUserCart = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    const userCart: CART | null = await getItem(cartModel, {orderBy: _id});
    if(!userCart) {
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${req.user?.firstName} does not have any cart.`, []);
    }
    await userCart?.populate("products.productID");
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${req.user?.firstName} cart :`, [userCart]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Empty User Cart =======================
export const emptyCart = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
    return;
  }
  try {
    const userEmptyCart: CART | null = await deleteItem(cartModel, {orderBy: _id});
    if(!userEmptyCart) {
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${req.user?.firstName} does not have any cart.`, []);
    }
    await userEmptyCart?.populate("products.productID");
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${req.user?.firstName} cart is empty now`, []);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Apply Coupon =======================
export const applyCoupon = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid User ObjectId');
    return;
  }
  const {coupon} = req.body;// Get coupon name from req.body
  try {
    const validCoupon: COUPON | null = await getItem(couponModel, {name: coupon});// Get the coupon
    if(!validCoupon) {// Check if the coupon is not null
      handleResponseError(res, HttpStatusCode.BADREQUEST, `Invalid Coupon`);
      return;
    }
    if(validCoupon !== null && Date.now() > validCoupon.expiry.getTime()) {// Check if the coupon is expire
      handleResponseError(res, HttpStatusCode.BADREQUEST, `Coupon expired`);
      return;
    }
    const getUserCart: CART | null = await getItem(cartModel, {orderBy: _id});
    if(!getUserCart) {// Check if the user does not have a cart
      handleResponseError(res, HttpStatusCode.BADREQUEST, `User does not have any cart`);
      return;
    }
    const {cartTotal} = getUserCart;
    // Calculate prix after discount (use the coupon discount) and add totalAfterDiscount to cart
    const totalAfterDiscount: string = (cartTotal - ((cartTotal * validCoupon.discount) / 100)).toFixed(2);
    const cartAfterApplyCoupon = await updateItem(cartModel, {orderBy: _id}, {totalAfterDiscount})
    handleResponseSuccess(res, HttpStatusCode.OK, `User ${req.user?.firstName} cart after apply coupon is`, [cartAfterApplyCoupon]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Create Order =======================
export const createOrder = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const _id = req.user?._id;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(_id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid User ObjectId');
    return;
  }
  // Get COD && couponApplied and check if COD not exists
  const {COD, couponApplied} = req.body;
  if(!COD) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Create cash order failed!!');
    return;
  }
  try {
    const userCart: CART | null = await getItem(cartModel, {orderBy: _id});// Get the user cart
    if(!userCart) {// Check if the coupon is not null
      handleResponseError(res, HttpStatusCode.BADREQUEST, `User does not have any cart`);
      return;
    };
    // Check if the coupon is applied and this cart has a total amout after discount
    let finalAmout: number = 0;
    if(couponApplied && userCart.totalAfterDiscount) {
      finalAmout = userCart.totalAfterDiscount;
    } else {
      finalAmout = userCart.cartTotal;
    }
    // Create a new order and save it    
    const newOrder: ORDER | null = await createItem(orderModel, {
      products: userCart.products,
      paymentIntent: {
        id: uuidv4(),
        method: "COD",
        amout: finalAmout,
        status: ORDERSTATUS.CashOnDelivery,
        created: Date.now(),
        currency: "usd"
      },
      orderStatus: ORDERSTATUS.CashOnDelivery,
      orderBy: _id
    });
    // Decrease the quentity from product stock quentity
    let updateProducts = userCart.products.map((product: OrderProduct) => {
      const filter: FilterQuery<PRODUCT> = { _id: product.productID };
      const update: UpdateQuery<PRODUCT> = {
        $inc: { quantity: -product.count, sold: +product.count }
      };
      return {
        updateOne: { filter, update }
      }
    });
    const updatedProducts = await productModel.bulkWrite(updateProducts);
    handleResponseSuccess(res, HttpStatusCode.OK, `successfuly - User ${req.user?.firstName} create new order`, [newOrder]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});

// ======================= Get User Orders =======================
export const getUserOrders = (user: boolean = true) => {
  return asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
    let _id: string = req.user?._id;
    if(user) {
      _id = req.user?._id;
    } else {
      _id = req.params.id;
    }    
    // Check if the id is a good ObjectId of mongoose
    if(!isValidObjectId(_id)) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid ObjectId');
      return;
    }
    try {
      const user: USER | null = await getItem(userModel, {_id});
      if(!user) {
        handleResponseError(res, HttpStatusCode.BADREQUEST, 'User not exists');
        return;
      }
      const userOrders: ORDER | null = await getItem(orderModel, {orderBy: _id});
      if(!userOrders) {
        handleResponseSuccess(res, HttpStatusCode.OK, `User ${user?.firstName} does not have any order.`, []);
      }
      await userOrders?.populate("products.productID");
      handleResponseSuccess(res, HttpStatusCode.OK, `User ${user?.firstName} orders :`, [userOrders]);
    } catch (err: any) {
      handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
    }
  });
};

// ======================= Update Order Status =======================
export const updateOrderStatus = asyncHandler(async(req: CustomRequest, res: Response): Promise<void> => {
  const {id} = req.params;
  // Check if the id is a good ObjectId of mongoose
  if(!isValidObjectId(id)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, 'Invalid User ObjectId');
    return;
  }
  // Get status not exists
  const {status} = req.body;
  if(!status) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, `'status' feild is required`);
    return;
  }
  // Check if the status exists in the ORDERSTATUS enum
  if (!Object.values(ORDERSTATUS).includes(status)) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, `Invalid status: ${status}`);
    return;
  }
  try {
    const updatedOrderStatus: ORDER | null = await updateItem(orderModel, {_id: id}, {
      orderStatus: status,
      $set: { 'paymentIntent.status': status }
    });
    if(!updatedOrderStatus) {
      console.log('Status new : ', updatedOrderStatus);
      
      handleResponseError(res, HttpStatusCode.BADREQUEST, `This order not exists`);
      return;
    };
    handleResponseSuccess(res, HttpStatusCode.OK, `successfuly - Order status change`, [updatedOrderStatus]);
  } catch (err: any) {
    handleResponseError(res, HttpStatusCode.BADREQUEST, err.message);
  }
});