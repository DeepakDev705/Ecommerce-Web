const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const multer = require("multer");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { type } = require("os");
const cors = require('cors'); //* Import cors
const dotenv = require('dotenv');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

//* Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());


//* Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend domain
  credentials: true, // Allow credentials (cookies) to be sent
}));

app.set("view engine", "ejs");

//* Set views directory explicitly
app.set("views", path.join(__dirname, "views"));

//* MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/adminDB")
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.log("MongoDB connection error:", err));

//* Define Admin schema and model
const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
  confirmPassword: String,
});

const Admin = mongoose.model("Admin", adminSchema);

//* Routes
app.get("/admin/signup", (req, res) => {
  res.render("signup", { message: null }); // Ensure message is defined as null initially
});

//* Admin signup route (POST)

app.post("/admin/signup", async (req, res) => {
  const { username, password, confirmPassword } = req.body;

  //* Check if passwords match
  if (password === confirmPassword) {
    try {
      //* Check if the username already exists
      const existingAdmin = await Admin.findOne({ username: username });
      if (existingAdmin) {
        return res.render("signup", { message: "Username already exists" });
      }

      //* Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      //* Create a new admin
      await Admin.create({ username: username, password: hashedPassword });

      //* Success message
      res.render("signup", {
        message: "Well done!! You have successfully created admin!!",
      });
    } catch (err) {
      console.error("Error creating admin:", err);
      res.send("Error in admin creation.");
    }
  } else {
    // Password mismatch message
    res.render("signup", { message: "Passwords do not match" });
  }
});

// Admin sign-in route (GET)
app.get("/admin", (req, res) => {
  res.render("signin", { message: null }); // Pass an empty message initially
});

// Admin sign-in route (POST)
app.post("/admin", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await Admin.findOne({ username: username });

    if (admin) {
      // Check if the provided password matches the hashed password in the database
      const isMatch = await bcrypt.compare(password, admin.password);

      if (isMatch) {
        // If password matches, redirect to the change password page
        res.redirect("/admin/change-password");
      } else {
        // If password is incorrect, display an error message
        res.render("signin", { message: "Invalid username or password" });
      }
    } else {
      // If admin not found, display an error message
      res.render("signin", { message: "Invalid username or password" });
    }
  } catch (err) {
    console.error("Error occurred while signing in:", err);
    res.send("Error occurred while signing in.");
  }
});

//////todo Mangae Users/////

app.get("/admin/Manage-Users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from the database
    res.render('Manage-Users', { users }); // Render EJS template with users data
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});




////////todo edit manage Users     ///////

app.get('/admin/edit-Manage-Users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the user from the database by ID
    const user = await User.findById(userId);

    // If user is found, render the edit form with user data
    if (user) {
      res.render('edit-Manage-Users', { user });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route to handle updating user details
app.post('/admin/edit-Manage-Users/:id', async (req, res) => {
  const userId = req.params.id;
  const { name, email, mobile, address } = req.body;

  try {
    // Update user data
    await User.findByIdAndUpdate(userId, { name, email, mobile, address });

    // Reload page with success message
    res.render('edit-Manage-Users', { 
      user: await User.findById(userId), 
      message: 'Well done! User details updated successfully.' 
    });
  } catch (err) {
    console.error(err);
    res.render('edit-Manage-Users', { 
      user: await User.findById(userId), 
      message: 'Error updating user details' 
    });
  }
});


//todo Route to delete a user

app.delete('/delete-user/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id); // Delete user by ID
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});


//////todo change password //////

app.get("/admin/change-password", (req, res) => {
  res.render("change-password", { message: null });
});

app.post("/admin/change-password", async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;

  // Check if any of the fields are empty
  if (!username || !oldPassword || !newPassword) {
    return res.render("change-password", {
      message: "All fields are required",
    });
  }

  try {
    // Proceed to next step if all fields are present
    const admin = await Admin.findOne({ username: username });
    if (!admin) {
      return res.render("change-password", { message: "Username not found" });
    }

    // Check if old password matches the stored password
    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) {
      return res.render("change-password", {
        message: "Old password is incorrect",
      });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the admin's password in the database
    admin.password = hashedNewPassword;
    await admin.save();

    return res.render("change-password", {
      message: "Well Done!! Password updated successfully",
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.render("change-password", { message: "Internal Server Error" });
  }
});

///////category section /////////

// Define the Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Store filename or path
    required: false,
  },
},{ timestamps: true });

