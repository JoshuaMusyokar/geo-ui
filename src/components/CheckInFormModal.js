"use client";
import React, { useState, useCallback, useEffect } from "react";
import { Camera, X, Loader2, MapPin } from "lucide-react";

const CheckInFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("success");
        setLocationInput("Current Location"); // Optionally set a label for the location input
      },
      () => {
        setLocationStatus("error");
        setError("Failed to get location. Please try again.");
      }
    );
  };

  const fetchLocationSuggestions = async (query) => {
    if (!query) {
      setLocationSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=AIzaSyBJ_KG6ykrtije7hb4BGwBIus3SoltgEcU`
      );
      const data = await response.json();
      setLocationSuggestions(data.predictions || []);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
    }
  };

  const handleLocationChange = (event) => {
    const query = event.target.value;
    setLocationInput(query);
    fetchLocationSuggestions(query);
  };

  const handleSuggestionSelect = (suggestion) => {
    setLocationInput(suggestion.description);
    setLocation({
      lat: suggestion.geometry.location.lat,
      lng: suggestion.geometry.location.lng,
    });
    setLocationSuggestions([]);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();

    // Append title and description
    if (title) {
      formData.append("title", title);
    } else {
      console.error("Title is missing");
    }

    if (description) {
      formData.append("description", description);
    } else {
      console.error("Description is missing");
    }

    // Append location if available
    if (location) {
      formData.append("location", JSON.stringify(location));
    }

    // Handle image if available
    if (imagePreview) {
      try {
        const response = await fetch(imagePreview);
        const blob = await response.blob();
        formData.append("image", blob, "check-in-image.jpg");
      } catch (error) {
        console.error("Error fetching the image:", error);
      }
    }

    // Debugging the formData contents
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }
    console.log("FormData title:", formData.get("title"));
    // Call the onSubmit handler with the formData
    await onSubmit(formData);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImagePreview(null);
    setLocation(null);
    setLocationStatus("idle");
    setError(null);
    setLocationInput("");
    setLocationSuggestions([]);
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "flex" : "hidden"
      } justify-center items-center`}
    >
      <div
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={handleClose}
      />
      <div className="bg-white rounded-lg p-6 shadow-lg z-10">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          New Job Check-In
        </h3>
        {error && (
          <div className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              value={locationInput}
              onChange={handleLocationChange}
              placeholder="Enter location"
              className="w-full border rounded-lg px-3 py-2"
            />
            {locationSuggestions.length > 0 && (
              <ul className="absolute z-20 bg-white border rounded-lg mt-1 max-h-60 overflow-y-auto">
                {locationSuggestions.map((suggestion) => (
                  <li
                    key={suggestion.place_id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-100"
                  >
                    {suggestion.description}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image Upload
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-500"
            />
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-[200px] mx-auto rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2"
                  onClick={() => setImagePreview(null)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <button
              type="button"
              onClick={handleClose}
              className="border rounded-lg px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white rounded-lg px-4 py-2"
            >
              {isSubmitting && <Loader2 className="mr-2 animate-spin inline" />}
              Submit Check-In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInFormModal;
