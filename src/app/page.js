"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "../utils/auth";
import Map from "../components/Map";
import Sidebar from "../components/Sidebar";
import FloatingButton from "../components/FloatingButton";
import CheckInFormModal from "../components/CheckInFormModal";
import { jwtDecode } from "jwt-decode";
import { postJob, getJobs } from "@/utils/api";
// Modal with the form

const Home = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: "Job 1",
      description: "Fixed roof in Manhattan",
      lat: 40.7128,
      lng: -74.006,
      image: null, // Placeholder for image upload
    },
    {
      id: 2,
      title: "Job 2",
      description: "Installed windows in Brooklyn",
      lat: 40.6782,
      lng: -73.9442,
      image: null, // Placeholder for image upload
    },
  ]);

  const [isModalOpen, setModalOpen] = useState(false); // Modal state
  const [currentLocation, setCurrentLocation] = useState({
    lat: null,
    lng: null,
  });
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const token = getToken(); // Check for the token from localStorage
    console.log("Token", token);
    if (!token) {
      router.push("/login"); // Redirect to login if no token is found
    } else {
      const decodedToken = jwtDecode(token);
      console.log("Decoded token", decodedToken);
      setUserId(decodedToken.id);
    }
  }, []);
  // Fetch jobs from the server
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = getToken(); // Get token for authorization
        const jobData = await getJobs(token); // Fetch jobs from the backend
        setJobs(jobData); // Update jobs state with data from backend
        console.log("Jobs fetched", jobData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs(); // Call fetchJobs on component mount
  }, []);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error fetching location:", error);
      }
    );
  }, []);

  const handleJobClick = (job) => {
    // Handle centering map on job location
  };

  const handleNewCheckIn = () => {
    setModalOpen(true); // Open modal when button is clicked
  };

  const handleModalClose = () => {
    setModalOpen(false); // Close modal
  };
  // Function to handle form submission
  const handleFormSubmit = async (newCheckInData) => {
    const token = getToken();
    console.log("new checkin data", newCheckInData.get("title"));

    // Prepare the job data to be sent to the server
    const newJobData = {
      title: newCheckInData.get("title"),
      description: newCheckInData.get("description"),
      lat: currentLocation.lat, // Use current location
      lng: currentLocation.lng, // Use current location
      image: newCheckInData.get("image"), // Handle image data (if any)
      userId: userId, // Replace with actual userId (if available)
    };

    try {
      // Make API request to submit the job

      const data = await postJob(newJobData, token);
      console.log("job created", data);
      // Update the jobs list with the new job
      setJobs([...jobs, data.job]);

      // Close the modal after successful submission
      setModalOpen(false);
    } catch (error) {
      console.error("Error submitting job:", error);
      // Handle error (e.g., show error message to the user)
    }
  };

  // const handleFormSubmit = (newCheckInData) => {
  //   // Handle form submission logic (e.g., add a new check-in)
  //   const newJob = {
  //     id: jobs.length + 1,
  //     title: newCheckInData.title,
  //     description: newCheckInData.description,
  //     lat: currentLocation.lat, // Use current location
  //     lng: currentLocation.lng, // Use current location
  //     image: newCheckInData.image, // Save image data
  //   };
  //   setJobs([...jobs, newJob]); // Update jobs with new check-in
  //   setModalOpen(false); // Close modal after submission
  // };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar jobs={jobs} onJobClick={handleJobClick} />
      <div style={{ position: "relative", flex: 1 }}>
        <Map jobs={jobs} />
        <FloatingButton onClick={handleNewCheckIn} />
        <CheckInFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSubmit={handleFormSubmit} // Pass form submission handler
          isSubmitting={false}
        />
      </div>
    </div>
  );
};

export default Home;