// Category model
const Category = mongoose.model("Category", categorySchema);

// Set storage engine for Multer (single file)
const categoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Folder where the images will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  },
});

// File filter for single file upload (category)
const categoryFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only images are allowed!");
  }
};

// Initialize upload middleware for single file
const uploadCategory = multer({
  storage: categoryStorage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: categoryFileFilter,
}).single('image'); // 'image' is the field name in your form


// Serve static files (uploaded images)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route to render the create category page
app.get("/create-category", async (req, res) => {
  try {
    // Fetch all categories to display on the same page
    const categories = await Category.find();

    // Render the create category page with an empty message and existing categories
    res.render("category", { message: null, categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Server error, unable to fetch categories");
  }
});

// Route to handle form submission and create a new category
app.post("/create-category", uploadCategory ,async (req, res) => {
  try {
    const { name } = req.body; // Ensure 'name' matches the input field's name attribute

    // Check if an image is uploaded
    if (!req.file) {
      // Fetch categories to display them in case of error
      const categories = await Category.find();
      return res.render("category", {
        message: "Please upload an image",
        categories,
      });
    }
   // Create a new category
    const newCategory = new Category({
      name: name, // Make sure 'name' is correctly set here
      image: req.file.filename, // Store only the filename in the DB
    });

    // Save the category to the database
    await newCategory.save();

    // Fetch updated categories after the new one is added
    const categories = await Category.find();

    // Respond with a success message and updated categories
    res.render("category", {
      message: "Well Done!! You have successfully created Category",
      categories,
    });
  } catch (error) {
    console.log(error);
    // Fetch categories to display them in case of server error
    const categories = await Category.find();
    res.render("category", { message: "Server error", categories });
  }
});

/// api to delet the category ///

app.delete("/delete/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find and delete category by ID
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Send success response
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category", error });
  }
});

// Route to fetch category data as JSON
app.get("/categories", async (req, res) => {
  try {
    // Fetch all categories from the database
    const categories = await Category.find();

    // Respond with categories in JSON format
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    // Handle any errors with a 500 status and error message
    res.status(500).json({
      success: false,
      message: "Server error, unable to fetch categories",
    });
  }
});




/////// edit category/////////

app.get("/admin/edit-category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).send("Category not found");
    }

    res.render("edit-category", { category, message: null });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post( "/admin/edit-category/:id", uploadCategory, async (req, res) => {
    const categoryId = req.params.id;
    const { name } = req.body;
    let image;

    try {
      if (req.file) {
        image = req.file.filename;
      }
      const updatedData = { name };

      if (image) {
        updatedData.image = `${image}`; // Assign image path
      }

      // Find the category and update it
      const category = await Category.findByIdAndUpdate(
        categoryId, updatedData, { new: true } // Return the updated category
       );

      if (!category) {
        return res.render("edit-category", { category, message: "Category not found" });
      }

      // Success message
      res.render("edit-category", {category, message: "Category updated successfully" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.render("edit-category", { message: "Error updating category" });
    }
  }
);

////////// Sub category//////////

const SubcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Assuming you're linking it to a Category model
    required: true,
  },
  image: {
    type: String, // Store the filename of the uploaded image
    required: false,
  }
}, { timestamps: true });

const Subcategory = mongoose.model("Subcategory", SubcategorySchema);

// Set storage engine for Multer (single file)
const subcategoryStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Folder where the images will be saved
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename with timestamp
  },
});

// File filter for single file upload (category)
const subcategoryFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only images are allowed!");
  }
};

// Initialize upload middleware for single file
const uploadSubcategory = multer({
  storage: subcategoryStorage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: subcategoryFileFilter,
}).single('image'); // 'image' is the field name in your form



app.get("/admin/Sub-category", async (req, res) => {
  try {
    // Fetch the subcategories from the database
    const subcategories = await Subcategory.find({}).populate("category"); // Populate the category reference if using Mongoose

    // Pass subcategories and category to the template
    res.render("Sub-category", { subcategories: subcategories });
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred");
  }
});

