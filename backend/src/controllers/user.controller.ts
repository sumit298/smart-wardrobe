import { Response, Request } from "express";

interface UserController {
    /**
   * Create a User
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response<any, Record<string, any>>>}
   */
  register: (
    req: Request,
    res: Response
  ) => Promise<Response<any, Record<string, any>>>;

  /**
   * Login a User
   *
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response<any, Record<string, any>>>}
   */
  login: (
    req: Request,
    res: Response
  ) => Promise<Response<any, Record<string, any>>>;

  /**
   * Logout a User
   * 
   * @param {Request} req - The request object.
   * @param {Response} res - The response object.
   * @returns {Promise<Response<any, Record<string, any>>>}
   */
  logout: (
    req: Request,
    res: Response
  ) => Promise<Response<any, Record<string, any>>>;
   

  

}