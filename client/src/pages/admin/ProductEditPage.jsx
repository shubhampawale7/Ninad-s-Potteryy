// client/src/pages/admin/ProductEditPage.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { AuthContext } from "../../context/AuthContext";
import { MdDelete, MdUpload } from "react-icons/md";

function ProductEditPage() {
  const { id } = useParams(); // Product ID, or 'new' if creating
  const navigate = useNavigate();
  const { state: authState } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]); // Array of { public_id, url }
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");

  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false); // For image upload
  const [uploadError, setUploadError] = useState(null);
  const [updatingProduct, setUpdatingProduct] = useState(false); // For product update/create

  useEffect(() => {
    if (!authState.user || authState.user.role !== "admin") {
      navigate("/login");
      toast.error("Unauthorized access. Admin privileges required.");
      return;
    }

    if (id && id !== "new") {
      // Fetch product if editing an existing one
      setProductLoading(true);
      const fetchProduct = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/products/${id}`, {
            headers: {
              Authorization: `Bearer ${authState.user.token}`,
            },
          });
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          setName(data.name);
          setPrice(data.price);
          setImages(data.images);
          setBrand(data.brand);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
        } catch (err) {
          setProductError(err.message);
          toast.error(`Failed to fetch product: ${err.message}`);
        } finally {
          setProductLoading(false);
        }
      };
      fetchProduct();
    } else {
      // Reset form if creating a new one
      setName("");
      setPrice(0);
      setImages([]);
      setBrand("");
      setCategory("");
      setCountInStock(0);
      setDescription("");
    }
  }, [id, authState.user, navigate]);

  const uploadFileHandler = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file); // 'images' must match backend middleware key
    });

    setUploadingImages(true);
    setUploadError(null);
    try {
      const res = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authState.user.token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImages((prevImages) => [...prevImages, ...data]); // Add new images to existing ones
        toast.success("Images uploaded successfully!");
      } else {
        setUploadError(data.message);
        toast.error(data.message || "Image upload failed");
      }
    } catch (error) {
      setUploadError(error.message);
      toast.error("Network error or server unavailable");
      console.error("Image upload error:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImageHandler = (public_id) => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      setImages((prevImages) =>
        prevImages.filter((img) => img.public_id !== public_id)
      );
      toast.info("Image removed from list (will be saved on product update).");
      // You might want to add a backend call here to delete from Cloudinary immediately
      // but for simplicity, we'll just remove from product images on update.
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setUpdatingProduct(true);
    try {
      const method = id && id !== "new" ? "PUT" : "POST";
      const url =
        id && id !== "new"
          ? `http://localhost:5000/api/products/${id}`
          : `http://localhost:5000/api/products`;

      const productData = {
        name,
        price,
        images, // Send the updated images array
        brand,
        category,
        countInStock,
        description,
      };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.user.token}`,
        },
        body: JSON.stringify(productData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          id && id !== "new"
            ? "Product updated successfully!"
            : "Product created successfully!"
        );
        navigate("/admin/products"); // Go back to product list
      } else {
        toast.error(
          data.message ||
            (id && id !== "new"
              ? "Failed to update product"
              : "Failed to create product")
        );
      }
    } catch (error) {
      toast.error("Network error or server unavailable");
      console.error("Product save error:", error);
    } finally {
      setUpdatingProduct(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        to="/admin/products"
        className="text-blue-600 hover:underline mb-6 inline-block"
      >
        &larr; Back to Product List
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        {id && id !== "new" ? "Edit Product" : "Create Product"}
      </h1>

      {productLoading || updatingProduct ? (
        <p className="text-center py-10 text-gray-600">Loading...</p>
      ) : productError ? (
        <p className="text-center py-10 text-red-600">Error: {productError}</p>
      ) : (
        <form
          onSubmit={submitHandler}
          className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto space-y-6"
        >
          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="name"
            >
              Product Name
            </label>
            <input
              type="text"
              id="name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="price"
            >
              Price
            </label>
            <input
              type="number"
              id="price"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter price"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="imageUpload"
            >
              Product Images
            </label>
            <input
              type="file"
              id="imageUpload"
              className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100 cursor-pointer"
              onChange={uploadFileHandler}
              multiple // Allow multiple file selection
              accept="image/*"
              disabled={uploadingImages}
            />
            {uploadingImages && (
              <p className="text-blue-500 mt-2 flex items-center">
                <MdUpload className="mr-1 animate-pulse" /> Uploading images...
              </p>
            )}
            {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}

            <div className="mt-4 grid grid-cols-3 gap-2">
              {images.map((img) => (
                <div
                  key={img.public_id}
                  className="relative group w-24 h-24 overflow-hidden rounded-md border border-gray-300"
                >
                  <img
                    src={img.url}
                    alt="product-thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageHandler(img.public_id)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Remove Image"
                  >
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="brand"
            >
              Brand
            </label>
            <input
              type="text"
              id="brand"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="category"
            >
              Category
            </label>
            <input
              type="text"
              id="category"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="countInStock"
            >
              Count In Stock
            </label>
            <input
              type="number"
              id="countInStock"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter stock quantity"
              value={countInStock}
              onChange={(e) => setCountInStock(Number(e.target.value))}
              required
              min="0"
            />
          </div>

          <div>
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              rows="5"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter product description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={updatingProduct || uploadingImages}
          >
            {id && id !== "new" ? "Update Product" : "Create Product"}
          </button>
        </form>
      )}
    </div>
  );
}

export default ProductEditPage;