app.post("/admin/Sub-category",uploadSubcategory, async (req, res) => {
  const { category, subcategory } = req.body;

  try {
    // Ensure both category and subcategory are provided
    if (!category || !subcategory) {
      const subcategories = await Subcategory.find({}).populate("category"); // Fetch categories
      return res.render("Sub-category", {
        message: "Please provide both category and subcategory!",
        subcategories,
      });
    }

      // Ensure an image was uploaded
      if (!req.file) {
        const subcategories = await Subcategory.find({}).populate("category");
        return res.render("Sub-category", { message: "Please upload an image!", subcategories, });
      }

    // Create a new subcategory
    const newSubcategory = new Subcategory({
      category,
      name: subcategory, // The subcategory name
      image: req.file.filename,
    });

    // Save the new subcategory to the database
    await newSubcategory.save();

    // Fetch updated subcategories after adding the new one
    const updatedSubcategories = await Subcategory.find({}).populate(
      "category"
    );

    // Reload the page with updated data and success message
    res.render("Sub-category", {
      message: "Subcategory added successfully",
      subcategories: updatedSubcategories,
    });
  } catch (error) {
    console.error("Error adding subcategory:", error);

    // Fetch subcategories for rendering in case of an error
    const subcategories = await Subcategory.find({}).populate("category");

    // Render the page with an error message
    res.render("Sub-category", {message: "Server error, unable to add subcategory", subcategories });
  }
});



app.delete("/admin/Sub-category/:id", async (req, res) => {
  const subcategoryId = req.params.id;///params we using for passing the id in url

  try {
    // Delete the subcategory by ID
    await Subcategory.findByIdAndDelete(subcategoryId);

    // Fetch the updated list of subcategories
    const updatedSubcategories = await Subcategory.find({}).populate(
      "category"
    );

    // Re-render the Sub-category page with updated subcategories
    res.render("Sub-category", {
      message: "Subcategory deleted successfully!", subcategories: updatedSubcategories, });
  } catch (error) {
    console.error("Error deleting subcategory:", error);

    // Fetch subcategories to re-render in case of an error
    const subcategories = await Subcategory.find({}).populate("category");

    // Render the page with an error message
    res.render("Sub-category", {
      message: "Server error, unable to delete subcategory!",
      subcategories,
    });
  }
});


//////// edit-subcategory ///////////////

app.get('/admin/edit-subcategory/:id', async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    // Fetch the subcategory and populate the category details
    const subcategory = await Subcategory.findById(subcategoryId).populate('category');
    if (!subcategory) {
      return res.status(404).send('Subcategory not found.');
    }

    // Fetch all categories for the dropdown
    const categories = await Category.find();

    // Render the page with subcategory and categories
    res.render('edit-subcategory', {
      subcategory: subcategory,
      categories: categories,
      message: req.query.message || '' // Optionally pass a message
    });
  } catch (error) {
    console.error('Error fetching subcategory details:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Route to handle updating the subcategory

app.post('/admin/edit-subcategory/:id', uploadSubcategory, async (req, res) => {
  try {
    const subcategoryId = req.params.id;
    const { name, category } = req.body;

    // Find the subcategory by ID
    const subcategory = await Subcategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).send('Subcategory not found.');
    }

    // If a new image is uploaded, update the image field
    const updatedData = {
      name: name,
      category: category,
    };

    if (req.file) {
      updatedData.image = req.file.filename;
    }

    // Update the subcategory
    const updatedSubcategory = await Subcategory.findByIdAndUpdate(
      subcategoryId,
      updatedData,
      { new: true }
    );

    if (!updatedSubcategory) {
      return res.status(404).send('Subcategory not found.');
    }

    // Redirect with a success message
    res.redirect(`/admin/edit-subcategory/${subcategoryId}?message=Subcategory updated successfully`);
  } catch (error) {
    console.error('Error updating subcategory:', error);
    res.status(500).send('Internal Server Error');
  }
});



// API  to get all subcategories
app.get('/subcategories', async (req, res) => {
  try {
    const subcategories = await Subcategory.find(); // Fetch all subcategories from the database
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching subcategories' });
  }
});




app.get('/subcategorie', async (req, res) => {
  const { categoryId } = req.query; // Get the categoryId from the query parameters

  try {
    // Check if `categoryId` is provided
    if (!categoryId) {
      return res.status(400).json({ success: false, message: 'categoryId is required' });
    }

    // Create a new ObjectId from the `categoryId` string
    const objectId = new mongoose.Types.ObjectId(categoryId);

    // Fetch subcategories that belong to the provided `categoryId`
    const subcategories = await Subcategory.find({ category: objectId });

    res.status(200).json({ success: true, data: subcategories });
  } catch (error) {
    console.error('Error fetching subcategories:', error);

    // Handle the case when `categoryId` is invalid or another error occurs
    if (error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ success: false, message: 'Invalid categoryId format' });
    }
    res.status(500).json({ success: false, message: 'Error fetching subcategories', error });
  }
});



