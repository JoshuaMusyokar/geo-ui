import React, { useState, useCallback, useEffect, useRef } from "react";
import { Camera, X, Loader2, MapPin, Share2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GOOGLE_MAPS_API_KEY } from "../utils/constants";
import { useDropzone } from "react-dropzone";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];

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
  const [suggestions, setSuggestions] = useState([]);
  const [postToSocial, setPostToSocial] = useState(false);
  const [postToGoogle, setPostToGoogle] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const autocompleteService = useRef(null);
  // const autocompleteRef = useRef(null);
  const placesService = useRef(null);
  const searchBoxRef = useRef();
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  useEffect(() => {
    if (navigator.geolocation) {
      // navigator.geolocation.getCurrentPosition(
      //   (position) => {
      //     setCenter({
      //       lat: position.coords.latitude,
      //       lng: position.coords.longitude,
      //     });
      //   },
      //   () => {
      //     setAlert({
      //       type: "error",
      //       title: "Geolocation Error",
      //       description:
      //         "The Geolocation service failed. Please enter your location manually.",
      //     });
      //   },
      //   { timeout: 10000 }
      // );
    }
  }, []);
  const handlePlaceSelect = () => {
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      setLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      if (place.formatted_address) {
        setLocationInput(place.formatted_address);
      } else {
        // Fallback if no address is available
        setLocationInput(`${lat}, ${lng}`);
      }
      // setCenter({
      //   lat: place.geometry.location.lat(),
      //   lng: place.geometry.location.lng(),
      // });
      // setNewReview({
      //   ...newReview,
      //   area: place.formatted_address,
      //   location: {
      //     lat: place.geometry.location.lat(),
      //     lng: place.geometry.location.lng(),
      //   },
      // });
      // if (map) {
      //   map.panTo(place.geometry.location);
      //   map.setZoom(15);
      // }
    }
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      setLocationInput(place.formatted_address);
      setLocation({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: "image/*",
    multiple: false,
  });

  const getCurrentLocation = () => {
    console.log("Getting current location...");
    setLocationStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log("Geolocation success:", position);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLocation({ lat, lng });
        setLocationStatus("success");

        // Reverse geocode to get address
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results[0]) {
            setLocationInput(results[0].formatted_address);
          } else {
            console.error("Geocoder failed due to: " + status);
          }
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
        setLocationStatus("error");
        setError("Failed to get location. Please try again.");
      }
    );
  };
  const handleLocationInputChange = (e) => {
    const input = e.target.value;
    setLocationInput(input);

    if (input.length > 2 && autocompleteService.current) {
      autocompleteService.current.getPlacePredictions(
        { input },
        (predictions, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    } else {
      setSuggestions([]);
    }
  };
  const handleSuggestionSelect = (placeId) => {
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement("div")
    );
    placesService.getDetails(
      { placeId: placeId, fields: ["formatted_address", "geometry"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          setLocationInput(place.formatted_address);
          setLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          });
          setSuggestions([]);
        }
      }
    );
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setSubmissionStatus("submitting");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (location) formData.append("location", JSON.stringify(location));
    if (imagePreview) {
      const response = await fetch(imagePreview);
      const blob = await response.blob();
      formData.append("image", blob, "check-in-image.jpg");
    }

    try {
      await onSubmit(formData);
      if (postToSocial)
        await postToSocialMedia(title, description, imagePreview);
      if (postToGoogle) await postToGoogleReviews(title, description, location);
      setSubmissionStatus("success");
      setTimeout(() => {
        handleClose();
        setSubmissionStatus(null);
      }, 2000);
    } catch (error) {
      console.error("Error during submission:", error);
      setSubmissionStatus("error");
    }
  };
  const postToSocialMedia = async (title, description, imageUrl) => {
    try {
      const token =
        "EAAO5ZB1ZCeds8BOxhVDnJUIY2syPKUCzXTdKtTtdCE8gEjXECT6Musm1wZAfUfKsdbJZBDAmCnNTzPeygAmrlSJgcRB3XM0bxY7ZBtNdzg3RElsIpV9b8pzfbnZCLoB5AdZAdAbFJjhNwErLyrA0p7RRs7Ac8f52aOdksR0Bpg3z17FmMhqQU7Rn1kbmQd0SHQ5E5dVMl5TzckQOYpLeEEgL6BXVLDPOfnqFJcgSCzZCrokZD";

      const postData = {
        message: `${title}\n\n${description}`,
        access_token: token,
      };

      if (imageUrl) {
        postData.link = imageUrl;
      }

      const response = await fetch(`https://graph.facebook.com/me/feed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(`Error posting to Facebook: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Successfully posted to Facebook:", result);
    } catch (error) {
      console.error("Error posting to social media:", error);
    }
  };

  const postToGoogleReviews = async (title, description, location) => {
    console.log("Posting to Google Reviews:", { title, description, location });
    // Placeholder for Google My Business API implementation
    try {
      const token = "YOUR_GOOGLE_API_TOKEN";

      const reviewData = {
        location: location,
        comment: description,
        starRating: 5,
      };

      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error posting to Google Reviews: ${response.statusText}`
        );
      }

      const result = await response.json();
      console.log("Successfully posted to Google Reviews:", result);
    } catch (error) {
      console.error("Error posting to Google Reviews:", error);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setImagePreview(null);
    setLocation(null);
    setLocationStatus("idle");
    setError(null);
    setLocationInput("");
    setPostToSocial(false);
    setPostToGoogle(false);
    onClose();
  };

  // if (loadError) {
  //   return <div>Error loading Google Maps: {loadError.message}</div>;
  // }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
          >
            <div className="p-6 overflow-y-auto flex-grow">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                New Job Check-In
              </h3>
              {error && (
                <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                  <p className="font-bold">Error</p>
                  <p>{error}</p>
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Job Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div className="relative">
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Location
                  </label>
                  {/* <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                    onLoad={() => console.log("Google Maps Loaded")}
                    onError={(error) =>
                      console.error("Google Maps Load Error:", error)
                    }
                  > */}
                  <Autocomplete
                    onLoad={(autocomplete) =>
                      (autocompleteRef.current = autocomplete)
                    }
                    onPlaceChanged={handlePlaceSelect}
                  >
                    <div className="flex">
                      <input
                        id="location"
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder="Search for a location"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        {" "}
                        <MapPin className="h-5 w-5" />
                      </button>
                    </div>
                  </Autocomplete>
                  {/* </LoadScript> */}
                  {/* <div className="flex">
                    <input
                      id="location"
                      ref={inputRef}
                      type="text"
                      value={locationInput}
                      onChange={handleLocationInputChange}
                      placeholder="Enter location"
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div> */}
                  {suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1">
                      {suggestions.map((suggestion) => (
                        <li
                          key={suggestion.place_id}
                          onClick={() =>
                            handleSuggestionSelect(suggestion.place_id)
                          }
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          {suggestion.description}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image Upload
                  </label>
                  <div
                    {...getRootProps()}
                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md ${
                      isDragActive ? "border-blue-500" : ""
                    }`}
                  >
                    <div className="space-y-1 text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                        >
                          <span>Upload a file</span>
                          <input {...getInputProps()} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  </div>
                  {imagePreview && (
                    <div className="mt-2 relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mt-2 max-h-48 w-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="postToSocial"
                    type="checkbox"
                    checked={postToSocial}
                    onChange={(e) => setPostToSocial(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="postToSocial"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Post to Social Media
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="postToGoogle"
                    type="checkbox"
                    checked={postToGoogle}
                    onChange={(e) => setPostToGoogle(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="postToGoogle"
                    className="text-sm text-gray-700 dark:text-gray-300"
                  >
                    Post to Google Reviews
                  </label>
                </div>
              </form>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFormSubmit}
                  disabled={isSubmitting || submissionStatus === "submitting"}
                  className={`px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    (isSubmitting || submissionStatus === "submitting") &&
                    "opacity-50 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting || submissionStatus === "submitting" ? (
                    <Loader2 className="animate-spin h-5 w-5 mr-2 inline" />
                  ) : submissionStatus === "success" ? (
                    <Check className="h-5 w-5 mr-2 inline" />
                  ) : (
                    <Share2 className="h-5 w-5 mr-2 inline" />
                  )}
                  {submissionStatus === "success"
                    ? "Check-In Submitted!"
                    : "Submit Check-In"}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckInFormModal;
