  import React, { useEffect, useState } from "react";
  import axios from "axios";
  import { RiArrowDropDownLine } from "react-icons/ri";
  import { useNavigate } from "react-router-dom";
  import '../assets/CategoriesList.css';
  
  const CategoriesList = () => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [hoveredCategoryId, setHoveredCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
  
    // Fetch categories from the backend API
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get("http://localhost:7000/categories");
          if (response.data && response.data.success) {
            setCategories(response.data.data);
          }
        } catch (err) {
          setError("Error fetching categories.");
          console.error("Error fetching categories:", err);
        } finally {
          setLoading(false);
        }
      };
  
      fetchCategories();
    }, []);
  
    // Fetch subcategories when a category is hovered
    const fetchSubcategories = async (categoryId) => {
      try {
        const response = await axios.get(
          `http://localhost:7000/subcategorie?categoryId=${categoryId}`
        );
        if (response.data && response.data.success) {
          setSubcategories((prevState) => ({
            ...prevState,
            [categoryId]: response.data.data,
          }));
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      }
    };
  
    // Navigate to the products page when a subcategory is clicked
    const handleSubcategoryClick = (categoryId, subcategoryId) => {
      navigate(`/products/${categoryId}/${subcategoryId}`);
    };
  
    if (loading) return <p>Loading categories...</p>;
    if (error) return <p>{error}</p>;
  
    return (
      <div className="categories-container">
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.slice(0, 7).map((category) => (
            <div
              key={category._id}
              className="category-item"
              onMouseEnter={() => {
                setHoveredCategoryId(category._id);
                fetchSubcategories(category._id); // Fetch subcategories on hover
              }}
              onMouseLeave={() => setHoveredCategoryId(null)} // Clear on mouse leave
            >
              <img
                src={`http://localhost:7000/uploads/${category.image}`}
                alt={category.name}
              />
              <h5>
                {category.name}
                <RiArrowDropDownLine className="dropdown-icon" />
              </h5>
  
              {hoveredCategoryId === category._id && (
                <div className="dropdown-subcategory">
                  {subcategories[category._id] &&
                  subcategories[category._id].length > 0 ? (
                    <ul key={`ul-${category._id}`}>
                      {subcategories[category._id].map((subcategory) => (
                        <li
                          key={subcategory._id}
                          onClick={() =>
                            handleSubcategoryClick(category._id, subcategory._id)
                          }
                        >
                          {subcategory.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="no-subcategories">No subcategories available</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No categories available.</p>
        )}
      </div>
    );
  };
  
  export default CategoriesList;
  