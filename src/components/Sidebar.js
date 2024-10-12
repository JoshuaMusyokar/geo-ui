import { useState, useMemo, useCallback } from "react";
import { Search, MapPin, Building2 } from "lucide-react";

const Tag = ({ children, variant = "default" }) => {
  const baseStyles = "px-2 py-0.5 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-blue-100 text-blue-800",
    gray: "bg-gray-100 text-gray-800",
    outline: "border border-gray-200 text-gray-600",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]}`}>{children}</span>
  );
};

const JobCard = ({ job, isSelected, onClick }) => (
  <li
    onClick={onClick}
    className={`
      group p-4 mb-3 rounded-lg border transition-all duration-200
      ${
        isSelected
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-sm"
      }
    `}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
    aria-selected={isSelected}
  >
    <div className="flex items-start gap-3">
      <div className="mt-1 p-2 bg-gray-100 rounded">
        <Building2 className="w-5 h-5 text-gray-600" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`font-medium truncate ${
              isSelected ? "text-blue-700" : "text-gray-900"
            }`}
          >
            {job.title}
          </h3>
          <Tag variant={isSelected ? "default" : "gray"}>{job.type}</Tag>
        </div>

        {/* User Name Section */}
        <div className="mt-1">
          <span className="text-sm text-gray-600">
            Posted by: <strong>{job.userId ? job.userId.name : ""}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{job.location}</span>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {job.description}
        </p>

        {job.tags && (
          <div className="flex flex-wrap gap-2 mt-3">
            {job.tags.map((tag) => (
              <Tag key={tag} variant="outline">
                {tag}
              </Tag>
            ))}
          </div>
        )}
      </div>
    </div>
  </li>
);

const Sidebar = ({ jobs = [], onJobClick, loading = false }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [jobs, searchQuery]);

  const handleJobClick = useCallback(
    (job) => {
      setSelectedJob(job);
      onJobClick?.(job);
    },
    [onJobClick]
  );

  return (
    <aside className="flex flex-col h-screen bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Job Listings
          {jobs.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredJobs.length} of {jobs.length})
            </span>
          )}
        </h2>

        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search jobs by titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg
              placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Job List */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredJobs.length > 0 ? (
          <ul className="space-y-2">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                isSelected={selectedJob?.id === job.id}
                onClick={() => handleJobClick(job)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium">No matching jobs found</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your search terms
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