//////////// Insert product ////////////




const productSchema = new mongoose.Schema({
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  productname: { type: String, required: true },
  productcompany: { type: String, required: true },
  productbeforediscount: { type: Number, required: true },
  productafterdiscount: { type: Number, required: true },
  productHighlight: { type: String, required: true },
  productDiscription: { type: String, required: true },
  productshippingcharge: { type: Number, required: true },
  productavailbility: { type: String, required: true },
  productimages: [String]  // Array of image paths
},{ timestamps: true });


const Product= mongoose.model('Product', productSchema);

// Set storage engine for Multer (multiple files)
const productStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads"); // Folder where the images will be saved
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique filename with timestamp and random number
  },
});

// File filter for multiple file upload (product)
const productFileFilter = (req, file, cb) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|avif/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Only images are allowed!");
  }
};

// Initialize upload middleware for multiple files
const uploadProduct = multer({
  storage: productStorage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: productFileFilter,
}).fields([
  { name: 'productimage1', maxCount: 1 },
  { name: 'productimage2', maxCount: 1 },
  { name: 'productimage3', maxCount: 1 },
  { name: 'productimage4', maxCount: 1 },
  { name: 'productimage5', maxCount: 1 },
  { name: 'productimage6', maxCount: 1 }
]);


app.get('/admin/Insert-Product', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')  // Populate category field with only name
      .populate('subcategory', 'name');  // Populate subcategory field with only name

    res.render('Insert-Product', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching products');
  }
});


app.post('/admin/Insert-Product', uploadProduct, async (req, res) => {
  try {
    // Log the files and body to debug
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    const {
      category,
      subcategory,  // Ensure this is passed as lowercase
      productname,
      productcompany,
      productbeforediscount,
      productafterdiscount,
      productHighlight,
      productDiscription,
      productshippingcharge,
      productavailbility
    } = req.body;

    // Check if subcategory is undefined or null
    console.log('Subcategory value:', subcategory);

    // Extract filenames from req.files
    const productImages = [
      req.files['productimage1'] ? req.files['productimage1'][0].filename : null,
      req.files['productimage2'] ? req.files['productimage2'][0].filename : null,
      req.files['productimage3'] ? req.files['productimage3'][0].filename : null,
      req.files['productimage4'] ? req.files['productimage4'][0].filename : null,
      req.files['productimage5'] ? req.files['productimage5'][0].filename : null,
      req.files['productimage6'] ? req.files['productimage6'][0].filename : null
    ].filter(filename => filename !== null); // Remove null values

    const product = new Product({
      category,
      subcategory:subcategory,  // Ensure subcategory is passed here
      productname,
      productcompany,
      productbeforediscount,
      productafterdiscount,
      productHighlight,
      productDiscription,
      productshippingcharge,
      productavailbility,
      productimages: productImages
    });

    await product.save();

    // Redirect or render success message
    const products = await Product.find().populate('category', 'name').populate('subcategory', 'name');
    res.render('Insert-Product', { message: 'Product Inserted successfully', products });
  } catch (error) {
    console.error('Error inserting product:', error);
    res.status(500).send('Error inserting product');
  }
});

//////todo oute that handles fetching products by category and subcategory:///

app.get('/products', async (req, res) => {
  const { categoryId, subcategoryId } = req.query;
  
  try {
    // Create a filter object based on the provided query parameters
    const filter = {};
    if (categoryId) filter.category = categoryId; // Using the correct field name
    if (subcategoryId) filter.subcategory = subcategoryId; // Using the correct field name

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subcategory', 'name');

    res.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});

app.get('/searchproducts', async (req, res) => {
  const { search } = req.query;

  try {
    const filter = {};
    
    if (search) {
      // Use a regex to search for the term in product name or description
      filter.$or = [
        { productname: { $regex: search, $options: 'i' } },  // Case-insensitive search for name
         // You can add other fields here
      ];
    }

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subcategory', 'name');

    res.json({ success: true, data: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
});



app.get('/products/:productId', async (req, res) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId); // Mongoose example
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});



////// todo Manage Products////////////

app.get('/admin/Manage-products', async (req, res) => {
  try {
    const products = await Product.find()
      .populate('category', 'name')        // Populate category field
      .populate('subcategory', 'name')    // Populate subcategory field
      .exec(); // Ensure to call .exec() to execute the query

    res.render('Manage-products', { products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send('Server error');
  }
});


// DELETE Product by ID
app.delete('/admin/Manage-products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product', error });
  }
});

