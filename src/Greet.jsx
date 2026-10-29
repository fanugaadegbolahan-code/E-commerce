import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";



const Greet = ({ disk }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        const response = await axios.get("https://dummyjson.com/products", {
          signal: controller.signal,
        });

        setData(response.data.products);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setError("Failed to fetch products.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <div className="store">
      <h1>Hello Greet</h1>

      <p>{disk}</p>

      {loading && <p>Loading products...</p>}

      {error && <p>{error}</p>}

      <div className="products">
        {data.map((item) => (
          <Link
            to={`/product/${item.id}`}
            className="product-card"
            key={item.id}
          >
            <img
              src={item.thumbnail}
              alt={item.title}
              width={200}
            />

            <h2>{item.title}</h2>

            <p>{item.description}</p>

            <h3>${item.price}</h3>

            <span>View Product →</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Greet;