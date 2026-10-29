import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";

const ProductDetail = () => {
  const { id } = useParams();

  const [result, setResult] = useState({ id: null, product: null, error: "" });
  const loading = result.id !== id;
  const product = loading ? null : result.product;
  const error = loading ? "" : result.error;

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        const response = await axios.get(
          `https://dummyjson.com/products/${id}`,
          { signal: controller.signal }
        );

        setResult({ id, product: response.data, error: "" });
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setResult({ id, product: null, error: "Unable to load product." });
        }
      }
    };

    loadProduct();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <h2>Loading product...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!product) {
    return <h2>Product not found.</h2>;
  }

  return (
    <div className="product-detail">
      <Link to="/" className="back-button">
        ← Back to Products
      </Link>

      <div className="detail-container">
        <div className="detail-image">
          <img
            src={product.thumbnail}
            alt={product.title}
          />
        </div>

        <div className="detail-info">
          <p className="category">
            {product.category}
          </p>

          <h1>{product.title}</h1>

          <p className="rating">
            ⭐ {product.rating} / 5
          </p>

          <h2>${product.price}</h2>

          <p className="description">
            {product.description}
          </p>

          <div className="product-meta">
            <p>
              <strong>Brand:</strong> {product.brand}
            </p>

            <p>
              <strong>Stock:</strong> {product.stock}
            </p>

            <p>
              <strong>Discount:</strong>{" "}
              {product.discountPercentage}%
            </p>

            <p>
              <strong>SKU:</strong> {product.sku}
            </p>
          </div>

          <button className="add-cart">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;