////////*  edit manageproducts /////// we will solve the error after some time


app.get('/admin/edit-Manageproducts/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate the product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send('Invalid Product ID.');
    }

    // Find the product by ID and populate the category and subcategory details
    const product = await Product.findById(productId)
      .populate('category', 'name')
      .populate('subcategory', 'name');

    if (!product) {
      return res.status(404).send('Product not found');
    }

    // Fetch all categories and subcategories for dropdowns
    const categories = await Category.find();
    const subcategories = await Subcategory.find();

    // Render the edit product page with product data and dropdown options
    res.render('edit-Manageproducts', {
      product,
      categories,
      subcategories
    });
  } catch (error) {
    console.error('Error fetching product for editing:', error);
    res.status(500).send('Server error');
  }
});


////todo admin-manageproducts/;id ////////

app.post('/admin/edit-Manageproducts/:id', uploadProduct, async (req, res) => {
  try {
    const productId = req.params.id;

    // Extract other fields from the request body
    const {
      category, subcategory, productname, productcompany, productbeforediscount,
      productafterdiscount, productHighlight, productDiscription, productshippingcharge, productavailbility
    } = req.body;

    // Fetch the current product to get existing images
    const currentProduct = await Product.findById(productId);

    if (!currentProduct) {
      return res.status(404).send('Product not found');
    }

    // Initialize the images array with existing images
    let productImages = [...currentProduct.productimages];

    // Update the images only if new ones are uploaded
    if (req.files['productimage1'] && req.files['productimage1'][0]) {
      const newImage1 = req.files['productimage1'][0].filename;
      if (productImages.length > 0) productImages[0] = newImage1;
      else productImages.push(newImage1);
    }
    if (req.files['productimage2'] && req.files['productimage2'][0]) {
      const newImage2 = req.files['productimage2'][0].filename;
      if (productImages.length > 1) productImages[1] = newImage2;
      else productImages.push(newImage2);
    }
    if (req.files['productimage3'] && req.files['productimage3'][0]) {
      const newImage3 = req.files['productimage3'][0].filename;
      if (productImages.length > 2) productImages[2] = newImage3;
      else productImages.push(newImage3);
    }
    if (req.files['productimage4'] && req.files['productimage4'][0]) {
      const newImage4 = req.files['productimage4'][0].filename;
      if (productImages.length > 3) productImages[3] = newImage4;
      else productImages.push(newImage4);
    }
    if (req.files['productimage5'] && req.files['productimage5'][0]) {
      const newImage5 = req.files['productimage5'][0].filename;
      if (productImages.length > 4) productImages[4] = newImage5;
      else productImages.push(newImage5);
    }
    if (req.files['productimage6'] && req.files['productimage6'][0]) {
      const newImage6 = req.files['productimage6'][0].filename;
      if (productImages.length > 5) productImages[5] = newImage6;
      else productImages.push(newImage6);
    }

    // Remove any null values from the array (in case of fewer uploaded images)
    productImages = productImages.filter(filename => filename !== null);

    // Prepare updated data
    const updatedData = {
      category,
      subcategory,
      productname,
      productcompany,
      productbeforediscount,
      productafterdiscount,
      productHighlight,
      productDiscription,
      productshippingcharge,
      productavailbility,
      productimages: productImages
    };

    console.log('Updating Product:', productId);
    console.log('Update Data:', updatedData);

    // Update product in the database
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true })
      .populate('category', 'name')
      .populate('subcategory', 'name');

    if (!updatedProduct) {
      return res.status(404).send('Product not found');
    }

    // Fetch categories and subcategories for dropdowns
    const categories = await Category.find();
    const subcategories = await Subcategory.find();

    // Re-render the edit page with the updated product and message
    res.render('edit-Manageproducts', {
      message: 'Well done !! Product Updated Successfully',
      product: updatedProduct,
      categories,
      subcategories
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Server error');
  }
});




//todo sidebar //////////////////


//* Define a schema for the Slidebar
const slidebarSchema = new mongoose.Schema({
  name: {
      type: String,
      required: true
  },
  image: {
      type: String,
      required: true
  }
},{ timestamps: true });;

//* Create a model for Slidebar
const Slidebar = mongoose.model('Slidebar', slidebarSchema);

//* Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'uploads'); 
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the original file name
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // Set file size limit to 5MB
  fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
          cb(null, true);
      } else {
          cb(new Error('Only image files are allowed!'), false);
      }
  }
});

//* Route to render the slidebar management page
app.get('/admin/Slidebar', async (req, res) => {
  try {
      const slidebars = await Slidebar.find();
      console.log('Slidebars:', slidebars); // Log the slidebars to see if it's defined
      res.render('Slidebar', { slidebars });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});


//* Route to handle form submission
// Route to handle form submission
app.post('/admin/Slidebar', upload.single('image'), async (req, res) => {
  try {
      const { name } = req.body;
      const image = req.file ? req.file.filename : null;

      if (!image) {
          return res.status(400).send('Image is required');
      }

      // Save the slidebar info in the database
      const newSlidebar = new Slidebar({
          name,
          image: `${image}` // Save the relative path to the image
      });

      await newSlidebar.save();

      // Fetch all slidebars after adding the new one
      const slidebars = await Slidebar.find();
      res.render('Slidebar', {
          message: 'Slidebar added successfully!',
          slidebars // Pass the updated slidebars to the render
      });

  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});


//* Route to delete a slidebar by ID
app.delete('/admin/Slidebar/:id', async (req, res) => {
  try {
      const { id } = req.params; // Get the slidebar ID from the request parameters
      const deletedSlidebar = await Slidebar.findByIdAndDelete(id); // Find and delete the slidebar

      if (!deletedSlidebar) {
          return res.status(404).send('Slidebar not found'); // Handle case where slidebar is not found
      }

      res.status(200).send({ message: 'Slidebar deleted successfully!' }); // Respond with success message
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error'); // Handle server errors
  }
});

//////////// todo edit Slidebar   ///////

// Route to render the edit slidebar page
app.get('/admin/edit-Slidebar/:id', async (req, res) => {
  try {
      const { id } = req.params; // Get the slidebar ID from the request parameters
      const slidebar = await Slidebar.findById(id); // Fetch the slidebar from the database

      if (!slidebar) {
          return res.status(404).send('Slidebar not found'); // Handle case where slidebar is not found
      }

      res.render('edit-Slidebar', { slidebar }); // Pass the slidebar data to the EJS template
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error'); // Handle server errors
  }
});

// Route to handle the form submission to update a slidebar
app.post('/admin/edit-Slidebar/:id', upload.single('image'), async (req, res) => {
  try {
      const { id } = req.params; // Get the slidebar ID from the request parameters
      const { name } = req.body; // Get the new slidebar name from the request body
      let image; // Variable to hold the new image filename

      // Check if a new image was uploaded
      if (req.file) {
          image = req.file.filename; // Set the new image filename
      } else {
          // If no new image is uploaded, keep the old image filename
          const slidebar = await Slidebar.findById(id);
          if (!slidebar) {
              return res.status(404).send('Slidebar not found'); // Ensure slidebar exists
          }
          image = slidebar.image; // Retain the existing image
      }

      // Update the slidebar in the database
      const updatedSlidebar = await Slidebar.findByIdAndUpdate(id, {
          name,
          image, // Update with new image filename or retain existing one
          updatedAt: new Date() // Update the updatedAt timestamp
      }, { new: true }); // Return the updated document

      // Redirect to a success page or render with a success message
      res.render('edit-Slidebar', {
          message: 'Slidebar updated successfully!',
          slidebar: updatedSlidebar // Pass the updated slidebar to the render
      });
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error'); // Handle server errors
  }
});



// API endpoint to get all slidebars
app.get('/slidebars', async (req, res) => {
  try {
      const slidebars = await Slidebar.find(); // Fetch all slidebars from the database
      res.json(slidebars); // Send the data as a JSON response
  } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
  }
});

////// todo Order-Management//////////


app.get('/admin/Order-Management', async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email address mobile').populate({
      path: 'productIds', 
      select: ['productname', 'productimages'],
    });

    // Render the page with the orders data
    res.render('Order-Management', { orders }); // Pass 'orders' here
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// Route to fetch order details
app.get('/Order-Details/:id', async (req, res) => {
  try {
      const orderId = req.params.id;

      // Fetch order details by ID and populate user and product details
      const order = await Order.findById(orderId)
      .populate('userId', 'name email address mobile').populate({
        path: 'productIds', 
        select: ['productname', 'productimages'],
      });
      if (!order) {
          return res.status(404).send('Order not found');
      }

      // Render the order details page with the order information
      res.render('Order-Details', { order }); // Ensure you have an `orderDetails.ejs` file
  } catch (error) {
      console.error('Error fetching order details:', error);
      res.status(500).send('An error occurred while fetching order details.');
  }
});




