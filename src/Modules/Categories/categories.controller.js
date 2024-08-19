import slugify from "slugify";
import { nanoid } from "nanoid";
// utils
import { ErrorClass } from "../../Utils/error-class.utils.js";
import { cloudinaryConfig } from "../../Utils/cloudinary.utils.js";
// models
import { Category } from "../../../DB/Models/index.js";

/**
 * @api {POST} /categories/create  create a  new category
 */
export const createCategory = async (req, res, next) => {
  // destructuring the request body
  const { name } = req.body;

  // Generating category slug
  const slug = slugify(name, {
    replacement: "_",
    lower: true,
  });

  // Image
  if (!req.file) {
    return next(
      new ErrorClass("Please upload an image", 400, "Please upload an image")
    );
  }
  // upload the image to cloudinary
  const customId = nanoid(4);
  const { secure_url, public_id } = await cloudinaryConfig().uploader.upload(
    req.file.path,
    {
      folder: `${process.env.UPLOADS_FOLDER}/Categories/${customId}`,
    }
  );

  // prepare category object
  const category = {
    name,
    slug,
    Images: {
      secure_url,
      public_id,
    },
    customId,
  };

  // create the category in db
  const newCategory = await Category.create(category);

  // send the response
  res.status(201).json({
    status: "success",
    message: "Category created successfully",
    data: newCategory,
  });
};

/**
 * @api {GET} /categories Get category by name or id or slug
 */
export const getCategory = async (req, res, next) => {
    const { id, name, slug } = req.query;
    const queryFilter = {};
  
    // check if the query params are present
    if (id) queryFilter._id = id;
    if (name) queryFilter.name = name;
    if (slug) queryFilter.slug = slug;
  
    // find the category
    const category = await Category.findOne(queryFilter);
  
    if (!category) {
      return next(
        new ErrorClass("Category not found", 404, "Category not found")
      );
    }
  
    res.status(200).json({
      status: "success",
      message: "Category found",
      data: category,
    });
  };