//// todo signup for user from frontend ///////

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String }, // Optional gender field
  mobile: { type: String }, // Optional mobile field
  address: { type: String }, // Optional  address field
}, { timestamps: true });


// Hash the password before saving
UserSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password during login
UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model('User', UserSchema);


// Update user by ID
app.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.gender = req.body.gender;
    user.mobile = req.body.mobile;
    user.address = req.body.address;

    // Save the updated user
    await user.save();

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});



// Define the route to get users

// Fetch user by ID
app.get('/users/:userId', async (req, res) => { // Update to include :userId
  const { userId } = req.params; // Extract userId from the route parameters
  
  try {
    const user = await User.findById(userId); // Fetch the user by ID
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Return 404 if user not found
    }
    res.status(200).json(user); // Return the user data
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' }); // Return 500 for server errors
  }
});



// Signup route
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
      // Check if the email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
          return res.status(400).json({ message: 'Email already registered' });
      }

      // Create a new user and save to the database
      const newUser = new User({ name, email, password });
      await newUser.save();

      res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error, please try again later' });
  }
});


// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.error('User not found');
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.error('Invalid credentials');
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Respond with success and userId
    return res.status(200).json({ message: 'Login successful', userId: user._id });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});


//todo add to cart ////////
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Cart = mongoose.model('Cart', cartSchema); // Updated to use Cart

// Add product to cart
app.post('/add-to-cart', async (req, res) => {
  const { userId, productId } = req.body;
  console.log('Received add-to-cart request:', { userId, productId });

  try {
    // Find the cart associated with the userId
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // If the cart doesn’t exist, create a new one
      console.log('Creating new cart');
      cart = new Cart({ userId, products: [new mongoose.Types.ObjectId(productId)] }); // Use new here
    } else if (!cart.products.includes(productId)) {
      // If the product is not already in the cart, add it
      console.log('Adding product to existing cart');
      cart.products.push(new mongoose.Types.ObjectId(productId)); // Use new here
    } else {
      // If the product is already in the cart, notify the user
      console.log('Product already in cart');
      return res.status(400).json({ message: 'Product is already in cart' });
    }

    // Save the cart to the database
    await cart.save();
    console.log('Cart saved successfully');
    res.status(200).json({ message: 'Product added to cart successfully!', cart });
  } catch (error) {
    console.error('Error in /add-to-cart:', error);
    res.status(500).json({ error: 'Failed to add product to cart' });
  }
});



// Route to fetch the user's cart
app.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters

  try {
    // Find the cart associated with the userId
    const cart = await Cart.findOne({ userId }).populate('products'); // Populate product details

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // If cart exists but no products, inform the user
    if (cart.products.length === 0) {
      return res.status(200).json({ message: "Your cart is empty.", cart });
    }

    // Log the fetched cart data (for debugging purposes)
    console.log('Fetched cart data:', JSON.stringify(cart, null, 2)); // Log the fetched cart data in a pretty format

    // Return the cart data in JSON format
    res.status(200).json(cart); 
  } catch (error) {
    console.error('Error fetching cart:', error);  // Log the error to the console
    res.status(500).json({ message: "Failed to fetch cart." });
  }
});

// Route to remove a product from the cart
app.delete('/cart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // Find the cart associated with the userId
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found." });
    }

    // Filter out the product to be removed
    const updatedProducts = cart.products.filter(
      (product) => product.toString() !== productId
    );

    // Check if the product was in the cart
    if (updatedProducts.length === cart.products.length) {
      return res.status(400).json({ message: "Product not found in cart." });
    }

    // Update the cart's products and save
    cart.products = updatedProducts;
    await cart.save();

    console.log('Product removed from cart successfully:', productId);
    res.status(200).json({ message: "Product removed successfully.", cart });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ message: "Failed to remove product from cart." });
  }
});




//todo add wishlisht//////

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

// Route to add a product to the wishlist
app.post('/wishlist/add-to-wishlist', async (req, res) => {
  const { userId, productId } = req.body;

  // Check if userId and productId are provided
  if (!userId || !productId) {
    return res.status(400).json({ message: "User ID and Product ID are required." });
  }

  try {
    // Find the existing wishlist for the user
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      // Create a new wishlist if none exists
      console.log('Creating new wishlist');
      wishlist = new Wishlist({ userId, products: [new mongoose.Types.ObjectId(productId)] }); // Use new ObjectId here
    } else {
      // Check if the product is already in the wishlist
      if (!wishlist.products.includes(productId)) {
        console.log('Adding product to existing wishlist');
        wishlist.products.push(new mongoose.Types.ObjectId(productId)); // Use new ObjectId here
      } else {
        return res.status(400).json({ message: "Product is already in wishlist." });
      }
    }

    // Save the wishlist
    await wishlist.save();
    res.status(200).json({ message: "Product added to wishlist successfully!", wishlist });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: "Failed to add product to wishlist." });
  }
});



// Route to get user's wishlist
app.get('/wishlist/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // Find the wishlist associated with the userId and populate product details
    const wishlist = await Wishlist.findOne({ userId }).populate('products'); 

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    // Log the fetched wishlist data in a pretty format
    console.log('Fetched wishlist data:', JSON.stringify(wishlist, null, 2));

    // Return the wishlist data in JSON format
    res.status(200).json(wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Route to remove a product from the wishlist
app.delete('/wishlist/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    // Find the wishlist associated with the userId
    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found." });
    }

    // Filter out the product to be removed
    const updatedProducts = wishlist.products.filter(
      (product) => product.toString() !== productId
    );

    // Check if the product was in the wishlist
    if (updatedProducts.length === wishlist.products.length) {
      return res.status(400).json({ message: "Product not found in wishlist." });
    }

    // Update the wishlist's products and save
    wishlist.products = updatedProducts;
    await wishlist.save();

    console.log('Product removed from wishlist successfully:', productId);
    res.status(200).json({ message: "Product removed successfully.", wishlist });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ message: "Failed to remove product from wishlist." });
  }
});

//todo Payment Gateway //////

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  productIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Array of Product IDs
  quantity: { type: Number, required: true },
  orderId: { type: String, required: true },
  paymentId: { type: String },
  signature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  receipt: { type: String, required: true },
  status: { type: String, default: 'Failure' },
  deliveryStatus: { type: String, default: 'Your Order is Processing' }, // Delivery status of the order
  createdAt: { type: Date, default: Date.now },
}); 


const Order = mongoose.model('Order', OrderSchema);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order route
app.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt, userId, productIds,quantity } = req.body;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Convert amount to paise
      currency,
      receipt,
    });

    // Log Razorpay response for debugging
    console.log('Razorpay Order:', razorpayOrder);

    // Save order details to database
    const newOrder = new Order({
      orderId: razorpayOrder.id,
      amount,
      currency,
      receipt,
      userId,
      productIds,
      quantity,
    });
    await newOrder.save();

    // Return the created order as response
    res.json(newOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: error.message });
  }
});




// Verify payment route
app.post('/verify-payment', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Generate HMAC for verification
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET); // Use your Razorpay secret
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    // Verify the signature
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update payment status in database
    await Order.findOneAndUpdate(
      { orderId: razorpay_order_id },
      { paymentId: razorpay_payment_id, signature: razorpay_signature, status: 'Success' }
    );

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get orders for a specific user
app.get('/orders/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find orders for the given userId and populate the user and products
    const orders = await Order.find({ 'userId': userId })
      .populate('userId', 'name email address')  // Populate userId with 'name' and 'email'
      .populate({
        path: "productIds", // Populate product details
        select: [
          "productname",
          "productimages",
        ],
      });


    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json(orders); // Send the populated orders back to the client
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

app.get('/orders', async (req, res) => {
  try {
    // Find all orders and populate the user and products
    const orders = await Order.find()
      .populate('userId', 'name email address')  // Populate userId with 'name' and 'email'
      .populate({
        path: "productIds", // Populate product details
        select: [
          "productname",
          "productimages",
        ],
      });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders); // Send the populated orders back to the client
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Error fetching orders." });
  }
});


//todo Route to update delivery status

app.post('/admin/update-delivery-status', async (req, res) => {
  try {
      const { orderId, deliveryStatus } = req.body;

      // Find the order by ID and update the delivery status
      const order = await Order.findById(orderId);
      if (!order) {
          return res.status(404).send('Order not found');
      }

      order.deliveryStatus = deliveryStatus;
      await order.save();

      // Redirect back to the order details page
      res.redirect(`/Order-Details/${orderId}`);
  } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).send('Internal Server Error');
  }
});








app.listen(7000, () => {
  console.log("Server started on port 7000");
});


